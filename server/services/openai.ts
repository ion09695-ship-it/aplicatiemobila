import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-fake-key-for-development"
});

export interface TravelAssistantResponse {
  message: string;
  shouldSearchTravel?: boolean;
  travelQuery?: {
    type: 'hotels' | 'flights' | 'activities';
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    budget?: string;
  };
}

export async function generateTravelResponse(userMessage: string, chatHistory: string[]): Promise<TravelAssistantResponse> {
  // Check if OpenAI API key is properly configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-fake-key-for-development") {
    return {
      message: "I'm currently unable to provide AI-powered responses because the OpenAI API key hasn't been configured. Please set up your OpenAI API key in the environment settings to enable intelligent travel assistance."
    };
  }

  try {
    const systemPrompt = `You are TravelAI, an expert travel assistant that helps users plan amazing trips. You have access to real-time travel booking APIs for hotels, flights, and activities.

Your capabilities:
- Search and recommend hotels with real pricing and availability
- Find flights with current schedules and fares  
- Suggest activities and attractions
- Create detailed itineraries
- Provide weather information
- Offer travel tips and advice

When users ask about specific travel needs (hotels, flights, activities), respond with helpful information and indicate if you should search for real options.

For search requests, include a travelQuery object with the search type and extracted parameters.

Be friendly, knowledgeable, and focus on providing personalized recommendations based on user preferences.

Always respond with valid JSON in this format:
{
  "message": "Your response message here",
  "shouldSearchTravel": true/false,
  "travelQuery": {
    "type": "hotels|flights|activities",
    "destination": "destination name",
    "checkIn": "YYYY-MM-DD",
    "checkOut": "YYYY-MM-DD",
    "guests": number,
    "budget": "budget range"
  }
}`;

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...chatHistory.slice(-6).map((msg, i) => ({
        role: i % 2 === 0 ? "user" as const : "assistant" as const,
        content: msg
      })),
      { role: "user", content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      message: result.message || "I'd be happy to help you plan your trip! What would you like to know?",
      shouldSearchTravel: result.shouldSearchTravel || false,
      travelQuery: result.travelQuery
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      message: "I'm having trouble connecting to the AI service right now. This might be due to an API key issue or temporary service disruption. Please check your OpenAI API key configuration and try again."
    };
  }
}

export async function generateChatTitle(firstMessage: string): Promise<string> {
  // Check if OpenAI API key is properly configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-fake-key-for-development") {
    // Generate a simple title based on keywords in the message
    const destination = extractDestinationFromMessage(firstMessage);
    if (destination) {
      return `Trip to ${destination}`;
    }
    return "Travel Planning";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate a short, descriptive title (3-5 words) for a travel chat conversation based on the first user message. Focus on the destination or travel type. Respond with just the title, no quotes or extra text."
        },
        {
          role: "user",
          content: firstMessage
        }
      ],
      max_tokens: 20,
      temperature: 0.3,
    });

    return response.choices[0].message.content?.trim() || "Travel Planning";
  } catch (error) {
    console.error("Error generating chat title:", error);
    return "Travel Planning";
  }
}

// Helper function to extract destination from message when AI is not available
function extractDestinationFromMessage(message: string): string | null {
  const commonDestinations = [
    'Paris', 'London', 'Tokyo', 'New York', 'Rome', 'Barcelona', 'Amsterdam', 
    'Berlin', 'Prague', 'Vienna', 'Madrid', 'Lisbon', 'Dublin', 'Edinburgh',
    'Venice', 'Florence', 'Milan', 'Munich', 'Zurich', 'Stockholm', 'Copenhagen',
    'Oslo', 'Helsinki', 'Warsaw', 'Budapest', 'Krakow', 'Athens', 'Istanbul',
    'Dubai', 'Singapore', 'Hong Kong', 'Bangkok', 'Seoul', 'Kyoto', 'Sydney',
    'Melbourne', 'Auckland', 'Vancouver', 'Toronto', 'Montreal', 'San Francisco',
    'Los Angeles', 'Chicago', 'Miami', 'Las Vegas', 'Washington', 'Boston'
  ];
  
  const lowerMessage = message.toLowerCase();
  for (const destination of commonDestinations) {
    if (lowerMessage.includes(destination.toLowerCase())) {
      return destination;
    }
  }
  return null;
}
