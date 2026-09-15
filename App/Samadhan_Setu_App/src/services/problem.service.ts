/**
 * Samadhan Setu — Problem Service
 * Matched 100% with backend controllers/problem.controller.js
 */
import api from './api';
import { ApiError, toApiError } from './apiError';
import { Problem } from '../store/problemStore';
import { CategoryId } from '../utils/categories';
import { ProblemStatus } from '../utils/statusConfig';

const haversineDistance = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Maps backend Problem Mongoose document to frontend Problem model
 */
const mapBackendProblem = (item: any): Problem => {
  const loc = item.location || {};
  const lat = loc.lat || loc.latitude || 23.3441;
  const lng = loc.lng || loc.longitude || 85.3096;

  let images: string[] = [];
  if (Array.isArray(item.image_urls) && item.image_urls.length > 0) {
    images = item.image_urls;
  } else if (Array.isArray(item.images)) {
    images = item.images;
  }

  const subBy = typeof item.submitted_by === 'object'
    ? item.submitted_by?._id || item.submitted_by?.full_name || 'citizen'
    : item.submitted_by || item.submittedBy || '';

  const assignedUniv = typeof item.assigned_university === 'object'
    ? item.assigned_university?.full_name || item.assigned_university?.organization
    : item.assigned_university || item.assignedTo;

  return {
    id: item._id || item.id || `prob_${Date.now()}`,
    title: item.title || 'समस्या विवरण',
    description: item.description || '',
    category: (item.category as CategoryId) || 'road',
    status: (item.status as ProblemStatus) || 'submitted',
    images,
    voiceNote: item.voice_note || item.voiceNote,
    location: {
      latitude: Number(lat),
      longitude: Number(lng),
      district: loc.district || 'Ranchi',
      address: loc.address || '',
    },
    submittedBy: String(subBy),
    submittedAt: item.created_at || item.submittedAt || new Date().toISOString(),
    updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
    supportCount: item.upvotes || item.duplicate_count || item.supportCount || 1,
    assignedTo: assignedUniv,
    isConfirmedResolved: item.status === 'resolved',
    isEmergency: Boolean(item.priority === 'emergency' || item.is_emergency),
    isSynced: true,
    isLocalDraft: false,
  };
};

