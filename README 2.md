# Baun AI Tutor

A powerful AI-powered educational platform that combines chat-based tutoring, lesson planning, and interactive quizzes to enhance the learning experience.

## 🌟 Features

### 🤖 AI Tutoring
- Real-time chat interface with AI tutor
- Context-aware responses using both local LLM and Groq
- Automatic fallback between local and cloud AI services
- Role-based conversations (student/teacher modes)
- Conversation history management

### 📚 Lesson Planning
- AI-powered lesson plan generation
- Customizable templates for different grade levels
- Standards-aligned content generation
- PDF export functionality
- Interactive preview with sections for:
  - Objectives
  - Standards
  - Materials
  - Activities
  - Assessment
  - Differentiation
  - Homework

### 📝 Interactive Quizzes
- Automatic quiz generation from conversations
- Topic-based question generation
- Multiple-choice format with explanations
- Progress tracking and statistics
- Mobile-responsive design
- Score history and performance analytics

### 🎨 User Interface
- Modern, responsive design
- Dark/Light mode support
- Mobile-first approach
- Accessible components
- Progressive Web App (PWA) support

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- Python 3.8+ (for local LLM)
- npm or yarn
- Git

### Installation

#### Frontend Setup
1. Clone the repository:
```bash
git clone https://github.com/starmindz/baun-ai-tutor.git
cd baun-ai-tutor
```

2. Install frontend dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
GROQ_API_KEY=your_groq_api_key
LOCAL_LLM_URL=http://localhost:8000  # Update this if using remote Raspberry Pi
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

#### Backend LLM Server Setup (Optional)
If running the LLM server locally (not on Raspberry Pi):

1. Install Python dependencies:
```bash
# Navigate to the scripts directory
cd scripts

# Install Python dependencies
pip install -r requirements.txt
```

2. Start the LLM server:
```bash
python llm_server.py
```

### 🖥️ Distributed Deployment (Raspberry Pi + PWA)

You can run Baun AI Tutor in a distributed setup with:
- Backend LLM server running on a Raspberry Pi
- Frontend PWA running on any device

#### Setting up the Raspberry Pi LLM Server

1. Prepare your Raspberry Pi:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip git -y
```

2. Clone and set up the repository on Raspberry Pi:
```bash
git clone https://github.com/starmindz/baun-ai-tutor.git
cd baun-ai-tutor

# Create Python virtual environment
python3 -m venv llm-env
source llm-env/bin/activate

# Install the LLM server dependencies
cd scripts
pip install -r requirements.txt
```

3. Configure the LLM server:
```bash
# Create environment file in the root directory
cd ..
cat > .env.local << EOL
PORT=8000
HOST=0.0.0.0  # Important: This allows external connections
MODEL_PATH=./models/your-model.gguf
EOL
```

4. Create a systemd service for auto-start (optional):
```bash
sudo nano /etc/systemd/system/llm-server.service

[Unit]
Description=LLM Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/baun-ai-tutor/scripts
Environment=PATH=/home/pi/baun-ai-tutor/llm-env/bin:$PATH
ExecStart=/home/pi/baun-ai-tutor/llm-env/bin/python llm_server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

5. Start the LLM server:
```bash
# If using systemd
sudo systemctl enable llm-server
sudo systemctl start llm-server

# Or run directly from the scripts directory
cd scripts
python llm_server.py
```

#### Setting up the PWA Frontend

1. Build the PWA for production:
```bash
# On your development machine
npm run build
# or
yarn build
```

2. Configure the frontend to connect to Raspberry Pi:
```bash
# Create .env.local for production
cat > .env.local << EOL
NEXT_PUBLIC_LLM_SERVER_URL=http://your-raspberry-pi-ip:8000
NEXT_PUBLIC_ENABLE_PWA=true
EOL
```

3. Deploy the PWA:
Option A - Using Vercel:
```bash
npm i -g vercel
vercel deploy
```

Option B - Using a local server:
```bash
# Install serve
npm install -g serve

# Serve the production build
serve out
```

4. Access the PWA:
- Open the deployed URL in your browser
- Click "Install" when prompted to install the PWA
- The app will now work offline and connect to your Raspberry Pi LLM server when on the same network

#### Network Configuration

1. Find your Raspberry Pi's IP address:
```bash
hostname -I
```

2. Configure your router to:
- Assign a static IP to the Raspberry Pi
- Forward port 8000 to the Raspberry Pi (if accessing from outside network)

3. Update frontend configuration with the correct IP:
- Use local IP (e.g., `192.168.1.100`) for local network
- Use public IP or domain for external access

#### Security Considerations

When running a distributed setup:
- Enable HTTPS for the LLM server
- Set up authentication for the LLM server
- Use a firewall on the Raspberry Pi
- Keep both frontend and backend updated

#### Offline Operation

The PWA will:
1. Cache necessary assets for offline operation
2. Work without internet connection
3. Connect to LLM server when on the same network
4. Fall back to cached responses when server is unreachable

## 🏗️ Architecture

### Frontend
- Next.js 14 (App Router)
- React 18
- TailwindCSS
- Heroicons
- TypeScript

### AI Services
- Local LLM Server (Python)
- Groq API Integration
- Fallback mechanism between services

### Key Components
- `app/components/chat/` - Chat interface components
- `app/components/lessonPlanner/` - Lesson planning system
- `app/components/quiz/` - Quiz generation and management
- `app/lib/` - Core utilities and services
- `app/context/` - Global state management
- `app/api/` - API routes

## 📱 Progressive Web App

The application is PWA-ready with:
- Offline support
- Install prompts
- Service worker
- App manifest
- Mobile-optimized UI

## 🔒 Security

- Environment variable protection
- API key management
- Rate limiting
- Input sanitization
- Secure data storage

## 🎯 Usage

### Chat Interface
1. Select your role (Student/Teacher)
2. Start a new conversation
3. Type your questions or topics
4. Receive AI-powered responses
5. Generate quizzes from conversations

### Lesson Planning
1. Click "Create Lesson Plan"
2. Fill in the basic information:
   - Topic
   - Grade Level
   - Duration
   - Standards (optional)
3. Add any specific requirements
4. Generate the plan
5. Export to PDF if needed

### Quizzes
1. Engage in educational conversations
2. Click "Generate Quiz" when ready
3. Answer the questions
4. Review your performance
5. Track progress over time

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Groq for AI API services
- Next.js team for the framework
- TailwindCSS for styling
- Contributors and testers

## 📞 Support

For support, please:
1. Check the documentation
2. Search existing issues
3. Open a new issue if needed

---

Built with ❤️ using Next.js, React, and Flask
