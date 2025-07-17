#!/bin/bash

# Simone's Train GraphRAG - Local Development Script
set -e

echo "🚄 Starting Simone's Train GraphRAG API locally..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install it first."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file..."
    cat > .env << EOF
GRAPHRAG_API_KEY=your_openai_api_key_here
PORT=8080
PYTHONPATH=/app
EOF
    echo "✏️  Please edit .env file and add your OpenAI API key"
    echo "   nano .env"
    read -p "Press Enter when you've updated the .env file..."
fi

# Load environment variables
if [ -f ".env" ]; then
    echo "🔐 Loading environment variables..."
    export $(cat .env | xargs)
fi

# Check if GRAPHRAG_API_KEY is set
if [ -z "$GRAPHRAG_API_KEY" ] || [ "$GRAPHRAG_API_KEY" = "your_openai_api_key_here" ]; then
    echo "❌ Please set your OpenAI API key in the .env file"
    echo "   GRAPHRAG_API_KEY=sk-your-actual-key-here"
    exit 1
fi

# Start the server
echo "🚀 Starting the API server..."
echo "📋 Server will be available at:"
echo "   URL: http://localhost:8080"
echo "   Health: http://localhost:8080/health"
echo "   Docs: http://localhost:8080/docs"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

python api_server.py 