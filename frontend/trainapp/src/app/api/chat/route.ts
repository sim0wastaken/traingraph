interface ChatMessage {
  question: string;
}

interface GraphRAGResponse {
  response: string;
  question: string;
}

export async function POST(request: Request) {
  try {
    const { question }: ChatMessage = await request.json();

    if (!question) {
      return Response.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const response = await queryGraphRAG(question);
    
    return Response.json({ 
      response,
      question 
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}

async function queryGraphRAG(question: string): Promise<string> {
  try {
    // Use environment variable for GraphRAG API URL
    const graphragApiUrl = process.env.GRAPHRAG_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${graphragApiUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        method: 'global'
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphRAG API responded with status: ${response.status}`);
    }

    const data: GraphRAGResponse = await response.json();
    return data.response || "I couldn't find information about that in the train conversations. Try asking something else!";

  } catch (error) {
    console.error('GraphRAG API Error:', error);
    return "Sorry, there was an issue processing your question. The train's knowledge graph might be having technical difficulties!";
  }
} 