import OpenAI from "openai";
import { serpApiService, type SerpApiResponse } from "./serpapi";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export interface TravelAssistantResponse {
  message: string;
  shouldSearchTravel?: boolean;
  travelQuery?: {
    destination: string;
    type: 'hotels' | 'flights' | 'activities' | 'mixed';
    dates?: string;
    guests?: string;
    budget?: string;
  };
  searchResults?: SerpApiResponse;
}

// Helper functions for destination extraction and response generation
function extractDestination(message: string): string | null {
  const destinations = [
    // Europe
    'paris', 'london', 'rome', 'barcelona', 'amsterdam', 'berlin', 'prague', 'vienna',
    'madrid', 'lisbon', 'dublin', 'edinburgh', 'venice', 'florence', 'milan', 'munich',
    'zurich', 'stockholm', 'copenhagen', 'oslo', 'helsinki', 'warsaw', 'budapest',
    'krakow', 'athens', 'istanbul', 'santorini', 'mykonos', 'dubrovnik', 'split',
    
    // Asia
    'tokyo', 'kyoto', 'osaka', 'seoul', 'busan', 'bangkok', 'phuket', 'singapore',
    'hong kong', 'macau', 'taipei', 'manila', 'cebu', 'bali', 'jakarta', 'kuala lumpur',
    'penang', 'hanoi', 'ho chi minh', 'siem reap', 'phnom penh', 'yangon', 'mandalay',
    'kathmandu', 'pokhara', 'delhi', 'mumbai', 'goa', 'jaipur', 'agra', 'kerala',
    'bangalore', 'chennai', 'kolkata', 'varanasi', 'rishikesh', 'dharamshala',
    
    // Americas
    'new york', 'los angeles', 'san francisco', 'chicago', 'miami', 'las vegas',
    'washington', 'boston', 'seattle', 'portland', 'denver', 'austin', 'nashville',
    'new orleans', 'toronto', 'vancouver', 'montreal', 'mexico city', 'cancun',
    'playa del carmen', 'tulum', 'puerto vallarta', 'guatemala city', 'antigua',
    'san jose', 'panama city', 'bogota', 'medellin', 'cartagena', 'lima', 'cusco',
    'machu picchu', 'quito', 'guayaquil', 'buenos aires', 'mendoza', 'bariloche',
    'santiago', 'valparaiso', 'sao paulo', 'rio de janeiro', 'salvador', 'brasilia',
    
    // Oceania
    'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'darwin', 'cairns',
    'gold coast', 'auckland', 'wellington', 'christchurch', 'queenstown', 'rotorua',
    
    // Africa & Middle East
    'dubai', 'abu dhabi', 'doha', 'kuwait city', 'riyadh', 'jeddah', 'muscat',
    'cairo', 'alexandria', 'marrakech', 'casablanca', 'fez', 'rabat', 'tunis',
    'cape town', 'johannesburg', 'durban', 'nairobi', 'mombasa', 'dar es salaam',
    'zanzibar', 'addis ababa', 'kigali', 'kampala'
  ];
  
  for (const dest of destinations) {
    if (message.includes(dest)) {
      return dest.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  }
  
  return null;
}

function extractDates(message: string): string | undefined {
  const datePatterns = [
    /next month/i,
    /next week/i,
    /this weekend/i,
    /january|february|march|april|may|june|july|august|september|october|november|december/i,
    /\d{1,2}\/\d{1,2}/,
    /\d{1,2}-\d{1,2}/
  ];
  
  for (const pattern of datePatterns) {
    const match = message.match(pattern);
    if (match) return match[0];
  }
  
  return undefined;
}

function extractGuests(message: string): string | undefined {
  const guestMatch = message.match(/(\d+)\s*(people|person|guest|adult|traveler)/i);
  return guestMatch ? guestMatch[1] : undefined;
}

function extractBudget(message: string): string | undefined {
  const budgetPatterns = [
    /budget/i,
    /cheap/i,
    /expensive/i,
    /luxury/i,
    /\$\d+/,
    /under \$?\d+/i
  ];
  
  for (const pattern of budgetPatterns) {
    const match = message.match(pattern);
    if (match) return match[0];
  }
  
  return undefined;
}

function generateHotelResponse(destination: string | null, message: string): TravelAssistantResponse {
  const destText = destination ? ` in ${destination}` : '';
  const travelQuery = destination ? {
    destination,
    type: 'hotels' as const,
    dates: extractDates(message),
    guests: extractGuests(message),
    budget: extractBudget(message)
  } : undefined;
  
  return {
    message: `### 🏨 Hotel Search${destText}

I'd love to help you find the perfect accommodation${destText}! Here's what I can offer:

#### **Luxury Options**
- Premium hotels with world-class amenities
- 5-star service and prime locations  
- Spa, fine dining, and concierge services

#### **Mid-Range Choices**
- Comfortable hotels with great value
- Modern amenities and convenient locations
- Perfect balance of quality and price

#### **Budget-Friendly**
- Clean, safe, and affordable options
- Essential amenities for comfortable stays
- Great for budget-conscious travelers

#### **What I Need to Help You Better:**
- **Travel dates** - When are you planning to visit?
- **Number of guests** - How many people will be staying?
- **Budget range** - What's your preferred price range?
- **Special requirements** - Any specific location or amenity preferences?

Once I have these details, I'll provide personalized hotel recommendations with current prices and booking options!`,
    shouldSearchTravel: true,
    travelQuery
  };
}

function generateFlightResponse(destination: string | null, message: string): TravelAssistantResponse {
  const destText = destination ? ` to ${destination}` : '';
  const travelQuery = destination ? {
    destination,
    type: 'flights' as const,
    dates: extractDates(message),
    guests: extractGuests(message),
    budget: extractBudget(message)
  } : undefined;
  
  return {
    message: `Perfect! I'll help you find the best flights${destText}. Here's what I can offer:

✈️ **Flight Search${destText}:**

**Flight Options:**
- Direct flights for convenience
- Connecting flights for better prices
- Flexible dates for savings
- Multiple airlines comparison

**Booking Benefits:**
- Real-time price tracking
- Flexible cancellation options
- Seat selection assistance
- Baggage information

**Travel Tips:**
- Book 6-8 weeks in advance for best prices
- Tuesday and Wednesday are often cheapest
- Consider nearby airports for savings

To find your perfect flight, I need:
- Departure city/airport
- Travel dates (or flexible date range)
- Number of passengers
- Preferred budget or class (economy/business)

I'll search across multiple airlines to find you the best deals!`,
    shouldSearchTravel: true,
    travelQuery
  };
}

function generateActivityResponse(destination: string | null, message: string): TravelAssistantResponse {
  const destText = destination ? ` in ${destination}` : '';
  const travelQuery = destination ? {
    destination,
    type: 'activities' as const,
    dates: extractDates(message),
    guests: extractGuests(message),
    budget: extractBudget(message)
  } : undefined;
  
  return {
    message: `Exciting! I'll help you discover amazing activities${destText}. Here's what awaits you:

🎯 **Activities & Experiences${destText}:**

**Must-Do Attractions:**
- Iconic landmarks and monuments
- Museums and cultural sites
- Historical tours and experiences

**Adventure & Outdoor:**
- Hiking and nature excursions
- Water sports and beach activities
- Adventure tours and extreme sports

**Cultural Experiences:**
- Local food tours and cooking classes
- Traditional performances and festivals
- Art galleries and local markets

**Family-Friendly:**
- Theme parks and entertainment
- Interactive museums and zoos
- Kid-friendly tours and activities

Let me know more about your preferences:
- What type of activities interest you most?
- How many days will you be visiting?
- Any mobility requirements?
- Adventure level (relaxed, moderate, extreme)?

I'll create a personalized itinerary with the best activities for your trip!`,
    shouldSearchTravel: true,
    travelQuery
  };
}

function generateDestinationResponse(destination: string, message: string): TravelAssistantResponse {
  return {
    message: `${destination} is an amazing destination! I'm excited to help you plan your trip there.

🌟 **Why ${destination} is Special:**
- Rich culture and history
- Incredible cuisine and dining
- Beautiful attractions and landmarks
- Unique local experiences

**I can help you with:**
🏨 **Accommodation** - From luxury hotels to budget-friendly options
✈️ **Flights** - Best routes and deals to ${destination}
🎯 **Activities** - Must-see attractions and hidden gems
🍽️ **Dining** - Local cuisine and restaurant recommendations
🚗 **Transportation** - Getting around the city
📅 **Itinerary** - Day-by-day planning for your trip

**Next Steps:**
To create your perfect ${destination} experience, tell me:
- When are you planning to visit?
- How long will you stay?
- What's your travel style? (luxury, mid-range, budget)
- What interests you most? (culture, food, nature, nightlife, etc.)

I'll create a customized travel plan just for you!`,
    shouldSearchTravel: true,
    travelQuery: {
      destination,
      type: 'mixed' as const,
      dates: extractDates(message),
      guests: extractGuests(message),
      budget: extractBudget(message)
    }
  };
}

// Fallback function to generate intelligent travel responses without OpenAI
function generateFallbackTravelResponse(userMessage: string): TravelAssistantResponse {
  const message = userMessage.toLowerCase();
  
  // Extract destination from common patterns
  const destination = extractDestination(message);
  
  // Detect travel intent
  if (message.includes('hotel') || message.includes('accommodation') || message.includes('stay')) {
    return generateHotelResponse(destination, message);
  }
  
  if (message.includes('flight') || message.includes('fly') || message.includes('plane')) {
    return generateFlightResponse(destination, message);
  }
  
  if (message.includes('activity') || message.includes('things to do') || message.includes('attraction')) {
    return generateActivityResponse(destination, message);
  }
  
  if (destination) {
    return generateDestinationResponse(destination, message);
  }
  
  // General travel planning response
  return {
    message: `I'd love to help you plan your trip! I can assist you with:

🏨 **Hotels & Accommodation** - Find the perfect place to stay
✈️ **Flights** - Search for the best flight options  
🎯 **Activities** - Discover amazing things to do
🗺️ **Itineraries** - Plan your perfect travel schedule

To get started, tell me:
- Where would you like to go?
- When are you planning to travel?
- What type of experience are you looking for?

I'll provide personalized recommendations to make your trip unforgettable!`
  };
}

function generateFallbackTitle(message: string): string {
  const destination = extractDestination(message);
  if (destination) {
    return `Trip to ${destination}`;
  }
  
  if (message.toLowerCase().includes('hotel')) return 'Hotel Search';
  if (message.toLowerCase().includes('flight')) return 'Flight Search';
  if (message.toLowerCase().includes('activity')) return 'Activity Planning';
  
  return 'Travel Planning';
}

export async function generateTravelResponse(userMessage: string, chatHistory: string[]): Promise<TravelAssistantResponse> {
  // Always try to get search results from SerpAPI first for enhanced responses
  let searchResults: SerpApiResponse | undefined;
  
  try {
    // Use SerpAPI to get real-time information about the user's query
    const searchOptions = {
      location: extractDestination(userMessage) || undefined,
      includeNews: shouldIncludeNews(userMessage),
      includeImages: shouldIncludeImages(userMessage)
    };
    
    const enhancedResults = await serpApiService.searchWithTravelContext(userMessage, searchOptions);
    searchResults = enhancedResults.webResults;
    
    // Add news and images if relevant
    if (enhancedResults.newsResults) {
      searchResults.organicResults = [
        ...searchResults.organicResults,
        ...enhancedResults.newsResults.organicResults.map(r => ({ ...r, title: `📰 ${r.title}` }))
      ];
    }
    
    if (enhancedResults.imageResults) {
      searchResults.organicResults = [
        ...searchResults.organicResults,
        ...enhancedResults.imageResults.organicResults.slice(0, 2).map(r => ({ ...r, title: `🖼️ ${r.title}` }))
      ];
    }
  } catch (searchError) {
    console.error("SerpAPI search error:", searchError);
    // Continue without search results if SerpAPI fails
  }

  // If OpenAI is available, enhance the response with search data
  if (openai) {
    try {
      const searchContext = searchResults ? 
        `\n\nReal-time search results for context:\n${searchResults.summary}\n\nTop results:\n${searchResults.organicResults.slice(0, 3).map(r => `- ${r.title}: ${r.snippet}`).join('\n')}` : '';

      const systemPrompt = `You are TravelAI, an expert travel assistant with access to real-time information through web search. You help users plan amazing trips with current, accurate data.

Your capabilities:
- Access to real-time travel information and prices
- Current weather, events, and local conditions
- Up-to-date restaurant, hotel, and activity recommendations
- Real flight schedules and booking information
- Local tips and insider knowledge

Always provide helpful, personalized responses based on the user's needs. When you have search results, incorporate that real-time information naturally into your response. Be conversational and focus on practical advice.

Format your responses using markdown for better readability:
- Use **bold** for important points
- Use ### for section headings  
- Use bullet points for lists
- Include relevant emojis sparingly to make responses more engaging
- Structure information clearly with sections when appropriate

${searchContext}`;

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
        temperature: 0.7,
        max_tokens: 1000,
      });

      const aiMessage = response.choices[0].message.content || "I'm sorry, I couldn't process your request. Please try again.";
      
      // Add search results in a more organized format
      let enhancedMessage = aiMessage;
      if (searchResults && searchResults.organicResults.length > 0) {
        enhancedMessage += `\n\n---\n\n### 🔍 Additional Resources\n\n`;
        searchResults.organicResults.slice(0, 3).forEach((result, i) => {
          enhancedMessage += `**${i + 1}. [${result.title}](${result.link})**\n`;
          if (result.snippet) {
            enhancedMessage += `${result.snippet.substring(0, 120)}...\n\n`;
          }
        });
      }

      return {
        message: enhancedMessage,
        searchResults,
        shouldSearchTravel: shouldSearchForTravel(userMessage),
        travelQuery: shouldSearchForTravel(userMessage) ? extractTravelQuery(userMessage) : undefined
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      // Fall back to enhanced response with just search results
    }
  }

  // Enhanced fallback response using search results
  if (searchResults) {
    const fallbackResponse = generateFallbackTravelResponse(userMessage);
    let enhancedMessage = fallbackResponse.message;
    
    enhancedMessage += `\n\n---\n\n### 📊 Current Information\n\n${searchResults.summary}\n`;
    
    if (searchResults.organicResults.length > 0) {
      enhancedMessage += `\n### 🔍 Helpful Resources\n\n`;
      searchResults.organicResults.slice(0, 4).forEach((result, i) => {
        enhancedMessage += `**${i + 1}. [${result.title}](${result.link})**\n`;
        if (result.snippet) {
          enhancedMessage += `${result.snippet.substring(0, 120)}...\n\n`;
        }
      });
    }

    return {
      message: enhancedMessage,
      searchResults,
      shouldSearchTravel: shouldSearchForTravel(userMessage),
      travelQuery: shouldSearchForTravel(userMessage) ? extractTravelQuery(userMessage) : undefined
    };
  }

  // Final fallback without search results
  return generateFallbackTravelResponse(userMessage);
}

