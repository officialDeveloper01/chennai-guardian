import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=300, s-maxage=600', // Cache for 5min client, 10min CDN
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination } = await req.json();
    
    if (!origin || !destination) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Origin and destination coordinates are required',
          code: 'MISSING_COORDINATES' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const MAPBOX_ACCESS_TOKEN = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    if (!MAPBOX_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Mapbox API configuration error',
          code: 'API_CONFIG_ERROR' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert origin and destination to coordinates if they're addresses
    const originCoords = Array.isArray(origin) ? origin.join(',') : await geocodeAddress(origin, MAPBOX_ACCESS_TOKEN);
    const destinationCoords = Array.isArray(destination) ? destination.join(',') : await geocodeAddress(destination, MAPBOX_ACCESS_TOKEN);

    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords};${destinationCoords}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
    
    const response = await fetch(directionsUrl);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No route found between specified points',
          code: 'NO_ROUTE_FOUND' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const route = data.routes[0];
    const result = {
      success: true,
      data: {
        distance_km: Math.round((route.distance / 1000) * 100) / 100,
        duration_min: Math.round(route.duration / 60),
        duration_text: `${Math.round(route.duration / 60)} min`,
        distance_text: `${Math.round((route.distance / 1000) * 100) / 100} km`,
        geometry: route.geometry,
        overview_polyline: route.geometry.coordinates
      },
      timestamp: new Date().toISOString()
    };

    console.log('Route calculated successfully for Chennai area');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in route function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Route calculation failed',
        code: 'ROUTE_CALCULATION_ERROR',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function geocodeAddress(address: string, accessToken: string): Promise<string> {
  const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${accessToken}`;
  const response = await fetch(geocodeUrl);
  const data = await response.json();
  
  if (!data.features || data.features.length === 0) {
    throw new Error(`Unable to geocode address: ${address}`);
  }
  
  const coordinates = data.features[0].center;
  return `${coordinates[0]},${coordinates[1]}`;
}