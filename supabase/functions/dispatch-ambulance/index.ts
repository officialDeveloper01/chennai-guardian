import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Chennai ambulance fleet data
const ambulanceFleet = [
  {
    id: 'AMB001',
    lat: 13.0827,
    lng: 80.2707,
    status: 'Available',
    location: 'T. Nagar Station',
    driver: 'Raj Kumar',
    phone: '+91 98765 43210',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'AMB002',
    lat: 13.0569,
    lng: 80.2091,
    status: 'Available',
    location: 'Velachery',
    driver: 'Priya Sharma',
    phone: '+91 98765 43211',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'AMB003',
    lat: 13.1475,
    lng: 80.2197,
    status: 'Available',
    location: 'Anna Nagar',
    driver: 'Kumar Singh',
    phone: '+91 98765 43212',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'AMB004',
    lat: 12.9165,
    lng: 80.1854,
    status: 'Available',
    location: 'Tambaram',
    driver: 'Deepak Raj',
    phone: '+91 98765 43213',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'AMB005',
    lat: 13.0475,
    lng: 80.2824,
    status: 'Available',
    location: 'Adyar',
    driver: 'Sita Devi',
    phone: '+91 98765 43214',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'AMB006',
    lat: 13.078,
    lng: 80.245,
    status: 'Available',
    location: 'Near Kola Saraswathi School',
    driver: 'Suresh Kumar',
    phone: '+91 98765 43215',
    lastUpdated: new Date().toISOString()
  }
];

// Simulate some ambulances being on duty
const randomizeAmbulanceStatus = () => {
  return ambulanceFleet.map(ambulance => {
    const random = Math.random();
    let status = 'Available';
    let eta = undefined;
    
    if (random > 0.7) {
      status = 'On Duty';
      eta = `${Math.floor(Math.random() * 15) + 5} mins`;
    } else if (random > 0.85) {
      status = 'En-route';
      eta = `${Math.floor(Math.random() * 20) + 8} mins`;
    }
    
    return {
      ...ambulance,
      status,
      eta,
      lastUpdated: new Date().toISOString()
    };
  });
};

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, emergencyLocation } = await req.json().catch(() => ({}));
    
    if (action === 'dispatch' && emergencyLocation) {
      // Find the nearest available ambulance
      const currentAmbulances = randomizeAmbulanceStatus();
      const availableAmbulances = currentAmbulances.filter(amb => amb.status === 'Available');
      
      if (availableAmbulances.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No available ambulances',
          message: 'All ambulances are currently assigned or en-route'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Find nearest ambulance to emergency location
      let nearestAmbulance = availableAmbulances[0];
      let shortestDistance = calculateDistance(
        emergencyLocation.lat, 
        emergencyLocation.lng, 
        nearestAmbulance.lat, 
        nearestAmbulance.lng
      );

      for (const ambulance of availableAmbulances) {
        const distance = calculateDistance(
          emergencyLocation.lat,
          emergencyLocation.lng,
          ambulance.lat,
          ambulance.lng
        );
        
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestAmbulance = ambulance;
        }
      }

      // Calculate ETA based on distance (assuming average city speed of 20 km/h)
      const estimatedTime = Math.round((shortestDistance / 20) * 60); // Convert to minutes
      const eta = `${Math.max(estimatedTime, 3)} mins`; // Minimum 3 minutes

      // Update ambulance status
      const dispatchedAmbulance = {
        ...nearestAmbulance,
        status: 'Dispatched',
        eta,
        emergencyLocation: emergencyLocation.name,
        dispatchTime: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      console.log(`Dispatched ${nearestAmbulance.id} to ${emergencyLocation.name} with ETA ${eta}`);

      return new Response(JSON.stringify({
        success: true,
        ambulance: dispatchedAmbulance,
        message: `${nearestAmbulance.id} dispatched with ETA ${eta}`,
        distance: `${shortestDistance.toFixed(1)} km`
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
      });
    }

    // Default: return current ambulance status
    const currentAmbulances = randomizeAmbulanceStatus();
    
    console.log(`Retrieved status for ${currentAmbulances.length} ambulances`);

    return new Response(JSON.stringify(currentAmbulances), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30' // 30 second cache
      },
    });

  } catch (error) {
    console.error('Error in dispatch-ambulance function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to process ambulance dispatch',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});