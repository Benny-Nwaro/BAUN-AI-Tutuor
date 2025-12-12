#!/bin/bash
#
# Setup script for Baun AI Tutor on Raspberry Pi 4
# This script installs dependencies and sets up the local LLM server

set -e  # Exit on error

echo "====================================================="
echo "Baun AI Tutor - Raspberry Pi 4 Setup Script"
echo "====================================================="

# Check if running on Raspberry Pi
PI_MODEL=$(grep -o 'Raspberry Pi.*' /proc/device-tree/model 2>/dev/null || echo "Not a Raspberry Pi")
if [[ $PI_MODEL != *"Raspberry Pi"* ]]; then
    echo "Warning: This script is designed for Raspberry Pi. Detected system: $(uname -a)"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install system dependencies
echo "====================================================="
echo "Installing system dependencies..."
echo "====================================================="
sudo apt update
sudo apt install -y python3-pip python3-venv git cmake build-essential htop

# Create virtual environment
echo "====================================================="
echo "Setting up Python virtual environment..."
echo "====================================================="
VENV_DIR="$HOME/llm-env"
python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install flask flask-cors requests tqdm

# Install llama-cpp-python with optimizations for Raspberry Pi 4
echo "Installing llama-cpp-python with optimizations (this may take a while)..."
CMAKE_ARGS="-DLLAMA_BLAS=ON -DLLAMA_BLAS_VENDOR=OpenBLAS" pip install llama-cpp-python

# Set up model directory
MODEL_DIR="$HOME/llm-models"
mkdir -p "$MODEL_DIR"

# Ask which model to download
echo "====================================================="
echo "Model Selection"
echo "====================================================="
echo "Which model would you like to download?"
echo "1) Phi-3 Mini (recommended, ~2.7GB)"
echo "2) DeepSeek Coder (smaller, ~600MB)"
echo "3) Both models"
echo "4) Skip download (I'll download manually later)"
read -p "Enter choice [1-4]: " model_choice

# Download models
case $model_choice in
    1)
        echo "Downloading Phi-3 Mini model..."
        python3 -m pip install requests tqdm
        python3 $(dirname "$0")/download_models.py --model phi3
        ;;
    2)
        echo "Downloading DeepSeek Coder model..."
        python3 -m pip install requests tqdm
        python3 $(dirname "$0")/download_models.py --model deepseek
        ;;
    3)
        echo "Downloading both models..."
        python3 -m pip install requests tqdm
        python3 $(dirname "$0")/download_models.py --model all
        ;;
    4)
        echo "Skipping model download."
        echo "You can download models later with:"
        echo "  python3 scripts/download_models.py --model [phi3|deepseek|all]"
        ;;
    *)
        echo "Invalid choice. Skipping model download."
        ;;
esac

# Create a simple systemd service file for the LLM server
echo "====================================================="
echo "Setting up systemd service for LLM server..."
echo "====================================================="

SERVICE_FILE="$HOME/llm-server.service"

cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Baun AI Tutor LLM Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PWD
ExecStart=$VENV_DIR/bin/python3 $PWD/scripts/llm_server.py
Restart=on-failure
RestartSec=5

# Set resource limits for Raspberry Pi 4
CPUWeight=90
MemoryMax=3G
IOWeight=90

# Environment variables
Environment="MODEL_DIRECTORY=$MODEL_DIR"
Environment="SELECTED_MODEL=phi3"

[Install]
WantedBy=multi-user.target
EOF

echo "Service file created at: $SERVICE_FILE"
echo "To install the service, run these commands:"
echo "  sudo cp $SERVICE_FILE /etc/systemd/system/"
echo "  sudo systemctl daemon-reload"
echo "  sudo systemctl enable llm-server.service"
echo "  sudo systemctl start llm-server.service"

# Create a run script for manual starting
RUN_SCRIPT="$HOME/run_llm_server.sh"

cat > "$RUN_SCRIPT" << EOF
#!/bin/bash
# Run the LLM server manually

# Activate virtual environment
source "$VENV_DIR/bin/activate"

# Set environment variables
export MODEL_DIRECTORY="$MODEL_DIR"

# Run the server
python3 "$PWD/scripts/llm_server.py" "\$@"
EOF

chmod +x "$RUN_SCRIPT"

echo "====================================================="
echo "Created a manual run script: $RUN_SCRIPT"
echo "You can run the server manually with: $RUN_SCRIPT"
echo "Or with options: $RUN_SCRIPT --model deepseek --threads 3"
echo "====================================================="
echo "Setup complete!"
echo "====================================================="
echo
echo "Next steps:"
echo "1. Start the LLM server (either with systemd or the run script)"
echo "2. Configure your Baun AI Tutor Next.js app to use the local LLM server"
echo "   by setting LOCAL_LLM_URL environment variable to http://[raspberry-pi-ip]:3300"
echo
echo "Happy teaching and learning with Baun AI Tutor!" 