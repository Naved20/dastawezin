import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'reset-password';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string; confirmPassword?: string }>({});
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If you use an external deployment (e.g. Vercel), put it here so OAuth can redirect back safely.
  const preferredPublicOrigin = (() => {
    const hardcoded = 'https://dastawez-by.vercel.app';
    try {
      if (window.location.host.endsWith('vercel.app')) return window.location.origin;
    } catch {
      // ignore
    }
    return hardcoded;
  })();

  // Check for password recovery event
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset-password');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && mode !== 'reset-password') {
      navigate('/dashboard');
    }
  }, [user, navigate, mode]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; fullName?: string; confirmPassword?: string } = {};
    
    if (mode !== 'reset-password') {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
    }
    
    if (mode === 'signin' || mode === 'signup' || mode === 'reset-password') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }

    if (mode === 'reset-password') {
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (mode === 'signup' && !fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async () => {
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Check your email',
          description: 'We sent you a password reset link. Please check your inbox.',
        });
        setMode('signin');
      }
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password updated',
          description: 'Your password has been reset successfully.',
        });
        navigate('/dashboard');
      }
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // In the editor preview, the app can run on an "id-preview" domain.
      // Redirecting OAuth back there can trigger the auth-bridge flow.
      // So we redirect OAuth back to the stable preview domain when detected.
      const redirectTo = (() => {
        const { host, origin } = window.location;

        // When running inside Lovable preview domains, redirecting OAuth back there can trigger auth-bridge.
        // Instead, redirect back to your external deployed site (preferredPublicOrigin).
        const isLovablePreviewDomain =
          /(^id-preview--[0-9a-f-]{36}\.lovable\.app$)/i.test(host) ||
          /lovableproject\.com$/i.test(host) ||
          /lovable\.app$/i.test(host);

        const base = isLovablePreviewDomain ? preferredPublicOrigin : origin;
        return `${base}/auth`;
      })();

      // Debug (safe): helps verify which redirect URL is actually used.
      console.info('[auth] google oauth redirectTo:', redirectTo);

      // IMPORTANT: In embedded previews, redirecting the iframe can cause the platform to intervene.
      // We request the provider URL without auto-redirect, then redirect the top window ourselves.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        toast({
          title: 'Google sign-in failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (!data?.url) {
        toast({
          title: 'Google sign-in failed',
          description: 'Could not start the Google sign-in flow. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // If we're inside an embedded preview (iframe), open OAuth in a new tab.
      // This avoids the platform auth-bridge flow that can show: "Invalid token: signing method ES256 is invalid".
      const isEmbedded = (() => {
        try {
          return window.self !== window.top;
        } catch {
          return true;
        }
      })();

      if (isEmbedded) {
        const opened = window.open(data.url, '_blank', 'noopener,noreferrer');
        toast({
          title: opened ? 'Continue in new tab' : 'Opening Google sign-in',
          description: opened
            ? 'Finish Google sign-in in the new tab, then come back here.'
            : 'If your browser blocked the popup, please allow popups and try again.',
        });
        return;
      }

      window.location.assign(data.url);
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'forgot-password') {
      handleForgotPassword();
      return;
    }

    if (mode === 'reset-password') {
      handleResetPassword();
      return;
    }

    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Please sign in instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Account created!',
            description: 'Welcome to Dastawez! Redirecting to dashboard...',
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Invalid credentials',
              description: 'Please check your email and password.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign in failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Welcome back!',
            description: 'Redirecting to dashboard...',
          });
        }
      }
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create an account';
      case 'forgot-password': return 'Forgot password';
      case 'reset-password': return 'Reset password';
      default: return 'Welcome back';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signup': return 'Enter your details to create your account';
      case 'forgot-password': return 'Enter your email to receive a reset link';
      case 'reset-password': return 'Enter your new password';
      default: return 'Enter your credentials to access your account';
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={logo} alt="Dastawez Logo" className="w-12 h-12 rounded-xl object-contain" />
            <span className="text-3xl font-display font-bold text-white">Dastawez</span>
          </div>
          <p className="text-white/80">Your trusted partner for document services</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            {(mode === 'forgot-password' || mode === 'reset-password') && (
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </button>
            )}
            <CardTitle className="text-2xl font-display">
              {getTitle()}
            </CardTitle>
            <CardDescription>
              {getDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                    className={errors.fullName ? 'border-destructive' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>
              )}
              
              {mode !== 'reset-password' && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              )}
              
              {(mode === 'signin' || mode === 'signup' || mode === 'reset-password') && (
                <div className="space-y-2">
                  <Label htmlFor="password">{mode === 'reset-password' ? 'New Password' : 'Password'}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={mode === 'reset-password' ? 'Enter new password' : 'Enter your password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
              )}

              {mode === 'reset-password' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {mode === 'signin' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot-password');
                      setErrors({});
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'signup' ? 'Creating account...' : 
                     mode === 'forgot-password' ? 'Sending reset link...' :
                     mode === 'reset-password' ? 'Resetting password...' :
                     'Signing in...'}
                  </>
                ) : (
                  mode === 'signup' ? 'Create account' : 
                  mode === 'forgot-password' ? 'Send reset link' :
                  mode === 'reset-password' ? 'Reset password' :
                  'Sign in'
                )}
              </Button>
            </form>

            {(mode === 'signin' || mode === 'signup') && (
              <>

                {/* <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button> */}
              </>
            )}

            {(mode === 'signin' || mode === 'signup') && (
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                  {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                </span>{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'signup' ? 'signin' : 'signup');
                    setErrors({});
                  }}
                  className="text-primary hover:underline font-medium"
                  disabled={isLoading}
                >
                  {mode === 'signup' ? 'Sign in' : 'Sign up'}
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-white/60 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;