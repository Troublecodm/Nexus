import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, FileText, Image, Settings, LogOut, Menu, Plus, Trash2, Edit, Save, X, Upload, Search
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut
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
  serverTimestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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
const storage = getStorage(app);

const glassStyle = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl";
const inputStyle = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all";

export default function App() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState([]);
  const [media, setMedia] = useState([]);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user) return;
    onSnapshot(collection(db, 'users'), snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    onSnapshot(query(collection(db, 'content'), orderBy('createdAt', 'desc')), snap => setContent(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    onSnapshot(query(collection(db, 'media'), orderBy('uploadedAt', 'desc')), snap => setMedia(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user]);

  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900/20 to-gray-900 text-gray-100">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed top-6 left-6 z-50 md:hidden p-3 bg-white/10 rounded-xl">
        <Menu size={24} />
      </button>

      <aside className={`fixed left-0 top-0 h-full w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-40`}>
        <div className="flex items-center gap-3 mb-12">
          <Shield size={36} className="text-indigo-400" />
          <h1 className="text-3xl font-black">NEXUS ADMIN</h1>
        </div>
        <nav className="space-y-3">
          <SidebarItem icon={BarChart3} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <SidebarItem icon={Users} label="Users" active={view === 'users'} onClick={() => setView('users')} />
          <SidebarItem icon={FileText} label="Content" active={view === 'content'} onClick={() => setView('content')} />
          <SidebarItem icon={Image} label="Media" active={view === 'media'} onClick={() => setView('media')} />
          <SidebarItem icon={Settings} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} />
        </nav>
        <button onClick={() => firebaseSignOut(auth)} className="absolute bottom-8 left-6 right-6 flex items-center justify-center gap-3 p-4 bg-red-600/20 rounded-xl hover:bg-red-600/30 transition">
          <LogOut size={20} />
          <span className="font-bold">Logout</span>
        </button>
      </aside>

      <main className="md:ml-72 p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black mb-10">{view.charAt(0).toUpperCase() + view.slice(1)}</h2>

          {view === 'dashboard' && <DashboardOverview users={users.length} content={content.length} media={media.length} />}

          {view === 'users' && <UserManagement users={users} />}

          {view === 'content' && <ContentManagement content={content} />}

          {view === 'media' && <MediaLibrary media={media} />}

          {view === 'settings' && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
}

// Full CRUD Components

const UserManagement = ({ users }) => {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'viewer' });

  const handleSave = async () => {
    if (editing) {
      await updateDoc(doc(db, 'users', editing), form);
    } else {
      await addDoc(collection(db, 'users'), { ...form, createdAt: serverTimestamp() });
    }
    setEditing(null);
    setForm({ name: '', email: '', role: 'viewer' });
  };

  return (
    <div className={`${glassStyle} p-8`}>
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold">User Management</h3>
        <button onClick={() => setEditing('new')} className="bg-indigo-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <Plus size={20} /> Add User
        </button>
      </div>
      <div className="space-y-4">
        {users.map(u => (
          <div key={u.id} className="bg-white/5 rounded-xl p-6 flex justify-between items-center">
            <div>
              <p className="font-bold">{u.name || u.email}</p>
              <p className="text-sm text-gray-400">{u.role}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setEditing(u.id); setForm(u); }} className="p-2 bg-white/10 rounded hover:bg-white/20">
                <Edit size={18} />
              </button>
              <button onClick={() => deleteDoc(doc(db, 'users', u.id))} className="p-2 bg-red-600/30 rounded hover:bg-red-600/50">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="mt-8 p-6 bg-white/10 rounded-xl">
          <input className={inputStyle + " mb-4"} placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input className={inputStyle + " mb-4"} placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <select className={inputStyle + " mb-6"} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex gap-4">
            <button onClick={handleSave} className="bg-green-600 px-6 py-3 rounded-xl font-bold">Save</button>
            <button onClick={() => setEditing(null)} className="bg-gray-600 px-6 py-3 rounded-xl font-bold">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const ContentManagement = ({ content }) => {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', body: '', type: 'post' });

  const handleSave = async () => {
    if (editing) {
      await updateDoc(doc(db, 'content', editing), form);
    } else {
      await addDoc(collection(db, 'content'), { ...form, createdAt: serverTimestamp() });
    }
    setEditing(null);
    setForm({ title: '', body: '', type: 'post' });
  };

  return (
    <div className={`${glassStyle} p-8`}>
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold">Content Management</h3>
        <button onClick={() => setEditing('new')} className="bg-indigo-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <Plus size={20} /> New Content
        </button>
      </div>
      <div className="space-y-4">
        {content.map(c => (
          <div key={c.id} className="bg-white/5 rounded-xl p-6 flex justify-between items-center">
            <div>
              <p className="font-bold">{c.title}</p>
              <p className="text-sm text-gray-400">{c.type}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setEditing(c.id); setForm(c); }} className="p-2 bg-white/10 rounded hover:bg-white/20">
                <Edit size={18} />
              </button>
              <button onClick={() => deleteDoc(doc(db, 'content', c.id))} className="p-2 bg-red-600/30 rounded hover:bg-red-600/50">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="mt-8 p-6 bg-white/10 rounded-xl">
          <input className={inputStyle + " mb-4"} placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <textarea className={inputStyle + " mb-4 h-32"} placeholder="Body" value={form.body} onChange={e => setForm({...form, body: e.target.value})} />
          <select className={inputStyle + " mb-6"} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="post">Post</option>
            <option value="page">Page</option>
            <option value="product">Product</option>
          </select>
          <div className="flex gap-4">
            <button onClick={handleSave} className="bg-green-600 px-6 py-3 rounded-xl font-bold">Save</button>
            <button onClick={() => setEditing(null)} className="bg-gray-600 px-6 py-3 rounded-xl font-bold">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const MediaLibrary = ({ media }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const storageRef = ref(storage, `media/\( {Date.now()}_ \){file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await addDoc(collection(db, 'media'), {
      name: file.name,
      url,
      uploadedAt: serverTimestamp()
    });
    setUploading(false);
  };

  return (
    <div className={`${glassStyle} p-8`}>
      <div className="mb-8">
        <label className="bg-indigo-600 px-8 py-4 rounded-xl font-bold cursor-pointer inline-flex items-center gap-3">
          <Upload size={24} />
          Upload File
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
        {uploading && <p className="mt-4 text-indigo-400">Uploading...</p>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {media.map(m => (
          <div key={m.id} className="bg-white/5 rounded-xl overflow-hidden">
            <img src={m.url} alt={m.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <p className="text-sm truncate">{m.name}</p>
              <button onClick={() => deleteObject(ref(storage, m.url)).then(() => deleteDoc(doc(db, 'media', m.id)))} className="mt-2 text-red-400 hover:text-red-300">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardOverview = ({ users, content, media }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className={`${glassStyle} p-8`}>
      <Users size={48} className="text-indigo-400 mb-4" />
      <h3 className="text-xl font-bold mb-2">Total Users</h3>
      <p className="text-5xl font-black">{users}</p>
    </div>
    <div className={`${glassStyle} p-8`}>
      <FileText size={48} className="text-purple-400 mb-4" />
      <h3 className="text-xl font-bold mb-2">Content Items</h3>
      <p className="text-5xl font-black">{content}</p>
    </div>
    <div className={`${glassStyle} p-8`}>
      <Image size={48} className="text-pink-400 mb-4" />
      <h3 className="text-xl font-bold mb-2">Media Files</h3>
      <p className="text-5xl font-black">{media}</p>
    </div>
  </div>
);

const SettingsPanel = () => (
  <div className={`${glassStyle} p-8`}>
    <h3 className="text-2xl font-bold mb-8">Settings</h3>
    <p>System configuration and toggles will be added here.</p>
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${active ? 'bg-indigo-600/30 border border-indigo-500/50' : 'hover:bg-white/5'}`}>
    <Icon size={24} />
    <span className="font-bold">{label}</span>
  </button>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900/20 to-gray-900 flex items-center justify-center p-6">
      <div className={`${glassStyle} p-16 rounded-3xl max-w-md w-full shadow-2xl`}>
        <div className="text-center mb-16">
          <Shield size={80} className="mx-auto text-indigo-400 mb-8" />
          <h1 className="text-5xl font-black mb-4">NEXUS ADMIN</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-8">
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className={inputStyle} />
          <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className={inputStyle} />
          {error && <p className="text-red-400 text-center font-bold">{error}</p>}
          <button type="submit" className="w-full bg-indigo-600 py-5 rounded-xl font-black text-2xl hover:bg-indigo-700 transition">
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
};
