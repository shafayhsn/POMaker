/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy, addDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { UserProfile, UserRole, PurchaseOrder } from './types';
import { Toaster, toast } from 'sonner';
import { POList } from './components/POList';
import { PODetail } from './components/PODetail';
import { POPrint } from './components/POPrint';
import { generateVerificationCode, generatePONumber } from './lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Briefcase, 
  Library, 
  History, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Bell, 
  ChevronRight,
  ShieldAlert,
  TrendingUp,
  Package,
  CheckCircle2,
  UserPlus
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { ScrollArea } from './components/ui/scroll-area';
import { Separator } from './components/ui/separator';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isMerchandiser: boolean;
  isApprover: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = doc(db, 'users', firebaseUser.uid);
        try {
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const value = {
    user,
    profile,
    loading,
    logout,
    isAdmin: profile?.role === 'admin',
    isMerchandiser: profile?.role === 'merchandiser' || profile?.role === 'admin',
    isApprover: profile?.role === 'approver' || profile?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      <Toaster position="bottom-right" />
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Login Component
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Check your credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA] font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] p-8 space-y-8"
      >
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-6">
            <Package className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">PO Maker</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access the portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@factory.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <button type="button" className="text-xs text-muted-foreground hover:text-black transition-colors">Forgot password?</button>
            </div>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white"
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={isLoggingIn}>
            {isLoggingIn ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Internal factory use only. Unauthorized access is monitored.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Sidebar Item
function SidebarItem({ id, label, icon: Icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[14px] font-medium transition-all group ${
        active 
          ? 'bg-[#EFEFEF] text-black' 
          : 'text-[#6B6B6B] hover:bg-[#EFEFEF] hover:text-black'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-black' : 'text-[#6B6B6B] group-hover:text-black'}`} />
      <span>{label}</span>
    </button>
  );
}

// Layout Component
function MainLayout({ children, activeTab, setActiveTab }: any) {
  const { profile, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-white font-sans text-[#37352F]">
      {/* Sidebar - Notion Style */}
      <aside className="w-[240px] bg-[#FBFBFA] border-r flex flex-col shrink-0">
        <div className="p-4 flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
            <Package className="text-white w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-[15px]">PO Maker</span>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-6">
            <div className="space-y-0.5">
              <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <SidebarItem id="pos" label="Purchase Orders" icon={FileText} active={activeTab === 'pos'} onClick={() => setActiveTab('pos')} />
            </div>

            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-[#9B9B9B] uppercase tracking-wider">Master Data</p>
              <div className="space-y-0.5">
                <SidebarItem id="suppliers" label="Suppliers" icon={Users} active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} />
                <SidebarItem id="jobs" label="Active Jobs" icon={Briefcase} active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} />
                <SidebarItem id="library" label="Item Library" icon={Library} active={activeTab === 'library'} onClick={() => setActiveTab('library')} />
              </div>
            </div>

            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-[#9B9B9B] uppercase tracking-wider">System</p>
              <div className="space-y-0.5">
                <SidebarItem id="audit" label="Audit Log" icon={History} active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
                <SidebarItem id="settings" label="Settings" icon={Settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#EFEFEF] flex items-center justify-center text-[12px] font-bold">
              {profile?.displayName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{profile?.displayName}</p>
              <p className="text-[11px] text-[#9B9B9B] truncate uppercase font-bold">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-[13px] text-[#EB5757] hover:bg-[#FFE2E2] rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        <header className="h-12 border-b flex items-center justify-between px-6 shrink-0 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2 text-[13px] text-[#9B9B9B]">
            <span>PO Maker</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-black font-medium capitalize">{activeTab.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-1.5 hover:bg-[#EFEFEF] rounded-md transition-colors">
              <Search className="w-4 h-4 text-[#6B6B6B]" />
            </button>
            <button className="p-1.5 hover:bg-[#EFEFEF] rounded-md transition-colors relative">
              <Bell className="w-4 h-4 text-[#6B6B6B]" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#EB5757] rounded-full" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 max-w-[1200px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

// Dashboard View
function DashboardView({ onCreatePO }: any) {
  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-[#6B6B6B]">Overview of factory procurement and PO status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Approvals', value: '12', trend: '+2 this week', icon: CheckCircle2, color: 'text-blue-600' },
          { label: 'Active Jobs', value: '45', trend: '8 near deadline', icon: Briefcase, color: 'text-orange-600' },
          { label: 'Monthly Spend', value: '$124.5k', trend: '+12% vs last month', icon: TrendingUp, color: 'text-green-600' },
          { label: 'Security Alerts', value: '2', trend: 'Critical', icon: ShieldAlert, color: 'text-red-600' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-none bg-[#FBFBFA] hover:bg-[#F5F5F4] transition-colors cursor-default">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg bg-white shadow-sm ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="bg-white text-[10px] font-bold uppercase tracking-wider">{stat.trend}</Badge>
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#6B6B6B]">{stat.label}</p>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold">Recent Purchase Orders</h3>
            <Button variant="ghost" size="sm" className="text-[13px] text-[#6B6B6B]">View all</Button>
          </div>
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="divide-y">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-[#FBFBFA] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#F5F5F4] flex items-center justify-center group-hover:bg-white transition-colors">
                      <FileText className="w-5 h-5 text-[#6B6B6B]" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[14px] font-semibold">PO-2026-0012{i}</p>
                      <p className="text-[12px] text-[#6B6B6B]">Job: Denim-Spring-26 • Supplier: TexFab Inc.</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[14px] font-bold">$4,250.00</p>
                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-100 text-[10px] uppercase font-bold">Pending</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-[16px] font-semibold">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button onClick={onCreatePO} className="w-full justify-start gap-2 h-10 bg-black text-white hover:bg-black/90">
                <Plus className="w-4 h-4" />
                <span>Create New PO</span>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-10 bg-white border-[#E5E5E5] hover:bg-[#FBFBFA]">
                <UserPlus className="w-4 h-4" />
                <span>Add Supplier</span>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-10 bg-white border-[#E5E5E5] hover:bg-[#FBFBFA]">
                <Briefcase className="w-4 h-4" />
                <span>Register Job</span>
              </Button>
            </div>
          </div>

          <Card className="border-red-100 bg-red-50/30 shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[14px] text-red-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Security Alert
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-[12px] text-red-600 leading-relaxed">
                PO-2026-00119 has similar items to PO-2026-00115 for Job Denim-Spring-26. Possible duplicate detected.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// User Management View (for Director)
function UserManagementView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('merchandiser');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName, role }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`User ${displayName} created successfully`);
        setEmail('');
        setPassword('');
        setDisplayName('');
      } else {
        toast.error(data.error || "Failed to create user");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-[#6B6B6B]">Manage system configuration and user access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="space-y-4">
            <h3 className="text-[16px] font-semibold">Create New User</h3>
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Full Name</Label>
                    <Input id="new-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Email</Label>
                    <Input id="new-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Initial Password</Label>
                    <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>System Role</Label>
                    <Select value={role} onValueChange={(v: any) => setRole(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="merchandiser">Merchandiser</SelectItem>
                        <SelectItem value="sourcing">Sourcing</SelectItem>
                        <SelectItem value="store">Store</SelectItem>
                        <SelectItem value="accounts">Accounts</SelectItem>
                        <SelectItem value="approver">Approver / Manager</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create User"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[16px] font-semibold">System Configuration</h3>
          <Card className="border shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label>PO Prefix</Label>
                  <Input defaultValue="PO-2026-" />
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" defaultValue="15" />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-[14px] font-semibold">Print Settings</h4>
                <div className="flex items-center justify-between p-3 bg-[#FBFBFA] rounded-lg">
                  <div>
                    <p className="text-[13px] font-medium">Enable QR Verification</p>
                    <p className="text-[11px] text-[#6B6B6B]">Show QR code on all printed POs</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleCreatePO = async () => {
    const newPO: Partial<PurchaseOrder> = {
      poNumber: generatePONumber(Math.floor(Math.random() * 100)),
      jobId: 'Denim-Spring-26',
      supplierId: 'TexFab Inc.',
      status: 'draft',
      issueDate: new Date().toISOString(),
      deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      deliveryPlace: 'Factory Warehouse A',
      items: [
        { id: '1', item: 'Denim Fabric', description: '12oz Indigo Blue', unit: 'Yards', qty: 5000, rate: 4.5, amount: 22500 }
      ],
      totalAmount: 22500,
      currency: 'USD',
      verificationCode: generateVerificationCode(),
      revisionNumber: 0,
      printCount: 0,
      createdBy: auth.currentUser?.uid || '',
    };

    try {
      await addDoc(collection(db, 'purchaseOrders'), newPO);
      toast.success("Draft PO created");
      setActiveTab('pos');
    } catch (error) {
      toast.error("Failed to create PO");
    }
  };

  if (isPrinting && selectedPO) {
    return (
      <div className="bg-white min-h-screen">
        <div className="print:hidden p-4 bg-secondary flex justify-between items-center border-b">
          <p className="font-medium text-[14px]">Print Preview: {selectedPO.poNumber}</p>
          <div className="flex gap-2">
            <Button onClick={() => window.print()} size="sm">Print Now</Button>
            <Button onClick={() => setIsPrinting(false)} variant="outline" size="sm">Cancel</Button>
          </div>
        </div>
        <POPrint po={selectedPO} copyType="Original" />
      </div>
    );
  }

  return (
    <AuthProvider>
      <AuthContext.Consumer>
        {({ user, loading }) => {
          if (loading) return null;
          if (!user) return <LoginPage />;
          
          return (
            <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab + (selectedPO?.id || '')}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === 'dashboard' && <DashboardView onCreatePO={handleCreatePO} />}
                  {activeTab === 'pos' && !selectedPO && <POList onSelect={setSelectedPO} />}
                  {activeTab === 'pos' && selectedPO && (
                    <PODetail 
                      po={selectedPO} 
                      onBack={() => setSelectedPO(null)} 
                      onPrint={() => setIsPrinting(true)}
                    />
                  )}
                  {activeTab === 'settings' && <UserManagementView />}
                  {['suppliers', 'jobs', 'library', 'audit'].includes(activeTab) && (
                    <div className="py-20 text-center text-[#9B9B9B]">
                      <div className="w-12 h-12 bg-[#F5F5F4] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-6 h-6" />
                      </div>
                      <h3 className="text-[16px] font-medium text-black">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
                      <p className="text-[13px] mt-1">This section is currently under development.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </MainLayout>
          );
        }}
      </AuthContext.Consumer>
    </AuthProvider>
  );
}
