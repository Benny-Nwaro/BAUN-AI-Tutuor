#!/usr/bin/env python3
"""
Local LLM Server for Baun AI Tutor using llama.cpp Python bindings
This script runs a standalone server that serves local AI models on a Raspberry Pi 4
"""

import os
import sys
import time
import json
import logging
import traceback
import uuid
import shutil
from pathlib import Path
import argparse
from typing import List, Dict, Any, Optional
from werkzeug.utils import secure_filename

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("llm-server")

# Try to import required packages, provide helpful error if missing
try:
    from flask import Flask, request, jsonify, Response, stream_with_context, send_file
    from flask_cors import CORS
    from llama_cpp import Llama
except ImportError:
    logger.error("Required packages not installed. Install with:")
    logger.error("pip install flask flask-cors llama-cpp-python")
    sys.exit(1)

# Default paths and configuration
HOME_DIR = str(Path.home())
DEFAULT_MODEL_DIR = os.path.join(HOME_DIR, "llm-models")
DEFAULT_PHI3_MODEL = os.path.join(DEFAULT_MODEL_DIR, "phi3-mini-4k-instruct.Q4_K_M.gguf")
DEFAULT_PHI3_2_MODEL = os.path.join(DEFAULT_MODEL_DIR, "Phi-3-mini-4k-instruct-Q8_0.gguf")
#DEFAULT_DEEPSEEK_MODEL = os.path.join(DEFAULT_MODEL_DIR, "deepseek-coder-6.7b-instruct.Q4_K_M.gguf")
DEFAULT_DEEPSEEK_MODEL = os.path.join(DEFAULT_MODEL_DIR, "deepseek-coder-1.3b-instruct.Q4_K_M.gguf")
DEFAULT_DEEPSEEK2_MODEL = os.path.join(DEFAULT_MODEL_DIR, "DeepSeek-R1-Distill-Llama-8B-Q4_K_M.gguf")

# Document storage configuration
DOCUMENTS_DIR = os.path.join(HOME_DIR, "baun-documents")
os.makedirs(DOCUMENTS_DIR, exist_ok=True)
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'xlsx', 'pptx', 'txt', 'csv', 'md', 'json', 'html', 'jpg', 'jpeg', 'png', 'gif'}

# Parse command line arguments
parser = argparse.ArgumentParser(description="Run a local LLM server for Baun AI Tutor")
parser.add_argument("--port", type=int, default=3300, help="Port to run the server on")
parser.add_argument("--model", type=str, default="phi3", choices=["phi3", "phi3-2", "deepseek", "deepseek2"], 
                    help="Model to use: phi3, phi3-2, deepseek, or deepseek2")
parser.add_argument("--model-path", type=str, help="Custom path to model file")
parser.add_argument("--model-dir", type=str, default=DEFAULT_MODEL_DIR, 
                    help="Directory containing model files")
parser.add_argument("--threads", type=int, default=4, 
                    help="Number of threads to use (default: 4 for RPi4)")
parser.add_argument("--context-size", type=int, default= 4096,
                    help="Context size (token limit)")
parser.add_argument("--documents-dir", type=str, default=DOCUMENTS_DIR,
                    help="Directory to store uploaded documents")
parser.add_argument("--debug", action="store_true", help="Enable debug mode")

args = parser.parse_args()

# Update document storage path if provided via arguments
DOCUMENTS_DIR = args.documents_dir
os.makedirs(DOCUMENTS_DIR, exist_ok=True)
logger.info(f"Document storage directory: {DOCUMENTS_DIR}")

# Set up model paths
MODEL_DIRECTORY = args.model_dir
os.makedirs(MODEL_DIRECTORY, exist_ok=True)

# Determine which model to use
if args.model_path:
    MODEL_PATH = args.model_path
    MODEL_NAME = args.model
elif args.model == "phi3":
    MODEL_PATH = DEFAULT_PHI3_MODEL
    MODEL_NAME = "phi3"
