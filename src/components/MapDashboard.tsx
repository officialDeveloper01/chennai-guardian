import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { motion } from 'framer-motion';

// Fix Leaflet default markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Ambulance {
  id: string;
  lat: number;
  lng: number;
  status: 'Available' | 'On Duty' | 'En-route' | 'Dispatched';
  location: string;
  eta?: string;
  driver?: string;
  phone?: string;
  hospital?: {
    id: string;
    name: string;
    address: string;
    phone: string;
    lat: number;
    lng: number;
    distance?: string;
  };
}

interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  intensity: number;
  prediction: string;
  trend?: 'rising' | 'stable' | 'declining';
  category: 'moderate' | 'high';
}

interface MapDashboardProps {
  ambulances: Ambulance[];
  hotspots: Hotspot[];
  hospitals: Array<{
    id: string;
    name: string;
    address: string;
    phone: string;
    lat: number;
    lng: number;
    distance?: string;
  }>;
  onAmbulanceSelect: (ambulance: Ambulance) => void;
  onHotspotSelect: (hotspot: Hotspot) => void;
  onDispatchAmbulance: (ambulance: Ambulance) => void;
  selectedAmbulance: Ambulance | null;
  showTraffic: boolean;
  showHighRiskOnly: boolean;
  simulationStarted: boolean;
  activeEmergencies: Array<{id: string, lat: number, lng: number, hospital: any}>;
}

