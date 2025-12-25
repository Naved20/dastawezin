import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  Plus,
  ArrowRight,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Package },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  delivered: { label: 'Delivered', color: 'bg-gray-100 text-gray-800', icon: Truck },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: Clock },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useUserOrders();

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'delivered').length,
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats.total, icon: Package, color: 'text-primary' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500' },
            { label: 'In Progress', value: stats.inProgress, icon: FileText, color: 'text-blue-500' },
            { label: 'Delivered', value: stats.completed, icon: CheckCircle, color: 'text-green-500' },
          ].map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/orders')}>
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Button onClick={() => navigate('/dashboard/new-order')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Place Your First Order
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => {
                  const status = statusConfig[order.status];
                  const StatusIcon = status.icon;
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{order.services?.name || 'Service'}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.created_at && format(new Date(order.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
