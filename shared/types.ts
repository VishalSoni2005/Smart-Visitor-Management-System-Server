export interface Visitor {
  visitorId: string;
  name: string;
  phone: string;
  email?: string;
  purpose: 'Meeting' | 'Interview' | 'Delivery' | 'Other';
  hostName: string;
  hostDepartment: string;
  photoUrl: string;
  gatePassUrl: string;
  visitorToken: string;
  status: 'checked-in' | 'checked-out';
  checkInTime: string;
  checkOutTime: string | null;
  createdAt: string;
}

export interface Admin {
  email: string;
  passwordHash: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
