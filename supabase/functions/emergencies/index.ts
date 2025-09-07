import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Chennai emergency-prone locations
const emergencyLocations = [
  { name: 'Besant Nagar Beach Road', lat: 13.0067, lng: 80.2669, type: 'accident' },
  { name: 'Guindy Industrial Estate', lat: 13.0067, lng: 80.2206, type: 'workplace' },
  { name: 'Koyambedu Market Complex', lat: 13.1067, lng: 80.1912, type: 'crowd' },
  { name: 'Central Railway Station', lat: 13.0836, lng: 80.2750, type: 'transport' },
  { name: 'Express Avenue Mall', lat: 13.0569, lng: 80.2511, type: 'crowd' },
  { name: 'Marina Beach Promenade', lat: 13.0524, lng: 80.2824, type: 'public' },
  { name: 'Vadapalani Bus Depot', lat: 13.0502, lng: 80.2126, type: 'transport' },
  { name: 'Porur IT Park', lat: 13.0359, lng: 80.1553, type: 'workplace' },
  { name: 'Tambaram Railway Station', lat: 12.9249, lng: 80.1000, type: 'transport' },
  { name: 'Adyar Cancer Institute', lat: 13.0067, lng: 80.2548, type: 'medical' }
];

const emergencyTypes = [
  'Traffic Accident',
  'Medical Emergency', 
  'Fire Incident',
  'Public Disturbance',
  'Infrastructure Issue'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, location } = await req.json().catch(() => ({}));
    
    if (action === 'simulate') {
      // Simulate a new emergency
      const randomLocation = emergencyLocations[Math.floor(Math.random() * emergencyLocations.length)];
      const randomType = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
      
      const emergency = {
        id: `EMG${Date.now()}`,
        type: randomType,
        location: randomLocation.name,
        lat: randomLocation.lat + (Math.random() - 0.5) * 0.01, // Add small variation
        lng: randomLocation.lng + (Math.random() - 0.5) * 0.01,
        severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        timestamp: new Date().toISOString(),
        status: 'active',
        reportedBy: 'Public Call',
        estimatedArrival: Math.floor(Math.random() * 15) + 3 // 3-18 minutes
      };

      console.log(`Simulated emergency: ${emergency.type} at ${emergency.location}`);
      
      return new Response(JSON.stringify({
        success: true,
        emergency
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
      });
    }

    // Default: return active emergencies (simulated for demo)
    const currentTime = Date.now();
    const activeEmergencies = [];
    
    // Generate 1-4 active emergencies based on time of day
    const currentHour = new Date().getHours();
    const isRushHour = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 19);
    const emergencyCount = isRushHour ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < emergencyCount; i++) {
      const location = emergencyLocations[Math.floor(Math.random() * emergencyLocations.length)];
      const type = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
      
      activeEmergencies.push({
        id: `EMG${currentTime + i}`,
        type,
        location: location.name,
        lat: location.lat + (Math.random() - 0.5) * 0.01,
        lng: location.lng + (Math.random() - 0.5) * 0.01,
        severity: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
        timestamp: new Date(currentTime - Math.random() * 1800000).toISOString(), // Within last 30 mins
        status: 'active',
        reportedBy: Math.random() > 0.5 ? 'Public Call' : 'Emergency Services',
        estimatedArrival: Math.floor(Math.random() * 20) + 5
      });
    }

    console.log(`Retrieved ${activeEmergencies.length} active emergencies`);

    return new Response(JSON.stringify(activeEmergencies), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30' // 30 second cache
      },
    });

  } catch (error) {
    console.error('Error in emergencies function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch emergency data',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});