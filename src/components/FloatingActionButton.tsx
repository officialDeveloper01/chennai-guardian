import React from 'react';
import { motion } from 'framer-motion';
import { Filter, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  showHighRiskOnly: boolean;
  onToggle: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  showHighRiskOnly,
  onToggle
}) => {
  return (
    <motion.div
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
    >
      <Button
        onClick={onToggle}
        className={`
          h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation
          ${showHighRiskOnly 
            ? 'bg-emergency hover:bg-emergency/90 text-emergency-foreground' 
            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }
          animate-pulse-medical
        `}
        size="lg"
      >
        {showHighRiskOnly ? (
          <AlertTriangle className="h-5 w-5 md:h-6 md:w-6" />
        ) : (
          <Filter className="h-5 w-5 md:h-6 md:w-6" />
        )}
      </Button>
      
      {/* Tooltip - Hidden on mobile */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        className="hidden md:block absolute right-16 top-1/2 transform -translate-y-1/2 bg-card/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-border/60 whitespace-nowrap"
      >
        <span className="text-sm font-medium text-foreground">
          {showHighRiskOnly ? 'Show All Zones' : 'High Risk Only'}
        </span>
        <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-card rotate-45 border-r border-b border-border/60"></div>
      </motion.div>
    </motion.div>
  );
};

export default FloatingActionButton;