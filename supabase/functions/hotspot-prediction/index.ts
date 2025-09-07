import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Chennai hotspot locations
const chennaiHotspots = [
  {
    id: 'HS001',
    name: 'T. Nagar Commercial District',
    lat: 13.0417,
    lng: 80.2341,
    baseIntensity: 0.8
  },
  {
    id: 'HS002', 
    name: 'Anna Nagar Roundabout',
    lat: 13.0850,
    lng: 80.2101,
    baseIntensity: 0.7
  },
  {
    id: 'HS003',
    name: 'Velachery Main Road',
    lat: 13.0067,
    lng: 80.2206,
    baseIntensity: 0.75
  },
  {
    id: 'HS004',
    name: 'OMR IT Corridor',
    lat: 12.9698,
    lng: 80.2282,
    baseIntensity: 0.85
  },
  {
    id: 'HS005',
    name: 'Central Railway Station Area',
    lat: 13.0878,
    lng: 80.2785,
    baseIntensity: 0.9
  },
  {
    id: 'HS006',
    name: 'Airport Road Junction',
    lat: 12.9897,
    lng: 80.1693,
    baseIntensity: 0.65
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city } = await req.json().catch(() => ({ city: 'Chennai' }));
    
    console.log(`Generating hotspot predictions for ${city}`);

    // Generate dynamic predictions with time-based variations
    const currentHour = new Date().getHours();
    const isRushHour = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 19);
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    
    const predictions = chennaiHotspots.map(hotspot => {
      // Add time-based intensity variations
      let intensityMultiplier = 1.0;
      
      if (isRushHour && !isWeekend) {
        intensityMultiplier = 1.3; // 30% higher during rush hours
      } else if (isWeekend) {
        intensityMultiplier = 0.7; // 30% lower on weekends
      }
      
      // Add some randomness for realistic variation
      const randomVariation = 0.8 + (Math.random() * 0.4); // ±20% variation
      const finalIntensity = Math.min(0.95, hotspot.baseIntensity * intensityMultiplier * randomVariation);
      
      // Determine trend based on time and intensity
      let trend: 'rising' | 'stable' | 'declining';
      if (isRushHour && currentHour < 19) {
        trend = 'rising';
      } else if (currentHour > 19 || currentHour < 7) {
        trend = 'declining';
      } else {
        trend = 'stable';
      }
      
      // Generate prediction text
      const riskLevel = finalIntensity > 0.8 ? 'high' : finalIntensity > 0.5 ? 'moderate' : 'low';
      const predictions = [
        `${Math.round(finalIntensity * 100)}% congestion expected`,
        `Traffic ${trend === 'rising' ? 'increasing' : trend === 'declining' ? 'decreasing' : 'stable'}`,
        `${riskLevel === 'high' ? 'High' : riskLevel === 'moderate' ? 'Moderate' : 'Low'} emergency response delay risk`
      ];
      
      return {
        hotspot_id: hotspot.id,
        name: hotspot.name,
        lat: hotspot.lat,
        lng: hotspot.lng,
        intensity: Math.round(finalIntensity * 100) / 100, // Round to 2 decimal places
        prediction: predictions[Math.floor(Math.random() * predictions.length)],
        trend,
        category: finalIntensity > 0.7 ? 'high' : 'moderate'
      };
    });

    console.log(`Generated ${predictions.length} hotspot predictions`);

    return new Response(JSON.stringify(predictions), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60' // 1 minute cache
      },
    });

  } catch (error) {
    console.error('Error in hotspot-prediction function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to generate hotspot predictions',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});