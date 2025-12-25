import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/dashboard/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, Mail, Phone, MapPin, Calendar, FileText, Package, 
  IndianRupee, TrendingUp, Clock, CheckCircle, XCircle,
  ArrowLeft, ExternalLink, Loader2, Search, Download,
  Activity, CreditCard, Eye, Crown
} from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UserOrder {
  id: string;
  status: string | null;
  total_amount: number | null;
  created_at: string | null;
  expected_delivery_date: string | null;
  notes: string | null;
  services: {
    name: string;
    category: string;
  } | null;
}

interface UserDocument {
  id: string;
  file_name: string;
  file_url: string;
  document_type: string | null;
  created_at: string | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  ready: 'bg-green-100 text-green-800 border-green-200',
  delivered: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const AdminUserData = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Fetch user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['admin-user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      return data as UserProfile | null;
    },
    enabled: !!userId,
  });

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['user-is-admin', userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!userId,
  });

  // Fetch all user orders with service details
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-user-orders', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*, services(name, category)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UserOrder[];
    },
    enabled: !!userId,
  });

  // Fetch user documents
  const { data: userDocuments = [], isLoading: docsLoading } = useQuery({
    queryKey: ['admin-user-documents', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UserDocument[];
    },
    enabled: !!userId,
  });

  // Fetch order documents for all user orders
  const { data: orderDocuments = [] } = useQuery({
    queryKey: ['admin-user-order-documents', userId],
    queryFn: async () => {
      if (!userId || orders.length === 0) return [];
      const orderIds = orders.map(o => o.id);
      const { data, error } = await supabase
        .from('order_documents')
        .select('*, order_id')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId && orders.length > 0,
  });

  // Calculate user statistics
  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'in_progress');
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');
    const avgOrderValue = orders.length > 0 ? Math.round(totalSpent / orders.length) : 0;

    // Category breakdown
    const categorySpending: Record<string, number> = {};
    orders.forEach(o => {
      if (o.services?.category) {
        categorySpending[o.services.category] = (categorySpending[o.services.category] || 0) + (o.total_amount || 0);
      }
    });

    // Monthly spending (last 6 months)
    const monthlySpending: Record<string, number> = {};
    orders.forEach(o => {
      if (o.created_at) {
        const month = format(new Date(o.created_at), 'MMM yyyy');
        monthlySpending[month] = (monthlySpending[month] || 0) + (o.total_amount || 0);
      }
    });

    return {
      totalOrders: orders.length,
      totalSpent,
      avgOrderValue,
      deliveredOrders: deliveredOrders.length,
      pendingOrders: pendingOrders.length,
      cancelledOrders: cancelledOrders.length,
      deliveredRevenue: deliveredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      pendingRevenue: pendingOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      categorySpending,
      monthlySpending,
      totalDocuments: userDocuments.length + orderDocuments.length,
    };
  }, [orders, userDocuments, orderDocuments]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.services?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.id.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  if (userLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">User not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const categoryLabels: Record<string, string> = {
    printing: 'Printing',
    certificates: 'Certificates',
    bills: 'Bills',
    mp_online: 'CSC Service',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/admin/users')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-display font-bold">{user.full_name || 'No Name'}</h1>
                {isAdmin && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Crown className="w-3 h-3 mr-1" /> Admin
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">Complete user data and activity</p>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" /> Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium truncate max-w-[200px]">{user.address || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {user.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                  <p className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Order Value</p>
                  <p className="text-2xl font-bold">₹{stats.avgOrderValue}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Documents</p>
                  <p className="text-2xl font-bold">{stats.totalDocuments}</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/50 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Breakdown */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
                  <p className="text-sm text-muted-foreground">₹{stats.deliveredRevenue.toLocaleString()}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending/In Progress</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pendingOrders}</p>
                  <p className="text-sm text-muted-foreground">₹{stats.pendingRevenue.toLocaleString()}</p>
                </div>
                <Clock className="w-10 h-10 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-red-50/50 dark:bg-red-950/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelledOrders}</p>
                </div>
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Spending */}
        {Object.keys(stats.categorySpending).length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.categorySpending).map(([category, amount]) => (
                  <div key={category} className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">{categoryLabels[category] || category}</p>
                    <p className="text-xl font-bold">₹{amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Orders and Documents */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" /> Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Documents ({stats.totalDocuments})
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" /> Activity
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <CardTitle className="text-lg">Order History</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search orders..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No orders found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Delivery</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">
                              {order.id.slice(0, 8)}...
                            </TableCell>
                            <TableCell className="font-medium">
                              {order.services?.name || 'Unknown'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {categoryLabels[order.services?.category || ''] || order.services?.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              ₹{order.total_amount?.toLocaleString() || 0}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[order.status || 'pending']}>
                                {order.status?.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {order.created_at && format(new Date(order.created_at), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              {order.expected_delivery_date 
                                ? format(new Date(order.expected_delivery_date), 'MMM dd, yyyy')
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* User Documents */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">User Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {docsLoading ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </div>
                  ) : userDocuments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No documents uploaded</p>
                  ) : (
                    <div className="space-y-2">
                      {userDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{doc.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.document_type || 'Document'} • {doc.created_at && format(new Date(doc.created_at), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Documents */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Order Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {orderDocuments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No order documents</p>
                  ) : (
                    <div className="space-y-2">
                      {orderDocuments.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{doc.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.document_type} • {doc.created_at && format(new Date(doc.created_at), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No activity yet</p>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 20).map((order, index) => (
                      <div key={order.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            order.status === 'delivered' ? 'bg-green-500' :
                            order.status === 'cancelled' ? 'bg-red-500' :
                            order.status === 'in_progress' ? 'bg-blue-500' :
                            'bg-amber-500'
                          }`} />
                          {index < orders.slice(0, 20).length - 1 && (
                            <div className="w-0.5 h-full bg-border flex-1 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{order.services?.name || 'Order'}</p>
                            <Badge className={statusColors[order.status || 'pending']} variant="outline">
                              {order.status?.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ₹{order.total_amount?.toLocaleString() || 0} • {order.created_at && format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                          {order.notes && (
                            <p className="text-sm text-muted-foreground mt-1 italic">"{order.notes}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminUserData;
