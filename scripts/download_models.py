#!/usr/bin/env python3
"""
Download and verify LLM models for Baun AI Tutor
"""

import os
import sys
import argparse
import hashlib
from pathlib import Path
import requests
from tqdm import tqdm

# Model information
MODELS = {
    "phi3": {
        "name": "phi3-mini-4k-instruct.Q4_K_M.gguf",
        "url": "https://huggingface.co/starmindz/baun_ai/resolve/main/finetune-Phi-3-mini-4k-instruct-q4.gguf",
        "size": 2_390_000_000,  # ~2GB
    },
    "phi3-2": {
        "name": "Phi-3-mini-4k-instruct-Q8_0.gguf",
        "url": "https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/resolve/main/Phi-3-mini-4k-instruct-Q8_0.gguf",
        "size": 2_390_000_000,  # ~2GB
    },
    "deepseek": {
        "name": "deepseek-coder-6.7b-instruct.Q4_K_M.gguf",
        "url": "https://huggingface.co/TheBloke/deepseek-coder-6.7B-instruct-GGUF/resolve/main/deepseek-coder-6.7b-instruct.Q4_K_M.gguf",
        "size": 4_300_000_000,  # ~4.3GB
    },
    "deepseek2": {
        "name": "DeepSeek-R1-Distill-Llama-8B-Q4_K_M.gguf",
        "url": "https://huggingface.co/SandLogicTechnologies/DeepSeek-R1-Distill-Llama-8B-GGUF/resolve/main/DeepSeek-R1-Distill-Llama-8B-Q4_K_M.gguf",
        "size": 4_800_000_000,  # ~4.8GB
    }
}

def download_file(url: str, destination: str, expected_size: int):
    """Download a file with progress bar"""
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    if total_size == 0:
        print(f"Warning: Could not get content length from {url}")
        total_size = expected_size
    
    block_size = 1024  # 1 KB
    progress_bar = tqdm(
        total=total_size,
        unit='iB',
        unit_scale=True,
        desc=f"Downloading {Path(destination).name}"
    )

    with open(destination, 'wb') as file:
        for data in response.iter_content(block_size):
            progress_bar.update(len(data))
            file.write(data)
    
    progress_bar.close()

def verify_model(model_path: str, expected_size: int) -> bool:
    """Verify if model exists and has correct size"""
    if not os.path.exists(model_path):
        return False
    
    actual_size = os.path.getsize(model_path)
    size_diff = abs(actual_size - expected_size)
    
    # Allow 5% size difference due to different quantization settings
    return size_diff <= (expected_size * 0.05)

def main():
    parser = argparse.ArgumentParser(description="Download and verify LLM models")
    parser.add_argument(
        "--model",
        choices=["phi3", "phi3-2", "deepseek", "deepseek2", "all"],
        default="all",
        help="Which model to download (default: all)"
    )
    parser.add_argument(
        "--model-dir",
        type=str,
        default=os.path.join(str(Path.home()), "llm-models"),
        help="Directory to store models"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force download even if model exists"
    )

    args = parser.parse_args()
    
    # Create model directory if it doesn't exist
    os.makedirs(args.model_dir, exist_ok=True)
    print(f"Using model directory: {args.model_dir}")
    
    models_to_download = list(MODELS.keys()) if args.model == "all" else [args.model]
    
    for model_name in models_to_download:
        model_info = MODELS[model_name]
        model_path = os.path.join(args.model_dir, model_info["name"])
        
        print(f"\nChecking {model_name} model...")
        
        if not args.force and verify_model(model_path, model_info["size"]):
            print(f"✓ {model_name} model already exists and appears valid")
            continue
        
        print(f"Downloading {model_name} model...")
        try:
            download_file(model_info["url"], model_path, model_info["size"])
            
            if verify_model(model_path, model_info["size"]):
                print(f"✓ Successfully downloaded and verified {model_name} model")
            else:
                print(f"⚠ Warning: {model_name} model was downloaded but size verification failed")
                print(f"  Expected size: {model_info['size']:,} bytes")
                print(f"  Actual size: {os.path.getsize(model_path):,} bytes")
        except Exception as e:
            print(f"✗ Error downloading {model_name} model: {str(e)}")
            if os.path.exists(model_path):
                os.remove(model_path)

if __name__ == "__main__":
    main() 