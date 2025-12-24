import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Trash2, 
  Plus, 
  Tag, 
  AlertTriangle,
  Zap,
  Activity,
  Terminal,
  Shield,
  Eye,
  EyeOff
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
  setDoc,
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
  appId: "1:500909979742:web:5f74784da4cf7eb0591ccf",
  measurementId: "G-9XZR61X2BS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "adminpanel-9b439";

export default function App() {
  const [user, setUser] = useState(null);
  const [sites, setSites] = useState([]);
  const [broadcast, setBroadcast] = useState({ message: '', active: false, maintenance: false });
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newSite, setNewSite] = useState({ name: '', url: '', group: 'default' });

  // Inject cyberpunk animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes glitch {
        0% { text-shadow: 0.05em 0 0 #00fffc, -0.05em -0.025em 0 #fc00ff; }
        15% { text-shadow: 0.05em 0 0 #00fffc, -0.05em -0.025em 0 #fc00ff; }
        16% { text-shadow: -0.05em -0.05em 0 #00fffc, 0.025em 0.05em 0 #fc00ff; }
        49% { text-shadow: -0.05em -0.05em 0 #00fffc, 0.025em 0.05em 0 #fc00ff; }
        50% { text-shadow: 0.05em 0.05em 0 #00fffc, -0.025em 0 -0.025em #fc00ff; }
        99% { text-shadow: 0.05em 0.05em 0 #00fffc, -0.025em 0 -0.025em #fc00ff; }
        100% { text-shadow: -0.05em 0 0 #00fffc, -0.025em -0.025em 0 #fc00ff; }
      }
      @keyframes flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      .glitch {
        animation: glitch 2s linear infinite;
      }
      .animate-flicker {
        animation: flicker 3s linear infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user || sites.length === 0) return;
    const interval = setInterval(async () => {
      const now = Timestamp.now();
      for (const site of sites) {
        if (site.lastSync?.seconds) {
          const secondsAgo = now.seconds - site.lastSync.seconds;
          const targetStatus = secondsAgo <= 60 ? 'online' : 'offline';
          if (site.status !== targetStatus) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sites', site.id), { status: targetStatus });
          }
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [user, sites]);

  useEffect(() => {
    if (!user) return;
    onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'sites'), orderBy('lastSync', 'desc')), snap => {
      setSites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'global_settings', 'broadcast'), snap => {
      if (snap.exists()) setBroadcast(snap.data());
    });
  }, [user]);

  const handleRegister = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'sites'), {
      ...newSite,
      status: 'offline',
      nexusKey: `NX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      lastSync: serverTimestamp(),
      group: newSite.group || 'default'
    });
    setNewSite({ name: '', url: '', group: 'default' });
    setAddModalOpen(false);
  };

  const updateBroadcast = async () => {
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'global_settings', 'broadcast'), broadcast);
  };

  const deleteSite = async (id) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sites', id));
  };

  const UptimeBar = ({ status }) => {
    const width = status === 'online' ? 100 : 0;
    return (
      <div className="relative w-full h-4 mt-4 rounded overflow-hidden bg-black/50 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
        <div className={`absolute inset-0 h-full bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 transition-all duration-2000`} style={{ width: `${width}%` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      </div>
    );
  };

  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen bg-black text-cyan-400 relative overflow-hidden font-mono">
      {/* Matrix rain background effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/20 to-transparent animate-pulse" />
      </div>

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="h-full w-full bg-repeat-y" style={{ backgroundImage: 'linear-gradient(transparent 50%, rgba(0,255,255,0.03) 50%)', backgroundSize: '100% 4px' }} />
      </div>

      <div className="relative z-10 p-8 md:p-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter glitch" data-text="NEXUS">
            NEXUS
          </h1>
          <p className="text-cyan-300 text-xl mt-4 tracking-widest animate-flicker">ROOT ACCESS GRANTED</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {sites.map(site => (
            <div key={site.id} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-black/70 backdrop-blur-2xl border-2 border-cyan-500/50 rounded-3xl p-8 hover:border-pink-500/80 transition-all duration-500 shadow-2xl shadow-cyan-500/30 hover:shadow-pink-500/50">
                <button onClick={() => deleteSite(site.id)} className="absolute top-6 right-6 text-red-500 hover:text-red-400 hover:scale-125 transition">
                  <Trash2 size={24} />
                </button>

                <div className="flex justify-center mb-8">
                  <div className="p-6 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full shadow-lg shadow-purple-500/50 animate-pulse">
                    <Globe size={64} className="text-white drop-shadow-2xl" />
                  </div>
                </div>

                <h3 className="text-3xl font-black text-center mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                  {site.name}
                </h3>
                <p className="text-center text-gray-400 text-sm mb-6 font-mono">{site.url}</p>

                {site.group !== 'default' && (
                  <div className="flex items-center justify-center gap-3 text-pink-400 mb-6">
                    <Tag size={20} />
                    <span className="font-bold tracking-wider">{site.group.toUpperCase()}</span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`text-4xl font-black ${site.status === 'online' ? 'text-cyan-400' : 'text-red-500'} glitch` } data-text={site.status.toUpperCase()}>
                    {site.status.toUpperCase()}
                  </div>
                  {site.status === 'online' && <Activity size={32} className="mx-auto mt-2 text-cyan-400 animate-pulse" />}
                  {site.status === 'offline' && <AlertTriangle size={40} className="mx-auto mt-2 text-red-500 animate-pulse" />}
                </div>

                <UptimeBar status={site.status} />
              </div>
            </div>
          ))}
        </div>

        {/* Floating Add Button */}
        <div className="fixed bottom-10 right-10 z-50">
          <button onClick={() => setAddModalOpen(true)} className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl shadow-purple-500/50 flex items-center justify-center hover:scale-125 transition-all duration-300 group">
            <Plus size={48} className="text-white drop-shadow-2xl group-hover:rotate-90 transition" />
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
          </button>
        </div>

        {/* Global Broadcast Panel */}
        <div className="fixed bottom-10 left-10 z-50 max-w-md">
          <div className="bg-black/80 backdrop-blur-2xl border-2 border-cyan-500/50 rounded-3xl p-8 shadow-2xl shadow-cyan-500/40">
            <div className="flex items-center gap-4 mb-6">
              <Zap size={32} className="text-pink-500 animate-pulse" />
              <h3 className="text-2xl font-black">BROADCAST CONTROL</h3>
            </div>
            <textarea 
              className="w-full bg-black/50 border border-cyan-500/50 rounded-2xl px-6 py-4 text-cyan-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/30 transition-all mb-6 font-mono"
              rows="4"
              value={broadcast.message} 
              onChange={e => setBroadcast({...broadcast, message: e.target.value})}
              placeholder="EMERGENCY TRANSMISSION..."
            />
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-4 cursor-pointer">
                <input type="checkbox" checked={broadcast.active} onChange={e => setBroadcast({...broadcast, active: e.target.checked})} className="w-6 h-6 accent-pink-500" />
                <span className="text-lg font-bold">LIVE BROADCAST</span>
              </label>
              <label className="flex items-center gap-4 cursor-pointer">
                <input type="checkbox" checked={broadcast.maintenance} onChange={e => setBroadcast({...broadcast, maintenance: e.target.checked})} className="w-6 h-6 accent-red-500" />
                <span className="text-lg font-bold text-red-400">MAINTENANCE LOCKDOWN</span>
              </label>
            </div>
            <button onClick={updateBroadcast} className="mt-8 w-full bg-gradient-to-r from-pink-600 to-purple-600 py-4 rounded-2xl font-black text-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all">
              TRANSMIT
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-8 z-50">
          <div className="relative bg-black/90 backdrop-blur-3xl border-4 border-cyan-500/80 rounded-3xl p-12 max-w-2xl w-full shadow-2xl shadow-cyan-500/60">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-cyan-600/10 rounded-3xl" />
            <button onClick={() => setAddModalOpen(false)} className="absolute top-8 right-8 text-cyan-400 hover:text-pink-400 transition">
              <Terminal size={36} />
            </button>
            <h2 className="text-5xl font-black text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 glitch" data-text="INITIALIZE NODE">
              INITIALIZE NODE
            </h2>
            <form onSubmit={handleRegister} className="space-y-8">
              <input required placeholder="NODE DESIGNATION" className="w-full bg-black/50 border-2 border-cyan-500/50 rounded-2xl px-8 py-6 text-2xl text-cyan-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/30 transition-all font-mono" value={newSite.name} onChange={e => setNewSite({...newSite, name: e.target.value})} />
              <input required type="url" placeholder="TARGET VECTOR" className="w-full bg-black/50 border-2 border-cyan-500/50 rounded-2xl px-8 py-6 text-2xl text-cyan-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/30 transition-all font-mono" value={newSite.url} onChange={e => setNewSite({...newSite, url: e.target.value})} />
              <input placeholder="SECTOR TAG" className="w-full bg-black/50 border-2 border-cyan-500/50 rounded-2xl px-8 py-6 text-2xl text-cyan-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/30 transition-all font-mono" value={newSite.group} onChange={e => setNewSite({...newSite, group: e.target.value})} />
              <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 py-8 rounded-3xl font-black text-4xl hover:shadow-2xl hover:shadow-purple-500/80 transition-all animate-pulse">
                DEPLOY
              </button>
            </form>
          </div>
        </div>
      )}
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
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-cyan-900/20 to-pink-900/20 animate-pulse" />
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-black/80 backdrop-blur-3xl border-4 border-cyan-500/60 rounded-3xl p-16 shadow-2xl shadow-cyan-500/60">
          <div className="text-center mb-16">
            <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-purple-500/80 animate-pulse">
              <Shield size={80} className="text-white drop-shadow-2xl" />
            </div>
            <h1 className="text-7xl font-black tracking-tighter glitch" data-text="NEXUS_ROOT">
              NEXUS_ROOT
            </h1>
            <p className="text-cyan-300 text-2xl mt-6 tracking-widest animate-flicker">SYSTEM BOOT SEQUENCE</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-10">
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="AUTH ID" className="w-full bg-black/50 border-2 border-cyan-500/50 rounded-2xl px-8 py-6 text-2xl text-cyan-300 focus:border-pink-500 focus:ring-8 focus:ring-pink-500/40 transition-all font-mono" />
            <div className="relative">
              <input required type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="PASSCODE" className="w-full bg-black/50 border-2 border-cyan-500/50 rounded-2xl px-8 py-6 text-2xl text-cyan-300 focus:border-pink-500 focus:ring-8 focus:ring-pink-500/40 transition-all font-mono" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-8 top-6 text-cyan-400 hover:text-pink-400 transition">
                {show ? <EyeOff size={32}/> : <Eye size={32}/>}
              </button>
            </div>
            {error && <p className="text-red-500 text-3xl text-center font-black animate-pulse">{error}</p>}
            <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 py-8 rounded-3xl font-black text-4xl hover:shadow-2xl hover:shadow-purple-600/80 transition-all animate-pulse">
              INITIATE BOOT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
