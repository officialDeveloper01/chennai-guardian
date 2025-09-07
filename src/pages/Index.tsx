import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeaderPanel from '@/components/HeaderPanel';
import GoogleMap from '@/components/GoogleMap';
import MetricsPanel from '@/components/MetricsPanel';
import SidebarPanel from '@/components/SidebarPanel';
import FloatingActionButton from '@/components/FloatingActionButton';
import { useToast } from '@/hooks/use-toast';

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

// Static ambulance fleet data
const ambulanceFleet = [
  { id: 'AMB001', driver: 'Raj Kumar', phone: '+91 98765 43210' },
  { id: 'AMB002', driver: 'Priya Sharma', phone: '+91 98765 43211' },
  { id: 'AMB003', driver: 'Kumar Singh', phone: '+91 98765 43212' },
  { id: 'AMB004', driver: 'Deepak Raj', phone: '+91 98765 43213' },
  { id: 'AMB005', driver: 'Sita Devi', phone: '+91 98765 43214' },
  { id: 'AMB006', driver: 'Suresh Kumar', phone: '+91 98765 43215' },
  { id: 'AMB007', driver: 'Anjali Reddy', phone: '+91 98765 43216' },
  { id: 'AMB008', driver: 'Vikram Patel', phone: '+91 98765 43217' },
  { id: 'AMB009', driver: 'Lakshmi Nair', phone: '+91 98765 43218' },
  { id: 'AMB010', driver: 'Ravi Shankar', phone: '+91 98765 43219' }, 
];

// Chennai hotspot locations
const chennaiHotspots = [
  { id: 'HOT001', name: 'T. Nagar Commercial District', lat: 13.0417, lng: 80.2341 },
  { id: 'HOT002', name: 'Anna Nagar Roundabout', lat: 13.085, lng: 80.2101 },
  { id: 'HOT003', name: 'Velachery Main Road', lat: 13.0067, lng: 80.2206 },
  { id: 'HOT004', name: 'OMR IT Corridor', lat: 12.9698, lng: 80.2282 },
  { id: 'HOT005', name: 'Central Railway Station Area', lat: 13.0878, lng: 80.2785 },
  { id: 'HOT006', name: 'Airport Road Junction', lat: 12.9897, lng: 80.1693 },
];

const initialMetrics = {
  averageResponseTime: 8.5,
  activeEmergencies: 0,
  improvementPercentage: 15,
  totalDispatches: 0,
  successfulOutcomes: 0,
  avgTimeToDispatch: 120
};

