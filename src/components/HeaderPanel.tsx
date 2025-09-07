import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MapPin, Navigation, Play, Square, Menu, X } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { useIsMobile } from '@/hooks/use-mobile';
import SidebarPanel from './SidebarPanel';

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
  trafficLevel: 'light' | 'moderate' | 'heavy';
  currentSpeed: number;
  category: 'moderate' | 'high';
}

interface HeaderPanelProps {
  isLoading: boolean;
  activeEmergencies: number;
  overallTraffic: string;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  simulationStarted: boolean;
  ambulances: Ambulance[];
  hotspots: Hotspot[];
  showHighRiskOnly: boolean;
  onToggleFilter: () => void;
  onAmbulanceSelect: (ambulance: Ambulance) => void;
  onHotspotSelect: (hotspot: Hotspot) => void;
}

const HeaderPanel: React.FC<HeaderPanelProps> = ({
  isLoading,
  activeEmergencies,
  overallTraffic,
  onStartSimulation,
  onStopSimulation,
  simulationStarted,
  ambulances,
  hotspots,
  showHighRiskOnly,
  onToggleFilter,
  onAmbulanceSelect,
  onHotspotSelect
}) => {
  const { weather, loading: loadingWeather } = useWeather({ city: 'Chennai' });
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getTrafficIcon = (traffic: string) => {
    switch (traffic.toLowerCase()) {
      case 'clear': return '🟢';
      case 'moderate': return '🟡';
      case 'heavy': return '🔴';
      case 'loading...': return '⏳';
      case 'n/a': return '⚠️';
      default: return '🚦';
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-md border-b border-border p-3 md:p-4 sticky top-0 z-50"
    >
      <div className="flex items-center justify-between gap-2 md:gap-4">
        {/* Mobile Menu Button */}
        <div className="xl:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <img className="h-8 w-8" src="/assets/logo.png" alt="EMSense Logo" />
                  Fleet & Hotspots
                </SheetTitle>
              </SheetHeader>
              <SidebarPanel
                ambulances={ambulances}
                hotspots={hotspots}
                showHighRiskOnly={showHighRiskOnly}
                onToggleFilter={onToggleFilter}
                onAmbulanceSelect={(ambulance) => {
                  onAmbulanceSelect(ambulance);
                  setIsMenuOpen(false);
                }}
                onHotspotSelect={(hotspot) => {
                  onHotspotSelect(hotspot);
                  setIsMenuOpen(false);
                }}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Title Section */}
        <motion.div
          className="flex items-center gap-2 md:gap-3 flex-1 min-w-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <img className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0" src="/assets/logo.png" alt="EMSense Logo" />
          <div className="flex flex-col min-w-0 flex-1">
            <h1 className="text-sm md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent truncate">
              {isMobile ? "EMSense" : "EMSense: Predictive Ambulance Dispatch System"}
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Chennai Emergency Response System</span>
            </p>
          </div>
        </motion.div>

        {/* Desktop Status Indicators */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden lg:flex items-center gap-3 text-sm"
        >
          {/* Traffic */}
          <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full">
            <span>{getTrafficIcon(overallTraffic)}</span>
            <span className="text-muted-foreground hidden xl:inline">Traffic:</span>
            <span className="font-medium">{overallTraffic}</span>
          </div>

          {/* Weather */}
          <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full">
            {loadingWeather ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : weather ? (
              <>
                <span className="text-sm">{weather.icon}</span>
                <span className="font-medium">{weather.temperature}°C</span>
                <span className="text-xs hidden xl:inline">{weather.condition}</span>
              </>
            ) : (
              <span className="text-muted-foreground">N/A</span>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Simulation Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {!simulationStarted ? (
              <Button
                onClick={onStartSimulation}
                variant="default"
                size={isMobile ? "sm" : "sm"}
                className="bg-emergency hover:bg-emergency/90 text-white"
                disabled={isLoading}
              >
                <Play className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Start</span>
                <span className="sm:hidden">▶</span>
              </Button>
            ) : (
              <Button
                onClick={onStopSimulation}
                variant="destructive"
                size={isMobile ? "sm" : "sm"}
                disabled={isLoading}
              >
                <Square className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Stop</span>
                <span className="sm:hidden">⏹</span>
              </Button>
            )}
          </motion.div>

          {/* Emergency Badge */}
          {activeEmergencies > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Badge variant="destructive" className="animate-pulse-medical text-xs">
                {activeEmergencies}
                <span className="hidden md:inline ml-1">Active</span>
              </Badge>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Status Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-3 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2"
      >
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="hidden sm:inline">System Operational</span>
            <span className="sm:hidden">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="h-3 w-3" />
            <span className="hidden sm:inline">GPS Tracking Active</span>
            <span className="sm:hidden">GPS</span>
          </div>
          
          {/* Mobile Status Indicators */}
          <div className="lg:hidden flex items-center gap-3">
            <span>{getTrafficIcon(overallTraffic)} {overallTraffic}</span>
            {weather && (
              <span>{weather.icon} {weather.temperature}°C</span>
            )}
          </div>
        </div>

        <div className="text-xs">
          {new Date().toLocaleTimeString()}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HeaderPanel;
