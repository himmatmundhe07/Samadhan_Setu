/**
 * Samadhan Setu — Auth Service
 * Matched 100% with backend src/controllers/auth.controller.js
 */
import api, { setAuthToken } from './api';
import { User } from '../store/authStore';

/**
 * Maps backend user response object to frontend User interface
 */
const mapBackendUser = (bUser: any, phoneFallback?: string): User => {
  return {
    id: String(bUser.id || bUser._id || ''),
    full_name: bUser.full_name || 'Citizen User',
    phone: bUser.phone || phoneFallback || '',
    email: bUser.email || '',
    district: bUser.district || 'Ranchi',
    pincode: bUser.pincode || '834001',
    village_or_city: bUser.village_or_city || '',
    role: bUser.role || 'citizen',
    createdAt: bUser.created_at || bUser.createdAt || new Date().toISOString(),
  };
};

/**
 * Generates a secure random password when none is provided
 */
const generateSecurePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const authService = {
  /**
   * Register User (POST /api/auth/register)
   * Matches src/controllers/auth.controller.js register()
   */
  register: async (data: {
    full_name: string;
    phone: string;
    email?: string;
    password?: string;
    district?: string;
    pincode?: string;
    village_or_city?: string;
  }): Promise<{ success: boolean; user: User; token: string }> => {
    try {
      const cleanPhone = data.phone.replace(/[^0-9]/g, '');
      const userEmail = data.email && data.email.includes('@')
        ? data.email
        : `${cleanPhone}@samadhansetu.in`;

      const userPassword = data.password && data.password.trim().length >= 6
        ? data.password.trim()
        : generateSecurePassword();

      const payload = {
        full_name: data.full_name,
        email: userEmail,
        password: userPassword,
        role: 'citizen',
        phone: cleanPhone,
        district: data.district || 'Ranchi',
        pincode: data.pincode || '834001',
        village_or_city: data.village_or_city || data.district || 'Ranchi',
      };

      const res = await api.post('/auth/register', payload);

      if (res.data?.success && res.data?.token) {
        setAuthToken(res.data.token);
        const user = mapBackendUser(res.data.user, cleanPhone);
        return { success: true, user, token: res.data.token };
      }
      throw new Error(res.data?.message || 'रजिस्ट्रेशन में विफलता हुई');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'रजिस्ट्रेशन विफल रहा';
      console.error('[Auth Service] register error:', errMsg);
      throw new Error(errMsg);
    }
  },

  /**
   * Login User (POST /api/auth/login)
   * Matches src/controllers/auth.controller.js login()
   */
  loginWithPassword: async (
    identifier: string, // email or 10-digit phone
    password: string
  ): Promise<{ success: boolean; user: User; token: string }> => {
    try {
      const cleanIdentifier = identifier.trim();
      const emailPayload = cleanIdentifier.includes('@')
        ? cleanIdentifier
        : `${cleanIdentifier.replace(/[^0-9]/g, '')}@samadhansetu.in`;

      // Debug: log what we're sending so we can diagnose mismatches
      console.log('[Auth] loginWithPassword → sending email:', emailPayload);

      const res = await api.post('/auth/login', {
        email: emailPayload,
        password: password,
      });

      if (res.data?.success && res.data?.token) {
        setAuthToken(res.data.token);
        const user = mapBackendUser(res.data.user, cleanIdentifier);
        return { success: true, user, token: res.data.token };
      }
      throw new Error(res.data?.message || 'गलत ईमेल या पासवर्ड');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'गलत ईमेल/पासवर्ड या खाता मौजूद नहीं है';
      console.error('[Auth Service] login error:', errMsg);
      // If account not found on this backend, suggest registering
      const finalMsg = (errMsg.toLowerCase().includes('invalid') || errMsg.toLowerCase().includes('not found'))
        ? `${errMsg}\n\nNote: यदि आप पहली बार local backend use कर रहे हैं तो पहले Register करें।`
        : errMsg;
      throw new Error(finalMsg);
    }
  },

  /**
   * Phone OTP sending
   */
  sendOTP: async (phone: string): Promise<{ success: boolean; message: string }> => {
    console.warn(`[Auth][DEV_MOCK] sendOTP is running in development mock mode for phone: ${phone}. No real SMS sent.`);
    return { success: true, message: 'OTP भेज दिया गया' };
  },

  /**
   * Verify OTP and Login / Register
   */
  verifyOTP: async (
    phone: string,
    otp: string,
    registrationData?: {
      full_name: string;
      phone: string;
      email?: string;
      password?: string;
      district?: string;
      pincode?: string;
      village_or_city?: string;
    }
  ): Promise<{ success: boolean; user: User; token: string }> => {
    if (otp !== '123456') {
      throw new Error('गलत OTP — फिर से कोशिश करो');
    }
    if (registrationData) {
      return authService.register(registrationData);
    }
    // General login must use explicit user credentials via loginWithPassword,
    // or call backend OTP login if supported without bypassing password checks.
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp });
      if (res.data?.success && res.data?.token) {
        setAuthToken(res.data.token);
        const user = mapBackendUser(res.data.user, phone);
        return { success: true, user, token: res.data.token };
      }
    } catch {
      // Backend does not support passwordless OTP login endpoint
    }
    throw new Error('ओटीपी सत्यापन केवल पंजीकरण के लिए उपलब्ध है। कृपया पासवर्ड के साथ लॉगिन करें।');
  },

  /**
   * Fetch current user profile (GET /api/auth/me)
   * Matches src/controllers/auth.controller.js getMe()
   */
  getMe: async (): Promise<User | null> => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.user) {
        return mapBackendUser(res.data.user);
      }
    } catch (err: any) {
      console.error('[Auth Service] getMe error:', err.message);
    }
    return null;
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    setAuthToken(null);
  },

  checkPhoneExists: async (): Promise<boolean> => {
    return false;
  },
};
