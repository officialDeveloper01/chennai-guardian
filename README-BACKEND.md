# EMSense Backend API - Supabase Edge Functions

This document describes the backend API endpoints implemented as Supabase Edge Functions for the EMSense Emergency Response Simulation system.

## Available Endpoints

### 1. Route API - `/functions/v1/route`

Calculates routes and ETAs using Mapbox Directions API.

**Method:** `POST`

**Request:**
```json
{
  "origin": [12.9716, 77.5946], // Coordinates [lat, lng] or address string
  "destination": [13.0827, 80.2707] // Coordinates [lat, lng] or address string
}
```

**Response:**
```json
{
  "distance_km": 12.5,
  "duration_min": 18,
  "geometry": {
    "type": "LineString",
    "coordinates": [[77.5946, 12.9716], [80.2707, 13.0827]]
  }
}
```

**Frontend Usage:**
```javascript
const response = await supabase.functions.invoke('route', {
  body: {
    origin: [12.9716, 77.5946],
    destination: [13.0827, 80.2707]
  }
});
const { data } = response;
```

### 2. Weather API - `/functions/v1/weather`

Fetches current weather conditions using OpenWeather API.

**Method:** `POST`

**Request:**
```json
{
  "lat": 13.0827,
  "lon": 80.2707
}
```

**Response:**
```json
{
  "temperature": 28,
  "condition": "Clear",
  "description": "clear sky",
  "icon": "01d",
  "humidity": 65,
  "wind_speed": 3.2,
  "alerts": []
}
```

**Frontend Usage:**
```javascript
const response = await supabase.functions.invoke('weather', {
  body: {
    lat: 13.0827,
    lon: 80.2707
  }
});
const { data } = response;
```

### 3. Events API - `/functions/v1/events`

Fetches upcoming events from Eventbrite and geocodes addresses using Mapbox.

**Method:** `POST`

**Request:**
```json
{
  "city": "Chennai"
}
```

**Response:**
```json
[
  {
    "id": "123456789",
    "name": "Tech Conference 2024",
    "venue": "Chennai Trade Centre",
    "address": "Mount Poonamallee Road, Chennai",
    "lat": 13.0827,
    "lng": 80.2707,
    "time": "2024-01-15T10:00:00",
    "url": "https://eventbrite.com/event/123456789",
    "description": "Annual technology conference"
  }
]
```

**Frontend Usage:**
```javascript
const response = await supabase.functions.invoke('events', {
  body: {
    city: "Chennai"
  }
});
const { data } = response;
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400`: Bad Request (missing required parameters)
- `404`: Not Found (no route found, no events, etc.)
- `500`: Internal Server Error (API key issues, external API failures)

## Setup Requirements

The following secrets must be configured in Supabase Dashboard → Settings → Edge Functions:

1. `MAPBOX_ACCESS_TOKEN` - Your Mapbox public access token
2. `OPENWEATHER_API_KEY` - Your OpenWeather API key
3. `EVENTBRITE_API_KEY` - Your Eventbrite API token

## Frontend Integration Example

```javascript
import { supabase } from '@/integrations/supabase/client';

// Get route between two points
async function getRoute(origin, destination) {
  try {
    const { data, error } = await supabase.functions.invoke('route', {
      body: { origin, destination }
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Route error:', error);
    throw error;
  }
}

// Get current weather
async function getWeather(lat, lon) {
  try {
    const { data, error } = await supabase.functions.invoke('weather', {
      body: { lat, lon }
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Weather error:', error);
    throw error;
  }
}

// Get Chennai events
async function getEvents(city = "Chennai") {
  try {
    const { data, error } = await supabase.functions.invoke('events', {
      body: { city }
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Events error:', error);
    throw error;
  }
}
```

## Notes

- All functions are configured as public endpoints (no JWT verification required)
- CORS is properly configured for frontend access
- Functions include proper error handling and logging
- Geocoding is automatically applied for events without coordinates
- All responses are optimized for frontend consumption