const MapDashboard: React.FC<MapDashboardProps> = ({
  ambulances,
  hotspots,
  hospitals,
  onAmbulanceSelect,
  onHotspotSelect,
  onDispatchAmbulance,
  selectedAmbulance,
  showTraffic,
  showHighRiskOnly,
  simulationStarted,
  activeEmergencies
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const ambulanceMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const heatmapLayerRef = useRef<any>(null);
  const hotspotCirclesRef = useRef<Map<string, L.Circle>>(new Map());
  const emergencyMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const routeLinesRef = useRef<Map<string, L.Polyline>>(new Map());
  const hospitalMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  // Chennai coordinates
  const chennaiCenter: [number, number] = [13.0827, 80.2707];

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current, {
      center: chennaiCenter,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
    });

    // Add tile layer with medical-friendly colors
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      className: 'map-tiles'
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update ambulance markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing ambulance markers
    ambulanceMarkersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    ambulanceMarkersRef.current.clear();

    // Add ambulance markers
    ambulances.forEach(ambulance => {
      const statusColor = ambulance.status === 'Available' ? '#10b981' : 
                        ambulance.status === 'On Duty' ? '#f59e0b' : 
                        ambulance.status === 'Dispatched' ? '#3b82f6' : '#ef4444';
      const pulseAnimation = ambulance.status !== 'Available' ? 'animation: pulse 2s infinite;' : '';
      const moveAnimation = ambulance.status === 'En-route' || ambulance.status === 'Dispatched' ? 'animation: ambulance-move 2s ease-in-out infinite;' : '';
      
      const ambulanceIcon = L.divIcon({
  html: `
    <div class="ambulance-marker ${ambulance.status.toLowerCase()}" style="
      width: 36px;   /* was 56px */
      height: 36px;  /* was 56px */
      background: ${statusColor};
      border: 3px solid white; /* was 4px */
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2); /* softer shadow */
      font-size: 18px; /* was 26px */
      ${pulseAnimation}
      ${moveAnimation}
      position: relative;
      transition: all 0.3s ease;
    ">
      🚑
    </div>
  `,
  className: 'ambulance-icon',
  iconSize: [36, 36],   // was [56, 56]
  iconAnchor: [18, 18], // was [28, 28]
});


      const marker = L.marker([ambulance.lat, ambulance.lng], { icon: ambulanceIcon })
        .bindPopup(`
          <div class="ambulance-popup">
            <h3 style="margin: 0 0 8px 0; color: #0f766e; font-weight: 600;">
              Ambulance ${ambulance.id}
            </h3>
            <p style="margin: 4px 0; color: #374151;">
              <strong>Status:</strong> 
              <span style="color: ${ambulance.status === 'Available' ? '#059669' : 
                                  ambulance.status === 'On Duty' ? '#d97706' : 
                                  ambulance.status === 'Dispatched' ? '#2563eb' : '#dc2626'};">
                ${ambulance.status}
              </span>
            </p>
            <p style="margin: 4px 0; color: #374151;">
              <strong>Location:</strong> ${ambulance.location}
            </p>
            ${ambulance.eta ? `<p style="margin: 4px 0; color: #374151;"><strong>ETA:</strong> ${ambulance.eta}</p>` : ''}
          </div>
        `)
        .on('click', () => onAmbulanceSelect(ambulance));

      if (mapRef.current) {
        marker.addTo(mapRef.current);
        ambulanceMarkersRef.current.set(ambulance.id, marker);
      }
    });
  }, [ambulances, onAmbulanceSelect]);

  // Update heatmap and hotspot circles
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing heatmap and circles
    if (heatmapLayerRef.current) {
      mapRef.current.removeLayer(heatmapLayerRef.current);
    }
    
    // Clear existing hotspot circles
    hotspotCirclesRef.current.forEach(circle => {
      mapRef.current?.removeLayer(circle);
    });
    hotspotCirclesRef.current.clear();

    // Filter hotspots based on showHighRiskOnly
    const filteredHotspots = showHighRiskOnly 
      ? hotspots.filter(h => h.category === 'high')
      : hotspots;

    // Create heatmap data points
    const heatmapData = filteredHotspots.map(hotspot => [
      hotspot.lat,
      hotspot.lng,
      hotspot.intensity // Intensity represents historical ambulance usage
    ]);

    // Create and add heatmap layer
    heatmapLayerRef.current = (L as any).heatLayer(heatmapData, {
      radius: hotspot => hotspot.category === 'high' ? 80 : 60,
      blur: 35,
      maxZoom: 18,
      max: 1.0,
      gradient: {
        0.0: '#3B82F6', // Blue for low usage
        0.3: '#10B981', // Green for moderate usage  
        0.5: '#F59E0B', // Yellow for moderate usage
        0.7: '#EF4444', // Red for high usage
        1.0: '#DC2626'  // Dark red for extreme usage
      }
    }).addTo(mapRef.current);

    // Add hotspot circles and clickable markers
    filteredHotspots.forEach(hotspot => {
      // Add circles for categorized hotspots
      let circleColor, circleOpacity, circleRadius;
      
      if (hotspot.category === 'high') {
        circleColor = '#ef4444';
        circleOpacity = 0.8;
        circleRadius = hotspot.intensity > 0.9 ? 2000 : 1500; // was 1000 / 800 → now 2km / 1.5km
      } else {
        circleColor = '#f59e0b';
        circleOpacity = 0.6;
        circleRadius = 1000; // was 600 → now 1km
      }

      const circle = L.circle([hotspot.lat, hotspot.lng], {
        radius: circleRadius,
        fillColor: circleColor,
        color: circleColor,
        weight: 2,
        opacity: circleOpacity,
        fillOpacity: circleOpacity * 0.4,
        className: `hotspot-zone-${hotspot.category}`
      });

      if (mapRef.current) {
        circle.addTo(mapRef.current);
        hotspotCirclesRef.current.set(hotspot.id, circle);
      }

      // Add clickable hotspot markers for details
      const markerColor = hotspot.category === 'high' ? '#ef4444' : '#f59e0b';
      const marker = L.circleMarker([hotspot.lat, hotspot.lng], {
        radius: hotspot.category === 'high' ? 10 : 8,
        fillColor: markerColor,
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8,
        className: 'hotspot-info-marker'
      })
        .bindPopup(`
          <div class="hotspot-popup">
            <h3 style="margin: 0 0 8px 0; color: #0f766e; font-weight: 600;">
              ${hotspot.category === 'high' ? '🔴' : '🟡'} ${hotspot.name}
            </h3>
            <p style="margin: 4px 0; color: #374151;">
              <strong>Risk Level:</strong> 
              <span style="color: ${hotspot.category === 'high' ? '#dc2626' : '#d97706'}; font-weight: 600;">
                ${hotspot.category === 'high' ? 'High Risk' : 'Moderate Risk'}
              </span>
            </p>
            <p style="margin: 4px 0; color: #374151;">
              <strong>Historical Usage:</strong> ${(hotspot.intensity * 100).toFixed(0)}%
            </p>
            <p style="margin: 4px 0; color: #374151;">
              <strong>Analysis:</strong> ${hotspot.prediction}
            </p>
            ${hotspot.trend ? `
              <p style="margin: 4px 0; color: #374151;">
                <strong>Trend:</strong> 
                <span style="color: ${hotspot.trend === 'rising' ? '#dc2626' : hotspot.trend === 'declining' ? '#059669' : '#d97706'};">
                  ${hotspot.trend === 'rising' ? '📈' : hotspot.trend === 'declining' ? '📉' : '➡️'} ${hotspot.trend}
                </span>
              </p>
            ` : ''}
            <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">
              Based on past ambulance dispatch data
            </p>
          </div>
        `)
        .on('click', () => onHotspotSelect(hotspot));

      if (mapRef.current) {
        marker.addTo(mapRef.current);
      }
    });
  }, [hotspots, onHotspotSelect, showHighRiskOnly, simulationStarted]);

  // Update hospital markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing hospital markers
    hospitalMarkersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    hospitalMarkersRef.current.clear();

    // Add hospital markers
    hospitals.forEach(hospital => {
      const isGovernment = hospital.name.toLowerCase().includes('government') || 
                          hospital.name.toLowerCase().includes('stanley') ||
                          hospital.name.toLowerCase().includes('kilpauk');
      
      const hospitalIcon = L.divIcon({
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: ${isGovernment ? '#059669' : '#0891b2'};
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            font-size: 14px;
          ">
            🏥
          </div>
        `,
        className: 'hospital-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon })
        .bindPopup(`
          <div class="hospital-popup">
            <h3 style="margin: 0 0 8px 0; color: #0f766e; font-weight: 600;">
              🏥 ${hospital.name}
            </h3>
            <p style="margin: 4px 0; color: #374151; font-size: 12px;">
              <strong>Type:</strong> 
              <span style="color: ${isGovernment ? '#059669' : '#0891b2'}; font-weight: 600;">
                ${isGovernment ? 'Government Hospital' : 'Private Hospital'}
              </span>
            </p>
            <p style="margin: 4px 0; color: #374151; font-size: 12px;">
              <strong>Address:</strong> ${hospital.address}
            </p>
            <p style="margin: 4px 0; color: #374151; font-size: 12px;">
              <strong>Phone:</strong> ${hospital.phone}
            </p>
          </div>
        `);

      if (mapRef.current) {
        marker.addTo(mapRef.current);
        hospitalMarkersRef.current.set(hospital.id, marker);
      }
    });
  }, [hospitals]);

  // Update emergency markers and route lines
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing emergency markers and routes
    emergencyMarkersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    emergencyMarkersRef.current.clear();

    routeLinesRef.current.forEach(line => {
      mapRef.current?.removeLayer(line);
    });
    routeLinesRef.current.clear();

    // Add emergency markers
    activeEmergencies.forEach(emergency => {
      const emergencyIcon = L.divIcon({
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: #dc2626;
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(220,38,38,0.4);
            animation: pulse 2s infinite;
            font-size: 12px;
          ">
            🚨
          </div>
        `,
        className: 'emergency-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([emergency.lat, emergency.lng], { icon: emergencyIcon })
        .bindPopup(`
          <div style="text-align: center;">
            <h4 style="margin: 0 0 8px 0; color: #dc2626; font-weight: 600;">
              🚨 Emergency Alert
            </h4>
            <p style="margin: 4px 0; color: #374151;">
              <strong>Location:</strong> ${emergency.lat.toFixed(4)}, ${emergency.lng.toFixed(4)}
            </p>
            <p style="margin: 4px 0; color: #374151;">
              <strong>Target Hospital:</strong> ${emergency.hospital?.name || 'Unknown'}
            </p>
          </div>
        `);

      if (mapRef.current) {
        marker.addTo(mapRef.current);
        emergencyMarkersRef.current.set(emergency.id, marker);
      }
    });

    // Add route lines for dispatched ambulances
    ambulances
      .filter(ambulance => ambulance.status === 'Dispatched' || ambulance.status === 'En-route')
      .forEach(ambulance => {
        if (ambulance.hospital) {
          const routeCoords: [number, number][] = [
            [ambulance.lat, ambulance.lng],
            [ambulance.hospital.lat, ambulance.hospital.lng]
          ];

          const routeLine = L.polyline(routeCoords, {
            color: ambulance.status === 'Dispatched' ? '#3b82f6' : '#f59e0b',
            weight: 4,
            opacity: 0.8,
            dashArray: ambulance.status === 'Dispatched' ? '10, 5' : undefined,
            className: 'ambulance-route'
          }).bindPopup(`
            <div>
              <h4 style="margin: 0 0 8px 0; color: #0f766e;">🚑 ${ambulance.id} Route</h4>
              <p style="margin: 4px 0; color: #374151;">
                Status: <strong>${ambulance.status}</strong>
              </p>
              <p style="margin: 4px 0; color: #374151;">
                Destination: <strong>${ambulance.hospital.name}</strong>
              </p>
              <p style="margin: 4px 0; color: #374151;">
                ETA: <strong>${ambulance.eta || 'Calculating...'}</strong>
              </p>
            </div>
          `);

          if (mapRef.current) {
            routeLine.addTo(mapRef.current);
            routeLinesRef.current.set(ambulance.id, routeLine);
          }
        }
      });
  }, [activeEmergencies, ambulances]);

  return (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="h-full w-full card-medical overflow-hidden relative"
  >
    {/* Map */}
    <div ref={mapContainerRef} className="h-full w-full" />

    {/* Dispatch Button Overlay */}
    {selectedAmbulance && selectedAmbulance.status === 'Available' && (
      <div className="absolute top-4 right-4 z-[9999]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="bg-card/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-border/60"
        >
          <div className="text-center mb-3">
            <h3 className="font-semibold text-sm mb-1">🚑 {selectedAmbulance.id}</h3>
            <p className="text-xs text-muted-foreground">{selectedAmbulance.location}</p>
          </div>
          <button
            onClick={() => onDispatchAmbulance(selectedAmbulance)}
            className="w-full bg-emergency hover:bg-emergency/90 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
          >
            🚨 Dispatch Ambulance
          </button>
        </motion.div>
      </div>
    )}

    {/* Enhanced Map Legend */}
    <div className="absolute bottom-4 left-4 z-[9999] bg-card/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-border/60 max-w-xs">
      <h4 className="font-semibold text-sm mb-3 text-foreground">Live Ambulance Status</h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-success rounded-full border-2 border-white shadow-sm"></div>
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-warning rounded-full border-2 border-white shadow-sm animate-pulse"></div>
          <span className="text-muted-foreground">On Duty</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emergency rounded-full border-2 border-white shadow-sm animate-ping"></div>
          <span className="text-muted-foreground">En-route</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/40">
        <h4 className="font-semibold text-sm mb-2 text-foreground">Risk Zones</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-warning rounded-full border border-white shadow-sm"></div>
            <span className="text-muted-foreground">🟡 Moderate Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emergency rounded-full border border-white shadow-sm"></div>
            <span className="text-muted-foreground">🔴 High Risk</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/40">
        <h4 className="font-semibold text-sm mb-2 text-foreground">Hospitals</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-600 rounded-full border border-white shadow-sm"></div>
            <span className="text-muted-foreground">🏥 Government</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-sky-600 rounded-full border border-white shadow-sm"></div>
            <span className="text-muted-foreground">🏥 Private</span>
          </div>
        </div>
        <p className="text-muted-foreground mt-2 text-[10px]">
          Historical ambulance dispatch data
        </p>
      </div>
    </div>
  </motion.div>
);


};

export default MapDashboard;