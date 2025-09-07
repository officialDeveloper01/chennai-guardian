import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const mapboxAccessToken = Deno.env.get('MAPBOX_ACCESS_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Chennai hotspot coordinates
const chennaiHotspots = [
  { id: 'HOT001', name: 'Kola Saraswathi School Area', lat: 13.079172, lng: 80.2461540 },
  { id: 'HOT002', name: 'T. Nagar Commercial Area', lat: 13.0418, lng: 80.2341 },
  { id: 'HOT003', name: 'Marina Beach Junction', lat: 13.0499, lng: 80.2825 },
  { id: 'HOT004', name: 'Anna Nagar Round Tana', lat: 13.1475, lng: 80.2197 },
  { id: 'HOT005', name: 'Velachery Bus Terminus', lat: 13.0127, lng: 80.2093 },
  { id: 'HOT006', name: 'Adyar Junction', lat: 13.0067, lng: 80.2206 }
];

// Cache to store traffic data for 2 minutes
let trafficCache: { data: any[], timestamp: number } | null = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

async function getTrafficData(lat: number, lng: number): Promise<any> {
  try {
    // Use Mapbox Matrix API to get traffic-aware travel times to nearby points
    const nearbyPoints = [
      [lng + 0.01, lat],      // East
      [lng - 0.01, lat],      // West  
      [lng, lat + 0.01],      // North
      [lng, lat - 0.01]       // South
    ];
    
    const coordinates = [[lng, lat], ...nearbyPoints];
    const coordinatesStr = coordinates.map(coord => coord.join(',')).join(';');
    
    const response = await fetch(
      `https://api.mapbox.com/directions-matrix/v1/mapbox/driving-traffic/${coordinatesStr}?sources=0&access_token=${mapboxAccessToken}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`Mapbox API error for ${lat},${lng}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.durations || !data.durations[0]) {
      return null;
    }

    // Calculate average travel time and estimate traffic level
    const durations = data.durations[0].slice(1); // Remove self-reference
    const avgDuration = durations.reduce((sum: number, dur: number) => sum + dur, 0) / durations.length;
    
    // Estimate speed based on 1km distance and travel time
    const estimatedSpeed = avgDuration > 0 ? (1000 / avgDuration) * 3.6 : 30; // Convert m/s to km/h
    
    let trafficLevel = 'low';
    let category = 'moderate';
    let intensity = 0.3;
    
    if (estimatedSpeed < 15) {
      trafficLevel = 'heavy';
      category = 'high';
      intensity = 0.9;
    } else if (estimatedSpeed < 25) {
      trafficLevel = 'moderate';
      category = 'moderate';
      intensity = 0.6;
    } else {
      trafficLevel = 'low';
      category = 'moderate';
      intensity = 0.3;
    }

    return {
      traffic_level: trafficLevel,
      current_speed_kmph: Math.round(estimatedSpeed),
      category,
      intensity,
      prediction: `Current traffic: ${trafficLevel} congestion`,
      trend: estimatedSpeed < 20 ? 'rising' : 'stable'
    };
    
  } catch (error) {
    console.error(`Error fetching traffic data for ${lat},${lng}:`, error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Traffic API called');

    // Check cache first
    if (trafficCache && (Date.now() - trafficCache.timestamp) < CACHE_DURATION) {
      console.log('Returning cached traffic data');
      return new Response(JSON.stringify(trafficCache.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!mapboxAccessToken) {
      throw new Error('Mapbox access token not configured');
    }

    // Fetch traffic data for all hotspots in parallel
    const trafficPromises = chennaiHotspots.map(async (hotspot) => {
      const trafficData = await getTrafficData(hotspot.lat, hotspot.lng);
      
      return {
        hotspot_id: hotspot.id,
        name: hotspot.name,
        lat: hotspot.lat,
        lng: hotspot.lng,
        ...trafficData || {
          traffic_level: 'moderate',
          current_speed_kmph: 25,
          category: 'moderate',
          intensity: 0.5,
          prediction: 'Traffic data unavailable - using fallback',
          trend: 'stable'
        }
      };
    });

    const results = await Promise.all(trafficPromises);
    
    // Update cache
    trafficCache = {
      data: results,
      timestamp: Date.now()
    };

    console.log(`Traffic data updated for ${results.length} hotspots`);

    return new Response(JSON.stringify(results), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=120' // 2 minutes cache
      },
    });

  } catch (error) {
    console.error('Error in traffic function:', error);
    
    // Return fallback data on error
    const fallbackData = chennaiHotspots.map(hotspot => ({
      hotspot_id: hotspot.id,
      name: hotspot.name,
      lat: hotspot.lat,
      lng: hotspot.lng,
      traffic_level: 'moderate',
      current_speed_kmph: 25,
      category: 'moderate',
      intensity: 0.5,
      prediction: 'Live traffic data temporarily unavailable',
      trend: 'stable'
    }));

    return new Response(JSON.stringify(fallbackData), {
      status: 200, // Return 200 with fallback data instead of error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});