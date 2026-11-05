export type UserRole =
  | 'owner'
  | 'ceo'
  | 'production'
  | 'sales'
  | 'marketing'
  | 'hrd'
  | 'finance'
  | 'pr'
  | 'member'
  | 'customer';

export type AccountStatus = 'pending_approval' | 'active' | 'suspended' | 'inactive';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  division?: string;
  position?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  division: string;
  bio: string;
  responsibilities: string[];
  status: string;
  avatarUrl: string;
  phone?: string;
  email?: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  colorHex: string;
  description: string;
  image?: string;
}

export interface ProductSize {
  id: string;
  name: string;
  capacity: string;
  priceAdjustment: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  features: string[];
  basePrice: number;
  category: string;
  status: 'published' | 'draft' | 'archived';
  isFeatured: boolean;
  isPO: boolean;
  images: string[];
  variants: ProductVariant[];
  sizes: ProductSize[];
  customCharms: string[];
}

export interface POPeriod {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status: 'upcoming' | 'open' | 'closing_soon' | 'closed' | 'completed';
  quota: number;
  orderedCount: number;
  productionEstimateDays: number;
  announcement: string;
}

export type OrderStatus =
  | 'pending_confirmation'
  | 'payment_verified'
  | 'in_production'
  | 'quality_check'
  | 'packaging'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cash_school' | 'qris' | 'bank_transfer' | 'midtrans';
export type PaymentStatus = 'pending' | 'verified' | 'failed' | 'refunded';

export interface CustomizationOption {
  bottleSize: string;
  variantColor: string;
  customCharm?: string;
  customNotes?: string;
  customImageRefName?: string;
  customImageRefUrl?: string;
  customImageRefData?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantName: string;
  sizeName: string;
  customCharm?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  customization?: CustomizationOption;
}

export interface Order {
  id: string;
  referenceCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  schoolName: string;
  className: string;
  deliveryType: 'school' | 'home' | 'pickup';
  shippingAddress: string;
  distanceKm: number;
  shippingCost: number;
  subtotal: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  poPeriodId: string;
  items: OrderItem[];
  notes?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  trackingNumber?: string;
  shippingProofUrl?: string;
  createdAt: string;
  updatedAt: string;
  auditTrail: {
    timestamp: string;
    changedBy: string;
    action: string;
    notes?: string;
  }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Benang Rajut' | 'Aksesoris Gantungan' | 'Packaging & Label' | 'Lainnya';
  stock: number;
  unit: string;
  minThreshold: number;
  unitCost: number;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  referenceCode: string;
  date: string;
  type: 'income' | 'expense';
  category: 'Penjualan Produk' | 'Bahan Baku' | 'Operasional' | 'Packaging' | 'Ongkir' | 'Lainnya';
  amount: number;
  paymentMethod: string;
  status: 'verified' | 'pending' | 'rejected';
  description: string;
  orderReference?: string;
  recordedBy: string;
}

export interface PerformanceReview {
  id: string;
  memberId: string;
  memberName: string;
  memberDivision: string;
  reviewerId: string;
  reviewerName: string;
  reviewDate: string;
  period: string; // e.g. "Oktober 2026"
  scores: {
    responsibility: number; // 1-100
    punctuality: number;
    quality: number;
    collaboration: number;
    productivity: number;
    communication: number;
    consistency: number;
  };
  averageScore: number;
  notes: string;
  developmentRecommendations: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  division: string;
  assignedToId?: string;
  assignedToName?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  deadline: string;
  createdAt: string;
}

export interface DashboardNotification {
  id: string;
  kind: 'order' | 'shipment' | 'task' | 'task_reminder' | string;
  title: string;
  message: string;
  href: string;
  createdAt: string;
  readAt: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  isPublic: boolean;
  priority: 'normal' | 'urgent';
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Produksi' | 'Produk' | 'Aktivitas Anggota' | 'Event';
  imageUrl: string;
  caption: string;
  date: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface SiteSettings {
  companyName: string;
  slogan: string;
  address: string;
  referencePoint: string;
  whatsappNumber: string;
  email: string;
  instagram: string;
  tiktok: string;
  paymentInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrisUrl: string;
  };
  shippingRules: {
    range1To2Km: number; // 0
    range3To5Km: number; // 3000
    range6To7Km: number; // admin configurable, e.g. 4000
    rangeAbove7Km: number; // 5000
  };
  crewInvitationCode: string;
}
