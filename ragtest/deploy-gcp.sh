#!/bin/bash

# Simone's Train GraphRAG - GCP Deployment Script
set -e

echo "🚄 Deploying Simone's Train GraphRAG API to Google Cloud Platform..."

# Configuration
PROJECT_ID=${1:-"your-project-id"}
REGION="europe-west6"
SERVICE_NAME="simone-train-graphrag"

if [ "$PROJECT_ID" = "your-project-id" ]; then
    echo "❌ Please provide your GCP Project ID as the first argument:"
    echo "   ./deploy-gcp.sh YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   Region: $REGION"
echo "   Service: $SERVICE_NAME"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check authentication
echo "🔐 Checking authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

# Set the project
echo "🔧 Setting up GCP project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable run.googleapis.com --quiet
gcloud services enable secretmanager.googleapis.com --quiet
gcloud services enable containerregistry.googleapis.com --quiet

# Create secret for OpenAI API key (if not exists)
echo "🔐 Setting up secrets..."
if ! gcloud secrets describe graphrag-openai-key &> /dev/null; then
    echo "Creating secret for OpenAI API key..."
    echo "Please enter your OpenAI API key:"
    read -s OPENAI_API_KEY
    if [ -z "$OPENAI_API_KEY" ]; then
        echo "❌ OpenAI API key cannot be empty"
        exit 1
    fi
    echo -n "$OPENAI_API_KEY" | gcloud secrets create graphrag-openai-key --data-file=-
    echo "✅ Secret created successfully"
else
    echo "✅ Secret already exists"
fi

# Verify cloudbuild.yaml exists
if [ ! -f "cloudbuild.yaml" ]; then
    echo "❌ cloudbuild.yaml not found in current directory"
    echo "   Please run this script from the ragtest directory"
    exit 1
fi

# Build and deploy using Cloud Build
echo "🏗️  Building and deploying with Cloud Build..."
echo "   This may take several minutes..."

if ! gcloud builds submit --config cloudbuild.yaml . --quiet; then
    echo "❌ Cloud Build failed. Check the logs above for details."
    echo ""
    echo "💡 Common issues:"
    echo "   - Make sure you're in the ragtest directory"
    echo "   - Check that all required files are present"
    echo "   - Verify your project has billing enabled"
    echo "   - Check Cloud Build logs in the GCP Console"
    exit 1
fi

# Wait a moment for deployment to complete
echo "⏳ Waiting for deployment to complete..."
sleep 10

# Get the service URL
echo "🌐 Getting service URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)" 2>/dev/null)

if [ -z "$SERVICE_URL" ]; then
    echo "⚠️  Could not retrieve service URL. Deployment may still be in progress."
    echo "   Check the Cloud Run console: https://console.cloud.google.com/run"
else
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Service Information:"
    echo "   URL: $SERVICE_URL"
    echo "   Health Check: $SERVICE_URL/health"
    echo "   API Docs: $SERVICE_URL/docs"
    echo ""
    echo "🧪 Test your deployment:"
    echo "   curl $SERVICE_URL/health"
    echo ""
    echo "🔄 To update your frontend, set this environment variable:"
    echo "   GRAPHRAG_API_URL=$SERVICE_URL"
    echo ""
    echo "🚄 All aboard! Your train knowledge API is now running on GCP!"
    
    # Test the health endpoint
    echo ""
    echo "🏥 Testing health endpoint..."
    if curl -f -s "$SERVICE_URL/health" > /dev/null; then
        echo "✅ Health check passed!"
    else
        echo "⚠️  Health check failed. The service might still be starting up."
        echo "   Please wait a few minutes and try again."
    fi
fi 