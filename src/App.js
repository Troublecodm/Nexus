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
const appId = "adminpanel-9b439";

export default function App() {
  const [user, setUser] = useState(null);
  const [sites, setSites] = useState([]);
  const [broadcast, setBroadcast] = useState({ message: '', active: false, maintenance: false });
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newSite, setNewSite] = useState({ name: '', url: '', group: 'default' });

  // Inject cyberpunk global styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body { margin: 0; font-family: 'Courier New', monospace; }
      .cyber-bg {
        background: linear-gradient(135deg, #0f0f0f, #1a0033);
        min-height: 100vh;
      }
      .scanlines {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(0deg, rgba(0,255,255,0.05), rgba(0,255,255,0.05) 1px, transparent 1px, transparent 2px);
        pointer-events: none;
        z-index: 9999;
        opacity: 0.3;
      }
      .glitch {
        position: relative;
        color: #00ffff;
        animation: glitch 2s infinite;
      }
      @keyframes glitch {
        0% { text-shadow: 0.05em 0 0 #ff00ff, -0.05em 0 0 #00ffff; }
        14% { text-shadow: 0.05em 0 0 #ff00ff, -0.05em 0 0 #00ffff; }
        15% { text-shadow: -0.05em -0.05em 0 #ff00ff, 0.05em 0.05em 0 #00ffff; }
        49% { text-shadow: -0.05em -0.05em 0 #ff00ff, 0.05em 0.05em 0 #00ffff; }
        50% { text-shadow: 0.025em 0.05em 0 #ff00ff, -0.025em -0.05em 0 #00ffff; }
        99% { text-shadow: 0.025em 0.05em 0 #ff00ff, -0.025em -0.05em 0 #00ffff; }
        100% { text-shadow: -0.025em 0 0 #ff00ff, 0.025em 0 0 #00ffff; }
      }
      .glow {
        box-shadow: 0 0 20px #00ffff, 0 0 40px #ff00ff;
      }
      .card {
        background: rgba(15, 15, 15, 0.8);
        backdrop-filter: blur(20px);
        border: 1px solid #00ffff44;
        transition: all 0.5s;
      }
      .card:hover {
        transform: translateY(-10px);
        box-shadow: 0 0 50px #ff00ff88;
        border-color: #ff00ff;
      }
      .btn-neon {
        background: linear-gradient(45deg, #ff00ff, #00ffff);
        color: black;
        font-weight: bold;
        padding: 15px 30px;
        border: none;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 0 30px #ff00ff88;
      }
      .btn-neon:hover {
        transform: scale(1.1);
        box-shadow: 0 0 60px #00ffff;
      }
      .input-neon {
        background: rgba(0,0,0,0.5);
        border: 2px solid #00ffff;
        color: #00ffff;
        padding: 15px;
        border-radius: 15px;
        width: 100%;
      }
      .input-neon:focus {
        outline: none;
        box-shadow: 0 0 20px #00ffff;
        border-color: #ff00ff;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  // Rest of your logic (heartbeat, data loading, etc.) remains the same

  if (!user) return <LoginPage />;

  return (
    <div className="cyber-bg relative">
      <div className="scanlines"></div>
      <div className="relative z-10 p-8">
        <h1 className="text-center text-6xl font-black glitch mb-16" data-text="NEXUS CONTROL">
          NEXUS CONTROL
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {sites.map(site => (
            <div key={site.id} className="card p-10 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-cyan-900/20"></div>
              <div className="relative z-10 text-center">
                <Globe size={80} className="mx-auto mb-6 text-cyan-400 glow" />
                <h3 className="text-3xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                  {site.name}
                </h3>
                <p className="text-gray-400 mb-8">{site.url}</p>
                <div className="text-4xl font-black mb-6" style={{ color: site.status === 'online' ? '#00ff00' : '#ff0000' }}>
                  {site.status.toUpperCase()}
                </div>
                {site.status === 'offline' && <AlertTriangle size={60} className="mx-auto text-red-500 animate-pulse" />}
              </div>
              <button onClick={() => deleteSite(site.id)} className="absolute top-6 right-6 text-red-500 hover:scale-150 transition">
                <Trash2 size={32} />
              </button>
            </div>
          ))}
        </div>

        {/* Neon + Button */}
        <button onClick={() => setAddModalOpen(true)} className="fixed bottom-12 right-12 btn-neon text-4xl w-20 h-20 rounded-full flex items-center justify-center animate-pulse">
          <Plus size={48} />
        </button>

        {/* Add Modal with Neon Style */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-50 p-8">
            <div className="card p-12 rounded-3xl max-w-lg w-full relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-3xl"></div>
              <button onClick={() => setAddModalOpen(false)} className="absolute top-8 right-8 text-cyan-400 hover:text-pink-400">
                <Terminal size={40} />
              </button>
              <h2 className="text-5xl font-black text-center mb-12 glitch" data-text="DEPLOY NODE">
                DEPLOY NODE
              </h2>
              <form onSubmit={handleRegister} className="space-y-8">
                <input required placeholder="NODE NAME" className="input-neon text-2xl py-6" value={newSite.name} onChange={e => setNewSite({...newSite, name: e.target.value})} />
                <input required type="url" placeholder="TARGET URL" className="input-neon text-2xl py-6" value={newSite.url} onChange={e => setNewSite({...newSite, url: e.target.value})} />
                <input placeholder="GROUP TAG" className="input-neon text-2xl py-6" value={newSite.group} onChange={e => setNewSite({...newSite, group: e.target.value})} />
                <button type="submit" className="w-full btn-neon text-4xl py-8 rounded-3xl">
                  ACTIVATE
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
    <div className="cyber-bg min-h-screen flex items-center justify-center relative">
      <div className="scanlines"></div>
      <div className="relative z-10 card p-16 rounded-3xl max-w-lg w-full glow">
        <div className="text-center mb-16">
          <Shield size={100} className="mx-auto text-cyan-400 glow mb-8 animate-pulse" />
          <h1 className="text-7xl font-black glitch mb-4" data-text="NEXUS_ROOT">
            NEXUS_ROOT
          </h1>
          <p className="text-3xl text-cyan-300 animate-flicker">BOOT SEQUENCE INITIATED</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-10">
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="AUTHENTICATION ID" className="input-neon text-3xl py-8" />
          <div className="relative">
            <input required type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="PASSCODE" className="input-neon text-3xl py-8" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-10 top-10 text-cyan-400 hover:text-pink-400">
              {show ? <EyeOff size={40} /> : <Eye size={40} />}
            </button>
          </div>
          {error && <p className="text-red-500 text-4xl text-center font-black animate-pulse">{error}</p>}
          <button type="submit" className="w-full btn-neon text-5xl py-10 rounded-3xl animate-pulse">
            INITIATE BOOT
          </button>
        </form>
      </div>
    </div>
  );
};
