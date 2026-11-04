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
  loginAs: (role: UserRole) => void;
  registerStaff: (data: { fullName: string; email: string; phone: string; division: string; position: string }) => void;
  approveStaff: (userId: string, role: UserRole, division: string, position: string) => void;
  rejectStaff: (userId: string) => void;
  logout: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const STORAGE_KEY = 'orvaxia_company_db_v1';
const CART_STORAGE_KEY = 'orvaxia_cart_v1';

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(INITIAL_USERS[0]); // Default to Owner for full inspection
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
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.siteSettings) setSiteSettings(parsed.siteSettings);
        if (parsed.poPeriod) setPoPeriod(parsed.poPeriod);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.teamMembers) setTeamMembers(parsed.teamMembers);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.performanceReviews) setPerformanceReviews(parsed.performanceReviews);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.announcements) setAnnouncements(parsed.announcements);
        if (parsed.currentUser) setCurrentUser(parsed.currentUser);
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

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {}
  }, [isHydrated, cart]);

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
    division: string;
    position: string;
  }) => {
    const newProfile: UserProfile = {
      id: `usr-reg-${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      role: 'member',
      status: 'pending_approval',
      division: data.division,
      position: data.position,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newProfile]);
    toast.success('Pendaftaran staf berhasil diajukan! Menunggu persetujuan Owner.');
  };

  const approveStaff = (
    userId: string,
    role: UserRole,
    division: string,
    position: string
  ) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: 'active' as const,
              role,
              division,
              position,
              updatedAt: new Date().toISOString(),
            }
          : u
      )
    );
    toast.success('Akun anggota disetujui dan role resmi telah ditetapkan');
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
        loginAs,
        registerStaff,
        approveStaff,
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
