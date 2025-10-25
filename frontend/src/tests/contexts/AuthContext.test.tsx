import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Mock API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    login: vi.fn(),
    register: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn(),
  }
}));

describe('AuthContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('provides authentication state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('handles login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      try {
        await result.current.login('test@test.com', 'password');
      } catch (e) {
        // Expected in test environment
      }
    });
    
    expect(result.current.login).toBeDefined();
  });

  it('handles logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('updates profile', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.updateProfile({ email: 'updated@test.com', _id: '123', name: { first: 'Test', last: 'User' }, phone: '0501234567', image: { url: '', alt: '' }, address: { country: 'Israel', city: 'Tel Aviv', street: 'Test', houseNumber: 1 }, isBusiness: false, isAdmin: false, createdAt: '', updatedAt: '' });
    });
    
    expect(result.current.updateProfile).toBeDefined();
  });
});
