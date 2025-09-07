import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  Ambulance, 
  TrendingUp,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
  Legend
} from 'recharts';

interface DashboardProps {
  metrics: {
    averageResponseTime: number;
    activeEmergencies: number;
    improvementPercentage: number;
    totalDispatches: number;
    successfulOutcomes: number;
    avgTimeToDispatch: number;
  };
  ambulances: Array<{
    id: string;
    status: string;
  }>;
  hotspots: Array<{
    name: string;
    category: string;
  }>;
}

const Dashboard: React.FC<DashboardProps> = ({ metrics, ambulances, hotspots }) => {
  // Sample data for charts
  const responseTimeData = [
    { name: 'Mon', responseTime: 7.2, target: 8 },
    { name: 'Tue', responseTime: 8.1, target: 8 },
    { name: 'Wed', responseTime: 6.9, target: 8 },
    { name: 'Thu', responseTime: 9.2, target: 8 },
    { name: 'Fri', responseTime: 8.5, target: 8 },
    { name: 'Sat', responseTime: 7.8, target: 8 },
    { name: 'Sun', responseTime: 8.3, target: 8 }
  ];

  const zoneData = [
    { name: 'Central Chennai', value: 35, color: '#1E40AF' },
    { name: 'South Chennai', value: 25, color: '#DC2626' },
    { name: 'North Chennai', value: 20, color: '#059669' },
    { name: 'East Chennai', value: 12, color: '#D97706' },
    { name: 'West Chennai', value: 8, color: '#7C3AED' }
  ];

  const peakHoursData = [
    { hour: '6AM', requests: 5 },
    { hour: '8AM', requests: 15 },
    { hour: '10AM', requests: 12 },
    { hour: '12PM', requests: 18 },
    { hour: '2PM', requests: 22 },
    { hour: '4PM', requests: 28 },
    { hour: '6PM', requests: 35 },
    { hour: '8PM', requests: 25 },
    { hour: '10PM', requests: 18 },
    { hour: '12AM', requests: 8 }
  ];

  const statusCounts = {
    available: ambulances.filter(a => a.status === 'Available').length,
    onDuty: ambulances.filter(a => a.status === 'On Duty').length,
    enRoute: ambulances.filter(a => a.status === 'En-route').length,
    dispatched: ambulances.filter(a => a.status === 'Dispatched').length,
  };

  const highRiskHotspots = hotspots.filter(h => h.category === 'high').length;

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time emergency response analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Today
          </Badge>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card className="border-border/60 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Ambulances</p>
                  <p className="text-2xl font-bold text-foreground">{ambulances.length}</p>
                  <p className="text-xs text-success mt-1">
                    +2 new this month
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Ambulance className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card className="border-border/60 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Emergencies</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.activeEmergencies}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current active cases
                  </p>
                </div>
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card className="border-border/60 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.averageResponseTime}m</p>
                  <p className={`text-xs mt-1 ${
                    metrics.improvementPercentage > 0 ? 'text-success' : 'text-accent'
                  }`}>
                    {metrics.improvementPercentage > 0 ? '↓' : '↑'} {Math.abs(metrics.improvementPercentage)}% vs target
                  </p>
                </div>
                <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Card className="border-border/60 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.totalDispatches}</p>
                  <p className="text-xs text-success mt-1">
                    {((metrics.successfulOutcomes / metrics.totalDispatches) * 100 || 0).toFixed(1)}% success rate
                  </p>
                </div>
                <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Fleet Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Fleet Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-success/5 rounded-lg border border-success/20">
                <div className="text-2xl font-bold text-success">{statusCounts.available}</div>
                <div className="text-sm text-muted-foreground">Available</div>
                <Progress value={(statusCounts.available / ambulances.length) * 100} className="mt-2 h-2" />
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-2xl font-bold text-primary">{statusCounts.enRoute}</div>
                <div className="text-sm text-muted-foreground">En Route</div>
                <Progress value={(statusCounts.enRoute / ambulances.length) * 100} className="mt-2 h-2" />
              </div>
              <div className="text-center p-4 bg-warning/5 rounded-lg border border-warning/20">
                <div className="text-2xl font-bold text-warning">{statusCounts.onDuty}</div>
                <div className="text-sm text-muted-foreground">On Duty</div>
                <Progress value={(statusCounts.onDuty / ambulances.length) * 100} className="mt-2 h-2" />
              </div>
              <div className="text-center p-4 bg-accent/5 rounded-lg border border-accent/20">
                <div className="text-2xl font-bold text-accent">{statusCounts.dispatched}</div>
                <div className="text-sm text-muted-foreground">Dispatched</div>
                <Progress value={(statusCounts.dispatched / ambulances.length) * 100} className="mt-2 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Times Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Weekly Response Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="responseTime" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="target" 
                    fill="hsl(var(--success))"
                    radius={[4, 4, 0, 0]}
                    opacity={0.3}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Zone Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Trips by Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={zoneData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {zoneData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Peak Hours Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Peak Request Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="hour" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* High Risk Areas Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              High Risk Areas Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                <div className="text-2xl font-bold text-accent">{highRiskHotspots}</div>
                <div className="text-sm text-muted-foreground">High Risk Zones</div>
              </div>
              <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
                <div className="text-2xl font-bold text-warning">{hotspots.length - highRiskHotspots}</div>
                <div className="text-sm text-muted-foreground">Moderate Risk Zones</div>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-2xl font-bold text-primary">{hotspots.length}</div>
                <div className="text-sm text-muted-foreground">Total Monitored Areas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;