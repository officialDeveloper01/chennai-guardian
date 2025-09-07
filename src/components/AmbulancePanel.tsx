import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Truck, 
  Clock, 
  MapPin, 
  Navigation,
  Phone,
  User
} from 'lucide-react';

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

interface AmbulancePanelProps {
  ambulances: Ambulance[];
  onAmbulanceSelect: (ambulance: Ambulance) => void;
  onTrackAmbulance: (ambulanceId: string) => void;
}

const AmbulancePanel: React.FC<AmbulancePanelProps> = ({
  ambulances,
  onAmbulanceSelect,
  onTrackAmbulance
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-success text-success-foreground';
      case 'On Duty': return 'bg-warning text-black';
      case 'En-route': return 'bg-emergency text-emergency-foreground';
      case 'Dispatched': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available': return '🟢';
      case 'On Duty': return '🟡';
      case 'En-route': return '🔴';
      case 'Dispatched': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full bg-card/95 backdrop-blur-sm border-l border-border/60 p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
          <Truck className="h-5 w-5 text-primary" />
          Ambulance Fleet
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {ambulances.filter(a => a.status === 'Available').length} available • {ambulances.filter(a => a.status !== 'Available').length} in service
        </p>
      </motion.div>

      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {ambulances.map((ambulance, index) => (
          <motion.div
            key={ambulance.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-ambulance p-4 cursor-pointer hover:bg-accent/50 transition-all duration-300"
            onClick={() => onAmbulanceSelect(ambulance)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="text-2xl animate-ambulance-move">🚑</div>
                  <div className="absolute -top-1 -right-1 text-xs">
                    {getStatusIcon(ambulance.status)}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">
                    Ambulance {ambulance.id}
                  </h3>
                  <Badge 
                    className={`${getStatusColor(ambulance.status)} text-xs`}
                    variant="secondary"
                  >
                    {ambulance.status}
                  </Badge>
                </div>
              </div>
              
              {ambulance.status !== 'Available' && ambulance.eta && (
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium text-warning">{ambulance.eta}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">ETA</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{ambulance.location}</span>
              </div>

              {ambulance.driver && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{ambulance.driver}</span>
                </div>
              )}

              {ambulance.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{ambulance.phone}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onTrackAmbulance(ambulance.id);
                }}
              >
                <Navigation className="h-3 w-3 mr-1" />
                Track
              </Button>
              
              {ambulance.status === 'Available' && (
                <Button
                  size="sm"
                  className="flex-1 text-xs btn-medical"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Dispatch logic here
                  }}
                >
                  Assign
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fleet Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-3 bg-muted/50 rounded-lg"
      >
        <h4 className="font-medium text-sm mb-2 text-foreground">Fleet Status</h4>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center p-2 bg-success/10 rounded">
            <div className="font-bold text-success">{ambulances.filter(a => a.status === 'Available').length}</div>
            <div className="text-muted-foreground">Available</div>
          </div>
          <div className="text-center p-2 bg-warning/10 rounded">
            <div className="font-bold text-warning">{ambulances.filter(a => a.status === 'On Duty').length}</div>
            <div className="text-muted-foreground">On Duty</div>
          </div>
          <div className="text-center p-2 bg-emergency/10 rounded">
            <div className="font-bold text-emergency">{ambulances.filter(a => a.status === 'En-route').length}</div>
            <div className="text-muted-foreground">En-route</div>
          </div>
          <div className="text-center p-2 bg-primary/10 rounded">
            <div className="font-bold text-primary">{ambulances.filter(a => a.status === 'Dispatched').length}</div>
            <div className="text-muted-foreground">Dispatched</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AmbulancePanel;