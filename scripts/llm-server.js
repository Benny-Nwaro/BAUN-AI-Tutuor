// Local LLM Server for Baun AI Tutor
// This script runs a standalone server that serves a local LLM model
// It can be run independently from the Next.js application

const express = require('express');
const cors = require('cors');
const { LlamaModel, LlamaContext, LlamaChatSession } = require('node-llama-cpp');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const PORT = process.env.LLM_SERVER_PORT || 3300;
const MODEL_DIRECTORY = process.env.MODEL_DIRECTORY || path.join(os.homedir(), 'llm-models');
const PHI3_MODEL_PATH = process.env.PHI3_MODEL_PATH || path.join(MODEL_DIRECTORY, 'phi3-mini-4k-instruct.Q4_K_M.gguf');
const DEEPSEEK_MODEL_PATH = process.env.DEEPSEEK_MODEL_PATH || path.join(MODEL_DIRECTORY, 'deepseek-coder-1.3b-instruct.Q4_K_M.gguf');
const SELECTED_MODEL = process.env.SELECTED_MODEL || 'phi3'; // 'phi3' or 'deepseek'

// Ensure model directory exists
if (!fs.existsSync(MODEL_DIRECTORY)) {
  fs.mkdirSync(MODEL_DIRECTORY, { recursive: true });
  console.log(`Created model directory at ${MODEL_DIRECTORY}`);
}

// Initialize model with proper config for Raspberry Pi 4
let model;
let modelPath;

if (SELECTED_MODEL === 'phi3') {
  modelPath = PHI3_MODEL_PATH;
  console.log('Using Phi-3 model');
} else {
  modelPath = DEEPSEEK_MODEL_PATH;
  console.log('Using DeepSeek model');
}

async function initializeModel() {
  try {
    if (!fs.existsSync(modelPath)) {
      console.error(`Model file not found at ${modelPath}`);
      console.log('Please download the model file and place it in the models directory');
      console.log('Phi-3 models: https://huggingface.co/microsoft/phi-3');
      console.log('DeepSeek models: https://huggingface.co/deepseek-ai/deepseek-coder-1.3b-instruct');
      process.exit(1);
    }

    // Raspberry Pi 4 optimized configuration
    model = new LlamaModel({
      modelPath: modelPath,
      seed: 42,
      enableLogging: false,
      gpuLayers: 0, // No GPU on RPi4
      threads: 4,   // RPi4 has 4 cores
      contextSize: 2048, // Lower context size for RPi4 memory constraints
      batchSize: 512,    // Smaller batch size for RPi4
    });

    console.log('Model loaded successfully!');
    console.log('Server ready for API requests');
  } catch (error) {
    console.error('Failed to initialize model:', error);
    process.exit(1);
  }
}

// Express server setup
const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', model: SELECTED_MODEL });
});

// Chat completion endpoint - compatible with OpenAI API format
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { messages, temperature = 0.7, max_tokens = 1000, stream = false } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid or missing messages array' });
    }

    // Format prompt from messages - IMPROVED FORMATTING
    let formattedPrompt = '';
    
    // First, extract the system message if present
    const systemMessage = messages.find(msg => msg.role === 'system');
    if (systemMessage) {
      formattedPrompt += `${systemMessage.content}\n\n`;
    } else {
      formattedPrompt += `You are an educational AI assistant. Provide helpful, concise responses directly to the user's question without fabricating dialog.\n\n`;
    }
    
    // Add context from previous exchanges without using dialog format
    const conversationHistory = messages.filter(msg => msg.role !== 'system');
    if (conversationHistory.length > 0) {
      formattedPrompt += "Context from previous conversation:\n";
      
      for (let i = 0; i < conversationHistory.length - 1; i++) {
        const msg = conversationHistory[i];
        if (msg.role === 'user') {
          formattedPrompt += `Question: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          formattedPrompt += `Response: ${msg.content}\n`;
        }
      }
      
      formattedPrompt += "\n";
    }
    
    // Add the current query
    const currentQuery = conversationHistory[conversationHistory.length - 1];
    if (currentQuery && currentQuery.role === 'user') {
      formattedPrompt += `Current question: ${currentQuery.content}\n\n`;
      formattedPrompt += `Provide a direct answer to the above question without creating a fictional dialog:`;
    }
    
    // Create context and generate response
    const context = new LlamaContext({ model });
    
    // If streaming is requested
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      let responseText = '';
      
      // Start token generation
      const session = new LlamaChatSession({ context });
      const stream = await session.prompt(formattedPrompt, {
        temperature,
        maxTokens: max_tokens,
        onToken: (chunk) => {
          const token = context.decode(chunk);
          responseText += token;
          
          // Send SSE event
          res.write(`data: ${JSON.stringify({
            id: `chatcmpl-${Date.now()}`,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: SELECTED_MODEL,
            choices: [{
              index: 0,
              delta: { content: token },
              finish_reason: null
            }]
          })}\n\n`);
        }
      });
      
      // Send the final "done" event
      res.write(`data: ${JSON.stringify({
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: SELECTED_MODEL,
        choices: [{
          index: 0,
          delta: {},
          finish_reason: 'stop'
        }]
      })}\n\n`);
      
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      // Non-streaming response
      const session = new LlamaChatSession({ context });
      const response = await session.prompt(formattedPrompt, {
        temperature,
        maxTokens: max_tokens,
      });
      
      // Return in OpenAI-compatible format
      res.json({
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: SELECTED_MODEL,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: response
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: formattedPrompt.length,
          completion_tokens: response.length,
          total_tokens: formattedPrompt.length + response.length
        }
      });
    }
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Failed to generate response', details: error.message });
  }
});

// Simple generation endpoint
app.post('/generate', async (req, res) => {
  try {
    const { prompt, temperature = 0.7, max_tokens = 1000 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }
    
    const context = new LlamaContext({ model });
    const output = await context.evaluate(prompt, {
      temp: temperature,
      maxTokens: max_tokens
    });
    
    res.json({ output });
  } catch (error) {
    console.error('Error in generation:', error);
    res.status(500).json({ error: 'Generation failed', details: error.message });
  }
});

// Start server after model initialization
async function startServer() {
  await initializeModel();
  
  app.listen(PORT, () => {
    console.log(`LLM server running on http://localhost:${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/v1/chat/completions`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  if (model) {
    console.log('Cleaning up model resources...');
    // Any cleanup needed
  }
  process.exit(0);
});

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
