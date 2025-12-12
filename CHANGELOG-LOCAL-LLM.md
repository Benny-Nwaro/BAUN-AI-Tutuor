# Local LLM Integration Changelog

## Version 1.1.0 (Current)

### Bug Fixes
- Fixed issue with DeepSeek model generating fabricated conversations in response to simple prompts
- Added response cleanup function to remove any artificial dialog/conversation formatting
- Improved JSON parsing error handling to better handle invalid responses
- Added detailed error messages for timeout errors and network issues
- Fixed UI representation of error messages with amber/warning styling

### Enhancements
- Increased API timeouts to 90 seconds to accommodate slower devices like Raspberry Pi 4
- Added more comprehensive debug logging for troubleshooting
- Improved system prompt to prevent model from fabricating responses
- Enhanced response parsing to handle various model output formats
- Added support for detecting HTML error pages returned by the server

### Performance Improvements
- Reduced load on the local server by using simplified system prompts
- Added clearer user feedback during long processing times
- Improved error recovery to maintain conversation continuity

## Version 1.0.0 (Initial Release)

### Features
- Basic integration with local LLM server using Flask and llama.cpp
- Support for DeepSeek Coder (1.3B) and Phi-3 Mini (7B) models
- Python implementation optimized for Raspberry Pi 4
- Alternative Node.js implementation using node-llama-cpp
- Model download script for easy setup
- Environment variable configuration
- Fallback to online API when local LLM unavailable 