elif args.model == "phi3-2":
    MODEL_PATH = DEFAULT_PHI3_2_MODEL
    MODEL_NAME = "phi3-2"
elif args.model == "deepseek2":
    MODEL_PATH = DEFAULT_DEEPSEEK2_MODEL
    MODEL_NAME = "deepseek2"
else:
    MODEL_PATH = DEFAULT_DEEPSEEK_MODEL
    MODEL_NAME = "deepseek"

# Configure logging
if args.debug:
    logger.setLevel(logging.DEBUG)

logger.info(f"Using model: {MODEL_NAME}")
logger.info(f"Model path: {MODEL_PATH}")

# Check if model file exists
if not os.path.exists(MODEL_PATH):
    logger.error(f"Model file not found at {MODEL_PATH}")
    logger.error("Please download the model file and place it in the models directory")
    logger.error("Available models:")
    logger.error("1. Phi-3 models: https://huggingface.co/microsoft/phi-3")
    logger.error("2. DeepSeek Coder: https://huggingface.co/TheBloke/deepseek-coder-6.7B-instruct-GGUF")
    logger.error("3. DeepSeek R1: https://huggingface.co/SandLogicTechnologies/DeepSeek-R1-Distill-Llama-8B-GGUF")
    sys.exit(1)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global model instance
llm = None

