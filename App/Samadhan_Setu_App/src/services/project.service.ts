/**
 * Samadhan Setu — Project Service
 * Matched 100% with backend controllers/project.controller.js
 */
import api from './api';

export interface ProjectProposal {
  id: string;
  problemId: string;
  proposalText?: string;
  universityName: string;
  budget: number;
  milestones?: any[];
  status: 'proposed' | 'under_review' | 'active' | 'completed';
  createdAt: string;
}

export const projectService = {
  /**
   * GET /api/projects
   * Matches getProjects in controllers/project.controller.js
   */
  getProjects: async (status?: string, universityId?: string): Promise<ProjectProposal[]> => {
    try {
      const params: any = {};
      if (status) params.status = status;
      if (universityId) params.university_id = universityId;

      const res = await api.get('/projects', { params });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        return res.data.data.map((item: any) => ({
          id: item._id || item.id,
          problemId: item.problem_id?._id || item.problem_id || item.problemId,
          proposalText: item.proposal_text,
          universityName: item.university_id?.organization || item.university_id?.full_name || 'University Partner',
          budget: item.budget || 0,
          milestones: item.milestones || [],
          status: item.status || 'proposed',
          createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        }));
      }
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('[Project Service] getProjects error:', err.message);
      }
    }
    return [];
  },

  /**
   * GET /api/projects/:id
   * Matches getProjectById in controllers/project.controller.js
   */
  getProjectById: async (id: string): Promise<ProjectProposal | null> => {
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data?.success && res.data?.data) {
        const item = res.data.data;
        return {
          id: item._id || item.id,
          problemId: item.problem_id?._id || item.problem_id,
          proposalText: item.proposal_text,
          universityName: item.university_id?.organization || item.university_id?.full_name || 'University Partner',
          budget: item.budget || 0,
          milestones: item.milestones || [],
          status: item.status || 'proposed',
          createdAt: item.created_at || new Date().toISOString(),
        };
      }
    } catch (err: any) {
      console.error(`[Project Service] getProjectById (${id}) error:`, err.message);
    }
    return null;
  },

  /**
   * POST /api/projects/:id/proposal
   * Matches submitProposal in controllers/project.controller.js
   */
  submitProposal: async (
    projectId: string,
    proposal: { proposalText: string; budget: number; milestones?: any[] }
  ) => {
    try {
      const payload = {
        proposal_text: proposal.proposalText,
        budget: proposal.budget,
        milestones: proposal.milestones || [],
      };
      const res = await api.post(`/projects/${projectId}/proposal`, payload);
      if (res.data?.success) {
        return { success: true, data: res.data.data };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message;
      console.error('[Project Service] submitProposal error:', errMsg);
      throw new Error(errMsg);
    }
    return { success: false };
  },

  /**
   * PUT /api/projects/:id/fund
   * Matches fundProject in controllers/project.controller.js
   */
  fundProject: async (projectId: string, amount: number) => {
    try {
      const res = await api.put(`/projects/${projectId}/fund`, { amount });
      if (res.data?.success) {
        return { success: true, data: res.data.data };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message;
      console.error('[Project Service] fundProject error:', errMsg);
      throw new Error(errMsg);
    }
    return { success: false };
  },
};
