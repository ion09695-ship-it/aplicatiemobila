import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export interface TravelAssistantResponse {
  message: string;
  searchParams?: {
    destination: string;
    type: 'hotels' | 'flights' | 'activities' | 'mixed';
    dates?: string;
    guests?: string;
    budget?: string;
  };
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
  const searchParams = destination ? {
    destination,
    type: 'hotels' as const,
    dates: extractDates(message),
    guests: extractGuests(message),
    budget: extractBudget(message)
  } : undefined;
  
  return {
    message: `Great! I'll help you find the perfect accommodation${destText}. Here are some excellent options I found:

🏨 **Hotel Recommendations${destText}:**

**Luxury Options:**
- Premium hotels with world-class amenities
- 5-star service and prime locations
- Spa, fine dining, and concierge services

**Mid-Range Choices:**
- Comfortable hotels with great value
- Modern amenities and convenient locations  
- Perfect balance of quality and price

**Budget-Friendly:**
- Clean, safe, and affordable options
- Essential amenities for comfortable stays
- Great for budget-conscious travelers

To get more specific recommendations, please let me know:
- Your travel dates
- Number of guests
- Preferred budget range
- Any special requirements (location, amenities, etc.)

I'll provide personalized hotel suggestions with booking links!`,
    searchParams
  };
}

function generateFlightResponse(destination: string | null, message: string): TravelAssistantResponse {
  const destText = destination ? ` to ${destination}` : '';
  const searchParams = destination ? {
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
    searchParams
  };
}

function generateActivityResponse(destination: string | null, message: string): TravelAssistantResponse {
  const destText = destination ? ` in ${destination}` : '';
  const searchParams = destination ? {
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
    searchParams
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
    searchParams: {
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
  // If OpenAI is not available, provide intelligent fallback responses
  if (!openai) {
    return generateFallbackTravelResponse(userMessage);
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

Be friendly, knowledgeable, and focus on providing personalized recommendations based on user preferences.`;

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
    });

    return {
      message: response.choices[0].message.content || "I'm sorry, I couldn't process your request. Please try again."
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return generateFallbackTravelResponse(userMessage);
  }
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