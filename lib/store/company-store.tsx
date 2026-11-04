'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
import {
  INITIAL_SITE_SETTINGS,
  INITIAL_PO_PERIOD,
  INITIAL_PRODUCTS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_TRANSACTIONS,
  INITIAL_PERFORMANCE_REVIEWS,
  INITIAL_TASKS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_FAQS,
  INITIAL_GALLERY,
  INITIAL_USERS,
} from '@/lib/data/initial-data';
import { toast } from 'sonner';

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
  setCurrentUser: (user: UserProfile | null) => void;
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
  updateTeamMember: (id: string, member: Partial<TeamMember>) => void;
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
  addPerformanceReview: (review: Omit<PerformanceReview, 'id'>) => void;
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (taskId: string, status: 'todo' | 'in_progress' | 'completed') => void;
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
  login: (email: string, password?: string) => { success: boolean; message: string; user?: UserProfile };
  loginAs: (role: UserRole) => void;
  registerStaff: (data: { fullName: string; email: string; phone: string; password?: string; invitationCode?: string; division?: string; position?: string }) => { success: boolean; message: string; user?: UserProfile };
  approveStaff: (userId: string, role: UserRole, division: string, position: string) => void;
  changeUserRole: (userId: string, role: UserRole, division: string, position: string) => void;
  rejectStaff: (userId: string) => void;
  deleteUser: (userId: string) => void;
  resetAllDataToZero: () => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  setInventoryStock: (id: string, exactStock: number, reason: string) => void;
  syncWithCloud: () => Promise<void>;
  logout: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const STORAGE_KEY = 'orvaxia_company_db_v3';
