import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  Navigation,
  Hospital,
  User,
  AlertTriangle,
  Activity,
  Thermometer,
  Wind,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import HotspotWeather from './HotspotWeather';

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
  trafficLevel: 'light' | 'moderate' | 'heavy';
  currentSpeed: number;
}

interface RightPanelProps {
  selectedAmbulance: Ambulance | null;
  selectedHotspot: Hotspot | null;
  onClose: () => void;
  onDispatch?: (ambulance: Ambulance) => void;
  onSendToPatient?: (ambulance: Ambulance) => void;
  onChangeStatus?: (ambulance: Ambulance) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  selectedAmbulance,
  selectedHotspot,
  onClose,
  onDispatch,
  onSendToPatient,
  onChangeStatus
}) => {
  const isVisible = selectedAmbulance || selectedHotspot;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-success text-success-foreground';
      case 'On Duty': return 'bg-warning text-warning-foreground';
      case 'En-route': return 'bg-primary text-primary-foreground';
      case 'Dispatched': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-16 bottom-0 w-80 lg:w-96 bg-card border-l border-border/60 shadow-xl z-40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/60 bg-secondary/30">
              <h2 className="text-lg font-semibold text-foreground">
                {selectedAmbulance ? 'Ambulance Details' : 'Hotspot Details'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-secondary/80 transition-colors"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedAmbulance && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 space-y-4"
                >
                  {/* Ambulance Status Card */}
                  <Card className="border-border/60">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          🚑 {selectedAmbulance.id}
                        </CardTitle>
                        <Badge 
                          className={`${getStatusColor(selectedAmbulance.status)} px-3 py-1 text-sm font-medium`}
                        >
                          {selectedAmbulance.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">{selectedAmbulance.location}</span>
                      </div>
                      
                      {selectedAmbulance.driver && (
                        <div className="flex items-center gap-3 text-sm">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground">{selectedAmbulance.driver}</span>
                        </div>
                      )}
                      
                      {selectedAmbulance.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground">{selectedAmbulance.phone}</span>
                        </div>
                      )}
                      
                      {selectedAmbulance.eta && (
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-primary">{selectedAmbulance.eta}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Navigation className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {selectedAmbulance.lat.toFixed(4)}, {selectedAmbulance.lng.toFixed(4)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hospital Details (if dispatched) */}
                  {selectedAmbulance.hospital && selectedAmbulance.status === 'Dispatched' && (
                    <Card className="border-border/60 bg-primary/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                          <Hospital className="h-4 w-4" />
                          Destination Hospital
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div><strong>Name:</strong> {selectedAmbulance.hospital.name}</div>
                        <div><strong>Address:</strong> {selectedAmbulance.hospital.address}</div>
                        <div><strong>Phone:</strong> {selectedAmbulance.hospital.phone}</div>
                        {selectedAmbulance.hospital.distance && (
                          <div><strong>Distance:</strong> {selectedAmbulance.hospital.distance}</div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {selectedAmbulance.status === 'Available' && onSendToPatient && (
                      <Button 
                        onClick={() => onSendToPatient(selectedAmbulance)}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        Send to Patient
                      </Button>
                    )}
                    
                    {selectedAmbulance.status === 'Available' && onDispatch && (
                      <Button 
                        onClick={() => onDispatch(selectedAmbulance)}
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary/10"
                      >
                        Emergency Dispatch
                      </Button>
                    )}

                    {onChangeStatus && (
                      <Button 
                        onClick={() => onChangeStatus(selectedAmbulance)}
                        variant="secondary"
                        className="w-full"
                      >
                        Change Status
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {selectedHotspot && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 space-y-4"
                >
                  {/* Hotspot Info Card */}
                  <Card className="border-border/60">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          {selectedHotspot.category === 'high' ? '🔴' : '🟡'} Hotspot
                        </CardTitle>
                        <Badge 
                          variant={selectedHotspot.category === 'high' ? 'destructive' : 'secondary'}
                          className="text-sm font-medium"
                        >
                          {selectedHotspot.category === 'high' ? 'High Risk' : 'Moderate Risk'}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-medium text-muted-foreground">{selectedHotspot.name}</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Activity className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">
                          Historical Usage: <strong>{(selectedHotspot.intensity * 100).toFixed(0)}%</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">
                          Traffic: <strong className={
                            selectedHotspot.trafficLevel === 'heavy' ? 'text-red-600' :
                            selectedHotspot.trafficLevel === 'moderate' ? 'text-yellow-600' : 'text-green-600'
                          }>
                            {selectedHotspot.trafficLevel}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-xs">🚦</span>
                        <span className="text-foreground">
                          Speed: <strong>{selectedHotspot.currentSpeed} km/h</strong>
                        </span>
                      </div>

                      {selectedHotspot.trend && (
                        <div className="flex items-center gap-3 text-sm">
                          <span>{getTrendIcon(selectedHotspot.trend)}</span>
                          <span className="text-foreground">
                            Trend: <strong className={
                              selectedHotspot.trend === 'rising' ? 'text-red-600' :
                              selectedHotspot.trend === 'declining' ? 'text-green-600' : 'text-yellow-600'
                            }>
                              {selectedHotspot.trend}
                            </strong>
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Navigation className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {selectedHotspot.lat.toFixed(4)}, {selectedHotspot.lng.toFixed(4)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weather Information */}
                  <Card className="border-border/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Thermometer className="h-4 w-4" />
                        Weather Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <HotspotWeather 
                        lat={selectedHotspot.lat} 
                        lng={selectedHotspot.lng} 
                        className="text-sm"
                      />
                    </CardContent>
                  </Card>

                  {/* Analysis */}
                  <Card className="border-border/60 bg-muted/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground leading-relaxed">
                        {selectedHotspot.prediction}
                      </p>
                      <Separator className="my-3" />
                      <p className="text-xs text-muted-foreground">
                        Based on historical ambulance dispatch data and current traffic conditions
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default RightPanel;