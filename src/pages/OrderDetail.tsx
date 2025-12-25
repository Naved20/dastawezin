import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrderDocuments, useUpdateOrderStatus, useUpdateOrderDeliveryDate, Order } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AdminLayout from '@/components/dashboard/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  ArrowLeft, Package, Clock, CheckCircle, Truck, User, Mail, Phone,
  Upload, Download, FileText, Image, File, Trash2, Loader2, Calendar as CalendarIcon
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

interface OrderDetailProps {
  isAdmin?: boolean;
}

const OrderDetail = ({ isAdmin = false }: OrderDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deliveryDateOpen, setDeliveryDateOpen] = useState(false);

  const updateStatus = useUpdateOrderStatus();
  const updateDeliveryDate = useUpdateOrderDeliveryDate();

  // Fetch order details
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          services (id, name, category, price, icon, description, show_upload_section, show_completed_section)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Order;
    },
    enabled: !!id,
  });

  // Fetch customer profile for admin view
  const { data: customerProfile } = useQuery({
    queryKey: ['customer-profile', order?.user_id],
    queryFn: async () => {
      if (!order?.user_id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', order.user_id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!order?.user_id && isAdmin,
  });

  // Fetch order documents
  const { data: documents = [], isLoading: docsLoading } = useOrderDocuments(id || '');

  const uploadedDocs = documents.filter(d => d.document_type === 'uploaded');
  const completedDocs = documents.filter(d => d.document_type === 'completed');

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return Image;
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return FileText;
    return File;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: 'uploaded' | 'completed') => {
    const file = e.target.files?.[0];
    if (!file || !id || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('order_documents')
        .insert([{
          order_id: id,
          file_name: file.name,
          file_url: publicUrl,
          document_type: docType,
        }]);

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['order-documents', id] });
      toast({ title: 'Document uploaded successfully' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (docId: string, fileUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/documents/');
      if (urlParts[1]) {
        await supabase.storage.from('documents').remove([decodeURIComponent(urlParts[1])]);
      }

      const { error } = await supabase
        .from('order_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['order-documents', id] });
      toast({ title: 'Document deleted' });
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await updateStatus.mutateAsync({ orderId: id, status: status as Order['status'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast({ title: 'Status updated' });
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const handleDeliveryDateChange = async (date: Date | undefined) => {
    if (!id) return;
    try {
      await updateDeliveryDate.mutateAsync({ 
        orderId: id, 
        date: date ? format(date, 'yyyy-MM-dd') : null 
      });
      setDeliveryDateOpen(false);
      toast({ title: 'Delivery date updated' });
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const Layout = isAdmin ? AdminLayout : DashboardLayout;
  const backPath = isAdmin ? '/admin/orders' : '/dashboard/orders';

  if (orderLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order not found</h2>
          <Button onClick={() => navigate(backPath)}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(backPath)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold">Order Details</h1>
            <p className="text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <Badge variant="outline" className={cn('text-sm px-3 py-1', status.color)}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {status.label}
          </Badge>
        </div>

        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{order.services?.name}</h3>
              </div>
              <p className="text-2xl font-bold text-primary">₹{order.total_amount || order.services?.price}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{order.created_at && format(new Date(order.created_at), 'MMM dd, yyyy • hh:mm a')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Updated:</span>
                <span>{order.updated_at && format(new Date(order.updated_at), 'MMM dd, yyyy • hh:mm a')}</span>
              </div>
            </div>

            {/* Expected Delivery Date */}
            {order.expected_delivery_date && !isAdmin && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">Expected Delivery</p>
                    <p className="text-lg font-bold">{format(new Date(order.expected_delivery_date), 'EEEE, MMMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>
            )}

            {order.notes && (
              <div className="p-3 rounded-lg border border-border">
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            )}

            {order.details && Object.keys(order.details).length > 0 && (
              <div className="p-3 rounded-lg border border-border">
                <p className="text-sm font-medium mb-2">Additional Details</p>
                {Object.entries(order.details as Record<string, string>).map(([key, value]) => (
                  <p key={key} className="text-sm">
                    <span className="text-muted-foreground capitalize">{key}:</span> {value}
                  </p>
                ))}
              </div>
            )}

            {/* Admin: Status Update */}
            {isAdmin && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Select value={order.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Expected Delivery:</span>
                  <Popover open={deliveryDateOpen} onOpenChange={setDeliveryDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-48 justify-start text-left font-normal',
                          !order.expected_delivery_date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {order.expected_delivery_date 
                          ? format(new Date(order.expected_delivery_date), 'MMM dd, yyyy')
                          : 'Set date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={order.expected_delivery_date ? new Date(order.expected_delivery_date) : undefined}
                        onSelect={handleDeliveryDateChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  {order.expected_delivery_date && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeliveryDateChange(undefined)}
                      className="text-muted-foreground"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Info (Admin only) */}
        {isAdmin && customerProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">{customerProfile.full_name || 'No name'}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {customerProfile.email}
                  </p>
                  {customerProfile.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {customerProfile.phone}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents Section */}
        {(isAdmin || (order.services as any)?.show_upload_section !== false || (order.services as any)?.show_completed_section !== false) && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Uploaded Documents (by customer) - Show for admin always, or for user if enabled */}
            {(isAdmin || (order.services as any)?.show_upload_section !== false) && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-base">
                    {isAdmin ? 'Customer Documents' : 'Uploaded Documents'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {docsLoading ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  ) : uploadedDocs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded</p>
                  ) : (
                    <div className="space-y-2">
                      {uploadedDocs.map((doc) => {
                        const FileIcon = getFileIcon(doc.file_name);
                        return (
                          <div key={doc.id} className="flex items-center gap-3 p-2 rounded-lg border border-border">
                            <FileIcon className="w-5 h-5 text-primary" />
                            <span className="flex-1 text-sm truncate">{doc.file_name}</span>
                            <Button size="icon" variant="ghost" onClick={() => window.open(doc.file_url, '_blank')}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Completed Documents (by admin) - Show for admin always, or for user if enabled */}
            {(isAdmin || (order.services as any)?.show_completed_section !== false) && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-display text-base">Completed Documents</CardTitle>
                  {isAdmin && (
                    <>
                      <input
                        type="file"
                        id="completed-upload"
                        className="hidden"
                        onChange={(e) => handleUpload(e, 'completed')}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => document.getElementById('completed-upload')?.click()}
                        disabled={uploading}
                      >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                        Upload
                      </Button>
                    </>
                  )}
                </CardHeader>
                <CardContent>
                  {docsLoading ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  ) : completedDocs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isAdmin ? 'Upload completed documents here' : 'Completed documents will appear here'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {completedDocs.map((doc) => {
                        const FileIcon = getFileIcon(doc.file_name);
                        return (
                          <div key={doc.id} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-green-50 dark:bg-green-950/20">
                            <FileIcon className="w-5 h-5 text-green-600" />
                            <span className="flex-1 text-sm truncate">{doc.file_name}</span>
                            <Button size="icon" variant="ghost" onClick={() => window.open(doc.file_url, '_blank')}>
                              <Download className="w-4 h-4" />
                            </Button>
                            {isAdmin && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleDelete(doc.id, doc.file_url)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrderDetail;
