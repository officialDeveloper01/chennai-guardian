import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Target
} from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import HotspotWeather from './HotspotWeather';

interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  intensity: number;
  prediction: string;
  trend?: 'rising' | 'stable' | 'declining';
  category: 'moderate' | 'high';
  trafficLevel?: string;
  currentSpeed?: number;
  weather?: {
    temperature: number;
    description: string;
    icon: string;
  };
}

interface HotspotPanelProps {
  hotspots: Hotspot[];
  onHotspotSelect: (hotspot: Hotspot) => void;
  onHighlightOnMap: (hotspot: Hotspot) => void;
  onDeployToHotspot: (hotspot: Hotspot) => void;
}

const HotspotPanel: React.FC<HotspotPanelProps> = ({
  hotspots,
  onHotspotSelect,
  onHighlightOnMap,
  onDeployToHotspot
}) => {
  const getRiskLevel = (intensity: number) => {
    if (intensity >= 0.7) return { level: 'High', color: 'text-emergency', bgColor: 'bg-emergency/10' };
    if (intensity >= 0.4) return { level: 'Medium', color: 'text-warning', bgColor: 'bg-warning/10' };
    return { level: 'Low', color: 'text-success', bgColor: 'bg-success/10' };
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-3 w-3 text-emergency" />;
      case 'declining': return <TrendingUp className="h-3 w-3 text-success rotate-180" />;
      default: return <div className="w-3 h-1 bg-muted-foreground rounded"></div>;
    }
  };

  const sortedHotspots = [...hotspots].sort((a, b) => b.intensity - a.intensity);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full bg-card/95 backdrop-blur-sm border-l border-border/60 p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
          <div className="p-1 bg-warning/20 rounded">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          Predicted Hotspots
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          AI-predicted emergency hotspots in Chennai
        </p>
      </motion.div>

      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {sortedHotspots.map((hotspot, index) => {
          const risk = getRiskLevel(hotspot.intensity);
          
          return (
            <motion.div
              key={hotspot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className="card-hotspot p-4 cursor-pointer transition-all duration-300"
              onClick={() => onHotspotSelect(hotspot)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="text-2xl animate-pulse-medical">🔥</div>
                    <div className="absolute -top-1 -right-1">
                      {getTrendIcon(hotspot.trend)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">
                      {hotspot.name}
                    </h3>
                    <Badge 
                      className={`${risk.color} ${risk.bgColor} text-xs border-0`}
                      variant="secondary"
                    >
                      {risk.level} Risk
                    </Badge>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-warning">
                    {(hotspot.intensity * 100).toFixed(0)}%
                  </div>
                  <span className="text-xs text-muted-foreground">Risk Score</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Lat: {hotspot.lat.toFixed(4)}, Lng: {hotspot.lng.toFixed(4)}</span>
                </div>

                {hotspot.trafficLevel && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>🚦</span>
                    <span>Traffic: {hotspot.trafficLevel}</span>
                    {hotspot.currentSpeed && (
                      <span>({hotspot.currentSpeed} km/h)</span>
                    )}
                  </div>
                )}

                <HotspotWeather lat={hotspot.lat} lng={hotspot.lng} />

                <div className="text-sm text-muted-foreground">
                  <Target className="h-3 w-3 inline mr-1" />
                  {hotspot.prediction}
                </div>
              </div>

              {/* Risk Level Progress Bar */}
              <div className="mt-3 mb-3">
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${
                      hotspot.intensity >= 0.7 ? 'bg-emergency' :
                      hotspot.intensity >= 0.4 ? 'bg-warning' : 'bg-success'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${hotspot.intensity * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.8, duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHighlightOnMap(hotspot);
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Highlight
                </Button>
                
                {hotspot.intensity >= 0.4 && (
                  <Button
                    size="sm"
                    className="flex-1 text-xs btn-emergency"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeployToHotspot(hotspot);
                    }}
                  >
                    Deploy
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Hotspot Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="mt-6 p-3 bg-muted/50 rounded-lg"
      >
        <h4 className="font-medium text-sm mb-2 text-foreground">Risk Assessment</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-emergency/10 rounded">
            <div className="font-bold text-emergency">
              {hotspots.filter(h => h.intensity >= 0.7).length}
            </div>
            <div className="text-muted-foreground">High Risk</div>
          </div>
          <div className="text-center p-2 bg-warning/10 rounded">
            <div className="font-bold text-warning">
              {hotspots.filter(h => h.intensity >= 0.4 && h.intensity < 0.7).length}
            </div>
            <div className="text-muted-foreground">Medium Risk</div>
          </div>
          <div className="text-center p-2 bg-success/10 rounded">
            <div className="font-bold text-success">
              {hotspots.filter(h => h.intensity < 0.4).length}
            </div>
            <div className="text-muted-foreground">Low Risk</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HotspotPanel;