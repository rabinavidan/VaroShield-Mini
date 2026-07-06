const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export interface LoginResponse {
  token: string;
  role: string;
}

export interface FileItem {
  id: number;
  name: string;
  owner: string;
  classification: string;
  source: string;
  is_public: boolean;
  is_shared_with_everyone: boolean;
  created_at: string;
}

export interface RiskAlert {
  id: number;
  file_id: number;
  severity: string;
  reason: string;
  status: string;
  created_at: string;
}

export interface DashboardSummary {
  total_files: number;
  sensitive_files: number;
  public_files: number;
  high_risks: number;
  open_alerts: number;
}

export interface ScanStatus {
  job_id: string;
  status: string;
  summary?: { scanned_files: number; sensitive_files: number };
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getFiles: () => request<FileItem[]>("/files"),

  createFile: (data: {
    name: string;
    content: string;
    owner: string;
    source: string;
    is_public: boolean;
  }) =>
    request<FileItem>("/files", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  setPermission: (fileId: number, userGroup: string, access: string) =>
    request(`/files/${fileId}/permissions`, {
      method: "POST",
      body: JSON.stringify({ user_group: userGroup, access }),
    }),

  deleteFile: (fileId: number) =>
    request<void>(`/files/${fileId}`, { method: "DELETE" }),

  startScan: () => request<ScanStatus>("/scan/start", { method: "POST" }),

  getScanStatus: (jobId: string) => request<ScanStatus>(`/scan/${jobId}`),

  getRisks: (severity?: string) =>
    request<RiskAlert[]>(`/risks${severity ? `?severity=${severity}` : ""}`),

  resolveRisk: (riskId: number) =>
    request<RiskAlert>(`/risks/${riskId}/resolve`, { method: "POST" }),

  deleteRisk: (riskId: number) =>
    request<void>(`/risks/${riskId}`, { method: "DELETE" }),

  getDashboardSummary: () =>
    request<DashboardSummary>("/dashboard/summary"),
};
