
import { Poll, UserProfile, PollComment, ConsciousnessLayer, PollStatus, AppNotification, Candidate } from '../../types';

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:4000/api";

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return mapId(data);
  },

  signup: async (username: string, email: string, password: string): Promise<UserProfile> => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) throw new Error('Signup failed');
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return mapId(data);
  },

  getProfile: async (): Promise<UserProfile> => {
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    const data = await res.json();
    return mapId(data);
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  searchUsers: async (query: string): Promise<{ id: string, username: string, avatarUrl: string }[]> => {
    const res = await fetch(`${API_URL}/auth/search?search=${query}`, {
      headers: getHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(mapId);
  },

  // --- POLLS ---
  getPolls: async (): Promise<Poll[]> => {
    const res = await fetch(`${API_URL}/polls`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch polls');
    const data = await res.json();
    return data.map((poll: any) => ({
      ...mapId(poll),
      options: poll.options?.map(mapId) || [],
      comments: [],
      consciousnessEntries: poll.consciousnessEntries?.map(mapId) || []
    }));
  },

  // Admin: Get Pending
  getPendingPolls: async (): Promise<Poll[]> => {
    const res = await fetch(`${API_URL}/polls/pending`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch pending polls');
    const data = await res.json();
    return data.map((poll: any) => ({
      ...mapId(poll),
      options: poll.options?.map(mapId) || [],
      comments: [],
      consciousnessEntries: poll.consciousnessEntries?.map(mapId) || []
    }));
  },

  // Admin: Update Status
  updatePollStatus: async (pollId: string, status: PollStatus): Promise<Poll> => {
    const res = await fetch(`${API_URL}/polls/${pollId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
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
    });
    if (!res.ok) throw new Error('Failed to add entry');
    const data = await res.json();
    return mapId(data);
  },

  // --- COMMENTS ---
  getComments: async (pollId: string): Promise<PollComment[]> => {
    const res = await fetch(`${API_URL}/polls/${pollId}/comments`, { headers: getHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(mapId);
  },

  addComment: async (pollId: string, text: string, parentId?: string): Promise<PollComment> => {
    const res = await fetch(`${API_URL}/polls/${pollId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text, parentId })
    });
    if (!res.ok) throw new Error('Failed to comment');
    const data = await res.json();
    return mapId(data);
  },

  // --- NOTIFICATIONS ---
  getNotifications: async (): Promise<AppNotification[]> => {
    const res = await fetch(`${API_URL}/notifications`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const data = await res.json();
    return data.map(mapId);
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders()
    });
  },

  // --- ELECTION MODULE ---
  applyForCandidacy: async (application: Partial<Candidate>): Promise<Candidate> => {
    const res = await fetch(`${API_URL}/election/apply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(application)
    });
    if (!res.ok) throw new Error('Application failed');
    const data = await res.json();
    return mapId(data);
  },

  getMyCandidacy: async (): Promise<Candidate | null> => {
    const res = await fetch(`${API_URL}/election/me`, { headers: getHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data) return null;
    return mapId(data);
  },

  getCandidates: async (): Promise<Candidate[]> => {
    const res = await fetch(`${API_URL}/election/candidates`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch candidates');
    const data = await res.json();
    return data.map(mapId);
  }
};
