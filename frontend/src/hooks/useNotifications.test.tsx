import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useNotifications } from './useNotifications';
import { NotificationProvider } from '../contexts/NotificationContext';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
  default: vi.fn(),
}));

describe('useNotifications', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <NotificationProvider>{children}</NotificationProvider>
  );

  it('provides notification functions', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    
    expect(result.current.addNotification).toBeDefined();
    expect(result.current.markAsRead).toBeDefined();
    expect(result.current.markAllAsRead).toBeDefined();
    expect(result.current.removeNotification).toBeDefined();
    expect(result.current.clearAll).toBeDefined();
    expect(result.current.notifications).toBeDefined();
    expect(result.current.unreadCount).toBeDefined();
  });

  it('starts with empty notifications', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('adds notifications correctly', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    
    act(() => {
      result.current.addNotification({
        type: 'success',
        title: 'Test notification',
        message: 'This is a test',
      });
    });
    
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject({
      type: 'success',
      title: 'Test notification',
      message: 'This is a test',
      read: false,
    });
    expect(result.current.unreadCount).toBe(1);
  });

  it('marks notifications as read', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    
    act(() => {
      result.current.addNotification({
        type: 'info',
        title: 'Test notification',
        message: 'Test message'
      });
    });
    
    const notificationId = result.current.notifications[0].id;
    
    act(() => {
      result.current.markAsRead(notificationId);
    });
    
    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('marks all notifications as read', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    
    // Add multiple notifications
    act(() => {
      result.current.addNotification({
        type: 'info',
        title: 'Test 1',
        message: 'Message 1'
      });
      result.current.addNotification({
        type: 'success',
        title: 'Test 2',
        message: 'Message 2'
      });
    });
    
    expect(result.current.unreadCount).toBe(2);
    
    act(() => {
      result.current.markAllAsRead();
    });
    
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every(n => n.read)).toBe(true);
  });

  it('removes notifications', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    
    act(() => {
      result.current.addNotification({
        type: 'info',
        title: 'Test notification',
        message: 'Test message'
      });
    });
    
    const notificationId = result.current.notifications[0].id;
    expect(result.current.notifications).toHaveLength(1);
    
    act(() => {
      result.current.removeNotification(notificationId);
    });
    
    expect(result.current.notifications).toHaveLength(0);
  });

  it('clears all notifications', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    
    // Add multiple notifications
    act(() => {
      result.current.addNotification({
        type: 'info',
        title: 'Test 1',
        message: 'Message 1'
      });
      result.current.addNotification({
        type: 'success',
        title: 'Test 2',
        message: 'Message 2'
      });
    });
    
    expect(result.current.notifications).toHaveLength(2);
    
    act(() => {
      result.current.clearAll();
    });
    
    expect(result.current.notifications).toHaveLength(0);
  });
});
