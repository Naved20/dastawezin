import { useState } from 'react';
import AdminLayout from '@/components/dashboard/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAllServices, Service, CustomField, parseCustomFields } from '@/hooks/useServices';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Plus, Pencil, Loader2, Trash2,
  CreditCard, Image, FileText, BookOpen,
  Home, IndianRupee, Users, Baby,
  Zap, Droplet, Smartphone, Fingerprint, Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconOptions = [
  { value: 'CreditCard', label: 'Credit Card', icon: CreditCard },
  { value: 'Image', label: 'Image', icon: Image },
  { value: 'FileText', label: 'File Text', icon: FileText },
  { value: 'BookOpen', label: 'Book Open', icon: BookOpen },
  { value: 'Home', label: 'Home', icon: Home },
  { value: 'IndianRupee', label: 'Rupee', icon: IndianRupee },
  { value: 'Users', label: 'Users', icon: Users },
  { value: 'Baby', label: 'Baby', icon: Baby },
  { value: 'Zap', label: 'Zap', icon: Zap },
  { value: 'Droplet', label: 'Droplet', icon: Droplet },
  { value: 'Smartphone', label: 'Smartphone', icon: Smartphone },
  { value: 'Fingerprint', label: 'Fingerprint', icon: Fingerprint },
  { value: 'Briefcase', label: 'Briefcase', icon: Briefcase },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard, Image, FileText, BookOpen, Home, IndianRupee, Users, Baby,
  Zap, Droplet, Smartphone, Fingerprint, Briefcase,
};

const categoryLabels: Record<string, string> = {
  printing: '🖨️ Printing',
  certificates: '📜 Certificates',
  bills: '💳 Bills',
  mp_online: '🏛️ CSC Service',
};

// Default category fields that can be customized per service
const defaultCategoryFields: Record<string, { id: string; label: string; placeholder: string; type?: string; required?: boolean }[]> = {
  printing: [
    { id: 'copies', label: 'Number of Copies', placeholder: 'Enter number of copies', type: 'number', required: true },
    { id: 'paperSize', label: 'Paper Size', placeholder: 'e.g., A4, A3, Letter', required: true },
    { id: 'colorType', label: 'Print Type', placeholder: 'e.g., Color, Black & White', required: true },
  ],
  certificates: [
    { id: 'applicantName', label: 'Applicant Full Name', placeholder: 'Name as per documents', required: true },
    { id: 'fatherName', label: "Father's Name", placeholder: "Enter father's name", required: true },
    { id: 'dateOfBirth', label: 'Date of Birth', placeholder: 'DD/MM/YYYY', required: true },
    { id: 'aadharNumber', label: 'Aadhar Number', placeholder: '12-digit Aadhar number', required: true },
    { id: 'samagraId', label: 'Samagra ID', placeholder: 'Enter Samagra ID', required: false },
  ],
  bills: [
    { id: 'accountNumber', label: 'Account/Consumer Number', placeholder: 'Enter account number', required: true },
    { id: 'billAmount', label: 'Bill Amount (₹)', placeholder: 'Enter bill amount', type: 'number', required: true },
    { id: 'billType', label: 'Bill Type', placeholder: 'e.g., Electricity, Water, Gas', required: true },
  ],
  mp_online: [
    { id: 'applicantName', label: 'Applicant Full Name', placeholder: 'Name as per documents', required: true },
    { id: 'fatherName', label: "Father's Name", placeholder: "Enter father's name", required: true },
    { id: 'aadharNumber', label: 'Aadhar Number', placeholder: '12-digit Aadhar number', required: true },
    { id: 'serviceType', label: 'Service Required', placeholder: 'e.g., Domicile, Income, Caste', required: true },
  ],
};


interface ServiceFormData {
  name: string;
  description: string;
  category: 'printing' | 'certificates' | 'bills' | 'mp_online';
  price: string;
  icon: string;
  is_active: boolean;
  custom_fields: CustomField[];
  price_per_copy: boolean;
  show_upload_section: boolean;
  show_completed_section: boolean;
}

const initialFormData: ServiceFormData = {
  name: '',
  description: '',
  category: 'printing',
  price: '',
  icon: 'FileText',
  is_active: true,
  custom_fields: [],
  price_per_copy: false,
  show_upload_section: true,
  show_completed_section: true,
};

