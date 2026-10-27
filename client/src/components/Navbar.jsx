import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Layers, 
  Database, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  LayoutDashboard, 
  ExternalLink,
  Menu,
  X,
  Server
} from 'lucide-react';
import { authAPI, healthAPI } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbHealth, setDbHealth] = useState({ maria: 'checking', mongo: 'checking' });

  useEffect(() => {
    // Check local user session
    const storedUser = localStorage.getItem('devshowcase_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Fetch quick health status
    healthAPI.check()
      .then((res) => {
        if (res.data?.databases) {
          setDbHealth({
            maria: res.data.databases.mariaDB === 'connected' ? 'connected' : 'offline',
            mongo: res.data.databases.mongoDB === 'connected' ? 'connected' : 'offline',
          });
        }
      })
      .catch(() => {
        setDbHealth({ maria: 'offline', mongo: 'offline' });
      });
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      localStorage.removeItem('devshowcase_token');
      localStorage.removeItem('devshowcase_user');
      setUser(null);
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Dual-DB Indicator */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-glow-cyan transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-[#090d16] rounded-[7px] flex items-center justify-center">
                  <Layers className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  DevShowcase
                </span>
                <span className="text-[10px] font-mono text-slate-400 -mt-1 tracking-wider">
                  DUAL-DB ARCHITECTURE
                </span>
              </div>
            </Link>

            {/* Micro Live Database Status Badge */}
            <div className="hidden lg:flex items-center gap-2 ml-4 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className={`w-1.5 h-1.5 rounded-full ${dbHealth.maria === 'connected' ? 'bg-emerald-400 shadow-glow-emerald animate-pulse' : 'bg-amber-500'}`} />
                MariaDB
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className={`w-1.5 h-1.5 rounded-full ${dbHealth.mongo === 'connected' ? 'bg-cyan-400 shadow-glow-cyan animate-pulse' : 'bg-amber-500'}`} />
                MongoDB
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-cyan-400 ${location.pathname === '/' ? 'text-cyan-400' : 'text-slate-300'}`}
            >
              Showcase Proyek
            </Link>
            
            <a 
              href="#architecture" 
              onClick={(e) => {
                if (location.pathname !== '/') {
                  e.preventDefault();
                  navigate('/#architecture');
                }
              }}
              className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors"
            >
              Arsitektur Sistem
            </a>

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-sm font-medium transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                  Admin Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-200 hover:text-white hover:border-cyan-500/50 hover:bg-slate-800 text-sm font-medium transition-all"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
                Admin Portal
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-3 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-cyan-400"
          >
            Showcase Proyek
          </Link>
          {user ? (
            <>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-cyan-400 bg-cyan-500/10"
              >
                Admin Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-500/10"
              >
                Logout ({user.username})
              </button>
            </>
          ) : (
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              Admin Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
