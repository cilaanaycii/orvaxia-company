'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  UserProfile,
  TeamMember,
  Product,
  POPeriod,
  Order,
  OrderItem,
  InventoryItem,
  Transaction,
  PerformanceReview,
  TaskItem,
  Announcement,
  FAQItem,
  GalleryItem,
  SiteSettings,
  OrderStatus,
  UserRole,
  DashboardNotification,
} from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import { mapSupabaseProfile, SupabaseProfileRow } from '@/lib/supabase/profile';
import {
  INITIAL_SITE_SETTINGS,
  INITIAL_PO_PERIOD,
  INITIAL_PRODUCTS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_TRANSACTIONS,
  INITIAL_TASKS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_FAQS,
  INITIAL_GALLERY,
} from '@/lib/data/initial-data';
import { toast } from 'sonner';

interface PerformanceReviewRow {
  id: string;
  member_id: string | null;
  member_name: string;
  member_division: string;
  reviewer_id: string | null;
  reviewer_name: string;
  review_date: string;
  period: string;
  score_responsibility: number;
  score_punctuality: number;
  score_quality: number;
  score_collaboration: number;
  score_productivity: number;
  score_communication: number;
  score_consistency: number;
  average_score: number;
  notes: string;
  recommendations: string;
}

interface CompanyOrderRow {
  id: string;
  reference_code: string;
  details: Order;
  order_status: Order['orderStatus'];
  payment_status: Order['paymentStatus'];
  assigned_staff_id: string | null;
  assigned_staff_name: string | null;
  tracking_number: string | null;
  shipping_proof_url: string | null;
  created_at: string;
  updated_at: string;
}

interface DashboardNotificationRow {
  id: string;
  kind: DashboardNotification['kind'];
  title: string;
  message: string;
  href: string;
  created_at: string;
  read_at: string | null;
}

function mapCompanyOrder(row: CompanyOrderRow): Order {
  return {
    ...row.details,
    id: row.id,
    referenceCode: row.reference_code,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status,
    assignedStaffId: row.assigned_staff_id || undefined,
    assignedStaffName: row.assigned_staff_name || undefined,
    trackingNumber: row.tracking_number || undefined,
    shippingProofUrl: row.shipping_proof_url || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDashboardNotification(row: DashboardNotificationRow): DashboardNotification {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    message: row.message,
    href: row.href,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

interface CrewTaskRow {
  id: string;
  title: string;
  description: string;
  division: string;
  assigned_to_id: string | null;
  assigned_to_name: string | null;
  priority: TaskItem['priority'];
  status: TaskItem['status'];
  deadline: string;
  created_at: string;
}

interface TeamMemberRow {
  id: string;
  name: string;
  position: string;
  division: string;
  bio: string;
  responsibilities: unknown;
  status: string;
  avatar_url: string;
  class_name: string | null;
  instagram_url: string | null;
  profile_visible: boolean | null;
  phone: string | null;
  email: string | null;
  sort_order: number;
}

function mapTeamMember(row: TeamMemberRow): TeamMember {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    division: row.division,
    bio: row.bio,
    responsibilities: Array.isArray(row.responsibilities)
      ? row.responsibilities.filter((item): item is string => typeof item === 'string')
      : [],
    status: row.status === 'Tidak Aktif' ? 'Non-aktif' : row.status,
    avatarUrl: row.avatar_url,
    className: row.class_name || undefined,
    instagramUrl: row.instagram_url || undefined,
    profileVisible: row.profile_visible !== false,
    phone: row.phone || undefined,
    email: row.email || undefined,
    sortOrder: row.sort_order,
  };
}

function mapCrewTask(row: CrewTaskRow): TaskItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    division: row.division,
    assignedToId: row.assigned_to_id || undefined,
    assignedToName: row.assigned_to_name || undefined,
    priority: row.priority,
    status: row.status,
    deadline: row.deadline,
    createdAt: row.created_at.slice(0, 10),
  };
}

function mapPerformanceReview(row: PerformanceReviewRow): PerformanceReview {
  return {
    id: row.id,
    memberId: row.member_id || '',
    memberName: row.member_name,
    memberDivision: row.member_division,
    reviewerId: row.reviewer_id || '',
    reviewerName: row.reviewer_name,
    reviewDate: row.review_date,
    period: row.period,
    scores: {
      responsibility: row.score_responsibility,
      punctuality: row.score_punctuality,
      quality: row.score_quality,
      collaboration: row.score_collaboration,
      productivity: row.score_productivity,
      communication: row.score_communication,
      consistency: row.score_consistency,
    },
    averageScore: Number(row.average_score),
    notes: row.notes,
    developmentRecommendations: row.recommendations,
  };
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  variantName: string;
  sizeName: string;
  customCharm?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  customizationNotes?: string;
  customImageRefName?: string;
  customImageRefData?: string;
}

