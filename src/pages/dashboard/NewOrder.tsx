import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useServices, Service, CustomField, parseCustomFields } from '@/hooks/useServices';
import { useCreateOrder } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  CreditCard, Image, FileText, BookOpen,
  Home, IndianRupee, Users, Baby,
  Zap, Droplet, Smartphone,
  Fingerprint, Briefcase,
  ArrowLeft, ArrowRight, Check, Loader2,
  Upload, X, File
} from 'lucide-react';
import { cn } from '@/lib/utils';
import UPIPayment from '@/components/UPIPayment';

interface UploadedFile {
  file: File;
  preview: string;
  type: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard, Image, FileText, BookOpen,
  Home, IndianRupee, Users, Baby,
  Zap, Droplet, Smartphone, Fingerprint, Briefcase,
};

const categoryLabels: Record<string, string> = {
  printing: '🖨️ Printing Services',
  certificates: '📜 Government Certificates',
  bills: '💳 Bill Payments',
  mp_online: '🏛️ CSC Services',
};

// Default category fields (fallback if service has no custom fields)
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

// Helper to get fields for a service
const getServiceFields = (service: Service): CustomField[] => {
  const customFields = parseCustomFields(service.custom_fields);
  if (customFields && customFields.length > 0) {
    return customFields;
  }
  return (defaultCategoryFields[service.category] || []).map(f => ({
    ...f,
    type: f.type || 'text',
    required: f.required ?? false
  }));
};

// Calculate total price
const calculateTotalPrice = (service: Service, details: Record<string, string>): number => {
  const basePrice = service.price;
  if (service.price_per_copy && details.copies) {
    const copies = parseInt(details.copies, 10);
    if (!isNaN(copies) && copies > 0) {
      return basePrice * copies;
    }
  }
  return basePrice;
};

