import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'info';
  read: boolean;
  created_at: string;
  order_id?: string;
}

// Create notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for a pleasant notification sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Pleasant notification tone
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    oscillator.type = 'sine';
    
    // Fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Could not play notification sound:', error);
  }
};

const STORAGE_KEY = 'app_notifications';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

// Load notifications from localStorage
const loadNotifications = (userId: string | undefined): Notification[] => {
  if (!userId) return [];
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.log('Could not load notifications:', error);
  }
  return [];
};

// Save notifications to localStorage
const saveNotifications = (userId: string | undefined, notifications: Notification[]) => {
  if (!userId) return;
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(notifications));
  } catch (error) {
    console.log('Could not save notifications:', error);
  }
};

// Clean old READ notifications (older than 24 hours and already read)
const cleanOldNotifications = (notifications: Notification[]): Notification[] => {
  const now = new Date().getTime();
  return notifications.filter(notification => {
    // Never delete unread notifications
    if (!notification.read) return true;
    
    // Keep read notifications for 24 hours
    const createdAt = new Date(notification.created_at).getTime();
    return now - createdAt < TWENTY_FOUR_HOURS;
  });
};

export const useNotifications = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const stored = loadNotifications(user.id);
      const cleaned = cleanOldNotifications(stored);
      setNotifications(cleaned);
      setUnreadCount(cleaned.filter(n => !n.read).length);
      // Save cleaned notifications back
      if (cleaned.length !== stored.length) {
        saveNotifications(user.id, cleaned);
      }
    }
  }, [user?.id]);

  // Save notifications whenever they change
  useEffect(() => {
    if (user?.id && notifications.length > 0) {
      saveNotifications(user.id, notifications);
    }
  }, [notifications, user?.id]);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      });
    }
  }, []);

  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Play notification sound
    playNotificationSound();
    
    // Show browser notification
    showBrowserNotification(notification.title, notification.message);
    
    // Show toast
    toast({
      title: notification.title,
      description: notification.message,
    });
  }, [toast, showBrowserNotification]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear only READ notifications
  const clearAll = useCallback(() => {
    setNotifications(prev => prev.filter(n => !n.read));
    // unreadCount stays the same since we only remove read ones
  }, []);

  // Listen for new orders (for admin)
  useEffect(() => {
    if (!isAdmin || !user) return;

    console.log('Setting up admin new orders channel');
    
    const channel = supabase
      .channel('admin-new-orders-' + user.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          console.log('New order received:', payload);
          
          // Fetch service name
          const { data: service } = await supabase
            .from('services')
            .select('name')
            .eq('id', payload.new.service_id)
            .maybeSingle();

          // Fetch user info
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', payload.new.user_id)
            .maybeSingle();

          addNotification({
            title: '🆕 New Order Received!',
            message: `${profile?.full_name || profile?.email || 'A customer'} ordered ${service?.name || 'a service'}`,
            type: 'order',
            order_id: payload.new.id,
          });

          // Refresh orders list
          queryClient.invalidateQueries({ queryKey: ['all-orders'] });
        }
      )
      .subscribe((status) => {
        console.log('Admin new orders channel status:', status);
      });

    return () => {
      console.log('Removing admin new orders channel');
      supabase.removeChannel(channel);
    };
  }, [isAdmin, user, queryClient, addNotification]);

  // Listen for order status updates from admin (for users)
  useEffect(() => {
    if (!user || isAdmin) return;

    console.log('Setting up user order updates channel');
    
    const channel = supabase
      .channel('user-order-updates-' + user.id)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('Order update received for user:', payload);
          
          if (payload.old.status !== payload.new.status) {
            const { data: service } = await supabase
              .from('services')
              .select('name')
              .eq('id', payload.new.service_id)
              .maybeSingle();

            const statusLabels: Record<string, string> = {
              pending: 'Pending',
              in_progress: 'In Progress',
              ready: 'Ready for Pickup',
              delivered: 'Delivered',
              cancelled: 'Cancelled',
            };

            addNotification({
              title: '📦 Order Status Updated',
              message: `Your order "${service?.name}" is now ${statusLabels[payload.new.status] || payload.new.status}`,
              type: 'order',
              order_id: payload.new.id,
            });

            // Refresh user orders
            queryClient.invalidateQueries({ queryKey: ['user-orders'] });
          }
        }
      )
      .subscribe((status) => {
        console.log('User order updates channel status:', status);
      });

    return () => {
      console.log('Removing user order updates channel');
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, queryClient, addNotification]);

  // Listen for all order updates (for admin) - status changes
  useEffect(() => {
    if (!isAdmin || !user) return;

    console.log('Setting up admin order updates channel');
    
    const channel = supabase
      .channel('admin-order-status-' + user.id)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          console.log('Admin order update received:', payload);
          
          // Only notify if status changed
          if (payload.old.status !== payload.new.status) {
            const { data: service } = await supabase
              .from('services')
              .select('name')
              .eq('id', payload.new.service_id)
              .maybeSingle();

            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', payload.new.user_id)
              .maybeSingle();

            const statusLabels: Record<string, string> = {
              pending: 'Pending',
              in_progress: 'In Progress',
              ready: 'Ready',
              delivered: 'Delivered',
              cancelled: 'Cancelled',
            };

            addNotification({
              title: '📋 Order Status Changed',
              message: `Order by ${profile?.full_name || profile?.email || 'customer'} (${service?.name}) → ${statusLabels[payload.new.status] || payload.new.status}`,
              type: 'order',
              order_id: payload.new.id,
            });

            queryClient.invalidateQueries({ queryKey: ['all-orders'] });
          }
        }
      )
      .subscribe((status) => {
        console.log('Admin order status channel status:', status);
      });

    return () => {
      console.log('Removing admin order status channel');
      supabase.removeChannel(channel);
    };
  }, [isAdmin, user, queryClient, addNotification]);

  // Listen for new documents added to orders (for admin)
  useEffect(() => {
    if (!user || !isAdmin) return;

    console.log('Setting up admin document uploads channel');
    
    const channel = supabase
      .channel('admin-document-uploads-' + user.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_documents',
        },
        async (payload) => {
          console.log('New document uploaded:', payload);
          
          addNotification({
            title: '📄 New Document Uploaded',
            message: `A customer uploaded a new document: ${payload.new.file_name}`,
            type: 'order',
            order_id: payload.new.order_id,
          });
          
          queryClient.invalidateQueries({ queryKey: ['all-orders'] });
        }
      )
      .subscribe((status) => {
        console.log('Admin document uploads channel status:', status);
      });

    return () => {
      console.log('Removing admin document uploads channel');
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, addNotification, queryClient]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestPermission,
  };
};