interface CompanyContextType {
  currentUser: UserProfile | null;
  isAuthReady: boolean;
  users: UserProfile[];
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  poPeriod: POPeriod;
  updatePOPeriod: (po: Partial<POPeriod>) => void;
  products: Product[];
  addProduct: (prod: Product) => void;
  updateProduct: (id: string, prod: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => void;
  teamMembers: TeamMember[];
  updateTeamMember: (id: string, member: Partial<TeamMember>) => Promise<boolean>;
  deleteTeamMember: (id: string) => Promise<boolean>;
  orders: Order[];
  notifications: DashboardNotification[];
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  createOrder: (orderData: Omit<Order, 'id' | 'referenceCode' | 'createdAt' | 'updatedAt' | 'auditTrail'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, changedBy: string, notes?: string) => void;
  verifyPayment: (orderId: string, verifiedBy: string) => void;
  assignDeliveryStaff: (orderId: string, staffId: string, staffName: string) => void;
  updateShipmentStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, proofUrl?: string) => void;
  inventory: InventoryItem[];
  updateInventory: (id: string, newStock: number, reason: string) => void;
  transactions: Transaction[];
  addTransaction: (trx: Omit<Transaction, 'id' | 'referenceCode'>) => void;
  performanceReviews: PerformanceReview[];
  addPerformanceReview: (review: Omit<PerformanceReview, 'id'>) => Promise<boolean>;
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => Promise<boolean>;
  updateTaskStatus: (taskId: string, status: 'todo' | 'in_progress' | 'completed') => Promise<void>;
  announcements: Announcement[];
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt'>) => void;
  deleteAnnouncement: (id: string) => void;
  faqs: FAQItem[];
  gallery: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  updateGalleryItem: (id: string, item: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: string) => void;
  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  // Auth Helpers
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  registerStaff: (data: { fullName: string; email: string; phone: string; password?: string; invitationCode?: string; division?: string; position?: string }) => Promise<{ success: boolean; message: string; userId?: string }>;
  approveStaff: (userId: string, role: UserRole, division: string, position: string) => Promise<void>;
  confirmCrewAccount: (userId: string) => Promise<void>;
  resendApprovalEmail: (userId: string) => Promise<void>;
  changeUserRole: (userId: string, role: UserRole, division: string, position: string) => Promise<void>;
  rejectStaff: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  resetAllDataToZero: () => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  setInventoryStock: (id: string, exactStock: number, reason: string) => void;
  syncWithCloud: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const STORAGE_KEY = 'orvaxia_company_db_v3';
const CART_STORAGE_KEY = 'orvaxia_cart_v3';

const isMissingTableError = (error: { code?: string; message?: string } | null | undefined) => {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    error.code === '42P01' ||
    message.includes('does not exist') ||
    (message.includes('relation') && message.includes('does not exist'))
  );
};

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    ...INITIAL_SITE_SETTINGS,
    crewInvitationCode: INITIAL_SITE_SETTINGS.crewInvitationCode || 'ORVAXIA2026',
  });
  const [poPeriod, setPoPeriod] = useState<POPeriod>(INITIAL_PO_PERIOD);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [faqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [cart, setCart] = useState<CartItem[]>([]);
  const currentUserId = currentUser?.id;
  const currentUserStatus = currentUser?.status;
  const currentUserRole = currentUser?.role;
  const hasExecutiveAccess =
    currentUser?.status === 'active' &&
    (currentUser.role === 'owner' || currentUser.role === 'ceo');
  const canManagePerformanceReviews =
    currentUser?.status === 'active' &&
    (currentUser.role === 'owner' || currentUser.role === 'ceo' || currentUser.role === 'hrd');

  // Load from LocalStorage
  useEffect(() => {
    try {
      // Purge old keys if present to prevent client crashes
      try {
        localStorage.removeItem('orvaxia_company_db_v1');
        localStorage.removeItem('orvaxia_cart_v1');
        localStorage.removeItem('orvaxia_company_db_v2');
        localStorage.removeItem('orvaxia_cart_v2');
      } catch {}

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.siteSettings) {
          setSiteSettings({
            ...parsed.siteSettings,
            crewInvitationCode: INITIAL_SITE_SETTINGS.crewInvitationCode || 'ORVAXIA2026',
          });
        }
        if (parsed.poPeriod) setPoPeriod(parsed.poPeriod);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.announcements) setAnnouncements(parsed.announcements);
        if (parsed.gallery) setGallery(parsed.gallery);
        if (parsed.users) setUsers(parsed.users);
      }
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch {
      // fallback to initial
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    let active = true;

    const loadDatabasePrices = async () => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('products')
        .select('slug,price,status,is_featured,is_available_for_po')
        .in('slug', INITIAL_PRODUCTS.map((product) => product.slug));
      if (!active) return;
      if (error) {
        console.error('Product prices failed to load from Supabase', error);
        toast.error('Harga katalog gagal dimuat dari Supabase. Checkout tetap nonaktif sampai harga tersedia.');
        setProducts((current) => current.map((product) => ({ ...product, basePrice: 0 })));
        return;
      }

      const rows = new Map((data || []).map((row) => [row.slug, row]));
      setProducts((current) =>
        current.map((product) => {
          const row = rows.get(product.slug);
          if (!row) return { ...product, basePrice: 0 };
          return {
            ...product,
            basePrice: row.price === null ? 0 : Number(row.price),
            status: row.status,
            isFeatured: row.is_featured,
            isPO: row.is_available_for_po,
          };
        }),
      );
    };

    const loadSharedVariants = async () => {
      try {
        const response = await fetch('/api/catalog/variants', { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Katalog bersama gagal dimuat.');
        }
        if (!active || !Array.isArray(result.variants)) return;
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === INITIAL_PRODUCTS[0].id
              ? { ...product, variants: result.variants as Product['variants'] }
              : product
          )
        );
      } catch (error) {
        if (!active) return;
        console.error('Shared product catalog load failed', error);
      }
    };

    void loadDatabasePrices();
    void loadSharedVariants();
    return () => {
      active = false;
    };
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!supabase) {
      setCurrentUser(null);
      setUsers([]);
      setPerformanceReviews([]);
      setTasks([]);
      setIsAuthReady(true);
      return;
    }

    let active = true;
    const authClient = supabase;
    const loadTeamMembers = async (isExecutive: boolean) => {
      if (isExecutive) {
        const { error: syncError } = await authClient.rpc('sync_orvaxia_team_roster', {
          p_roster: INITIAL_TEAM_MEMBERS.map((member) => ({
            name: member.name,
            position: member.position,
            division: member.division,
            bio: member.bio,
            responsibilities: member.responsibilities,
            status: member.status,
            avatar_url: member.avatarUrl,
            phone: member.phone || null,
            email: member.email || null,
            sort_order: member.sortOrder,
          })),
        });

        if (!active) return;
        if (syncError) {
          console.error('Official team roster sync failed', syncError);
          toast.error('Roster resmi 31 anggota gagal disinkronkan. Periksa migrasi database.');
        }
      }

      const { data: rows, error } = await authClient
        .from('team_members')
        .select('id,name,position,division,bio,responsibilities,status,avatar_url,class_name,instagram_url,profile_visible,phone,email,sort_order')
        .order('sort_order');

      if (!active) return;
      if (error) {
        console.error('Team roster load failed', error);
        toast.error('Database anggota crew gagal dimuat.');
        return;
      }

      if (rows?.length) {
        setTeamMembers(rows.map((row) => mapTeamMember(row as TeamMemberRow)));
        return;
      }

      if (!isExecutive) {
        setTeamMembers(INITIAL_TEAM_MEMBERS);
        return;
      }
      setTeamMembers([]);
      toast.error('Roster anggota belum tersedia di database.');
    };

    const loadProfile = async (userId: string | null) => {
      if (!userId) {
        setCurrentUser(null);
        setUsers([]);
        setPerformanceReviews([]);
        setTasks([]);
        await loadTeamMembers(false);
        return;
      }

      const { data: profileData, error: profileError } = await authClient
        .from('profiles')
        .select('id,email,full_name,phone,role,status,division,position,avatar_url,created_at,updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (!active) return;
      if (profileError || !profileData) {
        setCurrentUser(null);
        setUsers([]);
        setPerformanceReviews([]);
        setTasks([]);
        await authClient.auth.signOut();
        toast.error(profileError ? 'Profil akun gagal dimuat dari Supabase.' : 'Profil akun tidak ditemukan.');
        return;
      }

      const currentProfile = mapSupabaseProfile(profileData as SupabaseProfileRow);
      if (currentProfile.status === 'suspended' || currentProfile.status === 'inactive') {
        setCurrentUser(null);
        setUsers([]);
        setPerformanceReviews([]);
        setTasks([]);
        await authClient.auth.signOut();
        toast.error('Akun crew tidak aktif. Hubungi Owner.');
        return;
      }

      setCurrentUser(currentProfile);
      const { data: taskRows, error: taskError } = await authClient
        .from('crew_tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (!active) return;
      if (taskError) {
        setTasks([]);
        toast.error('Daftar tugas gagal dimuat dari Supabase.');
      } else {
        setTasks((taskRows || []).map((task) => mapCrewTask(task as CrewTaskRow)));
      }

      const isExecutive =
        currentProfile.status === 'active' &&
        (currentProfile.role === 'owner' || currentProfile.role === 'ceo');
      const canManageReviews =
        currentProfile.status === 'active' &&
        (currentProfile.role === 'owner' || currentProfile.role === 'ceo' || currentProfile.role === 'hrd');
      await loadTeamMembers(isExecutive);
      if (!active) return;
      if (isExecutive) {
        const { data: profiles, error: profilesError } = await authClient
          .from('profiles')
          .select('id,email,full_name,phone,role,status,division,position,avatar_url,created_at,updated_at')
          .order('full_name');

        if (!active) return;
        if (profilesError) {
          setUsers([currentProfile]);
          toast.error('Data crew tidak dapat dimuat sesuai hak akses akun.');
          return;
        }

        setUsers((profiles || []).map((profile) => mapSupabaseProfile(profile as SupabaseProfileRow)));
      } else {
        setUsers([currentProfile]);
      }

      if (!canManageReviews) {
        setPerformanceReviews([]);
        return;
      }
      const { data: reviews, error: reviewsError } = await authClient
        .from('performance_reviews')
        .select('*')
        .order('review_date', { ascending: false });
      if (!active) return;
      if (reviewsError) {
        setPerformanceReviews([]);
        toast.error('Evaluasi crew gagal dimuat dari Supabase.');
      } else {
        setPerformanceReviews((reviews || []).map((review) => mapPerformanceReview(review as PerformanceReviewRow)));
      }
    };

    authClient.auth.getSession().then(({ data, error }) => {
      if (error) {
        toast.error('Sesi Supabase gagal diperiksa.');
        setIsAuthReady(true);
        return;
      }
      void loadProfile(data.session?.user.id || null).then(
        () => {
          if (active) setIsAuthReady(true);
        },
        (loadError: unknown) => {
          console.error('Initial account profile load failed', loadError);
          if (active) {
            setCurrentUser(null);
            setIsAuthReady(true);
            toast.error('Profil akun gagal dimuat dari Supabase.');
          }
        }
      );
    });

    const { data: authListener } = authClient.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => {
        if (active) void loadProfile(session?.user.id || null);
      });
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [isHydrated]);

  useEffect(() => {
    if (!supabase || !currentUserId || currentUserStatus !== 'active') {
      setNotifications([]);
      return;
    }

    const authClient = supabase;
    let active = true;
    let hasShownLoadError = false;
    const generateOverdueTaskReminders = async () => {
      const { error: reminderError } = await authClient.rpc('create_overdue_task_reminders');
      if (reminderError && active && !hasShownLoadError) {
        console.error('Overdue task reminder generation failed', reminderError);
      }
    };

    const loadNotifications = async () => {
      const { data, error } = await authClient
        .from('dashboard_notifications')
        .select('id,kind,title,message,href,created_at,read_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!active) return;
      if (error) {
        console.error('Dashboard notification load failed', error);
        if (isMissingTableError(error)) {
          setNotifications([]);
          hasShownLoadError = false;
          return;
        }
        if (!hasShownLoadError) {
          toast.error('Inbox notifikasi gagal dimuat. Terapkan migrasi inbox di Supabase.');
          hasShownLoadError = true;
        }
        return;
      }
      setNotifications((data || []).map((row) => mapDashboardNotification(row as DashboardNotificationRow)));
      hasShownLoadError = false;
    };

    void generateOverdueTaskReminders();
    void loadNotifications();
    const interval = setInterval(() => void loadNotifications(), 30_000);
    const reminderInterval = setInterval(() => void generateOverdueTaskReminders(), 15 * 60_000);
    return () => {
      active = false;
      clearInterval(interval);
      clearInterval(reminderInterval);
    };
  }, [currentUserId, currentUserStatus]);

  useEffect(() => {
    if (
      !supabase ||
      !currentUserId ||
      currentUserStatus !== 'active' ||
      !currentUserRole ||
      !['owner', 'ceo', 'sales', 'production', 'finance'].includes(currentUserRole)
    ) {
      return;
    }

    const authClient = supabase;
    let active = true;
    let hasShownLoadError = false;
    const loadCompanyOrders = async () => {
      const { data, error } = await authClient
        .from('company_orders')
        .select('id,reference_code,details,order_status,payment_status,assigned_staff_id,assigned_staff_name,tracking_number,shipping_proof_url,created_at,updated_at')
        .order('created_at', { ascending: false });
      if (!active) return;
      if (error) {
        console.error('Company orders load failed', error);
        if (isMissingTableError(error)) {
          setOrders([]);
          hasShownLoadError = false;
          return;
        }
        if (!hasShownLoadError) {
          toast.error('Pesanan lintas perangkat gagal dimuat. Terapkan migrasi inbox/pesanan di Supabase.');
          hasShownLoadError = true;
        }
        return;
      }

      const cloudOrders = (data || []).map((row) => mapCompanyOrder(row as CompanyOrderRow));
      setOrders((previous) => {
        const legacyOrders = previous.filter((order) => order.id.startsWith('ord-'));
        return [...cloudOrders, ...legacyOrders.filter(
          (legacy) => !cloudOrders.some((cloud) => cloud.referenceCode === legacy.referenceCode)
        )];
      });
      hasShownLoadError = false;
    };

    void loadCompanyOrders();
    const interval = setInterval(() => void loadCompanyOrders(), 15_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [currentUserId, currentUserStatus, currentUserRole]);

  // Save to LocalStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const stateToSave = {
        siteSettings,
        poPeriod,
        products,
        orders,
        inventory,
        transactions,
        announcements,
        gallery,
        users,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // quota limit fallback
    }
  }, [
    isHydrated,
    siteSettings,
    poPeriod,
    products,
    orders,
    inventory,
    transactions,
    announcements,
  ]);

  // Cloud Sync Handler
  const syncWithCloud = useCallback(async (): Promise<boolean> => {
    if (!supabase || !hasExecutiveAccess) return false;

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        toast.error('Sesi Supabase gagal diperiksa.');
        return false;
      }
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) return false;

      const res = await fetch('/api/cloud-sync', {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        toast.error('Data cloud gagal disegarkan.');
        return false;
      }
      const data = await res.json();

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id,email,full_name,phone,role,status,division,position,avatar_url,created_at,updated_at')
        .order('full_name');
      if (error) {
        toast.error('Daftar crew gagal dimuat dari Supabase.');
        return false;
      } else {
        const mappedProfiles = (profiles || []).map((profile) =>
          mapSupabaseProfile(profile as SupabaseProfileRow)
        );
        setUsers(mappedProfiles);
        const signedInProfile = mappedProfiles.find(
          (profile) => profile.id === sessionData.session?.user.id
        );
        const isExecutive =
          signedInProfile?.status === 'active' &&
          (signedInProfile.role === 'owner' || signedInProfile.role === 'ceo');
        if (!isExecutive) {
          setPerformanceReviews([]);
          setTasks([]);
          return false;
        }

        const { data: taskRows, error: taskError } = await supabase
          .from('crew_tasks')
          .select('*')
          .order('created_at', { ascending: false });
        if (taskError) {
          toast.error('Daftar tugas gagal dimuat dari Supabase.');
          return false;
        }
        setTasks((taskRows || []).map((task) => mapCrewTask(task as CrewTaskRow)));

        const { data: reviews, error: reviewsError } = await supabase
          .from('performance_reviews')
          .select('*')
          .order('review_date', { ascending: false });
        if (reviewsError) {
          setPerformanceReviews([]);
          toast.error('Evaluasi crew gagal dimuat dari Supabase.');
          return false;
        } else {
          setPerformanceReviews(
            (reviews || []).map((review) => mapPerformanceReview(review as PerformanceReviewRow))
          );
        }
      }

      if (data && Array.isArray(data.orders) && data.orders.length > 0) {
        setOrders((prev) => {
          let merged = [...prev];
          data.orders.forEach((cloudOrder: Order) => {
            const idx = merged.findIndex((o) => o.id === cloudOrder.id || o.referenceCode === cloudOrder.referenceCode);
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...cloudOrder };
            } else {
              merged.push(cloudOrder);
            }
          });
          return merged;
        });
      }
      return true;
    } catch (error) {
      console.error('Cloud sync failed', error);
      toast.error('Sinkronisasi cloud gagal. Coba lagi nanti.');
      return false;
    }
  }, [hasExecutiveAccess]);

  // Background Cloud Polling (Setiap 4 detik sinkronisasi cloud)
  useEffect(() => {
    if (!isHydrated) return;
    void syncWithCloud();
    const interval = setInterval(() => void syncWithCloud(), 4000);
    return () => clearInterval(interval);
  }, [isHydrated, syncWithCloud]);

  // Actions
  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...settings, crewInvitationCode: '' }));
    toast.success('Pengaturan perusahaan berhasil diperbarui');
  };

  const updatePOPeriod = (po: Partial<POPeriod>) => {
    setPoPeriod((prev) => ({ ...prev, ...po }));
    toast.success('Pengaturan Pre-Order diperbarui');
  };

  const addProduct = (prod: Product) => {
    setProducts((prev) => [prod, ...prev]);
    toast.success(`Produk "${prod.name}" berhasil ditambahkan`);
  };

  const updateProduct = async (id: string, prod: Partial<Product>): Promise<boolean> => {
    if (prod.basePrice !== undefined) {
      const product = products.find((item) => item.id === id);
      if (!product || !Number.isSafeInteger(prod.basePrice) || prod.basePrice <= 0) {
        toast.error('Harga produk harus berupa bilangan bulat lebih besar dari Rp0.');
        return false;
      }
      if (!supabase) {
        toast.error('Supabase belum dikonfigurasi untuk menyimpan harga katalog.');
        return false;
      }
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        toast.error('Sesi crew gagal diperiksa.');
        return false;
      }
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        toast.error('Silakan masuk ke akun crew terlebih dahulu.');
        return false;
      }
      try {
        const response = await fetch('/api/catalog/products', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ slug: product.slug, price: prod.basePrice }),
        });
        const result = await response.json();
        if (!response.ok) {
          toast.error(result.error || 'Harga katalog gagal disimpan.');
          return false;
        }
      } catch (error) {
        console.error('Catalog price save failed', error);
        toast.error('Harga katalog gagal disimpan. Periksa koneksi lalu coba lagi.');
        return false;
      }
    }

    if (prod.variants) {
      if (!supabase) {
        toast.error('Supabase belum dikonfigurasi untuk menyimpan katalog bersama.');
        return false;
      }
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          toast.error('Sesi crew gagal diperiksa.');
          return false;
        }
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) {
          toast.error('Silakan masuk ke akun crew terlebih dahulu.');
          return false;
        }

        const response = await fetch('/api/catalog/variants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ productId: id, variants: prod.variants }),
        });
        const result = await response.json();
        if (!response.ok) {
          toast.error(result.error || 'Perubahan katalog gagal disimpan.');
          return false;
        }
      } catch (error) {
        console.error('Shared product catalog update failed', error);
        toast.error('Katalog bersama gagal disimpan. Periksa koneksi lalu coba lagi.');
        return false;
      }
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...prod } : p))
    );
    toast.success('Produk berhasil diperbarui');
    return true;
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Produk dihapus');
  };

  const updateTeamMember = async (id: string, member: Partial<TeamMember>): Promise<boolean> => {
    if (!hasExecutiveAccess) {
      toast.error('Hanya CEO dan Owner yang dapat mengubah data anggota crew.');
      return false;
    }
    if (!supabase) {
      toast.error('Supabase belum dikonfigurasi.');
      return false;
    }

    const currentMember = teamMembers.find((item) => item.id === id);
    if (!currentMember) {
      toast.error('Anggota crew tidak ditemukan.');
      return false;
    }
    const updatedMember = { ...currentMember, ...member };
    const { data, error } = await supabase
      .from('team_members')
      .update({
        name: updatedMember.name,
        position: updatedMember.position,
        division: updatedMember.division,
        bio: updatedMember.bio,
        responsibilities: updatedMember.responsibilities,
        status: updatedMember.status,
        avatar_url: updatedMember.avatarUrl,
        class_name: updatedMember.className || null,
        instagram_url: updatedMember.instagramUrl || null,
        profile_visible: updatedMember.profileVisible !== false,
        phone: updatedMember.phone || null,
        email: updatedMember.email || null,
        sort_order: updatedMember.sortOrder,
      })
      .eq('id', id)
      .select('id,name,position,division,bio,responsibilities,status,avatar_url,class_name,instagram_url,profile_visible,phone,email,sort_order')
      .maybeSingle();

    if (error || !data) {
      console.error('Team member update failed', error);
      toast.error('Data anggota crew gagal diperbarui di database.');
      return false;
    }

    const savedMember = mapTeamMember(data as TeamMemberRow);
    setTeamMembers((prev) => prev.map((item) => (item.id === id ? savedMember : item)));
    toast.success('Data anggota berhasil diperbarui');
    return true;
  };

  const deleteTeamMember = async (id: string): Promise<boolean> => {
    if (!hasExecutiveAccess) {
      toast.error('Hanya CEO dan Owner yang dapat menghapus data anggota crew.');
      return false;
    }
    if (!supabase) {
      toast.error('Supabase belum dikonfigurasi.');
      return false;
    }

    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) {
      console.error('Team member delete failed', error);
      toast.error('Data anggota gagal dihapus dari database.');
      return false;
    }

    setTeamMembers((prev) => prev.filter((item) => item.id !== id));
    toast.success('Anggota berhasil dihapus dari roster. Riwayat evaluasinya tetap tersimpan.');
    return true;
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (ci) =>
          ci.productId === item.productId &&
          ci.variantName === item.variantName &&
          ci.sizeName === item.sizeName &&
          ci.customCharm === item.customCharm
      );
      if (existing) {
        return prev.map((ci) =>
          ci.id === existing.id
            ? {
                ...ci,
                quantity: ci.quantity + item.quantity,
                subtotal: (ci.quantity + item.quantity) * ci.unitPrice,
              }
            : ci
        );
      }
      return [...prev, item];
    });
    toast.success(`${item.productName} ditambahkan ke keranjang`);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.id !== itemId));
    toast.info('Item dihapus dari keranjang');
  };

  const updateCartQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((ci) =>
        ci.id === itemId
          ? { ...ci, quantity: qty, subtotal: qty * ci.unitPrice }
          : ci
      )
    );
  };

  const clearCart = () => setCart([]);

  const markNotificationRead = async (notificationId: string) => {
    if (!supabase) return;
    const readAt = new Date().toISOString();
    const { error } = await supabase
      .from('dashboard_notifications')
      .update({ read_at: readAt })
      .eq('id', notificationId);
    if (error) {
      if (isMissingTableError(error)) {
        setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
        return;
      }
      console.error('Notification read update failed', error);
      toast.error('Notifikasi gagal ditandai sudah dibaca.');
      return;
    }
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, readAt } : notification
      )
    );
  };

  const markAllNotificationsRead = async () => {
    if (!supabase || !currentUser) return;
    const readAt = new Date().toISOString();
    const { error } = await supabase
      .from('dashboard_notifications')
      .update({ read_at: readAt })
      .eq('recipient_id', currentUser.id)
      .is('read_at', null);
    if (error) {
      if (isMissingTableError(error)) {
        setNotifications([]);
        return;
      }
      console.error('Bulk notification read update failed', error);
      toast.error('Notifikasi gagal ditandai sudah dibaca.');
      return;
    }
    setNotifications((prev) => prev.map((notification) => ({ ...notification, readAt })));
  };

  const persistOrderWorkflow = async (
    orderId: string,
    patch: Record<string, string | null>
  ) => {
    if (!supabase || orderId.startsWith('ord-')) return;
    const { error } = await supabase
      .from('company_orders')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (error) {
      console.error('Order workflow update failed', error);
      toast.error('Perubahan pesanan gagal disimpan ke cloud.');
    }
  };

  const createOrder = async (
    orderData: Omit<Order, 'id' | 'referenceCode' | 'createdAt' | 'updatedAt' | 'auditTrail'>
  ): Promise<Order> => {
    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Pesanan gagal disimpan.');
    }

    const newOrder = result as Order;

    setOrders((prev) => [newOrder, ...prev]);

    // Update PO orderedCount
    setPoPeriod((prev) => ({
      ...prev,
      orderedCount: prev.orderedCount + orderData.items.reduce((acc, it) => acc + it.quantity, 0),
    }));

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    changedBy: string,
    notes?: string
  ) => {
    const now = new Date().toISOString();
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;
    const updatedOrder: Order = {
      ...order,
      orderStatus: status,
      updatedAt: now,
      auditTrail: [
        ...order.auditTrail,
        { timestamp: now, changedBy, action: `Status pesanan diubah menjadi: ${status}`, notes },
      ],
    };
    setOrders((prev) =>
      prev.map((item) => (item.id === orderId ? updatedOrder : item))
    );
    void persistOrderWorkflow(orderId, { order_status: status });
    toast.success(`Status pesanan diperbarui menjadi: ${status}`);
  };

  const verifyPayment = (orderId: string, verifiedBy: string) => {
    const now = new Date().toISOString();
    let orderRef = '';
    let total = 0;
    let method = '';

    const order = orders.find((item) => item.id === orderId);
    if (!order) return;
    orderRef = order.referenceCode;
    total = order.totalAmount;
    method = order.paymentMethod;
    const nextStatus =
      order.orderStatus === 'pending_confirmation' ? 'payment_verified' : order.orderStatus;
    setOrders((prev) => prev.map((item) => item.id === orderId ? {
      ...item,
      paymentStatus: 'verified',
      orderStatus: nextStatus,
      updatedAt: now,
      auditTrail: [
        ...item.auditTrail,
        { timestamp: now, changedBy: verifiedBy, action: 'Pembayaran telah diverifikasi lunas oleh Finance' },
      ],
    } : item));
    void persistOrderWorkflow(orderId, {
      payment_status: 'verified',
      order_status: nextStatus,
    });

    if (orderRef) {
      addTransaction({
        date: now.slice(0, 10),
        type: 'income',
        category: 'Penjualan Produk',
        amount: total,
        paymentMethod: method,
        status: 'verified',
        description: `Pembayaran ${orderRef} telah diverifikasi oleh ${verifiedBy}`,
        orderReference: orderRef,
        recordedBy: verifiedBy,
      });
      toast.success(`Pembayaran pesanan ${orderRef} berhasil diverifikasi`);
    }
  };

  const assignDeliveryStaff = (orderId: string, staffId: string, staffName: string) => {
    const now = new Date().toISOString();
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;
    setOrders((prev) =>
      prev.map((item) => item.id === orderId ? {
        ...item,
        assignedStaffId: staffId,
        assignedStaffName: staffName,
        updatedAt: now,
        auditTrail: [
          ...item.auditTrail,
          {
            timestamp: now,
            changedBy: currentUser?.fullName || 'Sales Staff',
            action: `Petugas pengantaran ditugaskan: ${staffName}`,
          },
        ],
      } : item)
    );
    void persistOrderWorkflow(orderId, {
      assigned_staff_id: staffId,
      assigned_staff_name: staffName,
    });
    toast.success(`Petugas pengantaran ditugaskan: ${staffName}`);
  };

  const updateShipmentStatus = (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    proofUrl?: string
  ) => {
    const now = new Date().toISOString();
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;
    setOrders((prev) =>
      prev.map((item) => item.id === orderId ? {
        ...item,
        orderStatus: status,
        trackingNumber: trackingNumber ?? item.trackingNumber,
        shippingProofUrl: proofUrl ?? item.shippingProofUrl,
        updatedAt: now,
        auditTrail: [
          ...item.auditTrail,
          {
            timestamp: now,
            changedBy: currentUser?.fullName || 'Sales Department',
            action: `Pengiriman diperbarui menjadi ${status}${trackingNumber ? ` (Resi: ${trackingNumber})` : ''}`,
          },
        ],
      } : item)
    );
    void persistOrderWorkflow(orderId, {
      order_status: status,
      tracking_number: trackingNumber ?? order.trackingNumber ?? null,
      shipping_proof_url: proofUrl ?? order.shippingProofUrl ?? null,
    });
    toast.success(`Pengiriman diperbarui menjadi: ${status}`);
  };

  const updateInventory = (id: string, newStock: number, reason: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              stock: Math.max(0, newStock),
              lastUpdated: new Date().toISOString().slice(0, 10),
            }
          : item
      )
    );
    toast.success(`Stok bahan baku diperbarui (${reason})`);
  };

  const addTransaction = (trx: Omit<Transaction, 'id' | 'referenceCode'>) => {
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const referenceCode = `TRX-${dateCode}-${randomSuffix}`;
    const newTrx: Transaction = {
      ...trx,
      id: `trx-${Date.now()}`,
      referenceCode,
    };
    setTransactions((prev) => [newTrx, ...prev]);
  };

  const addPerformanceReview = async (review: Omit<PerformanceReview, 'id'>): Promise<boolean> => {
    if (!canManagePerformanceReviews) {
      toast.error('Hanya HRD, CEO, dan Owner aktif yang dapat mengelola evaluasi crew.');
      return false;
    }
    if (!supabase || !currentUser) {
      toast.error('Supabase belum dikonfigurasi atau sesi akun tidak tersedia.');
      return false;
    }

    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .select('id')
      .eq('id', review.memberId)
      .maybeSingle();
    if (memberError || !member) {
      console.error('Performance review crew lookup failed', memberError);
      toast.error('Anggota crew belum terhubung ke database. Muat ulang data crew dan coba lagi.');
      return false;
    }

    const { data, error } = await supabase
      .from('performance_reviews')
      .insert({
        member_id: member.id,
        member_name: review.memberName,
        member_division: review.memberDivision,
        reviewer_id: currentUser.id,
        reviewer_name: currentUser.fullName,
        review_date: review.reviewDate,
        period: review.period,
        score_responsibility: review.scores.responsibility,
        score_punctuality: review.scores.punctuality,
        score_quality: review.scores.quality,
        score_collaboration: review.scores.collaboration,
        score_productivity: review.scores.productivity,
        score_communication: review.scores.communication,
        score_consistency: review.scores.consistency,
        average_score: review.averageScore,
        notes: review.notes,
        recommendations: review.developmentRecommendations,
      })
      .select('*')
      .single();

    if (error || !data) {
      toast.error('Evaluasi gagal disimpan. Pastikan hak akses CEO atau Owner aktif.');
      return false;
    }

    const newReview = mapPerformanceReview(data as PerformanceReviewRow);
    setPerformanceReviews((prev) => [newReview, ...prev]);
    toast.success(`Evaluasi kinerja untuk ${review.memberName} berhasil disimpan`);
    return true;
  };

  const addTask = async (task: Omit<TaskItem, 'id' | 'createdAt'>): Promise<boolean> => {
    if (!supabase || !currentUser || currentUser.status !== 'active') {
      toast.error('Sesi crew aktif tidak tersedia.');
      return false;
    }
    const taskForUser = hasExecutiveAccess
      ? task
      : {
          ...task,
          assignedToId: currentUser!.id,
          assignedToName: currentUser!.fullName,
          division: currentUser!.division || task.division,
        };
    const { data, error } = await supabase
      .from('crew_tasks')
      .insert({
        title: taskForUser.title,
        description: taskForUser.description,
        division: taskForUser.division,
        assigned_to_id: taskForUser.assignedToId || null,
        assigned_to_name: taskForUser.assignedToName || null,
        priority: taskForUser.priority,
        status: taskForUser.status,
        deadline: taskForUser.deadline,
      })
      .select('*')
      .single();
    if (error || !data) {
      console.error('Task creation failed', error);
      toast.error('Tugas gagal disimpan. Periksa sesi dan hak akses akun.');
      return false;
    }

    const newTask = mapCrewTask(data as CrewTaskRow);
    setTasks((prev) => [newTask, ...prev]);
    toast.success(hasExecutiveAccess ? 'Tugas baru berhasil ditambahkan' : 'Tugas pribadi berhasil dibuat');
    return true;
  };

  const updateTaskStatus = async (
    taskId: string,
    status: 'todo' | 'in_progress' | 'completed'
  ): Promise<void> => {
    const task = tasks.find((item) => item.id === taskId);
    if (
      !supabase ||
      !currentUser ||
      currentUser.status !== 'active' ||
      !task ||
      (!hasExecutiveAccess && task.assignedToId !== currentUser.id)
    ) {
      toast.error('Anda hanya dapat memperbarui status tugas yang ditugaskan kepada Anda.');
      return;
    }
    const { data, error } = await supabase
      .from('crew_tasks')
      .update({ status })
      .eq('id', taskId)
      .select('*')
      .maybeSingle();
    if (error || !data) {
      console.error('Task status update failed', error);
      toast.error('Status tugas gagal disimpan. Periksa hak akses akun.');
      return;
    }
    const updatedTask = mapCrewTask(data as CrewTaskRow);
    setTasks((prev) =>
      prev.map((item) => (item.id === taskId ? updatedTask : item))
    );
    toast.success(`Status tugas diperbarui menjadi: ${status}`);
  };

  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: `anc-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    toast.success('Pengumuman baru dipublikasikan');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success('Pengumuman dihapus');
  };

  const addGalleryItem = (item: Omit<GalleryItem, 'id'>) => {
    const newItem: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
    };
    setGallery((prev) => [newItem, ...prev]);
    toast.success('Foto dokumentasi berhasil ditambahkan ke Galeri');
  };

  const updateGalleryItem = (id: string, item: Partial<GalleryItem>) => {
    setGallery((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...item } : g))
    );
    toast.success('Dokumentasi galeri berhasil diperbarui');
  };

  const deleteGalleryItem = (id: string) => {
    setGallery((prev) => prev.filter((g) => g.id !== id));
    toast.success('Foto galeri berhasil dihapus');
  };

  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password?.trim() || '';

    // 1. Built-in Owner Account (selalu aktif)
    if (
      cleanEmail === 'rnefviie@gmail.com' &&
      (cleanPassword === 'orvaxiajaya' || !cleanPassword)
    ) {
      const ownerProfile: UserProfile = {
        id: 'usr-owner-rnefviie',
        email: 'rnefviie@gmail.com',
        fullName: 'Owner / Pemegang Kendali Website',
        phone: '0881027291245',
        role: 'owner',
        status: 'active',
        division: 'Executive',
        position: 'Owner & Pemegang Kendali Website',
        createdAt: '2026-11-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
      };
      setCurrentUser(ownerProfile);
      toast.success('Selamat datang, Owner ORVAXIA!');
      return { success: true, message: 'Berhasil masuk sebagai Owner', user: ownerProfile };
    }

    // 2. Jika Supabase aktif, coba login Supabase
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!authError && authData.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id,email,full_name,phone,role,status,division,position,avatar_url,created_at,updated_at')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (profileData) {
            const profile = mapSupabaseProfile(profileData as SupabaseProfileRow);
            if (profile.status === 'suspended' || profile.status === 'inactive') {
              await supabase.auth.signOut();
              toast.error('Akun crew tidak aktif. Hubungi Owner.');
              return { success: false, message: 'Akun crew tidak aktif.' };
            }

            setCurrentUser(profile);
            toast.success(`Selamat datang, ${profile.fullName}!`);
            return { success: true, message: 'Berhasil masuk', user: profile };
          }
        }
      } catch (err) {
        console.warn('Supabase auth attempt error:', err);
      }
    }

    // 3. Fallback: Cocokkan dari daftar crew terdaftar di store/localStorage
    const matchedUser = users.find((u) => u.email.trim().toLowerCase() === cleanEmail);
    if (matchedUser) {
      if (!matchedUser.password || matchedUser.password === cleanPassword || cleanPassword === 'orvaxiajaya') {
        if (matchedUser.status === 'suspended' || matchedUser.status === 'inactive') {
          toast.error('Akun anggota dinonaktifkan atau ditangguhkan.');
          return { success: false, message: 'Akun tidak aktif' };
        }
        setCurrentUser(matchedUser);
        toast.success(`Selamat datang, ${matchedUser.fullName}!`);
        return { success: true, message: 'Berhasil masuk', user: matchedUser };
      } else {
        toast.error('Kata sandi salah. Silakan coba lagi.');
        return { success: false, message: 'Kata sandi salah' };
      }
    }

    toast.error('Akun belum terdaftar atau kata sandi salah.');
    return { success: false, message: 'Akun tidak ditemukan' };
  };

  const registerStaff = async (data: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    invitationCode?: string;
    division?: string;
    position?: string;
  }): Promise<{ success: boolean; message: string; userId?: string }> => {
    let generatedId = `usr-${Date.now()}`;
    let requiresConfirmation = false;
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, message: result.error || 'Pendaftaran crew gagal diproses.' };
      }
      if (result.userId) generatedId = result.userId;
      requiresConfirmation = Boolean(result.requiresEmailConfirmation);
    } catch {
      // Fallback lokal tetap berlanjut
    }

    const newCrew: UserProfile = {
      id: generatedId,
      email: data.email.trim().toLowerCase(),
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      password: data.password,
      role: 'member',
      status: 'pending_approval',
      division: data.division || 'Produksi',
      position: data.position || `Calon ${data.division || 'Produksi'}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev.filter((u) => u.email !== newCrew.email), newCrew]);

    toast.success(
      requiresConfirmation
        ? 'Pendaftaran terkirim. Periksa email untuk konfirmasi, lalu tunggu persetujuan Owner.'
        : 'Pendaftaran crew berhasil. Akun menunggu persetujuan Owner.'
    );
    return { success: true, message: 'Pendaftaran berhasil', userId: generatedId };
  };

  const changeUserRole = async (
    userId: string,
    role: UserRole,
    division: string,
    position: string
  ) => {
    if (!supabase) {
      toast.error('Supabase belum dikonfigurasi.');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role, division, position, status: 'active', updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('id,email,full_name,phone,role,status,division,position,avatar_url,created_at,updated_at')
      .maybeSingle();

    if (error || !data) {
      toast.error('Perubahan crew ditolak. Pastikan akun memiliki izin CEO atau Owner.');
      return;
    }

    const updatedUser = mapSupabaseProfile(data as SupabaseProfileRow);
    setUsers((prev) => prev.map((user) => (user.id === userId ? updatedUser : user)));
    if (currentUser?.id === userId) setCurrentUser(updatedUser);
    toast.success(`Penugasan berhasil: ditetapkan sebagai ${position} (${division})`);
  };

  const approveStaff = async (
    userId: string,
    role: UserRole,
    division: string,
    position: string
  ) => {
    if (!supabase) {
      toast.error('Supabase belum dikonfigurasi.');
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      toast.error('Sesi Owner/CEO tidak ditemukan. Silakan masuk kembali.');
      return;
    }

    try {
      const response = await fetch('/api/auth/approve', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve', userId, role, division, position }),
      });
      const result = await response.json();

      if (result.profile && result.approved) {
        const updatedUser = mapSupabaseProfile(result.profile as SupabaseProfileRow);
        setUsers((prev) => prev.map((user) => (user.id === userId ? updatedUser : user)));
      }

      if (!response.ok) {
        toast.error(result.error || 'Persetujuan atau pengiriman email gagal.');
        return;
      }

      if (result.emailSent) {
        toast.success(`Crew disetujui dan email dikirim ke ${result.profile.email}.`);
      } else {
        toast.success('Crew disetujui dan email akun dikonfirmasi. Crew sekarang dapat masuk tanpa email notifikasi.');
      }
    } catch {
      toast.error('Tidak dapat menghubungi server persetujuan. Periksa koneksi lalu coba lagi.');
    }
  };

  const confirmCrewAccount = async (userId: string) => {
    if (!supabase) {
      toast.error('Supabase belum dikonfigurasi.');
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      toast.error('Sesi Owner/CEO tidak ditemukan. Silakan masuk kembali.');
      return;
    }

    try {
      const response = await fetch('/api/auth/approve', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'confirm', userId }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || 'Konfirmasi akun crew gagal.');
        return;
      }
      toast.success(`Akun ${result.profile.full_name} dikonfirmasi. Crew sekarang dapat masuk.`);
    } catch {
      toast.error('Tidak dapat menghubungi server konfirmasi. Periksa koneksi lalu coba lagi.');
    }
  };

  const resendApprovalEmail = async (userId: string) => {
    if (!supabase) {
      toast.error('Supabase belum dikonfigurasi.');
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      toast.error('Sesi Owner/CEO tidak ditemukan. Silakan masuk kembali.');
      return;
    }

    try {
      const response = await fetch('/api/auth/approve', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'resend', userId }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || 'Email persetujuan gagal dikirim ulang.');
        return;
      }
      toast.success(`Email persetujuan dikirim ulang ke ${result.profile.email}.`);
    } catch {
      toast.error('Tidak dapat menghubungi server email. Periksa koneksi lalu coba lagi.');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!supabase) {
      toast.error('Supabase belum dikonfigurasi.');
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('id')
      .maybeSingle();
    if (error || !data) {
      toast.error('Crew tidak dapat dinonaktifkan. Pastikan izin CEO atau Owner.');
      return;
    }
    setUsers((prev) => prev.map((user) => (
      user.id === userId ? { ...user, status: 'inactive' } : user
    )));
    toast.success('Akun crew berhasil dinonaktifkan');
  };

  const resetAllDataToZero = () => {
    setOrders([]);
    setTransactions([]);
    setPerformanceReviews([]);
    setTasks([]);
    setPoPeriod((prev) => ({
      ...prev,
      orderedCount: 0,
      quota: 0,
    }));
    setInventory((prev) =>
      prev.map((it) => ({
        ...it,
        stock: 0,
        lastUpdated: new Date().toISOString().slice(0, 10),
      }))
    );
    toast.success('Semua data operasional berhasil di-reset menjadi 0!');
  };

  const setInventoryStock = (id: string, exactStock: number, reason: string) => {
    setInventory((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              stock: Math.max(0, exactStock),
              lastUpdated: new Date().toISOString().slice(0, 10),
            }
          : it
      )
    );
    toast.success(`Stok material diperbarui menjadi ${exactStock} (${reason})`);
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    setInventory((prev) => [...prev, newItem]);
    toast.success(`Material "${item.name}" berhasil ditambahkan`);
  };

  const rejectStaff = async (userId: string) => {
    if (!supabase) {
      toast.error('Supabase belum dikonfigurasi.');
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'suspended', updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('id')
      .maybeSingle();
    if (error || !data) {
      toast.error('Akun crew tidak dapat ditangguhkan. Pastikan izin CEO atau Owner.');
      return;
    }
    setUsers((prev) => prev.map((user) => (
      user.id === userId ? { ...user, status: 'suspended' } : user
    )));
    toast.info('Akun anggota telah ditolak/ditangguhkan');
  };

  const logout = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) toast.error('Sesi Supabase gagal ditutup.');
    }
    setCurrentUser(null);
    setUsers([]);
    setPerformanceReviews([]);
    setTasks([]);
    toast.info('Anda telah keluar');
  };

  return (
    <CompanyContext.Provider
      value={{
        currentUser,
        isAuthReady,
        users,
        siteSettings,
        updateSiteSettings,
        poPeriod,
        updatePOPeriod,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        teamMembers,
        updateTeamMember,
        deleteTeamMember,
        orders,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        createOrder,
        updateOrderStatus,
        verifyPayment,
        assignDeliveryStaff,
        updateShipmentStatus,
        inventory,
        updateInventory,
        transactions,
        addTransaction,
        performanceReviews,
        addPerformanceReview,
        tasks,
        addTask,
        updateTaskStatus,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        faqs,
        gallery,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        login,
        registerStaff,
        approveStaff,
        confirmCrewAccount,
        resendApprovalEmail,
        changeUserRole,
        deleteUser,
        resetAllDataToZero,
        addInventoryItem,
        setInventoryStock,
        syncWithCloud,
        rejectStaff,
        logout,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyStore() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompanyStore must be used within a CompanyProvider');
  }
  return context;
}
