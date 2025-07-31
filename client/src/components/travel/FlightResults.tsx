import { Plane } from "lucide-react";

interface FlightResult {
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

interface FlightResultsProps {
  flights: FlightResult[];
}

export function FlightResults({ flights }: FlightResultsProps) {
  if (!flights || flights.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Plane className="text-blue-600 h-4 w-4" />
          <h3 className="font-semibold text-gray-900">Flight Options</h3>
        </div>
        <div className="text-gray-500 text-sm py-4 text-center">
          No flight results available. Please try a different search or contact our travel team for assistance.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Plane className="text-blue-600 h-4 w-4" />
        <h3 className="font-semibold text-gray-900">Flight Options</h3>
      </div>
      <div className="space-y-3">
        {flights.map((flight, index) => (
          <div 
            key={flight.id} 
            className={`flex items-center justify-between p-3 rounded-lg border ${
              index === 0 ? 'bg-blue-50 border-blue-100' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{flight.departure.airport}</div>
                <div className="text-sm text-gray-500">{flight.departure.time}</div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-12 h-px bg-gray-300"></div>
                <Plane className="h-4 w-4" />
                <div className="w-12 h-px bg-gray-300"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{flight.arrival.airport}</div>
                <div className="text-sm text-gray-500">{flight.arrival.time}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${index === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                {flight.currency}{flight.price}
              </div>
              <div className="text-sm text-gray-500">per person</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
