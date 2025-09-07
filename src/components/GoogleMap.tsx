import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface Ambulance {
  id: string;
  lat: number;
  lng: number;
  status: 'Available' | 'On Duty' | 'En-route' | 'Dispatched';
  location: string;
  eta?: string;
  driver?: string;
  phone?: string;
}

interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  trafficLevel: 'light' | 'moderate' | 'heavy';
  currentSpeed: number;
  category: 'moderate' | 'high';
}

interface GoogleMapProps {
  ambulances: Ambulance[];
  hotspots: Hotspot[];
  onAmbulanceSelect: (ambulance: Ambulance) => void;
  onHotspotSelect: (hotspot: Hotspot) => void;
  onDispatchAmbulance: (ambulance: Ambulance) => void;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  ambulances,
  hotspots,
  onAmbulanceSelect,
  onHotspotSelect,
  onDispatchAmbulance
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: 'AIzaSyBIoOGxr3I6tm2q9795lAfdVgKl3IDJoiE', // Replace with actual API key
        version: 'weekly',
        libraries: ['places']
      });

      try {
        await loader.load();

        if (mapRef.current) {
          const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: { lat: 13.0827, lng: 80.2707 }, // Chennai center
            zoom: 11,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          setMap(mapInstance);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setIsError(true);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add ambulance markers
    ambulances.forEach(ambulance => {
      const marker = new window.google.maps.Marker({
        position: { lat: ambulance.lat, lng: ambulance.lng },
        map: map,
        title: ambulance.id,
        icon: {
          url:
            'data:image/svg+xml;charset=UTF-8,' +
            encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="12" fill="${getAmbulanceColor(
                  ambulance.status
                )}"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="12">🚑</text>
              </svg>
            `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });

      const dispatchButtonHtml =
        ambulance.status === 'Available'
          ? `<button onclick="window.dispatchAmbulance('${ambulance.id}')" 
               style="background-color: #10b981; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; margin-top: 8px;">
               🚑 Dispatch to Nearest Hospital
             </button>`
          : '';

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold mb-2">${ambulance.id}</h3>
            <div class="space-y-1 text-sm">
              <p><strong>Status:</strong> ${ambulance.status}</p>
              <p><strong>Location:</strong> ${ambulance.location}</p>
              <p><strong>Driver:</strong> ${ambulance.driver}</p>
              <p><strong>Phone:</strong> ${ambulance.phone}</p>
              ${
                ambulance.eta
                  ? `<p><strong>ETA:</strong> ${ambulance.eta}</p>`
                  : ''
              }
            </div>
            ${dispatchButtonHtml}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        onAmbulanceSelect(ambulance);
      });

      markersRef.current.push(marker);
    });

    // Add hotspot markers
    hotspots.forEach(hotspot => {
      const marker = new window.google.maps.Marker({
        position: { lat: hotspot.lat, lng: hotspot.lng },
        map: map,
        title: hotspot.name,
        icon: {
          url:
            'data:image/svg+xml;charset=UTF-8,' +
            encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                <circle cx="14" cy="14" r="12" fill="${
                  hotspot.category === 'high' ? '#ef4444' : '#f59e0b'
                }" />
                <text x="14" y="16" text-anchor="middle" dominant-baseline="middle" 
                      fill="white" font-size="12">🔥</text>
              </svg>
            `),
          scaledSize: new window.google.maps.Size(28, 28),
          anchor: new window.google.maps.Point(14, 14)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold mb-2">${hotspot.name}</h3>
            <div class="space-y-1 text-sm">
              <p><strong>Traffic Level:</strong> ${hotspot.trafficLevel}</p>
              <p><strong>Current Speed:</strong> ${hotspot.currentSpeed} km/h</p>
              <p><strong>Category:</strong> ${hotspot.category}</p>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        onHotspotSelect(hotspot);
      });

      markersRef.current.push(marker);
    });
  }, [map, isLoaded, ambulances, hotspots, onAmbulanceSelect, onHotspotSelect]);

  // Set up global dispatch function for button clicks
  useEffect(() => {
    (window as any).dispatchAmbulance = (ambulanceId: string) => {
      const ambulance = ambulances.find(amb => amb.id === ambulanceId);
      if (ambulance) {
        onDispatchAmbulance(ambulance);
      }
    };

    return () => {
      delete (window as any).dispatchAmbulance;
    };
  }, [ambulances, onDispatchAmbulance]);

  const getAmbulanceColor = (status: string) => {
    switch (status) {
      case 'Available':
        return '#10b981';
      case 'On Duty':
        return '#f59e0b';
      case 'En-route':
        return '#3b82f6';
      case 'Dispatched':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">
              Loading Google Maps...
            </p>
          </div>
        </div>
      )}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Google Maps unavailable
            </p>
            <p className="text-xs text-muted-foreground">
              Please add your Google Maps API key
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
