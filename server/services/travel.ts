export interface HotelResult {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  currency: string;
  imageUrl: string;
  location: string;
  amenities: string[];
  description: string;
}

export interface FlightResult {
  id: string;
  airline: string;
  departure: {
    airport: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    time: string;
    date: string;
  };
  duration: string;
  price: number;
  currency: string;
  stops: number;
}

export interface ActivityResult {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  duration: string;
  category: string;
}

export interface TravelSearchQuery {
  type: 'hotels' | 'flights' | 'activities';
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  budget?: string;
  origin?: string; // For flights
}

// Mock travel API service - replace with real API integration
export class TravelService {
  
  async searchHotels(query: TravelSearchQuery): Promise<HotelResult[]> {
    // TODO: Replace with real hotel API (Booking.com, Amadeus, etc.)
    // For now, return empty array to avoid mock data
    console.log("Hotel search query:", query);
    return [];
  }

  async searchFlights(query: TravelSearchQuery): Promise<FlightResult[]> {
    // TODO: Replace with real flight API (Amadeus, Skyscanner, etc.)
    // For now, return empty array to avoid mock data
    console.log("Flight search query:", query);
    return [];
  }

  async searchActivities(query: TravelSearchQuery): Promise<ActivityResult[]> {
    // TODO: Replace with real activities API (Viator, GetYourGuide, etc.)
    // For now, return empty array to avoid mock data
    console.log("Activities search query:", query);
    return [];
  }

  async searchTravel(query: TravelSearchQuery): Promise<{
    hotels?: HotelResult[];
    flights?: FlightResult[];
    activities?: ActivityResult[];
  }> {
    const results: any = {};

    switch (query.type) {
      case 'hotels':
        results.hotels = await this.searchHotels(query);
        break;
      case 'flights':
        results.flights = await this.searchFlights(query);
        break;
      case 'activities':
        results.activities = await this.searchActivities(query);
        break;
    }

    return results;
  }
}

export const travelService = new TravelService();
