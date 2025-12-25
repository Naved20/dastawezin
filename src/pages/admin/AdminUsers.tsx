import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/dashboard/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Mail, Phone, Trash2, Loader2, Crown, Search, 
  Eye, FileText, MapPin, Calendar, X, Download, ExternalLink 
} from 'lucide-react';
import { format } from 'date-fns';

interface UserWithRole {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string | null;
  isAdmin: boolean;
}

interface UserDocument {
  id: string;
  file_name: string;
  file_url: string;
  document_type: string | null;
  created_at: string | null;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'user'>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users-with-roles'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      const adminUserIds = new Set(adminRoles.map(r => r.user_id));

      return profiles.map(p => ({
        ...p,
        isAdmin: adminUserIds.has(p.id),
      })) as UserWithRole[];
    },
  });

  const { data: orderCounts = {} } = useQuery({
    queryKey: ['user-order-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('user_id');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach(o => {
        counts[o.user_id] = (counts[o.user_id] || 0) + 1;
      });
      return counts;
    },
  });

  const { data: userDocuments = [], isLoading: docsLoading } = useQuery({
    queryKey: ['user-documents', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', selectedUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserDocument[];
    },
    enabled: !!selectedUser?.id,
  });

  const { data: orderDocuments = [] } = useQuery({
    queryKey: ['user-order-documents', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      
      // Get user's orders first
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', selectedUser.id);

      if (!orders || orders.length === 0) return [];

      const orderIds = orders.map(o => o.id);
      
      const { data, error } = await supabase
        .from('order_documents')
        .select('*')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedUser?.id,
  });

  const deleteUser = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      await supabase.from('orders').delete().eq('user_id', userId);
      await supabase.from('user_documents').delete().eq('user_id', userId);
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;

      toast({ title: 'User deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      setIsDetailOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to delete user', variant: 'destructive' });
    } finally {
      setLoadingUserId(null);
    }
  };

  const openUserDetail = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  // Filter and search logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (user.phone?.includes(searchQuery) || false);
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'admin' && user.isAdmin) ||
      (filterType === 'user' && !user.isAdmin);

    return matchesSearch && matchesFilter;
  });

  const adminCount = users.filter(u => u.isAdmin).length;
  const userCount = users.length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">User Management</h1>
          <p className="text-muted-foreground">View and manage all users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{userCount}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{adminCount}</p>
                  <p className="text-sm text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="admin">Admins Only</SelectItem>
              <SelectItem value="user">Regular Users</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No users found matching your search.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className={user.isAdmin ? 'border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/20' : ''}>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.isAdmin ? 'bg-yellow-100' : 'bg-primary/10'}`}>
                        {user.isAdmin ? (
                          <Crown className="w-6 h-6 text-yellow-600" />
                        ) : (
                          <User className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{user.full_name || 'No name'}</p>
                          {user.isAdmin && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {user.phone}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined: {user.created_at && format(new Date(user.created_at), 'MMM dd, yyyy')}
                          {' • '}{orderCounts[user.id] || 0} orders
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View Full Data */}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" /> Full Data
                      </Button>
                      {/* Quick View */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUserDetail(user)}
                      >
                        Quick View
                      </Button>

                      {/* Delete User */}
                      {!user.isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              disabled={loadingUserId === user.id}
                            >
                              {loadingUserId === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <strong>{user.email}</strong> and all their orders and documents. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteUser(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* User Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Profile
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Profile Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {selectedUser.isAdmin && <Crown className="w-5 h-5 text-yellow-500" />}
                    {selectedUser.full_name || 'No name'}
                    {selectedUser.isAdmin && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 ml-2">
                        Admin
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedUser.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedUser.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-start gap-2 md:col-span-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{selectedUser.address || 'No address'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        Joined {selectedUser.created_at && format(new Date(selectedUser.created_at), 'MMMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{orderCounts[selectedUser.id] || 0} orders placed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {docsLoading ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </div>
                  ) : userDocuments.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No documents uploaded</p>
                  ) : (
                    <div className="space-y-2">
                      {userDocuments.map((doc) => (
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

              {/* Order Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {orderDocuments.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No order documents</p>
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
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;