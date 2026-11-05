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
  PaymentStatus,
  UserRole,
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
  users: UserProfile[];
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  poPeriod: POPeriod;
  updatePOPeriod: (po: Partial<POPeriod>) => void;
  products: Product[];
  addProduct: (prod: Product) => void;
  updateProduct: (id: string, prod: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  teamMembers: TeamMember[];
  updateTeamMember: (id: string, member: Partial<TeamMember>) => Promise<void>;
  orders: Order[];
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

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    ...INITIAL_SITE_SETTINGS,
    crewInvitationCode: '',
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
  const [gallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [cart, setCart] = useState<CartItem[]>([]);
  const hasExecutiveAccess =
    currentUser?.status === 'active' &&
    (currentUser.role === 'owner' || currentUser.role === 'ceo');

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
            crewInvitationCode: '',
          });
        }
        if (parsed.poPeriod) setPoPeriod(parsed.poPeriod);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.announcements) setAnnouncements(parsed.announcements);
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
    if (!supabase) {
      setCurrentUser(null);
      setUsers([]);
      setPerformanceReviews([]);
      setTasks([]);
      return;
    }

    let active = true;
    const authClient = supabase;
    const loadTeamMembers = async (isExecutive: boolean) => {
      const { data: rows, error } = await authClient
        .from('team_members')
        .select('id,name,position,division,bio,responsibilities,status,avatar_url,phone,email,sort_order')
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

      const { data: seededRows, error: seedError } = await authClient
        .from('team_members')
        .insert(
          INITIAL_TEAM_MEMBERS.map((member) => ({
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
          }))
        )
        .select('id,name,position,division,bio,responsibilities,status,avatar_url,phone,email,sort_order');

      if (!active) return;
      if (seedError) {
        console.error('Initial team roster seed failed', seedError);
        toast.error('Data awal anggota crew gagal disimpan ke database.');
        return;
      }
      setTeamMembers((seededRows || []).map((row) => mapTeamMember(row as TeamMemberRow)));
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
      await loadTeamMembers(isExecutive);
      if (!active) return;
      if (!isExecutive) {
        setPerformanceReviews([]);
      }
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

      if (!isExecutive) return;
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
        return;
      }
      void loadProfile(data.session?.user.id || null);
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

  const updateProduct = (id: string, prod: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...prod } : p))
    );
    toast.success('Produk berhasil diperbarui');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Produk dihapus');
  };

  const updateTeamMember = async (id: string, member: Partial<TeamMember>) => {
    if (!hasExecutiveAccess) {
      toast.error('Hanya CEO dan Owner yang dapat mengubah data anggota crew.');
      return;
    }
    if (!supabase) {
      toast.error('Supabase belum dikonfigurasi.');
      return;
    }

    const currentMember = teamMembers.find((item) => item.id === id);
    if (!currentMember) {
      toast.error('Anggota crew tidak ditemukan.');
      return;
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
        phone: updatedMember.phone || null,
        email: updatedMember.email || null,
        sort_order: updatedMember.sortOrder,
      })
      .eq('id', id)
      .select('id,name,position,division,bio,responsibilities,status,avatar_url,phone,email,sort_order')
      .maybeSingle();

    if (error || !data) {
      console.error('Team member update failed', error);
      toast.error('Data anggota crew gagal diperbarui di database.');
      return;
    }

    const savedMember = mapTeamMember(data as TeamMemberRow);
    setTeamMembers((prev) => prev.map((item) => (item.id === id ? savedMember : item)));
    toast.success('Data anggota berhasil diperbarui');
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

  const createOrder = async (
    orderData: Omit<Order, 'id' | 'referenceCode' | 'createdAt' | 'updatedAt' | 'auditTrail'>
  ): Promise<Order> => {
    const timestamp = new Date().toISOString();
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `ORV-${dateCode}-${randomSuffix}`;

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      referenceCode,
      createdAt: timestamp,
      updatedAt: timestamp,
      auditTrail: [
        {
          timestamp,
          changedBy: `${orderData.customerName} (Customer)`,
          action: 'Pemesanan berhasil disimpan di sistem',
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update PO orderedCount
    setPoPeriod((prev) => ({
      ...prev,
      orderedCount: prev.orderedCount + orderData.items.reduce((acc, it) => acc + it.quantity, 0),
    }));

    // If external online payment and auto-verified (e.g. simulation), record transaction
    if (orderData.paymentStatus === 'verified') {
      addTransaction({
        date: timestamp.slice(0, 10),
        type: 'income',
        category: 'Penjualan Produk',
        amount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        status: 'verified',
        description: `Pembayaran pesanan ${referenceCode} a.n ${orderData.customerName}`,
        orderReference: referenceCode,
        recordedBy: 'Payment Gateway Auto Settlement',
      });
    }

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
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            orderStatus: status,
            updatedAt: now,
            auditTrail: [
              ...ord.auditTrail,
              {
                timestamp: now,
                changedBy,
                action: `Status pesanan diubah menjadi: ${status}`,
                notes,
              },
            ],
          };
        }
        return ord;
      })
    );
    toast.success(`Status pesanan diperbarui menjadi: ${status}`);
  };

  const verifyPayment = (orderId: string, verifiedBy: string) => {
    const now = new Date().toISOString();
    let orderRef = '';
    let total = 0;
    let customer = '';
    let method = '';

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          orderRef = ord.referenceCode;
          total = ord.totalAmount;
          customer = ord.customerName;
          method = ord.paymentMethod;
          return {
            ...ord,
            paymentStatus: 'verified' as PaymentStatus,
            orderStatus:
              ord.orderStatus === 'pending_confirmation'
                ? ('payment_verified' as OrderStatus)
                : ord.orderStatus,
            updatedAt: now,
            auditTrail: [
              ...ord.auditTrail,
              {
                timestamp: now,
                changedBy: verifiedBy,
                action: 'Pembayaran telah diverifikasi lunas oleh Finance',
              },
            ],
          };
        }
        return ord;
      })
    );

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
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            assignedStaffId: staffId,
            assignedStaffName: staffName,
            updatedAt: now,
            auditTrail: [
              ...ord.auditTrail,
              {
                timestamp: now,
                changedBy: currentUser?.fullName || 'Sales Staff',
                action: `Petugas pengantaran ditugaskan: ${staffName}`,
              },
            ],
          };
        }
        return ord;
      })
    );
    toast.success(`Petugas pengantaran ditugaskan: ${staffName}`);
  };

  const updateShipmentStatus = (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    proofUrl?: string
  ) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            orderStatus: status,
            trackingNumber: trackingNumber ?? ord.trackingNumber,
            shippingProofUrl: proofUrl ?? ord.shippingProofUrl,
            updatedAt: now,
            auditTrail: [
              ...ord.auditTrail,
              {
                timestamp: now,
                changedBy: currentUser?.fullName || 'Sales Department',
                action: `Pengiriman diperbarui menjadi ${status}${trackingNumber ? ` (Resi: ${trackingNumber})` : ''}`,
              },
            ],
          };
        }
        return ord;
      })
    );
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
    if (!hasExecutiveAccess) {
      toast.error('Hanya CEO dan Owner yang dapat mengelola evaluasi crew.');
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

  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!supabase) {
      toast.error('Login crew belum dikonfigurasi oleh administrator.');
      return { success: false, message: 'Supabase Auth belum dikonfigurasi.' };
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password || '',
    });
    if (authError || !authData.user) {
      const errorCode = authError && 'code' in authError ? authError.code : undefined;
      const message =
        errorCode === 'email_not_confirmed'
          ? 'Email akun belum dikonfirmasi. Periksa inbox atau minta tautan konfirmasi baru.'
          : authError?.name === 'AuthRetryableFetchError'
            ? 'Layanan login tidak dapat dijangkau. Periksa koneksi atau konfigurasi Supabase.'
            : 'Supabase Auth menolak login. Pastikan akun terdaftar pada proyek Supabase ini dan kata sandinya benar. Jika perlu, gunakan “Lupa kata sandi?”.';
      toast.error(message);
      return { success: false, message };
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id,email,full_name,phone,role,status,division,position,avatar_url,created_at,updated_at')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError || !profileData) {
      await supabase.auth.signOut();
      toast.error('Profil crew belum siap. Hubungi Owner untuk bantuan.');
      return { success: false, message: 'Profil crew belum ditemukan.' };
    }

    const profile = mapSupabaseProfile(profileData as SupabaseProfileRow);
    if (profile.status === 'suspended' || profile.status === 'inactive') {
      await supabase.auth.signOut();
      toast.error('Akun crew tidak aktif. Hubungi Owner.');
      return { success: false, message: 'Akun crew tidak aktif.' };
    }

    setCurrentUser(profile);
    toast.success(`Selamat datang, ${profile.fullName}!`);
    return { success: true, message: 'Berhasil masuk', user: profile };
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
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || 'Pendaftaran crew gagal diproses.');
        return { success: false, message: result.error || 'Pendaftaran crew gagal diproses.' };
      }

      toast.success(
        result.requiresEmailConfirmation
          ? 'Pendaftaran terkirim. Periksa email untuk konfirmasi, lalu tunggu persetujuan Owner.'
          : 'Pendaftaran crew berhasil. Akun menunggu persetujuan Owner.'
      );
      return { success: true, message: 'Pendaftaran berhasil', userId: result.userId };
    } catch {
      toast.error('Tidak dapat terhubung ke server pendaftaran.');
      return { success: false, message: 'Tidak dapat terhubung ke server pendaftaran.' };
    }
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
        orders,
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
