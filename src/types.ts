export type UserRole = 'admin' | 'merchandiser' | 'sourcing' | 'store' | 'accounts' | 'approver';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  paymentTerms: string;
  taxId: string;
  status: 'active' | 'inactive';
  approvedItems: string[];
  address: string;
  contactPerson: string;
  email: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  styleName: string;
  buyer: string;
  status: 'active' | 'closed';
  createdAt: string;
}

export interface POItem {
  id: string;
  item: string;
  description: string;
  unit: string;
  qty: number;
  rate: number;
  amount: number;
}

export type POStatus = 'draft' | 'submitted' | 'approved' | 'issued' | 'cancelled' | 'revised';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  jobId: string;
  supplierId: string;
  status: POStatus;
  issueDate: string;
  deliveryDate: string;
  deliveryPlace: string;
  items: POItem[];
  totalAmount: number;
  currency: string;
  verificationCode: string;
  revisionNumber: number;
  printCount: number;
  createdBy: string;
  approvedBy?: string;
  notes?: string;
  terms?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}
