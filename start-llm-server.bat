@echo off
echo Setting up Baun AI Tutor LLM Server...

REM Check if Python virtual environment exists
if not exist "llm-env" (
    echo Creating Python virtual environment...
    python -m venv llm-env
)

REM Activate virtual environment
call llm-env\Scripts\activate.bat

REM Install required packages if not already installed
echo Installing required packages...
pip install -r requirements-llm.txt

REM Download models if they don't exist
echo Checking/downloading models...
python scripts/download_models.py --model all

REM Let user choose the model
echo.
echo Choose a model to use:
echo 1. Phi-3 (Smaller, faster)
echo 2. DeepSeek Coder 6.7B (Better for coding)
echo 3. DeepSeek R1 Distill 8B (Balanced performance)
echo.
set /p model_choice="Enter your choice (1-3, default is 1): "

REM Set the model based on user choice
if "%model_choice%"=="2" (
    set model_name=deepseek
) else if "%model_choice%"=="3" (
    set model_name=deepseek2
) else (
    set model_name=phi3
)

REM Start the server
echo.
echo Starting LLM server with %model_name% model...
python scripts/llm_server.py --model %model_name% --debug

REM Keep window open if there's an error
pause 