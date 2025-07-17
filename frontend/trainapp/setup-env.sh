#!/bin/bash

# Simone's Train Frontend - Environment Setup Script
set -e

echo "🚄 Setting up environment for Simone's Train Frontend..."

# Get the GraphRAG API URL from user
if [ -z "$1" ]; then
    echo "📋 Please provide your GraphRAG API URL:"
    echo "   For local development: http://localhost:8080"
    echo "   For GCP Cloud Run: https://your-service-name-xxx-uc.a.run.app"
    echo ""
    read -p "Enter GraphRAG API URL: " GRAPHRAG_API_URL
else
    GRAPHRAG_API_URL=$1
fi

# Validate URL
if [[ ! $GRAPHRAG_API_URL =~ ^https?:// ]]; then
    echo "❌ Invalid URL. Please include http:// or https://"
    exit 1
fi

# Create .env.local file
echo "📝 Creating .env.local file..."
cat > .env.local << EOF
# GraphRAG API Configuration
GRAPHRAG_API_URL=$GRAPHRAG_API_URL

# Development settings
NEXT_PUBLIC_APP_ENV=development
EOF

echo "✅ Environment file created successfully!"
echo ""
echo "📋 Configuration:"
echo "   GraphRAG API URL: $GRAPHRAG_API_URL"
echo ""
echo "🧪 Test the connection:"
echo "   curl $GRAPHRAG_API_URL/health"
echo ""
echo "🚀 Start the development server:"
echo "   npm run dev"
echo ""
echo "🌐 Your app will be available at: http://localhost:3000" 