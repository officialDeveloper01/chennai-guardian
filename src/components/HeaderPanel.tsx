import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Play, Square } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';

interface HeaderPanelProps {
  isLoading: boolean;
  activeEmergencies: number;
  overallTraffic: string;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  simulationStarted: boolean;
}

const HeaderPanel: React.FC<HeaderPanelProps> = ({
  isLoading,
  activeEmergencies,
  overallTraffic,
  onStartSimulation,
  onStopSimulation,
  simulationStarted
}) => {
  const { weather, loading: loadingWeather } = useWeather({ city: 'Chennai' });

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
      className="bg-white shadow-md border-b border-border p-4 sticky top-0 z-50"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Title Section */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <img className="h-12 w-12" src="/assets/logo.png" alt="EMSense Logo" />
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              EMSense: Predictive Ambulance Dispatch System
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Chennai Emergency Response System
            </p>
          </div>
        </motion.div>

        {/* Status and Action Buttons */}
        <div className="flex items-center gap-4">
          {/* Traffic + Weather Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden md:flex items-center gap-4 text-sm"
          >
            {/* Traffic */}
            <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full">
              <span>{getTrafficIcon(overallTraffic)}</span>
              <span className="text-muted-foreground">Traffic:</span>
              <span className="font-medium">{overallTraffic}</span>
            </div>

            {/* Weather */}
            <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full">
              {loadingWeather ? (
                <span className="text-muted-foreground">Weather: Loading...</span>
              ) : weather ? (
                <>
                  <span className="text-sm">{weather.icon}</span>
                  <span className="font-medium">{weather.temperature}°C</span>
                  <span className="text-xs">{weather.condition}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Weather: N/A</span>
              )}
            </div>
          </motion.div>

          {/* Emergencies Badge */}
          <div className="flex items-center gap-3">
            {/* Simulation Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2"
            >
              {!simulationStarted ? (
                <Button
                  onClick={onStartSimulation}
                  variant="default"
                  size="sm"
                  className="bg-emergency hover:bg-emergency/90 text-white"
                  disabled={isLoading}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Simulation
                </Button>
              ) : (
                <Button
                  onClick={onStopSimulation}
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Simulation
                </Button>
              )}
            </motion.div>

            {activeEmergencies > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Badge variant="destructive" className="animate-pulse-medical">
                  {activeEmergencies} Active Emergencies
                </Badge>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 flex flex-wrap items-center justify-between text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span>System Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="h-3 w-3" />
            <span>GPS Tracking Active</span>
          </div>
        </div>

        <div className="text-xs">
          Last Updated: {new Date().toLocaleTimeString()}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HeaderPanel;