const NewOrder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const createOrder = useCreateOrder();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Fetch user profile to auto-fill details
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Auto-fill details from profile when profile is loaded
  useEffect(() => {
    if (profile && Object.keys(details).length === 0) {
      setDetails({
        name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 10MB limit`,
          variant: 'destructive',
        });
        continue;
      }
      
      const preview = file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : '';
      
      newFiles.push({
        file,
        preview,
        type: file.type.startsWith('image/') ? 'photo' : 'document',
      });
    }
    
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFilesToStorage = async (orderId: string) => {
    if (uploadedFiles.length === 0) return;

    for (const uploadedFile of uploadedFiles) {
      const fileName = `${user?.id}/${orderId}/${Date.now()}-${uploadedFile.file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, uploadedFile.file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      await supabase.from('order_documents').insert({
        order_id: orderId,
        file_name: uploadedFile.file.name,
        file_url: publicUrl,
        document_type: uploadedFile.type,
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedService) return;

    try {
      setIsUploading(true);
      
      const totalAmount = calculateTotalPrice(selectedService, details);
      
      const order = await createOrder.mutateAsync({
        service_id: selectedService.id,
        details: Object.keys(details).length > 0 ? details : undefined,
        notes: notes || undefined,
        total_amount: totalAmount,
      });

      // Upload files after order is created
      if (uploadedFiles.length > 0 && order?.id) {
        await uploadFilesToStorage(order.id);
      }

      // Store order ID for payment step
      if (order?.id) {
        setCreatedOrderId(order.id);
        setStep(4); // Go to payment step
      }

      toast({
        title: 'Order placed successfully!',
        description: 'Please complete the payment.',
      });
    } catch (error) {
      toast({
        title: 'Failed to place order',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaymentComplete = () => {
    toast({
      title: 'Thank you for your payment!',
      description: 'Your order is being processed.',
    });
    navigate('/dashboard/orders');
  };


  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">Place New Order</h1>
            <p className="text-muted-foreground">Select a service and provide details</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                  step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div className={cn('w-16 h-1 mx-1', step > s ? 'bg-primary' : 'bg-muted')} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-6">
            {servicesLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              </div>
            ) : (
              Object.entries(groupedServices).map(([category, categoryServices]) => (
                <div key={category}>
                  <h3 className="text-lg font-display font-semibold mb-3">
                    {categoryLabels[category] || category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categoryServices.map((service) => {
                      const IconComponent = iconMap[service.icon || ''] || FileText;
                      const isSelected = selectedService?.id === service.id;
                        return (
                        <Card
                          key={service.id}
                          className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                          onClick={() => {
                            setSelectedService(service);
                            setStep(2);
                          }}
                        >
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-muted">
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{service.name}</p>
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                            </div>
                            <p className="font-semibold text-primary">₹{service.price}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            )}

          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && selectedService && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {(() => {
                      const IconComponent = iconMap[selectedService.icon || ''] || FileText;
                      return <IconComponent className="w-6 h-6 text-primary" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{selectedService.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary">₹{selectedService.price}</p>
                    {selectedService.price_per_copy && (
                      <p className="text-xs text-muted-foreground">per copy</p>
                    )}
                  </div>
                </div>

                {/* Personal Details Section - Read Only */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Personal Details</h4>
                    <p className="text-xs text-muted-foreground">Update from Profile settings</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        value={details.name || ''}
                        readOnly
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={details.email || ''}
                        readOnly
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={details.phone || ''}
                        readOnly
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={details.address || ''}
                        readOnly
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Service-Specific Fields */}
                {(() => {
                  const serviceFields = getServiceFields(selectedService);
                  if (serviceFields.length === 0) return null;
                  return (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Service Details - {categoryLabels[selectedService.category]?.replace(/^[^\s]+\s/, '')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {serviceFields.map((field) => (
                          <div key={field.id}>
                            <Label htmlFor={field.id}>
                              {field.label} {field.required && <span className="text-destructive">*</span>}
                            </Label>
                            <Input
                              id={field.id}
                              type={field.type || 'text'}
                              placeholder={field.placeholder}
                              value={details[field.id] || ''}
                              onChange={(e) => setDetails({ ...details, [field.id]: e.target.value })}
                            />
                          </div>
                        ))}
                      </div>
                      {selectedService.price_per_copy && details.copies && parseInt(details.copies, 10) > 0 && (
                        <div className="p-3 rounded-lg bg-primary/10 text-sm">
                          <span className="text-muted-foreground">Price calculation: </span>
                          <span className="font-medium">₹{selectedService.price} × {details.copies} copies = </span>
                          <span className="font-bold text-primary">₹{calculateTotalPrice(selectedService, details)}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* File Upload Section */}
                <div className="pt-4 border-t border-border space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Upload Documents
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Upload ID proofs, photos, or any required documents (max 10MB per file)
                  </p>
                  
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                      <p className="font-medium">Click to upload files</p>
                      <p className="text-sm text-muted-foreground">
                        Images, PDFs, or documents
                      </p>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          {file.preview ? (
                            <img
                              src={file.preview}
                              alt={file.file.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                              <File className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="pt-4 border-t border-border">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions or requirements"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={() => setStep(3)} className="gradient-primary">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedService && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Confirm Your Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border border-border">
                  <h4 className="font-semibold mb-2">Service</h4>
                  <p>{selectedService.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                </div>

                {Object.entries(details).length > 0 && (
                  <div className="p-4 rounded-lg border border-border">
                    <h4 className="font-semibold mb-2">Your Details</h4>
                    {Object.entries(details).map(([key, value]) => (
                      <p key={key} className="text-sm">
                        <span className="text-muted-foreground capitalize">{key}:</span> {value}
                      </p>
                    ))}
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="p-4 rounded-lg border border-border">
                    <h4 className="font-semibold mb-2">Attached Documents ({uploadedFiles.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded text-sm">
                          <File className="w-4 h-4" />
                          <span className="truncate max-w-[150px]">{file.file.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {notes && (
                  <div className="p-4 rounded-lg border border-border">
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-sm">{notes}</p>
                  </div>
                )}

                <div className="p-4 rounded-lg bg-primary/10">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">₹{calculateTotalPrice(selectedService, details)}</span>
                  </div>
                  {selectedService.price_per_copy && details.copies && parseInt(details.copies, 10) > 1 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ₹{selectedService.price} × {details.copies} copies
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="gradient-primary"
                disabled={createOrder.isPending || isUploading}
              >
                {(createOrder.isPending || isUploading) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                    {isUploading ? 'Uploading...' : 'Placing Order...'}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Place Order
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && selectedService && createdOrderId && (
          <div className="space-y-6">
            <UPIPayment
              amount={calculateTotalPrice(selectedService, details)}
              orderId={createdOrderId}
              serviceName={selectedService.name}
              onPaymentComplete={handlePaymentComplete}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NewOrder;
