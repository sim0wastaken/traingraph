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

# Set the project
echo "🔧 Setting up GCP project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Create secret for OpenAI API key (if not exists)
echo "🔐 Setting up secrets..."
if ! gcloud secrets describe graphrag-openai-key &> /dev/null; then
    echo "Creating secret for OpenAI API key..."
    echo "Please enter your OpenAI API key:"
    read -s OPENAI_API_KEY
    echo -n "$OPENAI_API_KEY" | gcloud secrets create graphrag-openai-key --data-file=-
    echo "✅ Secret created successfully"
else
    echo "✅ Secret already exists"
fi

# Build and deploy using Cloud Build
echo "🏗️  Building and deploying with Cloud Build..."
gcloud builds submit --config cloudbuild.yaml .

# Get the service URL
echo "🌐 Getting service URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

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