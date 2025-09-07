import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=1800, s-maxage=3600', // Cache for 30min client, 1hr CDN
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city = "Chennai" } = await req.json();

    const EVENTBRITE_API_KEY = Deno.env.get('EVENTBRITE_API_KEY');
    const MAPBOX_ACCESS_TOKEN = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    
    if (!EVENTBRITE_API_KEY || !MAPBOX_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Event API configuration error',
          code: 'API_CONFIG_ERROR' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search for events in Chennai
    const eventbriteUrl = `https://www.eventbriteapi.com/v3/events/search/?q=${encodeURIComponent(city)}&location.address=${encodeURIComponent(city)}&expand=venue&token=${EVENTBRITE_API_KEY}`;
    
    const response = await fetch(eventbriteUrl);
    const data = await response.json();

    if (response.status !== 200) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: data.error_description || 'Failed to fetch events from Eventbrite',
          code: 'EVENTBRITE_API_ERROR' 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const events = await Promise.all(
      (data.events || []).slice(0, 20).map(async (event: any) => {
        let lat = null;
        let lng = null;

        // Try to get coordinates from venue
        if (event.venue && event.venue.latitude && event.venue.longitude) {
          lat = parseFloat(event.venue.latitude);
          lng = parseFloat(event.venue.longitude);
        } else if (event.venue && event.venue.address) {
          // Geocode the venue address using Mapbox
          try {
            const address = `${event.venue.address.address_1 || ''} ${event.venue.address.city || ''} ${event.venue.address.region || ''}`.trim();
            if (address) {
              const coords = await geocodeAddress(address, MAPBOX_ACCESS_TOKEN);
              lat = coords.lat;
              lng = coords.lng;
            }
          } catch (geocodeError) {
            console.warn('Failed to geocode venue address:', geocodeError);
          }
        }

        // Format date and time
        const eventDate = event.start?.local || event.start?.utc;
        const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('en-IN') : '';
        const formattedTime = eventDate ? new Date(eventDate).toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '';

        return {
          id: event.id,
          name: event.name?.text || 'Unnamed Event',
          venue: event.venue?.name || 'Unknown Venue',
          address: event.venue?.address ? 
            `${event.venue.address.address_1 || ''} ${event.venue.address.city || ''}`.trim() : 
            'Address not available',
          lat,
          lng,
          time: eventDate,
          date_text: formattedDate,
          time_text: formattedTime,
          datetime_text: `${formattedDate} at ${formattedTime}`,
          url: event.url,
          description: (event.description?.text || '').substring(0, 200) + '...',
          category: 'Live Event',
          is_free: event.is_free || false,
          currency: event.currency || 'INR'
        };
      })
    );

    // Filter out events without coordinates and sort by date
    const validEvents = events
      .filter(event => event.lat && event.lng)
      .sort((a, b) => new Date(a.time || 0).getTime() - new Date(b.time || 0).getTime());

    console.log(`Fetched ${validEvents.length} live events with coordinates for ${city}`);

    const result = {
      success: true,
      data: validEvents,
      count: validEvents.length,
      city: city,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in events function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Events data fetch failed',
        code: 'EVENTS_FETCH_ERROR',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function geocodeAddress(address: string, accessToken: string): Promise<{ lat: number, lng: number }> {
  const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${accessToken}`;
  const response = await fetch(geocodeUrl);
  const data = await response.json();
  
  if (!data.features || data.features.length === 0) {
    throw new Error(`Unable to geocode address: ${address}`);
  }
  
  const coordinates = data.features[0].center;
  return { lat: coordinates[1], lng: coordinates[0] };
}