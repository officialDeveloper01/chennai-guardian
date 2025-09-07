import React from 'react';
import { motion } from 'framer-motion';
import { 
  Ambulance, 
  MapPin, 
  Clock, 
  Phone, 
  Filter,
  AlertTriangle,
  TrendingUp,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  trafficLevel: 'light' | 'moderate' | 'heavy';
  currentSpeed: number;
  category: 'moderate' | 'high';
}

interface SidebarPanelProps {
  ambulances: Ambulance[];
  hotspots: Hotspot[];
  showHighRiskOnly: boolean;
  onToggleFilter: () => void;
  onAmbulanceSelect: (ambulance: Ambulance) => void;
  onHotspotSelect: (hotspot: Hotspot) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SidebarPanel: React.FC<SidebarPanelProps> = ({
  ambulances,
  hotspots,
  showHighRiskOnly,
  onToggleFilter,
  onAmbulanceSelect,
  onHotspotSelect,
  isOpen,
  onClose
}) => {
  const filteredHotspots = showHighRiskOnly 
    ? hotspots.filter(hotspot => hotspot.category === 'high')
    : hotspots;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'text-success';
      case 'On Duty': return 'text-warning';
      case 'En-route': return 'text-info';
      case 'Dispatched': return 'text-emergency';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Available': return 'default';
      case 'On Duty': return 'secondary';
      case 'En-route': return 'outline';
      case 'Dispatched': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen || !window.matchMedia('(max-width: 1023px)').matches ? 0 : '100%' 
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed lg:relative top-0 right-0 z-50 
          w-80 bg-card border-l border-border 
          flex flex-col overflow-hidden h-full
          lg:translate-x-0 lg:block
          ${isOpen ? 'block' : 'hidden lg:block'}
        `}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Ambulance Fleet Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Ambulance className="h-5 w-5 text-primary" />
              Fleet Status
              <Badge variant="outline" className="ml-2">
                {ambulances.length}
              </Badge>
            </h2>
          </div>

      <div className="space-y-2 md:space-y-3">
        {ambulances.map((ambulance, index) => (
          <motion.div
            key={ambulance.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary/50 touch-manipulation"
              onClick={() => onAmbulanceSelect(ambulance)}
            >
              <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{ambulance.id}</h3>
                    <Badge variant={getStatusBadgeVariant(ambulance.status)}>
                      {ambulance.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>{ambulance.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{ambulance.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👨‍⚕️</span>
                      <span>{ambulance.driver}</span>
                    </div>
                    {ambulance.eta && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{ambulance.eta}</span>
                      </div>
                    )}
                    
                    {/* Hospital Details for Dispatched Ambulances */}
                    {ambulance.hospital && ambulance.status === 'Dispatched' && (
                      <>
                        <Separator className="my-2" />
                        <div className="bg-muted/50 p-2 rounded text-xs space-y-1">
                          <h4 className="font-semibold text-primary flex items-center gap-1">
                            🏥 Destination Hospital
                          </h4>
                          <div className="space-y-1">
                            <div><strong>Name:</strong> {ambulance.hospital.name}</div>
                            <div><strong>Address:</strong> {ambulance.hospital.address}</div>
                            <div><strong>Phone:</strong> {ambulance.hospital.phone}</div>
                            <div><strong>Distance:</strong> {ambulance.hospital.distance}</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Separator />

        {/* Hotspots Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Traffic Hotspots
            <Badge variant="outline" className="ml-2">
              {filteredHotspots.length}
            </Badge>
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilter}
            className="text-xs"
          >
            <Filter className="h-3 w-3 mr-1" />
            {showHighRiskOnly ? 'Show All' : 'High Risk'}
          </Button>
        </div>

        <div className="space-y-2 md:space-y-3">
          {filteredHotspots.map((hotspot, index) => (
            <motion.div
              key={hotspot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary/50 touch-manipulation"
                onClick={() => onHotspotSelect(hotspot)}
              >
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{hotspot.name}</h3>
                    <div className={`w-3 h-3 rounded-full ${
                      hotspot.category === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Traffic: {hotspot.trafficLevel}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">🚦 Speed: {hotspot.currentSpeed} km/h</span>
                    </div>
                    <HotspotWeather lat={hotspot.lat} lng={hotspot.lng} className="text-xs" />
                    <div className="text-xs">Category: {hotspot.category}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default SidebarPanel;