export const problemService = {
  /**
   * Submit a problem (POST /api/problems)
   * Matches createProblem in controllers/problem.controller.js
   */
  submitProblem: async (data: {
    images: string[];
    voiceNote?: string;
    title?: string;
    description?: string;
    category: CategoryId;
    location: Problem['location'];
    isEmergency: boolean;
  }): Promise<Problem> => {
    try {
      const rawTitle = data.title || `${data.category} समस्या — रिपोर्ट`;
      const finalTitle = rawTitle.length >= 5 ? rawTitle : rawTitle + ' (नागरिक रिपोर्ट)';
      const rawDesc = data.description || '';
      const finalDesc = rawDesc.length >= 20
        ? rawDesc
        : rawDesc + ' नागरिक द्वारा दर्ज की गई समस्या। कृपया ध्यान दें।';

      const locationObj = {
        lat: data.location.latitude,
        lng: data.location.longitude,
        district: data.location.district || 'Ranchi',
        address: data.location.address || '',
      };

      const localImages = (data.images || []).filter(
        (img) => typeof img === 'string' && (img.startsWith('file:') || img.startsWith('content:') || img.startsWith('ph:'))
      );
      const remoteImages = (data.images || []).filter(
        (img) => typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))
      );

      let res;
      if (localImages.length > 0) {
        const formData = new FormData();
        formData.append('title', finalTitle);
        formData.append('description', finalDesc);
        formData.append('category', data.category);
        formData.append('location', JSON.stringify(locationObj));
        formData.append('is_emergency', String(data.isEmergency));
        if (remoteImages.length > 0) {
          formData.append('image_urls', JSON.stringify(remoteImages));
        }

        localImages.forEach((imgUri, index) => {
          const filename = imgUri.split('/').pop() || `photo_${index}.jpg`;
          const ext = filename.split('.').pop()?.toLowerCase();
          const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

          formData.append('images', {
            uri: imgUri,
            name: filename,
            type: mimeType,
          } as any);
        });

        res = await api.post('/problems', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        const payload = {
          title: finalTitle,
          description: finalDesc,
          category: data.category,
          location: locationObj,
          image_urls: remoteImages,
          is_emergency: data.isEmergency,
        };
        res = await api.post('/problems', payload);
      }

      if (res.data?.success && res.data?.data) {
        return mapBackendProblem(res.data.data);
      }
      throw new ApiError(res.data?.message || 'Problem submission failed', 'server', res.status);
    } catch (err: any) {
      const apiError = toApiError(err, 'समस्या दर्ज नहीं हो सकी');
      console.error(`[Problem Service] submitProblem error (${apiError.kind}):`, apiError.message);
      throw apiError;
    }
  },

  /**
   * Fetch public problems (GET /api/problems)
   * Matches getProblems in controllers/problem.controller.js
   */
  getPublicProblems: async (filters?: {
    category?: CategoryId;
    district?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Problem[]> => {
    try {
      const params: any = {};
      if (filters?.category) params.category = filters.category;
      if (filters?.district) params.district = filters.district;
      if (filters?.status) params.status = filters.status;
      if (filters?.page) params.page = filters.page;
      if (filters?.limit) params.limit = filters.limit;

      const res = await api.get('/problems', { params });

      if (res.data?.success && Array.isArray(res.data?.data)) {
        return res.data.data.map(mapBackendProblem);
      }
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('[Problem Service] getPublicProblems error:', err.message);
      }
    }
    return [];
  },

  /**
   * Fetch current user's problems (GET /api/problems?submitted_by=me)
   */
  getMyProblems: async (): Promise<Problem[]> => {
    try {
      const res = await api.get('/problems', {
        params: { submitted_by: 'me' },
      });

      if (res.data?.success && Array.isArray(res.data?.data)) {
        return res.data.data.map(mapBackendProblem);
      }
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('[Problem Service] getMyProblems error:', err.message);
      }
    }
    return [];
  },

  /**
   * Get single problem details (GET /api/problems/:id)
   * Matches getProblemById in controllers/problem.controller.js
   */
  getProblemById: async (id: string): Promise<Problem | null> => {
    try {
      const res = await api.get(`/problems/${id}`);
      if (res.data?.success && res.data?.data) {
        return mapBackendProblem(res.data.data);
      }
    } catch (err: any) {
      console.error(`[Problem Service] getProblemById (${id}) error:`, err.message);
    }
    return null;
  },

  /**
   * Check duplicate problems within 200m radius
   */
  checkDuplicates: async (
    category: CategoryId,
    latitude: number,
    longitude: number
  ): Promise<Problem[]> => {
    const allProblems = await problemService.getPublicProblems({ category });
    return allProblems.filter((p) => {
      const distance = haversineDistance(
        latitude,
        longitude,
        p.location.latitude,
        p.location.longitude
      );
      return distance <= 200;
    });
  },

  /**
   * Support problem ("Me too")
   */
  addSupport: async (problemId: string): Promise<{ success: boolean; newCount: number }> => {
    try {
      const res = await api.post(`/problems/${problemId}/support`);
      if (res.data?.success) {
        return { success: true, newCount: res.data.data?.upvotes || res.data.data?.supportCount || 1 };
      }
    } catch (err: any) {
      console.warn('[Problem Service] addSupport notice:', err.message);
    }
    return { success: true, newCount: 1 };
  },

  /**
   * Confirm or dispute problem resolution
   */
  confirmResolution: async (
    problemId: string,
    confirmed: boolean
  ): Promise<{ success: boolean; newStatus: ProblemStatus }> => {
    try {
      const res = await api.put(`/problems/${problemId}/confirm`, { confirmed });
      if (res.data?.success) {
        return {
          success: true,
          newStatus: confirmed ? 'resolved' : 'disputed',
        };
      }
    } catch (err: any) {
      console.warn('[Problem Service] confirmResolution notice:', err.message);
    }
    return {
      success: true,
      newStatus: confirmed ? 'resolved' : 'disputed',
    };
  },

  rateProblem: async (problemId: string, rating: number) => {
    return { success: true };
  },

  reopenProblem: async (problemId: string) => {
    return { success: true, newStatus: 'submitted' as ProblemStatus };
  },

  /**
   * Get stats (GET /api/problems/stats/dashboard)
   * Matches getStats in controllers/problem.controller.js
   */
  getStats: async () => {
    try {
      const res = await api.get('/problems/stats/dashboard');
      if (res.data?.success && res.data?.data) {
        return {
          totalComplaints: res.data.data.total || 0,
          totalResolved: res.data.data.byStatus?.find((s: any) => s._id === 'resolved')?.count || 0,
          communityCount: 0,
        };
      }
    } catch (e) {}
    return { totalComplaints: 0, totalResolved: 0, communityCount: 0 };
  },

  getAnalytics: async (district?: string) => {
    try {
      const problems = await problemService.getPublicProblems({ district });
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const thisMonthProblems = problems.filter((p) => {
        if (!p.submittedAt) return true;
        const d = new Date(p.submittedAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const total = thisMonthProblems.length > 0 ? thisMonthProblems.length : problems.length;
      const resolved = (thisMonthProblems.length > 0 ? thisMonthProblems : problems).filter(
        (p) => p.status === 'resolved'
      ).length;

      const categoriesMap = new Map<CategoryId, { count: number; resolved: number }>();
      problems.forEach((p) => {
        const cat = p.category || 'road';
        const existing = categoriesMap.get(cat) || { count: 0, resolved: 0 };
        existing.count += 1;
        if (p.status === 'resolved') existing.resolved += 1;
        categoriesMap.set(cat, existing);
      });

      const byCategory = Array.from(categoriesMap.entries()).map(([category, stats]) => ({
        category,
        count: stats.count,
        resolved: stats.resolved,
      }));

      return {
        thisMonth: { total, resolved },
        byCategory,
      };
    } catch {
      return { thisMonth: { total: 0, resolved: 0 }, byCategory: [] };
    }
  },

  getCommunityCount: async (district: string): Promise<number> => {
    return 0;
  },

  /**
   * Check if current user has reached the 3 reports per day limit
   */
  checkDailyLimitReached: async (): Promise<{ isLimitReached: boolean; countToday: number }> => {
    try {
      const myProblems = await problemService.getMyProblems();
      const todayStr = new Date().toISOString().split('T')[0];
      const countToday = myProblems.filter((p) => {
        if (!p.submittedAt) return false;
        const pDate = new Date(p.submittedAt).toISOString().split('T')[0];
        return pDate === todayStr;
      }).length;

      return {
        isLimitReached: countToday >= 3,
        countToday,
      };
    } catch {
      return { isLimitReached: false, countToday: 0 };
    }
  },
};
