/**
 * api.ts — HEA Backend API Service
 * Connects HEA frontend to Flask backend at localhost:5000
 */

export const API_BASE = 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────
export interface BedSummary {
  ward: string;
  total: number;
  occupied: number;
  available: number;
  maintenance: number;
}

export interface Bed {
  id: number;
  bed_number: string;
  ward: string;
  status: 'available' | 'occupied' | 'maintenance';
  patient_id?: number;
}

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  condition: string;
  priority: 'normal' | 'urgent' | 'critical';
  ward: string;
  bed_number?: string;
  admitted_at: string;
}

export interface Resource {
  id: number;
  name: string;
  category: string;
  total: number;
  available: number;
}

export interface Alert {
  id: number;
  level: 'critical' | 'warning' | 'info';
  message: string;
  created_at: string;
}

export interface ForecastDay {
  day: string;
  date: string;
  predicted_admissions: number;
  predicted_emergency: number;
  predicted_icu: number;
  is_holiday: boolean;
  surge_alert: boolean;
  model_used: string;
}

export interface DashboardData {
  bed_summary: BedSummary[];
  patient_stats: { total_active: number; urgent: number; admitted_today: number };
  resources: Resource[];
  alerts: Alert[];
  occupancy_rate: number;
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
  department: string;
  status: string;
  shift: string;
}

export interface AuditLog {
  id: number;
  action: string;
  details: string;
  performed_by: string;
  timestamp: string;
}

export interface NearbyHospital {
  id: number;
  name: string;
  address: string;
  distance_km: number;
  latitude: number;
  longitude: number;
  phone: string;
  type: string;
  rating: number;
  total_beds: number;
  available_beds: number;
  icu_total: number;
  icu_available: number;
  emergency_total: number;
  emergency_available: number;
  general_total: number;
  general_available: number;
  has_ambulance: number;
  is_open_24h: number;
}

export interface RegisteredHospital {
  id: number;
  name: string;
  location: string;
  contact: string;
  bed_capacity: number;
  icu_availability: number;
  status: 'pending' | 'approved' | 'rejected';
  registered_at: string;
}

export interface Insight {
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  action: string;
}

// ── API Functions ───────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const getDashboard = () => apiFetch<DashboardData>('/dashboard');
export const getBeds = () => apiFetch<Bed[]>('/beds');
export const getBedSummary = () => apiFetch<BedSummary[]>('/beds/summary');
export const getPatients = () => apiFetch<Patient[]>('/patients');
export const getResources = () => apiFetch<Resource[]>('/resources');
export const getAlerts = () => apiFetch<Alert[]>('/alerts');
export const getForecast = () => apiFetch<ForecastDay[]>('/forecast');
export const getInsights = () => apiFetch<Insight[]>('/insights');
export const getStaff = () => apiFetch<StaffMember[]>('/staff');
export const getAuditLog = () => apiFetch<AuditLog[]>('/reports/audit');
export const checkHealth = () => apiFetch<{ status: string }>('/health');
export const getNearbyHospitals = () => apiFetch<NearbyHospital[]>('/nearby-hospitals');
export const getRegisteredHospitals = () => apiFetch<RegisteredHospital[]>('/hospitals');

export const admitPatient = (data: {
  name: string; age: number; gender: string;
  condition: string; priority: string; ward?: string;
}) => apiFetch<{ message: string; bed?: Bed }>('/patients/admit', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const dischargePatient = (id: number) =>
  apiFetch<{ message: string }>(`/patients/${id}/discharge`, { method: 'POST' });

export const updateBedStatus = (id: number, status: string) =>
  apiFetch<{ message: string }>(`/beds/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

export const downloadPDFReport = async () => {
  const res = await fetch(`${API_BASE}/reports/pdf`);
  if (!res.ok) throw new Error('Failed to generate PDF');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'HEA_Report.pdf';
  a.click();
  URL.revokeObjectURL(url);
};