# Document handling utilities
def allowed_file(filename):
    """Check if the file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_size_str(size_bytes):
    """Convert file size in bytes to human-readable string"""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes/1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes/(1024*1024):.1f} MB"
    else:
        return f"{size_bytes/(1024*1024*1024):.1f} GB"

def get_document_info(doc_id):
    """Get document information by ID"""
    doc_path = os.path.join(DOCUMENTS_DIR, doc_id)
    if not os.path.exists(doc_path):
        return None
    
    file_stat = os.stat(doc_path)
    file_name = os.path.basename(doc_path)
    file_ext = file_name.split('.')[-1] if '.' in file_name else ""
    
    return {
        "id": doc_id,
        "title": file_name,
        "type": file_ext,
        "size": get_file_size_str(file_stat.st_size),
        "uploadedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(file_stat.st_mtime)),
        "uploadedBy": "local-user"  # Default user for local uploads
    }

def get_all_documents():
    """Get list of all documents"""
    documents = []
    for filename in os.listdir(DOCUMENTS_DIR):
        file_path = os.path.join(DOCUMENTS_DIR, filename)
        if os.path.isfile(file_path):
            doc_info = get_document_info(filename)
            if doc_info:
                documents.append(doc_info)
    
    # Sort by uploadedAt (most recent first)
    documents.sort(key=lambda x: x.get("uploadedAt", ""), reverse=True)
    return documents

def initialize_model():
    """Initialize the LLM with optimized settings based on model type"""
    global llm
    
    try:
        # Optimize settings based on model type
        batch_size = 512  # Default batch size
        
        # Adjust batch size based on model to prevent timeouts
        if MODEL_NAME == "phi3":
            # Phi-3 Mini is smaller, can use larger batch
            batch_size = 512
        elif MODEL_NAME == "phi3-2":
            # Q8 model needs smaller batch size
            batch_size = 256
        elif MODEL_NAME == "deepseek" or MODEL_NAME == "deepseek2":
            # Larger models need a much smaller batch size
            batch_size = 64
        
        logger.info(f"Using batch size: {batch_size} for model: {MODEL_NAME}")
        
        # Load the model with optimized settings
        llm = Llama(
            model_path=MODEL_PATH,
            n_ctx=args.context_size,
            n_threads=args.threads,
            n_batch=batch_size,
            verbose=args.debug
        )
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to initialize model: {str(e)}")
        sys.exit(1)

def format_prompt(messages: List[Dict[str, str]]) -> str:
    """Format messages into a prompt that prevents the model from fabricating dialog"""
    formatted_prompt = ""
    
    # Extract the system message if present
    system_messages = [msg for msg in messages if msg.get("role", "") == "system"]
    if system_messages:
        formatted_prompt += f"{system_messages[0]['content']}\n\n"
    else:
        # Default system message to set expectations
        formatted_prompt += "You are Baun, an educational AI tutor. Answer directly and helpfully without creating fictional dialog. Focus only on addressing the user's question.\n\n"
    
    # Add conversation history
    user_assistant_pairs = []
    current_user_msg = None
    
    for msg in [m for m in messages if m.get("role", "") != "system"]:
        role = msg.get("role", "")
        content = msg.get("content", "")
        
        if role == "user":
            current_user_msg = content
            # If we have a complete pair, add it to the history
            if user_assistant_pairs and len(user_assistant_pairs[-1]) == 1:
                user_assistant_pairs[-1].append(content)
            else:
                # Start a new pair
                user_assistant_pairs.append([content])
        elif role == "assistant" and user_assistant_pairs:
            # Complete the current pair
            if len(user_assistant_pairs[-1]) == 1:
                user_assistant_pairs[-1].append(content)
            else:
                # Something unexpected happened, start a new pair
                user_assistant_pairs.append([None, content])
    
    # Format the conversation history
    if len(user_assistant_pairs) > 1:  # If we have history beyond the current query
        formatted_prompt += "Previous conversation:\n"
        
        # Process all complete pairs except the last (which might be incomplete)
        for i, (user_msg, assistant_msg) in enumerate(user_assistant_pairs[:-1]):
            if user_msg and assistant_msg:
                formatted_prompt += f"User: {user_msg}\n"
                formatted_prompt += f"Baun: {assistant_msg}\n\n"
    
    # Add the current query
    last_pair = user_assistant_pairs[-1] if user_assistant_pairs else []
    if last_pair and len(last_pair) >= 1:
        current_query = last_pair[0]
        formatted_prompt += f"Current question: {current_query}\n\n"
        formatted_prompt += "Respond as Baun directly to the user's question without narrating the conversation or creating fictional dialog:"
    
    return formatted_prompt

# Exception handling decorator
def handle_exceptions(f):
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {f.__name__}: {str(e)}")
            logger.error(traceback.format_exc())
            # Return a JSON error response
            return jsonify({
                "error": str(e),
                "details": traceback.format_exc(),
                "timestamp": int(time.time())
            }), 500
    wrapper.__name__ = f.__name__
    return wrapper

@app.route("/", methods=["GET"])
@handle_exceptions
def root():
    """Root endpoint with server information"""
    return jsonify({
        "name": "Baun AI Tutor LLM Server",
        "status": "running",
        "model": MODEL_NAME,
        "available_endpoints": {
            "GET /": "This information",
            "GET /health": "Server health check",
            "POST /v1/chat/completions": "Chat completions endpoint (OpenAI compatible)",
            "POST /generate": "Simple text generation endpoint",
            "GET /documents": "List all documents",
            "POST /documents/upload": "Upload a document",
            "GET /documents/{id}": "Download a document",
            "DELETE /documents/{id}": "Delete a document",
            "GET /documents/search": "Search documents"
        },
        "model_info": {
            "path": MODEL_PATH,
            "context_size": args.context_size,
            "threads": args.threads
        }
    })

@app.route("/health", methods=["GET"])
@handle_exceptions
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok", 
        "model": MODEL_NAME,
        "context_size": args.context_size,
        "threads": args.threads
    })

@app.route("/v1/chat/completions", methods=["POST"])
@handle_exceptions
def chat_completions():
    """OpenAI-compatible chat completions endpoint"""
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            logger.error(f"Invalid JSON or no data in request: {request.data.decode('utf-8', errors='ignore')}")
            return jsonify({"error": "Invalid JSON"}), 400
            
        logger.info(f"Request received: {json.dumps(data)[:200]}...")
        
        messages = data.get("messages", [])
        temperature = float(data.get("temperature", 0.7))
        max_tokens = int(data.get("max_tokens", 1000))
        stream = bool(data.get("stream", False))
        
        if not messages or not isinstance(messages, list):
            return jsonify({"error": "Invalid or missing messages array"}), 400
            
        # Format the prompt
        prompt = format_prompt(messages)
        logger.debug(f"Formatted prompt: {prompt}")
        logger.info(f"Prompt: {prompt}")
        
        # Handle streaming response
        if stream:
            def generate():
                completion_id = f"chatcmpl-{int(time.time())}"
                
                # Start generation with streaming
                for chunk in llm.create_completion(
                    prompt=prompt,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    stream=True
                ):
                    content = chunk.get("choices", [{}])[0].get("text", "")
                    
                    # Format in OpenAI compatible format
                    data = {
                        "id": completion_id,
                        "object": "chat.completion.chunk",
                        "created": int(time.time()),
                        "model": MODEL_NAME,
                        "choices": [{
                            "index": 0,
                            "delta": {"content": content},
                            "finish_reason": None
                        }]
                    }
                    
                    yield f"data: {json.dumps(data)}\n\n"
                
                # Send the final "DONE" message
                done_data = {
                    "id": completion_id,
                    "object": "chat.completion.chunk",
                    "created": int(time.time()),
                    "model": MODEL_NAME,
                    "choices": [{
                        "index": 0,
                        "delta": {},
                        "finish_reason": "stop"
                    }]
                }
                yield f"data: {json.dumps(done_data)}\n\n"
                yield "data: [DONE]\n\n"
                
            return Response(
                stream_with_context(generate()),
                content_type="text/event-stream"
            )
        else:
            # Non-streaming response
            logger.info(f"Generating completion for prompt (length: {len(prompt)})")
            
            try:
                completion = llm.create_completion(
                    prompt=prompt,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    stream=False
                )
                
                # Extract the generated text
                logger.debug(f"Raw completion: {completion}")
                generated_text = completion.get("choices", [{}])[0].get("text", "")
                
                # Return in OpenAI-compatible format
                response = {
                    "id": f"chatcmpl-{int(time.time())}",
                    "object": "chat.completion",
                    "created": int(time.time()),
                    "model": MODEL_NAME,
                    "choices": [{
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": generated_text
                        },
                        "finish_reason": "stop"
                    }],
                    "usage": {
                        "prompt_tokens": len(prompt),
                        "completion_tokens": len(generated_text),
                        "total_tokens": len(prompt) + len(generated_text)
                    }
                }
                
                logger.info(f"Generated response (length: {len(generated_text)})")
                logger.debug(f"Response JSON: {json.dumps(response)[:200]}...")
                
                return jsonify(response)
            except Exception as e:
                logger.error(f"Error generating completion: {str(e)}")
                logger.error(traceback.format_exc())
                return jsonify({
                    "error": f"Failed to generate response: {str(e)}",
                    "details": traceback.format_exc()
                }), 500
            
    except Exception as e:
        logger.error(f"Error in chat_completions: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": f"Failed to generate response: {str(e)}",
            "details": traceback.format_exc()
        }), 500

@app.route("/generate", methods=["POST"])
@handle_exceptions
def generate():
    """Simple text generation endpoint"""
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400
            
        prompt = data.get("prompt")
        temperature = float(data.get("temperature", 0.7))
        max_tokens = int(data.get("max_tokens", 1000))
        
        if not prompt:
            return jsonify({"error": "Missing prompt"}), 400
            
        # Generate text
        completion = llm.create_completion(
            prompt=prompt,
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        output = completion.get("choices", [{}])[0].get("text", "")
        
        return jsonify({
            "output": output
        })
        
    except Exception as e:
        logger.error(f"Error in generation: {str(e)}")
        return jsonify({"error": "Generation failed", "details": str(e)}), 500

# Document API endpoints
@app.route("/documents", methods=["GET"])
@handle_exceptions
def list_documents():
    """List all documents endpoint"""
    try:
        documents = get_all_documents()
        return jsonify(documents)
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        return jsonify({"error": "Failed to list documents", "details": str(e)}), 500

@app.route("/documents/upload", methods=["POST"])
@handle_exceptions
def upload_document():
    """Upload a document endpoint"""
    try:
        # Check if the post request has the file part
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
        
        file = request.files['file']
        
        # If user does not select file, browser may also
        # submit an empty part without filename
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        if file and allowed_file(file.filename):
            # Create a unique ID for the file
            file_id = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
            file_path = os.path.join(DOCUMENTS_DIR, file_id)
            
            # Save the file
            file.save(file_path)
            logger.info(f"Uploaded file saved to {file_path}")
            
            # Get document info and return it
            doc_info = get_document_info(file_id)
            return jsonify(doc_info)
        else:
            return jsonify({"error": f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"}), 400
            
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        return jsonify({"error": "Failed to upload document", "details": str(e)}), 500

@app.route("/documents/<document_id>", methods=["GET"])
@handle_exceptions
def download_document(document_id):
    """Download a document by ID endpoint"""
    try:
        file_path = os.path.join(DOCUMENTS_DIR, document_id)
        
        if not os.path.exists(file_path):
            return jsonify({"error": "Document not found"}), 404
        
        # Send the file to the client
        filename = document_id.split('_', 1)[1] if '_' in document_id else document_id
        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/octet-stream'
        )
            
    except Exception as e:
        logger.error(f"Error downloading document: {str(e)}")
        return jsonify({"error": "Failed to download document", "details": str(e)}), 500

@app.route("/documents/<document_id>", methods=["DELETE"])
@handle_exceptions
def delete_document(document_id):
    """Delete a document by ID endpoint"""
    try:
        file_path = os.path.join(DOCUMENTS_DIR, document_id)
        
        if not os.path.exists(file_path):
            return jsonify({"error": "Document not found"}), 404
        
        # Delete the file
        os.remove(file_path)
        logger.info(f"Deleted document: {document_id}")
        
        return jsonify({"success": True, "message": f"Document {document_id} deleted successfully"})
            
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        return jsonify({"error": "Failed to delete document", "details": str(e)}), 500

@app.route("/documents/search", methods=["GET"])
@handle_exceptions
def search_documents():
    """Search documents endpoint"""
    try:
        query = request.args.get('q', '').lower()
        
        if not query:
            return jsonify(get_all_documents())
        
        # Basic search: just filter documents by name containing the query
        all_docs = get_all_documents()
        filtered_docs = [doc for doc in all_docs if query in doc.get('title', '').lower()]
        
        return jsonify(filtered_docs)
            
    except Exception as e:
        logger.error(f"Error searching documents: {str(e)}")
        return jsonify({"error": "Failed to search documents", "details": str(e)}), 500

@app.errorhandler(Exception)
def handle_error(e):
    """Global error handler to ensure we always return JSON"""
    logger.error(f"Unhandled exception: {str(e)}")
    logger.error(traceback.format_exc())
    return jsonify({
        "error": str(e),
        "details": traceback.format_exc(),
        "timestamp": int(time.time())
    }), 500

if __name__ == "__main__":
    initialize_model()
    logger.info(f"LLM server running on http://localhost:{args.port}")
    logger.info(f"API endpoint: http://localhost:{args.port}/v1/chat/completions")
    logger.info(f"Document storage: {DOCUMENTS_DIR}")
    logger.info(f"Health check: http://localhost:{args.port}/health")
    
    # Start the Flask app with enhanced error handlin
    app.run(host="0.0.0.0", port=args.port, debug=args.debug, threaded=True) 
