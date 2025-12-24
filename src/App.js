import React, { useState, useEffect } from 'react';
import { 
  Shield, Globe, Trash2, Plus, Tag, AlertTriangle, Zap, Activity, Terminal, Eye, EyeOff
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  onAuthStateChanged 
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
  Timestamp
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

export default function App() {
  const [user, setUser] = useState(null);
  const [sites, setSites] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSite, setNewSite] = useState({ name: '', url: '', group: 'default' });

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', 'adminpanel-9b439', 'public', 'data', 'sites'), orderBy('lastSync', 'desc'));
    return onSnapshot(q, snap => {
      setSites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!newSite.name || !newSite.url) return;
    await addDoc(collection(db, 'artifacts', 'adminpanel-9b439', 'public', 'data', 'sites'), {
      ...newSite,
      status: 'offline',
      nexusKey: `NX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      lastSync: serverTimestamp(),
      group: newSite.group || 'default'
    });
    setNewSite({ name: '', url: '', group: 'default' });
    setIsAddModalOpen(false);
  };

  const deleteSite = async (id) => {
    await deleteDoc(doc(db, 'artifacts', 'adminpanel-9b439', 'public', 'data', 'sites', id));
  };

  // Cyberpunk CSS injection
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body { margin: 0; font-family: 'Courier New', monospace; overflow-x: hidden; }
      .cyber-bg { background: linear-gradient(135deg, #000000, #0f0020); min-height: 100vh; position: relative; }
      .scanlines { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: repeating-linear-gradient(0deg, rgba(0,255,255,0.03), rgba(0,255,255,0.03) 1px, transparent 1px, transparent 2px); pointer-events: none; z-index: 9999; opacity: 0.5; }
      .glitch { position: relative; color: #00ffff; animation: glitch 2s infinite; }
      @keyframes glitch { 0% { text-shadow: 0.05em 0 0 #ff00ff, -0.05em 0 0 #00ffff; } 14% { text-shadow: 0.05em 0 0 #ff00ff, -0.05em 0 0 #00ffff; } 15% { text-shadow: -0.05em -0.05em 0 #ff00ff, 0.05em 0.05em 0 #00ffff; } 49% { text-shadow: -0.05em -0.05em 0 #ff00ff, 0.05em 0.05em 0 #00ffff; } 50% { text-shadow: 0.025em 0.05em 0 #ff00ff, -0.025em -0.05em 0 #00ffff; } 99% { text-shadow: 0.025em 0.05em 0 #ff00ff, -0.025em -0.05em 0 #00ffff; } 100% { text-shadow: -0.025em 0 0 #ff00ff, 0.025em 0 0 #00ffff; } }
      .glow { box-shadow: 0 0 30px #00ffff, 0 0 60px #ff00ff; }
      .card { background: rgba(10, 10, 30, 0.8); backdrop-filter: blur(20px); border: 1px solid #00ffff44; transition: all 0.5s; }
      .card:hover { transform: translateY(-15px); box-shadow: 0 0 80px #ff00ff88; border-color: #ff00ff; }
      .btn-neon { background: linear-gradient(45deg, #ff00ff, #00ffff); color: black; font-weight: bold; padding: 15px 40px; border: none; border-radius: 50px; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 40px #ff00ff88; }
      .btn-neon:hover { transform: scale(1.1); box-shadow: 0 0 80px #00ffff; }
      .input-neon { background: rgba(0,0,0,0.6); border: 2px solid #00ffff; color: #00ffff; padding: 20px; border-radius: 20px; width: 100%; font-size: 1.5rem; }
      .input-neon:focus { outline: none; box-shadow: 0 0 30px #00ffff; border-color: #ff00ff; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (!user) return <LoginPage />;

  return (
    <div className="cyber-bg">
      <div className="scanlines"></div>
      <div className="relative z-10 p-10">
        <h1 className="text-center text-7xl font-black glitch mb-20" data-text="NEXUS">
          NEXUS
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {sites.map(site => (
            <div key={site.id} className="card p-12 rounded-3xl relative">
              <button onClick={() => deleteSite(site.id)} className="absolute top-8 right-8 text-red-500 hover:scale-150 transition">
                <Trash2 size={36} />
              </button>
              <Globe size={100} className="mx-auto mb-8 text-cyan-400 glow animate-pulse" />
              <h3 className="text-4xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                {site.name}
              </h3>
              <p className="text-center text-gray-400 mb-8 text-xl">{site.url}</p>
              <div className="text-5xl font-black text-center mb-8" style={{ color: site.status === 'online' ? '#00ff00' : '#ff0000' }}>
                {site.status.toUpperCase()}
              </div>
              {site.status === 'offline' && <AlertTriangle size={80} className="mx-auto text-red-500 animate-pulse" />}
            </div>
          ))}
        </div>

        <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-16 right-16 btn-neon text-5xl w-24 h-24 rounded-full flex items-center justify-center animate-pulse">
          <Plus size={60} />
        </button>

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl flex items-center justify-center z-50 p-8">
            <div className="card p-16 rounded-3xl max-w-2xl w-full relative glow">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-12 right-12 text-cyan-400 hover:text-pink-400">
                <Terminal size={48} />
              </button>
              <h2 className="text-6xl font-black text-center mb-16 glitch" data-text="INITIALIZE NODE">
                INITIALIZE NODE
              </h2>
              <form onSubmit={handleRegister} className="space-y-12">
                <input required placeholder="NODE DESIGNATION" className="input-neon" value={newSite.name} onChange={e => setNewSite({...newSite, name: e.target.value})} />
                <input required type="url" placeholder="TARGET URL" className="input-neon" value={newSite.url} onChange={e => setNewSite({...newSite, url: e.target.value})} />
                <input placeholder="GROUP TAG" className="input-neon" value={newSite.group} onChange={e => setNewSite({...newSite, group: e.target.value})} />
                <button type="submit" className="w-full btn-neon text-5xl py-10 rounded-3xl">
                  DEPLOY
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('ACCESS DENIED');
    }
  };

  return (
    <div className="cyber-bg min-h-screen flex items-center justify-center">
      <div className="scanlines"></div>
      <div className="relative z-10 card p-20 rounded-3xl max-w-xl w-full glow">
        <Shield size={120} className="mx-auto text-cyan-400 glow mb-12 animate-pulse" />
        <h1 className="text-8xl font-black text-center mb-8 glitch" data-text="NEXUS_ROOT">
          NEXUS_ROOT
        </h1>
        <p className="text-center text-3xl text-cyan-300 mb-16 animate-flicker">SYSTEM BOOT SEQUENCE</p>
        <form onSubmit={handleLogin} className="space-y-12">
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="AUTH ID" className="input-neon" />
          <div className="relative">
            <input required type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="PASSCODE" className="input-neon" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-12 top-8 text-cyan-400 hover:text-pink-400">
              {show ? <EyeOff size={40} /> : <Eye size={40} />}
            </button>
          </div>
          {error && <p className="text-red-500 text-5xl text-center font-black animate-pulse">{error}</p>}
          <button type="submit" className="w-full btn-neon text-6xl py-12 rounded-3xl animate-pulse">
            INITIATE BOOT
          </button>
        </form>
      </div>
    </div>
  );
};
