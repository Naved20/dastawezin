import AdminLayout from '@/components/dashboard/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAllOrders } from '@/hooks/useOrders';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package, Users, IndianRupee, Clock, CheckCircle, Truck } from 'lucide-react';

const AdminDashboard = () => {
  const { data: orders = [] } = useAllOrders();
  
  const { data: customersCount = 0 } = useQuery({
    queryKey: ['customers-count'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const stats = {
    totalOrders: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total_amount || 0), 0),
    customers: customersCount,
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your business</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'text-primary' },
            { label: 'Customers', value: stats.customers, icon: Users, color: 'text-blue-500' },
            { label: 'Revenue', value: `₹${stats.revenue}`, icon: IndianRupee, color: 'text-green-500' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500' },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{order.services?.name}</p>
                  <p className="text-sm text-muted-foreground">{order.profiles?.email}</p>
                </div>
                <span className="text-sm px-2 py-1 rounded bg-muted">{order.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
