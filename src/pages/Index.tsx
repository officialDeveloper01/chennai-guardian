import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeaderPanel from '@/components/HeaderPanel';
import MapDashboard from '@/components/MapDashboard';
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
  hospital?: Hospital;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distance?: string;
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
  trafficLevel: 'light' | 'moderate' | 'heavy';
  currentSpeed: number;
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

// Chennai hospital locations
const chennaiHospitals: Hospital[] = [
  {
    id: 'HOSP001',
    name: 'Apollo Hospital Main',
    address: 'Greams Road, Thousand Lights, Chennai - 600006',
    phone: '+91 44 2829 3333',
    lat: 13.0358,
    lng: 80.2433
  },
  {
    id: 'HOSP002', 
    name: 'Fortis Malar Hospital',
    address: '52, 1st Main Road, Gandhi Nagar, Adyar, Chennai - 600020',
    phone: '+91 44 4289 8888',
    lat: 13.0067,
    lng: 80.2206
  },
  {
    id: 'HOSP003',
    name: 'MIOT International',
    address: '4/112, Mount Poonamalle Road, Manapakkam, Chennai - 600089',
    phone: '+91 44 2249 2288',
    lat: 13.0475,
    lng: 80.1854
  },
  {
    id: 'HOSP004',
    name: 'Gleneagles Global Health City',
    address: 'Perumbakkam, Chennai - 600100',
    phone: '+91 44 4444 1000',
    lat: 12.9165,
    lng: 80.2282
  },
  {
    id: 'HOSP005',
    name: 'Stanley Medical College Hospital',
    address: 'Old Jail Road, Royapuram, Chennai - 600001',
    phone: '+91 44 2663 0800',
    lat: 13.1065,
    lng: 80.2963
  }
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
  const [showTraffic, setShowTraffic] = useState(true);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(null);
  const [overallTraffic, setOverallTraffic] = useState<string>('Loading...');
  const [activeEmergencies, setActiveEmergencies] = useState<Array<{id: string, lat: number, lng: number, hospital: Hospital}>>([]);
  const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Find nearest hospital to a location
  const findNearestHospital = useCallback((lat: number, lng: number): Hospital => {
    let nearestHospital = chennaiHospitals[0];
    let shortestDistance = calculateDistance(lat, lng, nearestHospital.lat, nearestHospital.lng);

    for (const hospital of chennaiHospitals) {
      const distance = calculateDistance(lat, lng, hospital.lat, hospital.lng);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestHospital = hospital;
      }
    }

    return {
      ...nearestHospital,
      distance: `${shortestDistance.toFixed(1)} km`
    };
  }, [calculateDistance]);

  // Find nearest available ambulance to an emergency location
  const findNearestAmbulance = useCallback((emergencyLat: number, emergencyLng: number): Ambulance | null => {
    const availableAmbulances = ambulances.filter(amb => amb.status === 'Available');
    if (availableAmbulances.length === 0) return null;

    let nearestAmbulance = availableAmbulances[0];
    let shortestDistance = calculateDistance(emergencyLat, emergencyLng, nearestAmbulance.lat, nearestAmbulance.lng);

    for (const ambulance of availableAmbulances) {
      const distance = calculateDistance(emergencyLat, emergencyLng, ambulance.lat, ambulance.lng);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestAmbulance = ambulance;
      }
    }

    return nearestAmbulance;
  }, [ambulances, calculateDistance]);

  // Generate random emergency location in Chennai
  const generateRandomEmergency = useCallback(() => {
    const chennaiArea = {
      minLat: 12.9, maxLat: 13.2,
      minLng: 80.1, maxLng: 80.35
    };
    
    const lat = chennaiArea.minLat + Math.random() * (chennaiArea.maxLat - chennaiArea.minLat);
    const lng = chennaiArea.minLng + Math.random() * (chennaiArea.maxLng - chennaiArea.minLng);
    
    return { lat, lng };
  }, []);

  // Start emergency simulation
  const startSimulation = useCallback(() => {
    if (simulationInterval) return;

    toast({
      title: "🚨 Emergency Simulation Started",
      description: "Random emergencies will occur every 10-30 seconds",
    });

    const interval = setInterval(() => {
      const emergency = generateRandomEmergency();
      const nearestAmbulance = findNearestAmbulance(emergency.lat, emergency.lng);
      
      if (nearestAmbulance) {
        const nearestHospital = findNearestHospital(emergency.lat, emergency.lng);
        const emergencyId = `EMG${Date.now()}`;
        
        // Add to active emergencies
        setActiveEmergencies(prev => [...prev, {
          id: emergencyId,
          lat: emergency.lat,
          lng: emergency.lng,
          hospital: nearestHospital
        }]);

        // Dispatch the ambulance
        handleDispatchAmbulance(nearestAmbulance, emergency.lat, emergency.lng);

        toast({
          title: "🚨 Emergency Triggered",
          description: `${nearestAmbulance.id} auto-dispatched to emergency location`,
        });
      } else {
        toast({
          title: "⚠️ No Available Ambulances",
          description: "All ambulances are currently busy",
          variant: "destructive"
        });
      }
    }, Math.random() * 20000 + 10000); // 10-30 seconds

    setSimulationInterval(interval);
    setSimulationStarted(true);
  }, [simulationInterval, generateRandomEmergency, findNearestAmbulance, findNearestHospital, toast]);

  // Stop emergency simulation
  const stopSimulation = useCallback(() => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
      setSimulationStarted(false);
      
      toast({
        title: "🛑 Simulation Stopped",
        description: "Emergency simulation has been stopped",
      });
    }
  }, [simulationInterval, toast]);

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
            category: trafficLevel === 'heavy' ? 'high' : 'moderate',
            intensity: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
            prediction: trafficLevel === 'heavy' 
              ? 'High ambulance demand predicted based on traffic patterns'
              : 'Moderate demand area with steady traffic flow',
            trend: Math.random() > 0.6 ? 'rising' : Math.random() > 0.3 ? 'stable' : 'declining'
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

  const handleDispatchAmbulance = useCallback(async (ambulance: Ambulance, emergencyLat?: number, emergencyLng?: number) => {
    if (isLoading || ambulance.status !== 'Available') return;
    
    setIsLoading(true);
    
    try {
      // Use emergency location if provided, otherwise use ambulance location
      const targetLat = emergencyLat || ambulance.lat;
      const targetLng = emergencyLng || ambulance.lng;
      
      // Find nearest hospital to the emergency/target location
      const nearestHospital = findNearestHospital(targetLat, targetLng);
      
      // Calculate distance to emergency and then to hospital
      const distanceToEmergency = emergencyLat ? calculateDistance(ambulance.lat, ambulance.lng, emergencyLat, emergencyLng) : 0;
      const distanceToHospital = calculateDistance(targetLat, targetLng, nearestHospital.lat, nearestHospital.lng);
      const totalDistance = distanceToEmergency + distanceToHospital;
      
      // Calculate ETA based on total distance (assuming average city speed of 25 km/h)
      const estimatedTime = Math.max(Math.round((totalDistance / 25) * 60), 2); // Minimum 2 minutes

      // Update ambulance status with hospital info and emergency route
      const updatedAmbulances = ambulances.map(amb =>
        amb.id === ambulance.id
          ? { 
              ...amb, 
              status: 'Dispatched' as const, 
              eta: `${estimatedTime} min to ${nearestHospital.name}`,
              location: emergencyLat ? `Responding to emergency → ${nearestHospital.name}` : `En-route to ${nearestHospital.name}`,
              hospital: nearestHospital
            }
          : amb
      );

      setAmbulances(updatedAmbulances);
      setSelectedAmbulance(null); // Clear selection after dispatch
      setMetrics(prev => ({
        ...prev,
        activeEmergencies: prev.activeEmergencies + 1,
        totalDispatches: prev.totalDispatches + 1,
        successfulOutcomes: prev.successfulOutcomes + 1
      }));

      // Simulate ambulance movement - first to emergency, then to hospital
      let currentLat = ambulance.lat;
      let currentLng = ambulance.lng;
      
      // If there's an emergency location, move there first
      if (emergencyLat && emergencyLng) {
        const steps = 5; // Number of animation steps
        const latStep = (emergencyLat - currentLat) / steps;
        const lngStep = (emergencyLng - currentLng) / steps;
        
        for (let i = 1; i <= steps; i++) {
          setTimeout(() => {
            currentLat += latStep;
            currentLng += lngStep;
            
            setAmbulances(prev => prev.map(amb => 
              amb.id === ambulance.id
                ? { 
                    ...amb, 
                    lat: currentLat,
                    lng: currentLng,
                    status: i < steps ? 'En-route' as const : 'On Duty' as const
                  }
                : amb
            ));
          }, i * 1000); // 1 second intervals
        }
        
        // After reaching emergency, move to hospital
        setTimeout(() => {
          const hospitalSteps = 5;
          const hospitalLatStep = (nearestHospital.lat - emergencyLat) / hospitalSteps;
          const hospitalLngStep = (nearestHospital.lng - emergencyLng) / hospitalSteps;
          
          for (let i = 1; i <= hospitalSteps; i++) {
            setTimeout(() => {
              const newLat = emergencyLat + (hospitalLatStep * i);
              const newLng = emergencyLng + (hospitalLngStep * i);
              
              setAmbulances(prev => prev.map(amb => 
                amb.id === ambulance.id
                  ? { 
                      ...amb, 
                      lat: newLat,
                      lng: newLng,
                      status: 'En-route' as const,
                      location: `Transporting to ${nearestHospital.name}`
                    }
                  : amb
              ));
              
              // Complete the mission at hospital
              if (i === hospitalSteps) {
                setTimeout(() => {
                  setAmbulances(prev => prev.map(amb => 
                    amb.id === ambulance.id
                      ? { 
                          ...amb, 
                          status: 'Available' as const,
                          location: `Available near ${nearestHospital.name}`,
                          eta: undefined,
                          hospital: undefined
                        }
                      : amb
                  ));
                  
                  setMetrics(prev => ({
                    ...prev,
                    activeEmergencies: Math.max(0, prev.activeEmergencies - 1)
                  }));
                }, 2000);
              }
            }, i * 1500); // 1.5 second intervals
          }
        }, steps * 1000 + 3000); // Wait for emergency response + 3 seconds
      } else {
        // Direct hospital route
        const steps = 8;
        const latStep = (nearestHospital.lat - currentLat) / steps;
        const lngStep = (nearestHospital.lng - currentLng) / steps;
        
        for (let i = 1; i <= steps; i++) {
          setTimeout(() => {
            currentLat += latStep;
            currentLng += lngStep;
            
            setAmbulances(prev => prev.map(amb => 
              amb.id === ambulance.id
                ? { 
                    ...amb, 
                    lat: currentLat,
                    lng: currentLng,
                    status: i < steps ? 'En-route' as const : 'Available' as const,
                    location: i < steps ? `En-route to ${nearestHospital.name}` : `Available near ${nearestHospital.name}`,
                    eta: i >= steps ? undefined : amb.eta,
                    hospital: i >= steps ? undefined : amb.hospital
                  }
                : amb
            ));
            
            if (i === steps) {
              setMetrics(prev => ({
                ...prev,
                activeEmergencies: Math.max(0, prev.activeEmergencies - 1)
              }));
            }
          }, i * 1200); // 1.2 second intervals
        }
      }

      toast({
        title: "🚑 Ambulance Dispatched",
        description: emergencyLat 
          ? `${ambulance.id} responding to emergency → ${nearestHospital.name}` 
          : `${ambulance.id} dispatched to ${nearestHospital.name} (ETA: ${estimatedTime} min)`,
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
  }, [isLoading, ambulances, toast, findNearestHospital, calculateDistance]);

  const handleAmbulanceSelect = useCallback((ambulance: Ambulance) => {
    setSelectedAmbulance(ambulance);
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

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [simulationInterval]);

  return (
    <div className="h-screen w-full bg-background overflow-hidden">
      {/* Header */}
      <HeaderPanel
        isLoading={isLoading}
        activeEmergencies={metrics.activeEmergencies}
        overallTraffic={overallTraffic}
        onStartSimulation={startSimulation}
        onStopSimulation={stopSimulation}
        simulationStarted={simulationStarted}
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
          <MapDashboard
            ambulances={ambulances}
            hotspots={hotspots}
            onAmbulanceSelect={handleAmbulanceSelect}
            onHotspotSelect={handleHotspotSelect}
            onDispatchAmbulance={handleDispatchAmbulance}
            selectedAmbulance={selectedAmbulance}
            showTraffic={showTraffic}
            showHighRiskOnly={showHighRiskOnly}
            simulationStarted={simulationStarted}
            activeEmergencies={activeEmergencies}
          />
          
          {/* Floating Action Button */}
          <FloatingActionButton
            showHighRiskOnly={showHighRiskOnly}
            onToggle={handleToggleFilter}
          />
        </motion.div>

        {/* Sidebar Panel */}
        <SidebarPanel
          ambulances={ambulances}
          hotspots={hotspots}
          showHighRiskOnly={showHighRiskOnly}
          onToggleFilter={handleToggleFilter}
          onAmbulanceSelect={handleAmbulanceSelect}
          onHotspotSelect={handleHotspotSelect}
        />
      </div>
      
      {/* Bottom Metrics */}
      <MetricsPanel metrics={metrics} />
    </div>
  );
};

export default Index;