// Helper functions for search enhancement
function shouldIncludeNews(message: string): boolean {
  const newsKeywords = ['news', 'current', 'latest', 'recent', 'events', 'what\'s happening', 'updates'];
  return newsKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

function shouldIncludeImages(message: string): boolean {
  const imageKeywords = ['photos', 'pictures', 'images', 'looks like', 'show me', 'see'];
  return imageKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

function shouldSearchForTravel(message: string): boolean {
  const travelSearchKeywords = ['hotel', 'flight', 'book', 'reserve', 'availability', 'prices', 'cost'];
  return travelSearchKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

function extractTravelQuery(message: string): {
  destination: string;
  type: 'hotels' | 'flights' | 'activities' | 'mixed';
  dates?: string;
  guests?: string;
  budget?: string;
} | undefined {
  const destination = extractDestination(message);
  if (!destination) return undefined;

  let type: 'hotels' | 'flights' | 'activities' | 'mixed' = 'mixed';
  if (message.includes('hotel') || message.includes('accommodation')) type = 'hotels';
  else if (message.includes('flight') || message.includes('fly')) type = 'flights';
  else if (message.includes('activity') || message.includes('things to do')) type = 'activities';

  return {
    destination,
    type,
    dates: extractDates(message),
    guests: extractGuests(message),
    budget: extractBudget(message)
  };
}

export async function generateChatTitle(firstMessage: string): Promise<string> {
  // If OpenAI is not available, generate title from message content
  if (!openai) {
    return generateFallbackTitle(firstMessage);
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

    return response.choices[0].message.content?.trim() || generateFallbackTitle(firstMessage);
  } catch (error) {
    console.error("Error generating chat title:", error);
    return generateFallbackTitle(firstMessage);
  }
}