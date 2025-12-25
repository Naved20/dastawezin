import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Copy, ExternalLink, Loader2, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UPIPaymentProps {
  amount: number;
  orderId: string;
  serviceName: string;
  onPaymentComplete: () => void;
}

const UPI_ID = '8878502349@ybl';
const MERCHANT_NAME = 'Dastawez';

export const UPIPayment = ({ amount, orderId, serviceName, onPaymentComplete }: UPIPaymentProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate UPI payment link
  const generateUPILink = () => {
    const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&tn=${encodeURIComponent(`Order: ${serviceName} - ${orderId.slice(0, 8)}`)}&cu=INR`;
    return upiUrl;
  };

  // Generate QR code URL using a free API
  const generateQRCodeURL = () => {
    const upiString = `upi://pay?pa=${UPI_ID}&pn=${MERCHANT_NAME}&am=${amount}&tn=Order: ${serviceName}&cu=INR`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
  };

  const copyUPIId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      toast({
        title: 'UPI ID copied!',
        description: 'You can now paste it in your UPI app.',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy manually.',
        variant: 'destructive',
      });
    }
  };

  const openUPIApp = () => {
    const upiLink = generateUPILink();
    window.location.href = upiLink;
  };

  const handlePaymentDone = () => {
    setIsProcessing(true);
    // Simulate payment verification delay
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: 'Payment marked as done',
        description: 'We will verify your payment and update the order status.',
      });
      onPaymentComplete();
    }, 1500);
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="text-center pb-2">
        <CardTitle className="font-display flex items-center justify-center gap-2">
          <Smartphone className="w-6 h-6 text-primary" />
          Pay with UPI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Display */}
        <div className="text-center p-4 rounded-lg bg-primary/10">
          <p className="text-sm text-muted-foreground">Amount to Pay</p>
          <p className="text-3xl font-bold text-primary">₹{amount}</p>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-white rounded-xl shadow-lg">
            <img 
              src={generateQRCodeURL()} 
              alt="UPI QR Code" 
              className="w-48 h-48"
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Scan this QR code with any UPI app
          </p>
        </div>

        {/* UPI ID */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">Or pay to UPI ID:</p>
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted">
            <code className="text-lg font-mono font-semibold">{UPI_ID}</code>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyUPIId}
              className="h-8 w-8"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Open UPI App Button (mobile) */}
        <Button
          onClick={openUPIApp}
          variant="outline"
          className="w-full"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open UPI App
        </Button>

        {/* Payment Done Button */}
        <div className="space-y-3 pt-4 border-t border-border">
          <Button
            onClick={handlePaymentDone}
            className="w-full gradient-primary"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                I have completed the payment
          </>
            )}
          </Button>
        </div>

        {/* Payment Apps */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Supported: Google Pay, PhonePe, Paytm, BHIM & other UPI apps
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UPIPayment;