const CART_STORAGE_KEY = 'orvaxia_cart_v3';

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [poPeriod, setPoPeriod] = useState<POPeriod>(INITIAL_PO_PERIOD);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(INITIAL_PERFORMANCE_REVIEWS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [faqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [gallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [cart, setCart] = useState<CartItem[]>([]);

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
        let loadedUsers: UserProfile[] = parsed.users || INITIAL_USERS;
        const ownerExists = loadedUsers.some(
          (u) => u.email.toLowerCase() === 'rnefviie@gmail.com'
        );
        if (!ownerExists) {
          loadedUsers = [INITIAL_USERS[0], ...loadedUsers];
        } else {
          loadedUsers = loadedUsers.map((u) => {
            if (u.email.toLowerCase() === 'rnefviie@gmail.com') {
              return {
                ...u,
                role: 'owner' as const,
                status: 'active' as const,
                password: 'orvaxiajaya',
              };
            }
            return u;
          });
        }
        setUsers(loadedUsers);
        if (parsed.siteSettings) {
          setSiteSettings({
            ...parsed.siteSettings,
            crewInvitationCode: parsed.siteSettings.crewInvitationCode || 'ORVAXIA2026',
          });
        }
        if (parsed.poPeriod) setPoPeriod(parsed.poPeriod);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.teamMembers) setTeamMembers(parsed.teamMembers);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.performanceReviews) setPerformanceReviews(parsed.performanceReviews);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.announcements) setAnnouncements(parsed.announcements);
        if (parsed.currentUser) {
          const matched = loadedUsers.find(
            (u) =>
              u.id === parsed.currentUser.id ||
              u.email.toLowerCase() === parsed.currentUser.email.toLowerCase()
          );
          setCurrentUser(matched || parsed.currentUser);
        }
      } else {
        setUsers(INITIAL_USERS);
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

  // Save to LocalStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const stateToSave = {
        users,
        siteSettings,
        poPeriod,
        products,
        teamMembers,
        orders,
        inventory,
        transactions,
        performanceReviews,
        tasks,
        announcements,
        currentUser,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // quota limit fallback
    }
  }, [
    isHydrated,
    users,
    siteSettings,
    poPeriod,
    products,
    teamMembers,
    orders,
    inventory,
    transactions,
    performanceReviews,
    tasks,
    announcements,
    currentUser,
  ]);

  // Cloud Sync Handler
  const syncWithCloud = async () => {
    try {
      const res = await fetch('/api/cloud-sync', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();

      if (data && Array.isArray(data.users) && data.users.length > 0) {
        setUsers((prev) => {
          let merged = [...prev];
          data.users.forEach((cloudUser: UserProfile) => {
            const idx = merged.findIndex(
              (u) =>
                u.id === cloudUser.id ||
                (u.email && cloudUser.email && u.email.toLowerCase() === cloudUser.email.toLowerCase())
            );
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...cloudUser };
            } else {
              merged.push(cloudUser);
            }
          });
          return merged;
        });
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
    } catch {}
  };

  // Background Cloud Polling (Setiap 4 detik sinkronisasi cloud)
  useEffect(() => {
    if (!isHydrated) return;
    syncWithCloud();
    const interval = setInterval(syncWithCloud, 4000);
    return () => clearInterval(interval);
  }, [isHydrated]);

  // Actions
  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...settings }));
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

  const updateTeamMember = (id: string, member: Partial<TeamMember>) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...member } : m))
    );
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

  const addPerformanceReview = (review: Omit<PerformanceReview, 'id'>) => {
    const newReview: PerformanceReview = {
      ...review,
      id: `rev-${Date.now()}`,
    };
    setPerformanceReviews((prev) => [newReview, ...prev]);
    toast.success(`Evaluasi kinerja untuk ${review.memberName} berhasil disimpan`);
  };

  const addTask = (task: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...task,
      id: `tsk-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTasks((prev) => [newTask, ...prev]);
    toast.success('Tugas baru berhasil ditambahkan');
  };

  const updateTaskStatus = (taskId: string, status: 'todo' | 'in_progress' | 'completed') => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
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

  const login = (
    email: string,
    password?: string
  ): { success: boolean; message: string; user?: UserProfile } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // Check if Owner login:
    if (cleanEmail === 'rnefviie@gmail.com') {
      if (cleanPassword !== 'orvaxiajaya') {
        toast.error('Kata sandi Owner tidak sesuai');
        return { success: false, message: 'Kata sandi Owner salah!' };
      }
      let ownerUser = users.find((u) => u.email.toLowerCase() === 'rnefviie@gmail.com');
      if (!ownerUser) {
        ownerUser = INITIAL_USERS[0];
        setUsers((prev) => [ownerUser!, ...prev.filter((u) => u.email.toLowerCase() !== 'rnefviie@gmail.com')]);
      }
      setCurrentUser(ownerUser);
      toast.success('Selamat datang kembali, Pemegang Kendali Website (Owner)!');
      return { success: true, message: 'Berhasil masuk sebagai Owner', user: ownerUser };
    }

    // Check crew users
    const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!foundUser) {
      toast.error('Email ini belum terdaftar sebagai Crew');
      return {
        success: false,
        message: 'Email pribadi belum terdaftar. Silakan pilih tab "Daftar Akun Crew" untuk mendaftar.',
      };
    }

    if (foundUser.password && cleanPassword && foundUser.password !== cleanPassword) {
      toast.error('Kata sandi tidak sesuai');
      return { success: false, message: 'Kata sandi tidak sesuai. Silakan periksa kembali.' };
    }

    setCurrentUser(foundUser);
    toast.success(`Selamat datang, ${foundUser.fullName}!`);
    return { success: true, message: 'Berhasil masuk', user: foundUser };
  };

  const loginAs = (role: UserRole) => {
    const matched = users.find((u) => u.role === role && u.status === 'active');
    if (matched) {
      setCurrentUser(matched);
      toast.success(`Beralih peran sebagai: ${matched.position || matched.role.toUpperCase()}`);
    } else {
      // Create temporary active user for that role if not found
      const tempUser: UserProfile = {
        id: `usr-${role}`,
        email: `${role}@orvaxia.com`,
        fullName: `Akun ${role.toUpperCase()} Orvaxia`,
        phone: '0881027291245',
        role,
        status: 'active',
        division: role === 'ceo' ? 'Executive' : role.toUpperCase(),
        position: `${role.toUpperCase()} Officer`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentUser(tempUser);
      toast.success(`Masuk sebagai: ${role.toUpperCase()}`);
    }
  };

  const registerStaff = (data: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    invitationCode?: string;
    division?: string;
    position?: string;
  }): { success: boolean; message: string; user?: UserProfile } => {
    // 1. Verify Secret Invitation Code from Owner
    const expectedCode = (siteSettings.crewInvitationCode || 'ORVAXIA2026').trim().toUpperCase();
    const providedCode = (data.invitationCode || '').trim().toUpperCase();

    if (!providedCode || providedCode !== expectedCode) {
      toast.error('Kode khusus Owner salah! Hanya kru resmi dengan kode yang dapat mendaftar.');
      return {
        success: false,
        message: 'Kode khusus tidak valid. Kode pendaftaran crew hanya diberikan oleh Owner.',
      };
    }

    const cleanEmail = data.email.trim().toLowerCase();

    if (cleanEmail === 'rnefviie@gmail.com') {
      toast.error('Email rnefviie@gmail.com adalah akun Owner. Silakan login dengan kata sandi orvaxiajaya.');
      return {
        success: false,
        message: 'Email ini milik akun Owner.',
      };
    }

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      toast.error('Email ini sudah terdaftar. Silakan masuk menggunakan kata sandi Anda.');
      return {
        success: false,
        message: 'Email ini sudah terdaftar.',
      };
    }

    const newProfile: UserProfile = {
      id: `usr-reg-${Date.now()}`,
      email: data.email.trim(),
      password: data.password || 'orvaxia123',
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      role: 'member',
      status: 'pending_approval',
      division: data.division || 'Menunggu Arahan',
      position: data.position || 'Crew Baru (Pending)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newProfile]);
    setCurrentUser(newProfile);

    // Langsung simpan akun ke Cloud Database secara realtime
    try {
      fetch('/api/cloud-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: [newProfile] }),
      }).catch(() => {});
    } catch {}

    toast.success('Pendaftaran staf berhasil diajukan! Menunggu arahan & penugasan dari Owner.');
    return { success: true, message: 'Pendaftaran berhasil', user: newProfile };
  };

  const changeUserRole = (
    userId: string,
    role: UserRole,
    division: string,
    position: string
  ) => {
    const now = new Date().toISOString();
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated: UserProfile = {
            ...u,
            status: 'active',
            role,
            division,
            position,
            updatedAt: now,
          };
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    // Sinkronisasi status aktif kru ke Cloud
    try {
      fetch('/api/cloud-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: [{ id: userId, role, division, position, status: 'active' }],
        }),
      }).catch(() => {});
    } catch {}

    toast.success(`Penugasan berhasil: ditetapkan sebagai ${position} (${division})`);
  };

  const approveStaff = (
    userId: string,
    role: UserRole,
    division: string,
    position: string
  ) => {
    changeUserRole(userId, role, division, position);
  };

  const deleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target?.email.toLowerCase() === 'rnefviie@gmail.com') {
      toast.error('Akun Owner utama tidak dapat dihapus!');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    toast.success('Akun crew berhasil dihapus');
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

  const rejectStaff = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: 'suspended' as const,
              updatedAt: new Date().toISOString(),
            }
          : u
      )
    );
    toast.info('Akun anggota telah ditolak/ditangguhkan');
  };

  const logout = () => {
    setCurrentUser(null);
    toast.info('Anda telah keluar');
  };

  return (
    <CompanyContext.Provider
      value={{
        currentUser,
        setCurrentUser,
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
        loginAs,
        registerStaff,
        approveStaff,
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
