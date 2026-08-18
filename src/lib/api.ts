const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: { code: string; message: string; details?: unknown };
};

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function firstValidationMessage(details: unknown) {
  if (!details || typeof details !== "object") return undefined;
  const fieldErrors = (details as { fieldErrors?: Record<string, string[]> }).fieldErrors;
  if (!fieldErrors) return undefined;
  for (const messages of Object.values(fieldErrors)) {
    if (messages?.[0]) return messages[0];
  }
  return undefined;
}
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      response.status,
      payload?.error?.code ?? "REQUEST_FAILED",
      firstValidationMessage(payload?.error?.details) ?? payload?.error?.message ?? "Request failed",
      payload?.error?.details
    );
  }

  return payload.data;
}

export type Role = "patient" | "doctor";

export type User = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status?: string;
};

export type DoctorProfile = {
  _id: string;
  userId: User;
  qualification: string;
  specialization: string;
  registrationNumber: string;
  experienceYears?: number;
  hospital?: string;
  clinicAddress?: string;
  about?: string;
  available?: boolean;
  verified?: boolean;
  ratingAverage?: number;
  ratingCount?: number;
};

export type ScanImage = {
  label: string;
  secureUrl: string;
  isAiGenerated?: boolean;
  kind?: string;
};

export type AiFinding = {
  name: string;
  confidence: number;
  severity: "Low" | "Mild" | "Moderate" | "High";
  region: string;
  description: string;
  recommendation: string;
};

export type Scan = {
  _id: string;
  patientId: User | string;
  doctorId: User | string;
  status: string;
  originalImages: ScanImage[];
  enhancedImages?: ScanImage[];
  aiGeneratedViews?: ScanImage[];
  aiFindings: AiFinding[];
  aiSummary?: string;
  aiDisclaimer?: string;
  createdAt: string;
  updatedAt: string;
};

export type DoctorReport = {
  _id: string;
  scanId: string;
  diagnosis: string;
  findings?: string;
  prescription?: string;
  treatmentPlan?: string;
  notes?: string;
  followUpDate?: string;
  status: string;
  submittedAt?: string;
};

export const api = {
  login: (body: { email: string; password: string }) =>
    request<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  register: (body: unknown) =>
    request<{ user: User }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),

  me: () => request<{ user: User }>("/auth/me"),

  patientDashboard: () => request<{ totalScans: number; pendingReviews: number; completedReports: number; recentScans: Scan[] }>("/patients/dashboard"),

  patientProfile: () => request<{ user: User; profile: unknown }>("/patients/profile"),

  updatePatientProfile: (body: unknown) => request<{ user: User; profile: unknown }>("/patients/profile", { method: "PATCH", body: JSON.stringify(body) }),

  reportHistory: () => request<{ scans: Scan[] }>("/patients/reports/history"),

  doctors: () => request<{ doctors: DoctorProfile[] }>("/doctors"),

  doctorDashboard: () => request<{ totalPatients: number; pendingReviews: number; completedReports: number; recentPatients: Scan[] }>("/doctors/dashboard"),

  doctorPatients: () => request<{ patients: Scan[] }>("/doctors/patients"),

  doctorProfile: () => request<{ user: User; profile: unknown }>("/doctors/profile"),

  updateDoctorProfile: (body: unknown) => request<{ user: User; profile: unknown }>("/doctors/profile", { method: "PATCH", body: JSON.stringify(body) }),

  createScan: (formData: FormData) => request<{ scan: Scan }>("/scans", { method: "POST", body: formData }),

  scan: (id: string) => request<{ scan: Scan; doctorReport: DoctorReport | null }>(`/scans/${id}`),

  submitDoctorReport: (id: string, body: unknown) => request<{ report: DoctorReport }>(`/scans/${id}/doctor-report`, { method: "POST", body: JSON.stringify(body) })
};

