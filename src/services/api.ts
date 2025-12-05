
import { Poll, UserProfile, PollComment, ConsciousnessLayer, PollStatus, AppNotification, Candidate } from '../../types';

const API_URL = import.meta.env.MODE === "production" ? import.meta.env.VITE_APP_API_URL : "http://localhost:5000/api";

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// Helper to map MongoDB _id to frontend id
const mapId = (item: any) => {
  if (!item) return item;
  const { _id, ...rest } = item;
  return { id: _id, ...rest };
};

export const api = {
  // --- AUTH ---
  login: async (email: string, password: string): Promise<UserProfile> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Login failed');
    }
    const data = await res.json();
    return mapId(data);
  },

  signup: async (username: string, email: string, password: string): Promise<UserProfile> => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
      credentials: 'include',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Signup failed');
    }
    const data = await res.json();
    return mapId(data);
  },

  getProfile: async (): Promise<UserProfile> => {
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    const data = await res.json();
    return mapId(data);
  },

  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to update profile');
    const data = await res.json();
    return mapId(data);
  },

  logout: async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  searchUsers: async (query: string): Promise<{ id: string, username: string, avatarUrl: string }[]> => {
    const res = await fetch(`${API_URL}/auth/search?search=${query}`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(mapId);
  },

  // --- POLLS ---
  getPolls: async (): Promise<Poll[]> => {
    const res = await fetch(`${API_URL}/polls`, { headers: getHeaders(), credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch polls');
    const data = await res.json();
    console.log('DEBUG: api.getPolls raw data:', data);
    return data.map((poll: any) => ({
      ...mapId(poll),
      options: poll.options?.map(mapId) || [],
      comments: poll.comments?.map(mapId) || [],
      consciousnessEntries: poll.consciousnessEntries?.map(mapId) || []
    }));
  },

  // Admin: Get Pending
  getPendingPolls: async (): Promise<Poll[]> => {
    const res = await fetch(`${API_URL}/polls/pending`, { headers: getHeaders(), credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch pending polls');
    const data = await res.json();
    return data.map((poll: any) => ({
      ...mapId(poll),
      options: poll.options?.map(mapId) || [],
      comments: [],
      consciousnessEntries: poll.consciousnessEntries?.map(mapId) || []
    }));
  },

  getTrendingTopics: async (): Promise<{ tag: string, count: number }[]> => {
    const res = await fetch(`${API_URL}/polls/trending`, { headers: getHeaders(), credentials: 'include' });
    if (!res.ok) return [];
    return res.json();
  },

  getMyPolls: async (): Promise<Poll[]> => {
    const res = await fetch(`${API_URL}/polls/me`, { headers: getHeaders(), credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch my polls');
    const data = await res.json();
    return data.map((poll: any) => ({
      ...mapId(poll),
      options: poll.options?.map(mapId) || [],
      comments: poll.comments?.map(mapId) || [],
      consciousnessEntries: poll.consciousnessEntries?.map(mapId) || []
    }));
  },

  updatePoll: async (id: string, data: { question?: string; options?: string[] }) => {
    const res = await fetch(`${API_URL}/polls/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to update poll');
    return mapId(await res.json());
  },

  deletePoll: async (id: string) => {
    const res = await fetch(`${API_URL}/polls/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete poll');
    return res.json();
  },

  toggleSavePoll: async (id: string) => {
    const res = await fetch(`${API_URL}/auth/save/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to toggle save poll');
    return res.json();
  },

  // Admin: Update Status
  updatePollStatus: async (pollId: string, status: PollStatus): Promise<Poll> => {
    const res = await fetch(`${API_URL}/polls/${pollId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to update status');
    const data = await res.json();
    return mapId(data);
  },

  createPoll: async (pollData: Partial<Poll>): Promise<Poll> => {
    const res = await fetch(`${API_URL}/polls`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(pollData),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to create poll');
    const data = await res.json();
    return mapId(data);
  },

  vote: async (pollId: string, optionId: string): Promise<Poll> => {
    const res = await fetch(`${API_URL}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ optionId }),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Vote failed');
    const data = await res.json();
    return mapId(data);
  },

  addConsciousnessEntry: async (pollId: string, entry: { text: string; intensity: number; layer: ConsciousnessLayer; emoji: string }): Promise<Poll> => {
    const res = await fetch(`${API_URL}/polls/${pollId}/consciousness`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(entry),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to add entry');
    const data = await res.json();
    return mapId(data);
  },

  // --- COMMENTS ---
  getComments: async (pollId: string): Promise<PollComment[]> => {
    const res = await fetch(`${API_URL}/polls/${pollId}/comments`, { headers: getHeaders(), credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(mapId);
  },

  addComment: async (pollId: string, text: string, parentId?: string): Promise<PollComment> => {
    const res = await fetch(`${API_URL}/polls/${pollId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text, parentId }),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to comment');
    const data = await res.json();
    return mapId(data);
  },

  // --- NOTIFICATIONS ---
  getNotifications: async (): Promise<AppNotification[]> => {
    const res = await fetch(`${API_URL}/notifications`, { headers: getHeaders(), credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const data = await res.json();
    return data.map(mapId);
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include'
    });
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include'
    });
  },

  // --- ELECTION MODULE ---
  applyForCandidacy: async (application: Partial<Candidate>): Promise<Candidate> => {
    const res = await fetch(`${API_URL}/election/apply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(application),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Application failed');
    const data = await res.json();
    return mapId(data);
  },

  getMyCandidacy: async (): Promise<Candidate | null> => {
    const res = await fetch(`${API_URL}/election/me`, { headers: getHeaders(), credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data) return null;
    return mapId(data);
  },

  getCandidates: async (): Promise<Candidate[]> => {
    const res = await fetch(`${API_URL}/election/candidates`, { headers: getHeaders(), credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch candidates');
    const data = await res.json();
    return data.map(mapId);
  },

  // Admin: Get All Candidates (including pending)
  getAllCandidates: async (): Promise<Candidate[]> => {
    const res = await fetch(`${API_URL}/election/all`, { headers: getHeaders(), credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch all candidates');
    const data = await res.json();
    return data.map(mapId);
  },

  // Admin: Update Candidate Status
  updateCandidateStatus: async (id: string, status: 'approved' | 'rejected'): Promise<Candidate> => {
    const res = await fetch(`${API_URL}/election/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to update candidate status');
    const data = await res.json();
    return mapId(data);
  },

  // Module 3: Election Management
  createElection: async (electionData: any): Promise<any> => {
    const res = await fetch(`${API_URL}/election/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(electionData),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to create election');
    const data = await res.json();
    return mapId(data);
  },

  getElections: async (): Promise<any[]> => {
    const res = await fetch(`${API_URL}/election/list`, { headers: getHeaders(), credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch elections');
    const data = await res.json();
    return data.map(mapId);
  },

  updateElectionStatus: async (id: string, status: string): Promise<any> => {
    const res = await fetch(`${API_URL}/election/election/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to update election status');
    const data = await res.json();
    return mapId(data);
  },

  // Module 2: Campaign Setup
  joinElection: async (data: { electionId: string, symbol: string, promises: string[], keyIssues: string[] }): Promise<Candidate> => {
    const res = await fetch(`${API_URL}/election/join`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to join election');
    }
    const dataRes = await res.json();
    return mapId(dataRes);
  }
};
