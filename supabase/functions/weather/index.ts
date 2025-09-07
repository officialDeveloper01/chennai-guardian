// functions/weather/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ✅ Keep your OpenWeather API key in Supabase secrets
// set it with: supabase secrets set --env-file .env
const OPENWEATHER_API_KEY = Deno.env.get("OPENWEATHER_API_KEY");

serve(async (req) => {
  try {
    const { city } = await req.json();

    if (!OPENWEATHER_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing API key" }),
        { status: 500 }
      );
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const weatherRes = await fetch(url);
    const weatherData = await weatherRes.json();

    if (weatherData.cod !== 200) {
      return new Response(
        JSON.stringify({ success: false, error: weatherData.message }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          temperature: weatherData.main.temp,
          condition: weatherData.weather[0].description,
          city: weatherData.name,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
});
// src/components/HotspotPanel.tsx