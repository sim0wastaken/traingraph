import { GoogleGenerativeAI } from '@google/generative-ai';

interface FastLLMMessage {
  question: string;
}

interface FastLLMResponse {
  response: string;
  question: string;
}

// Add your train context here - this will be prepended to every query
const TRAIN_CONTEXT = `
CONTEXT:
Here is what I (Simone) am overhearing in my loud train ride from Torino Porta Susa on my way to Roma Termini.
This train is directed towards Salerno on the route Torino-Salerno.
Peak travel speed 300km/h and is mantained constant throughout the whole trip.
AC only works every now and then, when it's almost off it's too hot, when it's completely on it's almost too cold.
Every point represents a different person. If the name is lacking, invent it, but they must all be different:
- Simone (me) talking with Bart about how Milano sucks as a city in general: it is only good for work variety, but truly not even that because salaries are nowhere near enough to comfortably sustain the lifestyle of such an expensive city. Torino is much better on many aspects, Simone loves it, but Bart thinks it lacks vibrant social life characteristic of bigger cities: Simone disagrees on this and it's probably because Simone is a local who actually lives in turin and Bart is from Lecco. Bart claims that Rome is an open-air museum, which Simone also agrees: Simone expands on it stating that Rome is beautiful to visit as a tourist, but awful to live in, due to chaos, overtourism, traffic and the fact that it's not exactly clean. Bart firmly believes that if Valtellina had a decent transportation network, it would be the new Switzerland: perfect for working, good salaries, amazing landscape, close to the mountains, extremely clean, pollution free, lots of green, potentially would become the new standard for Lombardy. Bart feels very lucky having grown up in such a place.
- this guy's ex girlfriend issues. as he is talking
- this guy's grandma medication plan
- this girl's todo list for tomorrow at work
- this guy's plan as soon as he gets to naples (he's going for a quick pizza with his friend but he doesn't want to be late for some reason). Also he is sharing some tricks on how to manage conflicts in relationships, according to this guy, you just have to be sweet and calm. He is talking on the phone and his friend sitting next to him is apparently joining the conversation from time to time. Now he is making plans for a saturday meetup, he invited Lorenzo and Leonardo, it has been very long since they had seen each other, but he is afraid that they will not see the text before tonight because they are working late.
- a guy has trouble converting something into pdf. I'm not surprised, after all it wasn't long ago since they discovered electricity
- a guy is supposed to be working remotely for UniCredit but he's on a train to naples (he is like me, he gets a pass). he planned pickup/dropoff of 20 boxes of corporate documents because a local branch recently closed and apparently those documents need to be reviewed
- a guy is managing his waiting list for a doctor's appointment, reassuring his friend that he will keep checking something
- this guy has black screen issues on his laptop, sometimes it’s completely green
- a guy is phoning his friend, his friend tells him a story about why and how their friend Matteo killed himself in Rome. He doubts the story because it doesn’t seem realy. He sent emails asking for clarifications, looked up excel spreadsheets, and now is trying to understand information about this whole situation. Probably sent those to police or hospitals

Based on the above context about the train conversations, please answer the following question:
`;

export async function POST(request: Request) {
  try {
    const { question }: FastLLMMessage = await request.json();

    if (!question) {
      return Response.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const response = await queryGemini(question);
    
    return Response.json({ 
      response,
      question 
    });

  } catch (error) {
    console.error('FastLLM API error:', error);
    return Response.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}

async function queryGemini(question: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-06-17" });

    const prompt = TRAIN_CONTEXT + "\n\nQuestion: " + question;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || "I couldn't generate a response. Please try again!";

  } catch (error) {
    console.error('Gemini API Error:', error);
    return "Sorry, there was an issue with the FastLLM service. Please try switching to Knowledge Graph mode or try again later!";
  }
} 