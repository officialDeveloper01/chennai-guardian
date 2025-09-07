import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  Clock, 
  TrendingUp, 
  Activity, 
  Target,
  AlertCircle,
  CheckCircle,
  Timer,
  BarChart3
} from 'lucide-react';

interface MetricsData {
  averageResponseTime: number;
  activeEmergencies: number;
  improvementPercentage: number;
  totalDispatches: number;
  successfulOutcomes: number;
  avgTimeToDispatch: number;
}

interface MetricsPanelProps {
  metrics: MetricsData;
  isRealTime?: boolean;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ 
  metrics, 
  isRealTime = true 
}) => {
  const [animatedMetrics, setAnimatedMetrics] = useState(metrics);

  useEffect(() => {
    if (isRealTime) {
      // Simulate real-time updates
      const interval = setInterval(() => {
        setAnimatedMetrics(prev => ({
          ...prev,
          averageResponseTime: prev.averageResponseTime + (Math.random() - 0.5) * 0.2,
          activeEmergencies: Math.max(0, prev.activeEmergencies + Math.floor((Math.random() - 0.7) * 2)),
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isRealTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getResponseTimeColor = (time: number) => {
    if (time <= 8) return 'text-success';
    if (time <= 12) return 'text-warning';
    return 'text-emergency';
  };

  const getImprovementColor = (percentage: number) => {
    if (percentage >= 15) return 'text-success';
    if (percentage >= 5) return 'text-warning';
    return 'text-emergency';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card/95 backdrop-blur-sm border-t border-border/60 p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-4"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <BarChart3 className="h-5 w-5 text-primary" />
          Performance Metrics
        </h2>
        <p className="text-sm text-muted-foreground">
          Real-time system performance and emergency response analytics
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Average Response Time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="card-medical p-4 text-center hover:shadow-medical"
        >
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Clock className={`h-5 w-5 ${getResponseTimeColor(animatedMetrics.averageResponseTime)}`} />
            </div>
          </div>
          <div className={`text-2xl font-bold ${getResponseTimeColor(animatedMetrics.averageResponseTime)}`}>
            {formatTime(animatedMetrics.averageResponseTime * 60)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Avg Response Time
          </div>
          <div className="mt-2">
            <div className="w-full bg-muted rounded-full h-1">
              <motion.div
                className={`h-1 rounded-full ${
                  animatedMetrics.averageResponseTime <= 8 ? 'bg-success' :
                  animatedMetrics.averageResponseTime <= 12 ? 'bg-warning' : 'bg-emergency'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (15 - animatedMetrics.averageResponseTime) * 10)}%` }}
                transition={{ delay: 0.8, duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Active Emergencies */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="card-medical p-4 text-center hover:shadow-emergency"
        >
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-emergency/10 rounded-full">
              <AlertCircle className="h-5 w-5 text-emergency animate-pulse-medical" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emergency">
            {animatedMetrics.activeEmergencies}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Active Emergencies
          </div>
          {animatedMetrics.activeEmergencies > 0 && (
            <div className="mt-2 text-xs text-emergency font-medium animate-pulse">
              Requires Attention
            </div>
          )}
        </motion.div>

        {/* Improvement Percentage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="card-medical p-4 text-center hover:shadow-success"
        >
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-success/10 rounded-full">
              <TrendingUp className={`h-5 w-5 ${getImprovementColor(metrics.improvementPercentage)}`} />
            </div>
          </div>
          <div className={`text-2xl font-bold ${getImprovementColor(metrics.improvementPercentage)}`}>
            +{metrics.improvementPercentage}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            vs Random Dispatch
          </div>
          <div className="mt-2">
            <div className="w-full bg-muted rounded-full h-1">
              <motion.div
                className="h-1 rounded-full bg-success"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, metrics.improvementPercentage * 3)}%` }}
                transition={{ delay: 1.0, duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Total Dispatches */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="card-medical p-4 text-center hover:shadow-medical"
        >
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Target className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary">
            {metrics.totalDispatches}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Total Dispatches
          </div>
          <div className="text-xs text-success mt-1">
            Today
          </div>
        </motion.div>

        {/* Successful Outcomes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0 }}
          className="card-medical p-4 text-center hover:shadow-success"
        >
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-success/10 rounded-full">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
          </div>
          <div className="text-2xl font-bold text-success">
            {metrics.successfulOutcomes}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Successful Outcomes
          </div>
          <div className="text-xs text-success mt-1">
            {((metrics.successfulOutcomes / Math.max(metrics.totalDispatches, 1)) * 100).toFixed(1)}% Success Rate
          </div>
        </motion.div>

        {/* Avg Time to Dispatch */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
          className="card-medical p-4 text-center hover:shadow-medical"
        >
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Timer className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary">
            {formatTime(metrics.avgTimeToDispatch)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Avg Dispatch Time
          </div>
          <div className="text-xs text-success mt-1">
            -23% from baseline
          </div>
        </motion.div>
      </div>

      {/* Real-time Status */}
      {isRealTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span>Real-time metrics • Updates every 5 seconds</span>
          <Activity className="h-3 w-3 ml-1" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default MetricsPanel;