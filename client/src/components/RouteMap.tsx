import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, Package } from "lucide-react";

export default function RouteMap() {
  // Mock route data - in production this would come from real transport APIs
  const mockRoutes = [
    { id: 1, from: "Cape Town", to: "Johannesburg", active: true },
    { id: 2, from: "Johannesburg", to: "Durban", active: true },
    { id: 3, from: "Cape Town", to: "Port Elizabeth", active: false },
    { id: 4, from: "Durban", to: "Pietermaritzburg", active: true },
  ];

  const mockTransportLocations = [
    { id: 1, name: "Cape Town Hub", lat: 25, lng: 25, type: "hub" },
    { id: 2, name: "Johannesburg Hub", lat: 66, lng: 33, type: "hub" },
    { id: 3, name: "Durban Hub", lat: 75, lng: 66, type: "hub" },
    { id: 4, name: "Golden Arrow Bus", lat: 45, lng: 29, type: "transport" },
    { id: 5, name: "Intercape Coach", lat: 70, lng: 50, type: "transport" },
  ];

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Transport Routes & Real-time Locations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center relative overflow-hidden border">
          {/* Mock South Africa map background */}
          <div className="w-full h-full relative">
            {/* Route lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Cape Town to Johannesburg */}
              <line 
                x1="25%" y1="75%" 
                x2="66%" y2="33%" 
                stroke="#2563EB" 
                strokeWidth="3" 
                strokeDasharray="8,4" 
                opacity="0.8"
              />
              {/* Johannesburg to Durban */}
              <line 
                x1="66%" y1="33%" 
                x2="75%" y2="66%" 
                stroke="#059669" 
                strokeWidth="3" 
                strokeDasharray="8,4" 
                opacity="0.8"
              />
              {/* Cape Town to Port Elizabeth */}
              <line 
                x1="25%" y1="75%" 
                x2="65%" y2="85%" 
                stroke="#6B7280" 
                strokeWidth="2" 
                strokeDasharray="4,4" 
                opacity="0.4"
              />
            </svg>

            {/* Transport locations */}
            {mockTransportLocations.map((location) => (
              <div
                key={location.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                  location.type === 'hub' 
                    ? 'w-4 h-4 bg-primary border-2 border-white rounded-full shadow-lg' 
                    : 'w-3 h-3 bg-yellow-500 border-2 border-white rounded-full shadow-md animate-pulse'
                }`}
                style={{ 
                  left: `${location.lng}%`, 
                  top: `${location.lat}%` 
                }}
                title={location.name}
              />
            ))}

            {/* City labels */}
            <div className="absolute" style={{ left: '25%', top: '80%', transform: 'translate(-50%, 0)' }}>
              <div className="bg-white px-2 py-1 rounded shadow-sm text-xs font-medium">
                Cape Town
              </div>
            </div>
            <div className="absolute" style={{ left: '66%', top: '28%', transform: 'translate(-50%, 0)' }}>
              <div className="bg-white px-2 py-1 rounded shadow-sm text-xs font-medium">
                Johannesburg
              </div>
            </div>
            <div className="absolute" style={{ left: '75%', top: '71%', transform: 'translate(-50%, 0)' }}>
              <div className="bg-white px-2 py-1 rounded shadow-sm text-xs font-medium">
                Durban
              </div>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-48">
              <h4 className="font-semibold text-sm mb-3">Map Legend</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Transport Hubs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Active Transports</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-0.5 bg-primary"></div>
                  <span>Active Routes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-0.5 bg-gray-400 opacity-60"></div>
                  <span>Inactive Routes</span>
                </div>
              </div>
            </div>

            {/* Live stats overlay */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
              <h4 className="font-semibold text-sm mb-2">Live Statistics</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">12</div>
                  <div className="text-gray-600">Active Routes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">8</div>
                  <div className="text-gray-600">Transports</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">24</div>
                  <div className="text-gray-600">In Transit</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">156</div>
                  <div className="text-gray-600">Deliveries</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Route status cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {mockRoutes.map((route) => (
            <div key={route.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{route.from}</p>
                  <p className="text-xs text-gray-500">to {route.to}</p>
                </div>
              </div>
              <Badge variant={route.active ? "default" : "secondary"}>
                {route.active ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
