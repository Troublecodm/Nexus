import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, FileText, Image, Settings, Activity, Bell, BarChart3, 
  LogOut, Menu, Globe, Search, Moon, Sun, Download, Filter, Edit3, Save
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updatePassword,
  updateEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAhB-uq-rbk5z1E8-JLuz_cAmyooGWSpgo",
  authDomain: "adminpanel-9b439.firebaseapp.com",
  projectId: "adminpanel-9b439",
  storageBucket: "adminpanel-9b439.firebasestorage.app",
  messagingSenderId: "500909979742",
  appId: "1:500909979742:web:5f74784da4cf7eb0591ccf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const glassStyle = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl";
const inputStyle = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      setCurrentUser({ 
        uid: user.uid, 
        email: user.email, 
        role: userDoc.exists() ? userDoc.data().role || 'viewer' : 'viewer',
        name: userDoc.exists() ? userDoc.data().name : ''
      });
    } else {
      setCurrentUser(null);
    }
  }), []);

  useEffect(() => {
    if (!currentUser) return;
    onSnapshot(collection(db, 'users'), snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    onSnapshot(query(collection(db, 'content'), orderBy('createdAt', 'desc')), snap => setContent(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    // Fake notifications
    setNotifications([
      { id: 1, message: "New user registered", time: "5 mins ago" },
      { id: 2, message: "Content updated", time: "1 hour ago" }
    ]);
  }, [currentUser]);

  const hasPermission = (required) => {
    const roles = { admin: 3, editor: 2, viewer: 1 };
    return roles[currentUser?.role || 'viewer'] >= roles[required];
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser) return <LoginPage />;

  return (
    <div className={`min-h-screen transition-all ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-slate-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      {/* Theme Toggle */}
      <button onClick={() => setDarkMode(!darkMode)} className="fixed top-6 right-6 z-50 p-3 bg-white/10 rounded-xl">
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {/* Mobile Menu */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed top-6 left-6 z-50 md:hidden p-3 bg-white/10 rounded-xl">
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-72 \( {darkMode ? 'bg-black/40' : 'bg-white/80'} backdrop-blur-xl border-r border-white/10 p-6 transition-transform \){sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-40`}>
        <div className="flex items-center gap-3 mb-12">
          <Shield size={36} className="text-indigo-400" />
          <h1 className="text-3xl font-black">NEXUS</h1>
        </div>
        <nav className="space-y-3">
          <SidebarItem icon={BarChart3} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          {hasPermission('admin') && <SidebarItem icon={Users} label="Users" active={view === 'users'} onClick={() => setView('users')} />}
          {(hasPermission('editor') || hasPermission('admin')) && <SidebarItem icon={FileText} label="Content" active={view === 'content'} onClick={() => setView('content')} />}
          {(hasPermission('editor') || hasPermission('admin')) && <SidebarItem icon={Image} label="Media" active={view === 'media'} onClick={() => setView('media')} />}
          <SidebarItem icon={Bell} label="Notifications" active={view === 'notifications'} onClick={() => setView('notifications')} />
          <SidebarItem icon={Activity} label="Logs" active={view === 'logs'} onClick={() => setView('logs')} />
          {hasPermission('admin') && <SidebarItem icon={Settings} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} />}
          <SidebarItem icon={Edit3} label="Profile" active={view === 'profile'} onClick={() => setView('profile')} />
        </nav>
        <div className="absolute bottom-8 left-6 right-6">
          <p className="text-sm mb-2">Logged in as: <span className="font-bold text-indigo-400">{currentUser.email}</span></p>
          <p className="text-sm mb-4">Role: <span className="font-bold text-pink-400">{currentUser.role.toUpperCase()}</span></p>
          <button onClick={() => firebaseSignOut(auth)} className="w-full flex items-center justify-center gap-3 p-4 bg-red-600/20 rounded-xl hover:bg-red-600/30 transition">
            <LogOut size={20} />
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="md:ml-72 p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-black">{view.charAt(0).toUpperCase() + view.slice(1)}</h2>
            {['users', 'content', 'media'].includes(view) && (
              <div className="relative">
                <Search size={20} className="absolute left-4 top-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className={`${inputStyle} pl-12 pr-6 py-4 w-80`}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>

          {view === 'dashboard' && <DashboardOverview users={users.length} content={content.length} />}

          {view === 'users' && hasPermission('admin') && <UserManagement users={filteredUsers} currentUser={currentUser} />}

          {view === 'content' && (hasPermission('editor') || hasPermission('admin')) && <ContentManagement content={content.filter(c => c.title?.toLowerCase().includes(searchTerm.toLowerCase()))} />}

          {view === 'media' && (hasPermission('editor') || hasPermission('admin')) && <MediaLibrary />}

          {view === 'notifications' && <NotificationsPanel notifications={notifications} />}

          {view === 'logs' && <ActivityLogs />}

          {view === 'profile' && <ProfilePage currentUser={currentUser} />}

          {view === 'settings' && hasPermission('admin') && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
}

// New Components

const NotificationsPanel = ({ notifications }) => (
  <div className={`${glassStyle} p-8`}>
    <h3 className="text-2xl font-bold mb-6">Notifications</h3>
    <div className="space-y-4">
      {notifications.map(n => (
        <div key={n.id} className="bg-white/5 rounded-xl p-6 flex justify-between items-center">
          <div>
            <p className="font-bold">{n.message}</p>
            <p className="text-sm text-gray-400">{n.time}</p>
          </div>
          <Bell size={24} className="text-indigo-400" />
        </div>
      ))}
    </div>
  </div>
);

const ProfilePage = ({ currentUser }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: currentUser.name || '', email: currentUser.email });

  const handleSave = async () => {
    await updateDoc(doc(db, 'users', currentUser.uid), { name: form.name });
    if (form.email !== currentUser.email) await updateEmail(auth.currentUser, form.email);
    setEditing(false);
  };

  return (
    <div className={`${glassStyle} p-8 max-w-2xl`}>
      <h3 className="text-2xl font-bold mb-6">My Profile</h3>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-400">Email</p>
          <p className="text-xl font-bold">{currentUser.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Role</p>
          <p className="text-xl font-bold text-indigo-400">{currentUser.role.toUpperCase()}</p>
        </div>
        {editing ? (
          <div className="space-y-4">
            <input className={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Display Name" />
            <div className="flex gap-4">
              <button onClick={handleSave} className="bg-green-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                <Save size={20} /> Save
              </button>
              <button onClick={() => setEditing(false)} className="bg-gray-600 px-6 py-3 rounded-xl font-bold">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="bg-indigo-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
            <Edit3 size={20} /> Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

// Keep all previous components (Dashboard, UserManagement with role permissions, etc.)

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${active ? 'bg-indigo-600/30 border border-indigo-500/50' : 'hover:bg-white/10'}`}>
    <Icon size={24} />
    <span className="font-bold">{label}</span>
  </button>
);

const LoginPage = () => {
  // Same beautiful login as before
};

