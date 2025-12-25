import { useMemo } from 'react';
import AdminLayout from '@/components/dashboard/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAllOrders } from '@/hooks/useOrders';
import { useAllServices } from '@/hooks/useServices';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { TrendingUp, IndianRupee, Package, Users, Percent, Calendar, CheckCircle, Clock } from 'lucide-react';

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminAnalytics = () => {
  const { data: orders = [] } = useAllOrders();
  const { data: services = [] } = useAllServices();

  // Calculate date range (last 30 days)
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 29);
    return eachDayOfInterval({ start, end });
  }, []);

  // Orders over time
  const ordersOverTime = useMemo(() => {
    return dateRange.map(date => {
      const dayStart = startOfDay(date);
      const dayOrders = orders.filter(o => {
        if (!o.created_at) return false;
        const orderDate = startOfDay(new Date(o.created_at));
        return orderDate.getTime() === dayStart.getTime();
      });
      
      return {
        date: format(date, 'MMM dd'),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      };
    });
  }, [orders, dateRange]);

  // Monthly revenue trends (last 6 months)
  const monthlyRevenue = useMemo(() => {
    const end = new Date();
    const start = subMonths(end, 5);
    const months = eachMonthOfInterval({ start, end });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthOrders = orders.filter(o => {
        if (!o.created_at) return false;
        const orderDate = new Date(o.created_at);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      const totalRevenue = monthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const deliveredRevenue = monthOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const pendingRevenue = monthOrders
        .filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      return {
        month: format(month, 'MMM yyyy'),
        total: totalRevenue,
        delivered: deliveredRevenue,
        pending: pendingRevenue,
        orders: monthOrders.length,
      };
    });
  }, [orders]);

  // Revenue by service
  const revenueByService = useMemo(() => {
    const serviceRevenue: Record<string, { name: string; revenue: number; orders: number }> = {};
    
    orders.forEach(order => {
      if (order.services?.name) {
        const name = order.services.name;
        if (!serviceRevenue[name]) {
          serviceRevenue[name] = { name, revenue: 0, orders: 0 };
        }
        serviceRevenue[name].revenue += order.total_amount || 0;
        serviceRevenue[name].orders++;
      }
    });
    
    return Object.values(serviceRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [orders]);

  // Revenue by category
  const revenueByCategory = useMemo(() => {
    const categoryRevenue: Record<string, { name: string; revenue: number; orders: number }> = {};
    
    const labels: Record<string, string> = {
      printing: 'Printing',
      certificates: 'Certificates',
      bills: 'Bills',
      mp_online: 'CSC Service',
    };

    orders.forEach(order => {
      if (order.services?.category) {
        const cat = order.services.category;
        const name = labels[cat] || cat;
        if (!categoryRevenue[cat]) {
          categoryRevenue[cat] = { name, revenue: 0, orders: 0 };
        }
        categoryRevenue[cat].revenue += order.total_amount || 0;
        categoryRevenue[cat].orders++;
      }
    });
    
    return Object.values(categoryRevenue).sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  // Service popularity
  const servicePopularity = useMemo(() => {
    const serviceCounts: Record<string, { name: string; count: number }> = {};
    
    orders.forEach(order => {
      if (order.services?.name) {
        const name = order.services.name;
        if (!serviceCounts[name]) {
          serviceCounts[name] = { name, count: 0 };
        }
        serviceCounts[name].count++;
      }
    });
    
    return Object.values(serviceCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [orders]);

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    const counts = {
      pending: 0,
      in_progress: 0,
      ready: 0,
      delivered: 0,
      cancelled: 0,
    };
    
    orders.forEach(order => {
      if (order.status && order.status in counts) {
        counts[order.status as keyof typeof counts]++;
      }
    });
    
    return [
      { name: 'Pending', value: counts.pending, color: '#f59e0b' },
      { name: 'In Progress', value: counts.in_progress, color: '#3b82f6' },
      { name: 'Ready', value: counts.ready, color: '#10b981' },
      { name: 'Delivered', value: counts.delivered, color: '#6b7280' },
      { name: 'Cancelled', value: counts.cancelled, color: '#ef4444' },
    ].filter(s => s.value > 0);
  }, [orders]);

  // Revenue split by status
  const revenueByStatus = useMemo(() => {
    const statusRevenue = {
      pending: 0,
      in_progress: 0,
      ready: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach(order => {
      if (order.status && order.status in statusRevenue) {
        statusRevenue[order.status as keyof typeof statusRevenue] += order.total_amount || 0;
      }
    });

    return [
      { name: 'Pending', value: statusRevenue.pending, color: '#f59e0b' },
      { name: 'In Progress', value: statusRevenue.in_progress, color: '#3b82f6' },
      { name: 'Ready', value: statusRevenue.ready, color: '#10b981' },
      { name: 'Delivered', value: statusRevenue.delivered, color: '#6b7280' },
      { name: 'Cancelled', value: statusRevenue.cancelled, color: '#ef4444' },
    ].filter(s => s.value > 0);
  }, [orders]);

  // Summary stats
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
    const pendingRevenue = pendingOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');
    const cancelledRevenue = cancelledOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    
    // This month stats
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthOrders = orders.filter(o => {
      if (!o.created_at) return false;
      return new Date(o.created_at) >= thisMonthStart;
    });
    const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    // Last month stats
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const lastMonthOrders = orders.filter(o => {
      if (!o.created_at) return false;
      const date = new Date(o.created_at);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : thisMonthRevenue > 0 ? '100' : '0';

    const completionRate = orders.length > 0 
      ? ((deliveredOrders.length / orders.length) * 100).toFixed(1)
      : '0';

    return {
      totalOrders: orders.length,
      totalRevenue,
      deliveredRevenue,
      pendingRevenue,
      cancelledRevenue,
      avgOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueGrowth,
      completionRate,
      pendingOrders: pendingOrders.length,
      deliveredOrders: deliveredOrders.length,
    };
  }, [orders]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Analytics & Revenue</h1>
          <p className="text-muted-foreground">Business insights, revenue splits, and performance metrics</p>
        </div>

        {/* Summary Cards - Row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
            { label: 'This Month', value: `₹${stats.thisMonthRevenue.toLocaleString()}`, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/50' },
            { label: 'Delivered Revenue', value: `₹${stats.deliveredRevenue.toLocaleString()}`, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/50' },
            { label: 'Pending Revenue', value: `₹${stats.pendingRevenue.toLocaleString()}`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/50' },
          ].map((stat, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Cards - Row 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Avg Order Value', value: `₹${stats.avgOrderValue}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/50' },
            { label: 'Revenue Growth', value: `${stats.revenueGrowth}%`, icon: Percent, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/50', subtitle: 'vs last month' },
            { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: Users, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/50' },
          ].map((stat, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {'subtitle' in stat && <p className="text-xs text-muted-foreground">{stat.subtitle}</p>}
                  </div>
                  <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Monthly Revenue Trend */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display">Monthly Revenue Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="delivered" fill="#10b981" name="Delivered Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending Revenue" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders & Revenue Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display">Daily Orders & Revenue (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ordersOverTime}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis yAxisId="left" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                    name="Orders"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue (₹)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Splits Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue by Category */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display">Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {revenueByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="revenue"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {revenueByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No category data available
                  </div>
                )}
              </div>
              {/* Category Revenue Table */}
              <div className="mt-4 space-y-2">
                {revenueByCategory.map((cat, index) => (
                  <div key={cat.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">₹{cat.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{cat.orders} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Status */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display">Revenue by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {revenueByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {revenueByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No orders yet
                  </div>
                )}
              </div>
              {/* Status Revenue Table */}
              <div className="mt-4 space-y-2">
                {revenueByStatus.map((status) => (
                  <div key={status.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="text-sm font-medium">{status.name}</span>
                    </div>
                    <p className="text-sm font-semibold">₹{status.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Service */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display">Revenue by Service (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {revenueByService.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByService} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `₹${value}`} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={150}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                        name === 'revenue' ? 'Revenue' : 'Orders'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No service data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Service Popularity */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display">Top Services by Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {servicePopularity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={servicePopularity} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No service data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Status Breakdown */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display">Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {statusBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {statusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No orders yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
