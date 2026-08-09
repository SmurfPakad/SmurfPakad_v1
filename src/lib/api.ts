/**
 * SmurfPakad API Client
 * =====================
 * Centralized API client for the FastAPI backend.
 * All API calls go through this module.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_V1 = `${API_BASE}/api/v1`;

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider?: string;
  tier?: string;
  createdAt?: string;
}

export interface Upload {
  id: string;
  name: string;
  filename: string;
  size: number;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  date: string;
  uploadedAt: string;
  rows?: number;
  columns?: number;
  error?: string;
}

export interface Pattern {
  type: string;
  severity: string;
  description: string;
  detail: string;
  count?: number;
  wallets?: string[];
}

export interface SuspiciousAddress {
  address: string;
  riskScore: number;
  riskLevel: string;
  patterns: string[];
  inDegree: number;
  outDegree: number;
  totalSent?: number;
  totalReceived?: number;
}

export interface GraphNode {
  id: string;
  label?: string;
  risk: number;
  riskLevel: string;
  group?: number;
  size?: number;
  color?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  value?: number;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  metadata?: {
    totalNodes: number;
    totalEdges: number;
    suspiciousCount: number;
  };
}

export interface Report {
  id: string;
  name: string;
  type: string;
  report_type: string;
  format: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
  created_at: string;
  downloadUrl?: string;
  size?: number;
}

export interface AnalystBrief {
  walletId: string;
  brief: string;
  recommendations: string[];
  regulatoryFlags: string[];
  riskAssessment: string;
  generatedBy: string;
  modelId: string;
  generatedAt: string;
  confidence: number;
}

export interface SafeguardAlert {
  recipient: string;
  amount: number;
  platform: string;
  senderId?: string;
  currency: string;
  riskScore: number;
  riskLevel: string;
  reasons: string[];
  timestamp: string;
}

export interface FATFIndicator {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: string;
  matchedPattern?: string;
  matchedDescription?: string;
}

// ============================================================================
// Helpers
// ============================================================================

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_V1}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.detail || error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

async function apiRequestRaw(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_V1}${endpoint}`;
  return fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });
}

// ============================================================================
// Auth API
// ============================================================================

export const authApi = {
  getGoogleAuthUrl: () => apiRequest<{ url: string }>('/auth/google'),

  handleCallback: (code: string, provider: string = 'google') =>
    apiRequest<{ token: string; refreshToken: string; user: User }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ code, provider }),
      }
    ),

  getMe: () => apiRequest<User>('/auth/me'),

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  },
};

// ============================================================================
// Dashboard API
// ============================================================================

export const dashboardApi = {
  getStats: () =>
    apiRequest<{
      stats: {
        totalTransactions: number;
        total_transactions: number;
        suspiciousCount: number;
        suspicious_count: number;
        riskScore: number;
        addressesMonitored: number;
        activeCases: number;
        total_uploads: number;
      };
    }>('/dashboard/stats'),
};

// ============================================================================
// Upload API
// ============================================================================

export const uploadApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_V1}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  },

  getHistory: (page = 1, limit = 10, status?: string) =>
    apiRequest<{ uploads: Upload[]; pagination: any }>(
      `/upload/history?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`
    ),

  getById: (uploadId: string) =>
    apiRequest<Upload>(`/upload/${uploadId}`),
};

// ============================================================================
// Analysis API
// ============================================================================

export const analysisApi = {
  run: (uploadId: string) =>
    apiRequest<{ status: string; message: string }>(
      `/analysis/${uploadId}/run`,
      { method: 'POST' }
    ),

  getPatterns: (uploadId: string) =>
    apiRequest<{ patterns: Pattern[] }>(`/analysis/${uploadId}/patterns`),

  getSuspicious: (uploadId: string) =>
    apiRequest<{ addresses: SuspiciousAddress[] }>(
      `/analysis/${uploadId}/suspicious`
    ),

  getStatus: (uploadId: string) =>
    apiRequest<{ status: string; progress: number }>(
      `/analysis/${uploadId}/status`
    ),
};

// ============================================================================
// Graph API
// ============================================================================

export const graphApi = {
  getSuspiciousSubgraph: (uploadId: string) =>
    apiRequest<GraphData>(`/graph/${uploadId}/suspicious-subgraph`),

  getFullGraph: (uploadId: string) =>
    apiRequest<GraphData>(`/graph/${uploadId}/full`),
};

// ============================================================================
// Reports API
// ============================================================================

export const reportsApi = {
  generate: (data: {
    upload_id: string;
    report_type: string;
    format: string;
    time_period?: string;
    filters?: any;
  }) =>
    apiRequest<{ reportId: string; status: string; id?: string; report_type?: string; [key: string]: any }>(
      '/reports/generate',
      {
        method: 'POST',
        body: JSON.stringify({
          uploadId: data.upload_id,
          type: data.report_type,
          format: data.format,
          filters: { timePeriod: data.time_period, ...data.filters },
        }),
      }
    ),

  getHistory: (uploadId?: string, page = 1, limit = 10) =>
    apiRequest<{ reports: Report[]; pagination: any }>(
      `/reports/history?page=${page}&limit=${limit}${uploadId ? `&upload_id=${uploadId}` : ''}`
    ),

  download: async (reportId: string) => {
    const response = await apiRequestRaw(`/reports/${reportId}/download`);
    if (!response.ok) throw new Error('Download failed');
    return response.blob();
  },

  // Alias used by Reports.tsx
  downloadReport: async (reportId: string) => {
    const response = await apiRequestRaw(`/reports/${reportId}/download`);
    if (!response.ok) throw new Error('Download failed');
    return response.blob();
  },

  getStatus: (reportId: string) =>
    apiRequest<{ status: string; downloadUrl?: string }>(
      `/reports/${reportId}/status`
    ),
};

// ============================================================================
// Settings API
// ============================================================================

export const settingsApi = {
  getProfile: () => apiRequest<User>('/settings/profile'),

  updateProfile: (data: Partial<User>) =>
    apiRequest<User>('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getApiKeys: () =>
    apiRequest<{ keys: any[] }>('/settings/api-keys'),

  generateApiKey: (name: string) =>
    apiRequest<{ key: string }>('/settings/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  revokeApiKey: (keyId: string) =>
    apiRequest<void>(`/settings/api-keys/${keyId}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// IBM AI API (watsonx.ai)
// ============================================================================

export const ibmAiApi = {
  generateBrief: (data: {
    walletId: string;
    riskScore: number;
    riskLevel: string;
    patterns: any[];
    featureImportance: any[];
    graphMetrics?: any;
    narrative?: string;
  }) =>
    apiRequest<AnalystBrief>('/ibm-ai/analyst-brief', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  generateSafeguardAdvisory: (data: {
    recipient: string;
    amount: number;
    riskScore: number;
    riskLevel: string;
    reasons: string[];
    platform: string;
  }) =>
    apiRequest<{ advisory: string; generatedBy: string; generatedAt: string }>(
      '/ibm-ai/safeguard-advisory',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  getStatus: () =>
    apiRequest<{
      configured: boolean;
      provider: string;
      model: string;
      status: string;
      message?: string;
    }>('/ibm-ai/status'),
};

// ============================================================================
// SafeGuard API
// ============================================================================

export const safeguardApi = {
  checkTransaction: (data: {
    recipient: string;
    amount: number;
    platform?: string;
    senderId?: string;
    currency?: string;
  }) =>
    apiRequest<{
      riskScore: number;
      riskLevel: string;
      reasons: string[];
      message: string;
      checkedAt: string;
    }>('/safeguard/check', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStats: () =>
    apiRequest<{
      totalChecks: number;
      totalFlagged: number;
      flaggedRecipients: number;
      blacklistedRecipients: number;
      flagRate: number;
    }>('/safeguard/stats'),

  getHistory: (senderId: string, limit = 50) =>
    apiRequest<{ history: any[] }>(
      `/safeguard/history?sender_id=${senderId}&limit=${limit}`
    ),
};

// ============================================================================
// WebSocket Connection
// ============================================================================

export function createWebSocketConnection(
  token: string,
  onMessage: (data: any) => void,
  onClose?: () => void,
  onError?: (error: Event) => void,
): WebSocket {
  const wsUrl = API_BASE.replace('http', 'ws');
  const ws = new WebSocket(`${wsUrl}/ws?token=${token}`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch {
      console.warn('Invalid WebSocket message:', event.data);
    }
  };

  ws.onclose = () => {
    onClose?.();
  };

  ws.onerror = (error) => {
    onError?.(error);
  };

  return ws;
}


// ============================================================================
// AML Agent API
// ============================================================================

export const agentApi = {
  investigate: async (walletId: string, context?: Record<string, any>) => {
    const res = await fetch(`${API_V1}/agent/investigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_id: walletId, context }),
    });
    if (!res.ok) throw new Error('Investigation failed');
    return res.json();
  },

  chat: async (message: string, walletId?: string, context?: Record<string, any>) => {
    const res = await fetch(`${API_V1}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, wallet_id: walletId, context }),
    });
    if (!res.ok) throw new Error('Agent chat failed');
    return res.json();
  },

  getHistory: async () => {
    const res = await fetch(`${API_V1}/agent/history`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  getCapabilities: async () => {
    const res = await fetch(`${API_V1}/agent/capabilities`);
    if (!res.ok) throw new Error('Failed to fetch capabilities');
    return res.json();
  },
};

