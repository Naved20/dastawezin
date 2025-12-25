import { useState } from 'react';
import AdminLayout from '@/components/dashboard/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAllOrders, useUpdateOrderStatus, useOrderDocuments, OrderWithProfile } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, User, Eye, Trash2, Search, FileText, 
  Mail, Phone, MapPin, Calendar, ExternalLink, Loader2,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800' },
  delivered: { label: 'Delivered', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

const AdminOrders = () => {
  const { data: orders = [], isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithProfile | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch documents for selected order
  const { data: orderDocuments = [], isLoading: docsLoading } = useQuery({
    queryKey: ['order-documents', selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder?.id) return [];
      const { data, error } = await supabase
        .from('order_documents')
        .select('*')
        .eq('order_id', selectedOrder.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedOrder?.id,
  });

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: status as any });
      toast({ title: 'Order updated', description: `Status changed to ${status}` });
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await supabase.from('order_documents').delete().eq('order_id', orderId);
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast({ title: 'Order deleted' });
      setIsDetailOpen(false);
      setSelectedOrder(null);
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const openOrderDetail = (order: OrderWithProfile) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  // Filter and search
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.services?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (order.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (order.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (order.id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const orderDetails = selectedOrder?.details as Record<string, string> | null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Manage Orders</h1>
          <p className="text-muted-foreground">{orders.length} total orders</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by service, customer, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(statusConfig).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No orders found matching your search.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{order.services?.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" /> {order.profiles?.full_name || order.profiles?.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.created_at && format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className={statusConfig[order.status || 'pending']?.color}>
                        {statusConfig[order.status || 'pending']?.label}
                      </Badge>
                      <p className="font-bold text-primary">₹{order.total_amount}</p>
                      <Select value={order.status || 'pending'} onValueChange={(v) => handleStatusChange(order.id, v)}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" onClick={() => openOrderDetail(order)}>
                        <Eye className="w-4 h-4 mr-2" /> View Details
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Order</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this order and all its documents. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteOrder(order.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Details
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{selectedOrder.services?.name}</CardTitle>
                    <Badge className={statusConfig[selectedOrder.status || 'pending']?.color}>
                      {statusConfig[selectedOrder.status || 'pending']?.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-mono text-sm">{selectedOrder.id.slice(0, 8)}...</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-bold text-primary text-lg">₹{selectedOrder.total_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="text-sm">
                        {selectedOrder.created_at && format(new Date(selectedOrder.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Updated</p>
                      <p className="text-sm">
                        {selectedOrder.updated_at && format(new Date(selectedOrder.updated_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  {/* Update Status */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Update Status</p>
                    <Select 
                      value={selectedOrder.status || 'pending'} 
                      onValueChange={(v) => {
                        handleStatusChange(selectedOrder.id, v);
                        setSelectedOrder({ ...selectedOrder, status: v as any });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" /> Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedOrder.profiles?.full_name || 'No name'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedOrder.profiles?.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedOrder.profiles?.phone || 'No phone'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Details (Form Data) */}
              {orderDetails && Object.keys(orderDetails).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" /> Form Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(orderDetails).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="font-medium">{value || '-'}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Attached Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Attached Documents ({orderDocuments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {docsLoading ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </div>
                  ) : orderDocuments.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No documents attached</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {orderDocuments.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            {doc.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <img 
                                src={doc.file_url} 
                                alt={doc.file_name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                                <FileText className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{doc.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.document_type} • {doc.created_at && format(new Date(doc.created_at), 'MMM dd')}
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
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;