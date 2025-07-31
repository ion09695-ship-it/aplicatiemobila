import { Bed, Star } from "lucide-react";

interface HotelResult {
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

interface HotelResultsProps {
  hotels: HotelResult[];
}

export function HotelResults({ hotels }: HotelResultsProps) {
  if (!hotels || hotels.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bed className="text-blue-600 h-4 w-4" />
          <h3 className="font-semibold text-gray-900">Recommended Hotels</h3>
        </div>
        <div className="text-gray-500 text-sm py-4 text-center">
          No hotel results available. Please try a different search or contact our travel team for assistance.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bed className="text-blue-600 h-4 w-4" />
        <h3 className="font-semibold text-gray-900">Recommended Hotels</h3>
      </div>
      <div className="space-y-3">
        {hotels.map((hotel, index) => (
          <div 
            key={hotel.id}
            className={`flex gap-3 p-3 rounded-lg border ${
              index === 0 ? 'bg-blue-50 border-blue-100' : 'bg-gray-50'
            }`}
          >
            <img 
              src={hotel.imageUrl} 
              alt={hotel.name}
              className="w-20 h-16 rounded-lg object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D'80'%20height%3D'64'%20xmlns%3D'http%3A//www.w3.org/2000/svg'%3E%3Crect%20width%3D'100%25'%20height%3D'100%25'%20fill%3D'%23f3f4f6'/%3E%3Ctext%20x%3D'50%25'%20y%3D'50%25'%20text-anchor%3D'middle'%20dy%3D'.3em'%20fill%3D'%236b7280'%3EHotel%3C/text%3E%3C/svg%3E";
              }}
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{hotel.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < hotel.rating ? 'fill-current' : ''}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {hotel.rating} ({hotel.reviewCount.toLocaleString()} reviews)
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{hotel.location}</p>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${index === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                    {hotel.currency}{hotel.pricePerNight}
                  </div>
                  <div className="text-sm text-gray-500">per night</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