const AdminServices = () => {
  const { data: services = [], isLoading } = useAllServices();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const openAddDialog = () => {
    setEditingService(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    const parsedFields = parseCustomFields(service.custom_fields);
    setFormData({
      name: service.name,
      description: service.description || '',
      category: service.category,
      price: service.price.toString(),
      icon: service.icon || 'FileText',
      is_active: service.is_active ?? true,
      custom_fields: parsedFields || defaultCategoryFields[service.category]?.map(f => ({
        ...f,
        type: f.type || 'text',
        required: f.required ?? false
      })) || [],
      price_per_copy: service.price_per_copy ?? false,
      show_upload_section: service.show_upload_section ?? true,
      show_completed_section: service.show_completed_section ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast({ title: 'Missing fields', description: 'Name and price are required', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const serviceData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        price: parseFloat(formData.price),
        icon: formData.icon,
        is_active: formData.is_active,
        custom_fields: formData.custom_fields.length > 0 ? JSON.parse(JSON.stringify(formData.custom_fields)) : null,
        price_per_copy: formData.price_per_copy,
        show_upload_section: formData.show_upload_section,
        show_completed_section: formData.show_completed_section,
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);
        if (error) throw error;
        toast({ title: 'Service updated' });
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);
        if (error) throw error;
        toast({ title: 'Service added' });
      }

      queryClient.invalidateQueries({ queryKey: ['all-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error saving service', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['all-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({ title: service.is_active ? 'Service disabled' : 'Service enabled' });
    } catch {
      toast({ title: 'Error updating service', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Services</h1>
            <p className="text-muted-foreground">Manage your service offerings</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="gradient-primary rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., ID Card Printing"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the service"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => {
                        const newCategory = v as ServiceFormData['category'];
                        const defaultFields = defaultCategoryFields[newCategory]?.map(f => ({
                          ...f,
                          type: f.type || 'text',
                          required: f.required ?? false
                        })) || [];
                        setFormData({ 
                          ...formData, 
                          category: newCategory,
                          custom_fields: defaultFields,
                          price_per_copy: newCategory === 'printing'
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                </div>

                {formData.category === 'printing' && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label htmlFor="price_per_copy">Price per Copy</Label>
                      <p className="text-xs text-muted-foreground">Total = Price × Copies</p>
                    </div>
                    <Switch
                      id="price_per_copy"
                      checked={formData.price_per_copy}
                      onCheckedChange={(checked) => setFormData({ ...formData, price_per_copy: checked })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconOptions.map(({ value, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: value })}
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center border transition-colors',
                          formData.icon === value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted hover:bg-muted/80 border-transparent'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Fields Editor */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label>Custom Input Fields</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newField: CustomField = {
                          id: `field_${Date.now()}`,
                          label: '',
                          placeholder: '',
                          type: 'text',
                          required: false,
                        };
                        setFormData({
                          ...formData,
                          custom_fields: [...formData.custom_fields, newField],
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Field
                    </Button>
                  </div>

                  {formData.custom_fields.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No custom fields. Add fields that users need to fill when ordering.
                    </p>
                  )}

                  {formData.custom_fields.map((field, index) => (
                    <div key={field.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Field {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              custom_fields: formData.custom_fields.filter((_, i) => i !== index),
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Label (e.g., Number of Copies)"
                          value={field.label}
                          onChange={(e) => {
                            const updated = [...formData.custom_fields];
                            updated[index] = { ...field, label: e.target.value };
                            setFormData({ ...formData, custom_fields: updated });
                          }}
                        />
                        <Input
                          placeholder="Placeholder text"
                          value={field.placeholder}
                          onChange={(e) => {
                            const updated = [...formData.custom_fields];
                            updated[index] = { ...field, placeholder: e.target.value };
                            setFormData({ ...formData, custom_fields: updated });
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <Select
                          value={field.type}
                          onValueChange={(v) => {
                            const updated = [...formData.custom_fields];
                            updated[index] = { ...field, type: v };
                            setFormData({ ...formData, custom_fields: updated });
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="tel">Phone</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => {
                              const updated = [...formData.custom_fields];
                              updated[index] = { ...field, required: checked };
                              setFormData({ ...formData, custom_fields: updated });
                            }}
                          />
                          <span className="text-sm">Required</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Document Section Visibility */}
                <div className="space-y-3 border-t pt-4">
                  <Label className="text-sm font-medium">Document Sections</Label>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Show Upload Documents</p>
                      <p className="text-xs text-muted-foreground">Allow users to see uploaded documents section</p>
                    </div>
                    <Switch
                      checked={formData.show_upload_section}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_upload_section: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Show Completed Documents</p>
                      <p className="text-xs text-muted-foreground">Show completed documents section for this service</p>
                    </div>
                    <Switch
                      checked={formData.show_completed_section}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_completed_section: checked })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <Button onClick={handleSave} disabled={isSaving} className="w-full gradient-primary rounded-xl">
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    editingService ? 'Update Service' : 'Add Service'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category}>
                <h3 className="text-lg font-display font-semibold mb-3">
                  {categoryLabels[category] || category}
                </h3>
                <div className="grid gap-3">
                  {categoryServices.map((service) => {
                    const IconComponent = iconMap[service.icon || ''] || FileText;
                    return (
                      <Card key={service.id} className={cn(!service.is_active && 'opacity-60', 'border-border/50')}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                'w-12 h-12 rounded-lg flex items-center justify-center',
                                service.is_active ? 'bg-primary/10' : 'bg-muted'
                              )}>
                                <IconComponent className={cn(
                                  'w-6 h-6',
                                  service.is_active ? 'text-primary' : 'text-muted-foreground'
                                )} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold">{service.name}</p>
                                  {!service.is_active && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                      Disabled
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{service.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="font-bold text-primary">₹{service.price}</p>
                              <Switch
                                checked={service.is_active ?? true}
                                onCheckedChange={() => toggleServiceStatus(service)}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(service)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminServices;
