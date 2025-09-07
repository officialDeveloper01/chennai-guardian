import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ambulance, 
  Search, 
  Filter, 
  Clock, 
  ChevronDown,
  ChevronRight,
  Phone,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface LeftSidebarProps {
  ambulances: Ambulance[];
  isCollapsed: boolean;
  onAmbulanceSelect: (ambulance: Ambulance) => void;
  selectedAmbulance: Ambulance | null;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  ambulances,
  isCollapsed,
  onAmbulanceSelect,
  selectedAmbulance
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(!isCollapsed);

  React.useEffect(() => {
    setIsExpanded(!isCollapsed);
  }, [isCollapsed]);

  const filteredAmbulances = ambulances.filter(ambulance => {
    const matchesSearch = ambulance.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ambulance.driver?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ambulance.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ambulance.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-success text-success-foreground';
      case 'On Duty': return 'bg-warning text-warning-foreground';
      case 'En-route': return 'bg-primary text-primary-foreground';
      case 'Dispatched': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const statusCounts = {
    available: ambulances.filter(a => a.status === 'Available').length,
    onDuty: ambulances.filter(a => a.status === 'On Duty').length,
    enRoute: ambulances.filter(a => a.status === 'En-route').length,
    dispatched: ambulances.filter(a => a.status === 'Dispatched').length,
  };

  return (
    <motion.aside
      initial={{ width: isCollapsed ? 80 : 320 }}
      animate={{ width: isCollapsed ? 80 : 320 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full bg-card border-r border-border/60 flex flex-col shadow-sm relative z-40"
    >
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/60">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <Ambulance className="h-5 w-5 text-primary" />
                  Fleet Status
                </h2>
                <Badge variant="outline" className="text-xs">
                  {ambulances.length}
                </Badge>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-success/10 rounded-md p-2 text-center">
                  <div className="font-semibold text-success">{statusCounts.available}</div>
                  <div className="text-muted-foreground">Available</div>
                </div>
                <div className="bg-accent/10 rounded-md p-2 text-center">
                  <div className="font-semibold text-accent">{statusCounts.dispatched}</div>
                  <div className="text-muted-foreground">Active</div>
                </div>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search ambulances..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm bg-secondary/50 border-border/60"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-sm bg-secondary/50 border-border/60">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/60">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="On Duty">On Duty</SelectItem>
                  <SelectItem value="En-route">En-route</SelectItem>
                  <SelectItem value="Dispatched">Dispatched</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ambulance List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
              {filteredAmbulances.map((ambulance, index) => (
                <motion.div
                  key={ambulance.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 hover:shadow-md border ${
                      selectedAmbulance?.id === ambulance.id 
                        ? 'border-primary/50 bg-primary/5 shadow-md' 
                        : 'border-border/40 hover:border-primary/30'
                    }`}
                    onClick={() => onAmbulanceSelect(ambulance)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm text-foreground">{ambulance.id}</h3>
                        <Badge 
                          className={`${getStatusColor(ambulance.status)} text-xs px-2 py-1`}
                        >
                          {ambulance.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{ambulance.location}</span>
                        </div>
                        
                        {ambulance.driver && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs">👨‍⚕️</span>
                            <span className="truncate">{ambulance.driver}</span>
                          </div>
                        )}
                        
                        {ambulance.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span>{ambulance.phone}</span>
                          </div>
                        )}
                        
                        {ambulance.eta && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="font-medium text-primary">{ambulance.eta}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {filteredAmbulances.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Ambulance className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No ambulances found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed State */}
      {isCollapsed && (
        <div className="p-4 flex flex-col items-center gap-4">
          <Ambulance className="h-6 w-6 text-primary" />
          <div className="text-xs text-center text-muted-foreground space-y-1">
            <div className="w-8 h-8 bg-success/10 rounded-md flex items-center justify-center">
              <span className="text-xs font-semibold text-success">{statusCounts.available}</span>
            </div>
            <div className="w-8 h-8 bg-accent/10 rounded-md flex items-center justify-center">
              <span className="text-xs font-semibold text-accent">{statusCounts.dispatched}</span>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default LeftSidebar;