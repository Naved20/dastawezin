import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUserOrders } from '@/hooks/useOrders';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Search,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  delivered: { label: 'Delivered', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Truck },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', icon: Clock },
};

const Orders = () => {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useUserOrders();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.services?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(null)}
            >
              All
            </Button>
            {Object.entries(statusConfig).map(([key, config]) => (
              <Button
                key={key}
                variant={statusFilter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(key)}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter ? 'Try adjusting your filters' : "You haven't placed any orders yet"}
              </p>
              {!search && !statusFilter && (
                <Button onClick={() => navigate('/dashboard/new-order')}>
                  Place Your First Order
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              return (
                <Card
                  key={order.id}
                  className="hover:shadow-md transition-shadow cursor-pointer border-border/50"
                  onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{order.services?.name || 'Service'}</h3>
                          <p className="text-sm text-muted-foreground">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.created_at && format(new Date(order.created_at), 'MMM dd, yyyy • hh:mm a')}
                          </p>
                          {order.expected_delivery_date && (
                            <p className="text-sm text-primary font-medium mt-1">
                              📦 Expected: {format(new Date(order.expected_delivery_date), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg text-primary">
                            ₹{order.total_amount || order.services?.price || 0}
                          </p>
                          <Badge variant="outline" className={cn('mt-1', status.color)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground hidden sm:block" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;
