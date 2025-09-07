import React from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  User,
  Moon,
  Sun,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate, useLocation } from 'react-router-dom';

interface TopNavigationProps {
  onToggleSidebar: () => void;
  notifications: number;
  isDark: boolean;
  onToggleDark: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  onToggleSidebar,
  notifications,
  isDark,
  onToggleDark
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', active: location.pathname === '/dashboard' },
    { label: 'Map', path: '/', active: location.pathname === '/' },
    { label: 'Requests', path: '/requests', active: location.pathname === '/requests' },
    { label: 'Hospitals', path: '/hospitals', active: location.pathname === '/hospitals' },
    { label: 'Reports', path: '/reports', active: location.pathname === '/reports' },
    { label: 'Settings', path: '/settings', active: location.pathname === '/settings' },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-16 bg-card border-b border-border/60 flex items-center justify-between px-4 shadow-sm relative z-50"
    >
      {/* Left Section - Logo & Menu */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hover:bg-secondary/80 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-foreground">Smart Ambulance</h1>
            <p className="text-xs text-muted-foreground -mt-1">Emergency Response System</p>
          </div>
        </motion.div>
      </div>

      {/* Center Section - Navigation */}
      <nav className="hidden lg:flex items-center space-x-1">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant={item.active ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate(item.path)}
            className={`relative transition-all duration-300 ${
              item.active 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'hover:bg-secondary/80 hover:text-foreground'
            }`}
          >
            {item.label}
            {item.active && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-md -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </Button>
        ))}
      </nav>

      {/* Right Section - Search & Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search emergencies, ambulances..."
            className="pl-10 w-64 bg-secondary/50 border-border/60 focus:bg-card transition-colors"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-secondary/80 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0 animate-pulse"
            >
              {notifications}
            </Badge>
          )}
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDark}
          className="hover:bg-secondary/80 transition-colors"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary/80 transition-colors"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover border-border/60 shadow-lg">
            <DropdownMenuItem className="hover:bg-secondary/80 cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-secondary/80 cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-secondary/80 cursor-pointer text-destructive focus:text-destructive">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
};

export default TopNavigation;