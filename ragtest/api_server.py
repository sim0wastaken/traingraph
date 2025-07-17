from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import subprocess
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Simone's Train GraphRAG API", 
    version="1.0.0",
    description="AI-powered chatbot for analyzing overheard train conversations"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str
    method: str = "local"  # local, global, or drift

class QueryResponse(BaseModel):
    response: str
    question: str

# Set the working directory to the ragtest folder
RAGTEST_DIR = Path(__file__).parent
os.chdir(RAGTEST_DIR)

@app.on_event("startup")
async def startup_event():
    """Log startup information"""
    logger.info("🚄 Simone's Train GraphRAG API starting up...")
    logger.info(f"Working directory: {os.getcwd()}")
    logger.info(f"GRAPHRAG_API_KEY configured: {'GRAPHRAG_API_KEY' in os.environ}")

@app.get("/")
async def root():
    return {
        "message": "🚄 Simone's Train GraphRAG API", 
        "status": "running",
        "description": "AI chatbot for analyzing overheard train conversations",
        "available_endpoints": ["/query", "/health", "/docs"],
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for Cloud Run"""
    return {
        "status": "healthy", 
        "service": "graphrag-api",
        "environment": "production" if os.getenv("PORT") == "8080" else "development"
    }

@app.post("/query", response_model=QueryResponse)
async def query_graphrag(request: QueryRequest):
    """Query the GraphRAG knowledge base about train conversations"""
    try:
        logger.info(f"Received query: {request.question[:100]}...")
        
        # Run GraphRAG query
        result = await run_graphrag_query(request.question, request.method)
        
        logger.info("Query processed successfully")
        return QueryResponse(
            response=result,
            question=request.question
        )
    except Exception as e:
        logger.error(f"Query failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

async def run_graphrag_query(question: str, method: str = "local") -> str:
    """Run GraphRAG query asynchronously"""
    try:
        # Prepare the command
        cmd = [
            "graphrag", "query",
            "--root", ".",
            "--method", method,
            "--query", question
        ]
        
        logger.info(f"Running GraphRAG command: {' '.join(cmd[:4])}...")
        
        # Run the command
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env={**os.environ, "PYTHONPATH": str(RAGTEST_DIR)}
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode == 0:
            output = stdout.decode('utf-8')
            
            # Extract the response from GraphRAG output
            lines = output.split('\n')
            response_lines = []
            response_started = False
            
            for line in lines:
                if 'SUCCESS: Local Search Response:' in line or response_started:
                    if 'SUCCESS: Local Search Response:' in line:
                        response_started = True
                        continue
                    if line.strip() == '' and response_started:
                        break
                    if response_started:
                        response_lines.append(line)
            
            response = '\n'.join(response_lines).strip()
            return response or "I couldn't find information about that in the train conversations. Try asking about Simone, Bart, or the train conditions!"
            
        else:
            error_msg = stderr.decode('utf-8')
            logger.error(f"GraphRAG Error: {error_msg}")
            return "Sorry, there was an issue processing your question. The train's knowledge graph might be having technical difficulties!"
            
    except Exception as e:
        logger.error(f"Process Error: {e}")
        return "Sorry, I'm having trouble accessing the train's knowledge. Please try again!"

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    logger.info(f"🚄 Starting server on port {port}")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        log_level="info",
        access_log=True
    ) 