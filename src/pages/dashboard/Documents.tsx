import { useState, useRef } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FolderOpen,
  Upload,
  FileText,
  Image,
  File,
  Trash2,
  Download,
  Loader2,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';

interface UserDocument {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  document_type: string | null;
  created_at: string | null;
}

const Documents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['user-documents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserDocument[];
    },
    enabled: !!user,
  });

  const filteredDocs = documents.filter((doc) =>
    doc.file_name.toLowerCase().includes(search.toLowerCase())
  );

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return Image;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
      return FileText;
    }
    return File;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('user_documents')
        .insert([{
          user_id: user.id,
          file_name: file.name,
          file_url: publicUrl,
          document_type: file.type,
        }]);

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['user-documents'] });
      toast({
        title: 'Document uploaded',
        description: 'Your document has been uploaded successfully.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (doc: UserDocument) => {
    if (!user) return;

    try {
      // Extract file path from URL
      const urlParts = doc.file_url.split('/');
      const filePath = `${user.id}/${urlParts[urlParts.length - 1]}`;

      await supabase.storage.from('documents').remove([filePath]);

      const { error } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['user-documents'] });
      toast({
        title: 'Document deleted',
        description: 'Your document has been deleted.',
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">My Documents</h1>
            <p className="text-muted-foreground">Upload and manage your documents</p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gradient-primary rounded-xl"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" /> Upload Document
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : filteredDocs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                {search ? 'Try a different search term' : 'Upload your first document to get started'}
              </p>
              {!search && (
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" /> Upload Document
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => {
              const FileIcon = getFileIcon(doc.file_name);
              return (
                <Card key={doc.id} className="hover:shadow-md transition-shadow border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" title={doc.file_name}>
                          {doc.file_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {doc.created_at && format(new Date(doc.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-1" /> View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDelete(doc)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

export default Documents;