const Index = () => {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [showHighRiskOnly, setShowHighRiskOnly] = useState(false);
  const [overallTraffic, setOverallTraffic] = useState<string>('Loading...');
  const { toast } = useToast();

  // Fetch traffic data from Google Maps API and assign ambulances to hotspots
  useEffect(() => {
    const fetchTrafficAndAssignAmbulances = async () => {
      setIsLoading(true);
      try {
        // Simulate Google Maps Traffic API call (replace with actual API)
        const trafficPromises = chennaiHotspots.map(async (hotspot) => {
          // Simulate API delay and traffic calculation
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const trafficLevel = Math.random() > 0.6 ? 'heavy' : Math.random() > 0.3 ? 'moderate' : 'light';
          const currentSpeed = trafficLevel === 'heavy' ? 8 + Math.random() * 5 
                             : trafficLevel === 'moderate' ? 15 + Math.random() * 10 
                             : 25 + Math.random() * 15;
          
          return {
            ...hotspot,
            trafficLevel,
            currentSpeed: Math.floor(currentSpeed),
            category: trafficLevel === 'heavy' ? 'high' : 'moderate'
          } as Hotspot;
        });

        const hotspotsWithTraffic = await Promise.all(trafficPromises);
        setHotspots(hotspotsWithTraffic);

        // Calculate overall traffic status
        const heavyCount = hotspotsWithTraffic.filter(h => h.trafficLevel === 'heavy').length;
        const totalCount = hotspotsWithTraffic.length;
        const heavyPercentage = totalCount > 0 ? (heavyCount / totalCount) * 100 : 0;
        
        if (heavyPercentage > 50) {
          setOverallTraffic('Heavy');
        } else if (heavyPercentage > 25) {
          setOverallTraffic('Moderate');
        } else {
          setOverallTraffic('Clear');
        }

        // Assign ambulances near hotspots (at least 1 per hotspot)
        const assignedAmbulances: Ambulance[] = [];
        let ambulanceIndex = 0;

        hotspotsWithTraffic.forEach((hotspot, index) => {
          // Assign at least 1 ambulance per hotspot, more for high traffic areas
          const ambulancesNeeded = hotspot.category === 'high' ? 2 : 1;
          
          for (let i = 0; i < ambulancesNeeded && ambulanceIndex < ambulanceFleet.length; i++) {
            const fleet = ambulanceFleet[ambulanceIndex];
            const offsetLat = (Math.random() - 0.5) * 0.01; // Small random offset
            const offsetLng = (Math.random() - 0.5) * 0.01;
            
            assignedAmbulances.push({
              id: fleet.id,
              lat: hotspot.lat + offsetLat,
              lng: hotspot.lng + offsetLng,
              status: 'Available',
              location: `Near ${hotspot.name}`,
              driver: fleet.driver,
              phone: fleet.phone
            });
            
            ambulanceIndex++;
          }
        });

        setAmbulances(assignedAmbulances);

        toast({
          title: "🔄 Traffic Data Updated",
          description: `Traffic: ${overallTraffic === 'Loading...' ? 'Moderate' : overallTraffic} • ${assignedAmbulances.length} ambulances assigned`,
        });

      } catch (error) {
        console.error('Error fetching traffic data:', error);
        setOverallTraffic('N/A');
        toast({
          title: "⚠️ Could not load traffic data",
          description: "Google Maps API may be unavailable",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrafficAndAssignAmbulances();

    // Refresh data every 5 minutes for real-time updates
    const interval = setInterval(fetchTrafficAndAssignAmbulances, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [toast]);

  const handleDispatchAmbulance = useCallback(async (ambulance: Ambulance) => {
    if (isLoading || ambulance.status !== 'Available') return;
    
    setIsLoading(true);
    
    try {
      // Use Google Places API to find nearest hospital (simulated for now)
      const nearestHospital = {
        name: 'Apollo Hospital Chennai',
        lat: 13.0358,
        lng: 80.2433,
        distance: '2.5 km'
      };

      // Update ambulance status
      const updatedAmbulances = ambulances.map(amb =>
        amb.id === ambulance.id
          ? { 
              ...amb, 
              status: 'Dispatched' as const, 
              eta: `${Math.floor(Math.random() * 15) + 5} min to ${nearestHospital.name}`,
              location: `En-route to ${nearestHospital.name}`
            }
          : amb
      );

      setAmbulances(updatedAmbulances);
      setMetrics(prev => ({
        ...prev,
        activeEmergencies: prev.activeEmergencies + 1,
        totalDispatches: prev.totalDispatches + 1,
        successfulOutcomes: prev.successfulOutcomes + 1
      }));

      toast({
        title: "🚑 Ambulance Dispatched",
        description: `${ambulance.id} dispatched to ${nearestHospital.name}`,
      });
    } catch (error) {
      console.error('Error dispatching ambulance:', error);
      toast({
        title: "⚠️ Dispatch Error",
        description: "Failed to dispatch ambulance. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, ambulances, toast]);

  const handleAmbulanceSelect = useCallback((ambulance: Ambulance) => {
    toast({
      title: `🚑 ${ambulance.id} Selected`,
      description: `Status: ${ambulance.status} • Location: ${ambulance.location}`,
    });
  }, [toast]);

  const handleHotspotSelect = useCallback((hotspot: Hotspot) => {
    toast({
      title: `${hotspot.category === 'high' ? '🔴' : '🟡'} ${hotspot.name}`,
      description: `Traffic: ${hotspot.trafficLevel} • Speed: ${hotspot.currentSpeed} km/h`,
    });
  }, [toast]);

  const handleToggleFilter = useCallback(() => {
    setShowHighRiskOnly(prev => !prev);
    toast({
      title: showHighRiskOnly ? "🗺️ Showing All Zones" : "🔴 High Risk Filter Active",
      description: showHighRiskOnly ? "Displaying all risk zones" : "Showing only high-risk zones",
    });
  }, [showHighRiskOnly, toast]);

  return (
    <div className="h-screen w-full bg-background overflow-hidden">
      {/* Header */}
      <HeaderPanel
        isLoading={isLoading}
        activeEmergencies={metrics.activeEmergencies}
        overallTraffic={overallTraffic}
      />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Map Section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 relative"
        >
          <GoogleMap
            ambulances={ambulances}
            hotspots={hotspots}
            onAmbulanceSelect={handleAmbulanceSelect}
            onHotspotSelect={handleHotspotSelect}
            onDispatchAmbulance={handleDispatchAmbulance}
          />
          
          {/* Floating Action Button */}
          <FloatingActionButton
            showHighRiskOnly={showHighRiskOnly}
            onToggle={handleToggleFilter}
          />
        </motion.div>
      </div>
      
      {/* Bottom Metrics */}
      <MetricsPanel metrics={metrics} />
    </div>
  );
};

export default Index;
