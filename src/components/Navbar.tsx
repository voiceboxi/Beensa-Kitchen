import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, PlusSquare, LogOut, User as UserIcon, Home, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';

export function Navbar() {
  const { user, profile, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  // Custom function to check if link is active
  const isActive = (path: string) => currentPath === path;

  const navLinks = [
    { name: 'Accueil', path: '/', icon: Home },
    { name: 'Nouvelle Recette', path: '/create', icon: PlusSquare },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  return (
    <>
      {/* Main Top Header Navbar (Desktop + Logo Header on Mobile) */}
      <nav className="bg-[#FDFDFD]/85 backdrop-blur-xl border-b border-slate-100/80 sticky top-0 z-50 shrink-0 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo Brand Brand */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-11 h-11 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg shadow-brand-blue/15 group-hover:scale-105 transition-all duration-300">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-brand-blue">
                Beensa<span className="text-brand-orange">Kitchen</span>
              </span>
            </Link>
            
            {/* Desktop Center Navigation Links */}
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                const LinkIcon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-colors duration-300 flex items-center gap-2 cursor-pointer ${
                      active ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                    }`}
                  >
                    <LinkIcon className={`w-4 h-4 ${active ? 'text-brand-orange' : 'text-slate-400'}`} />
                    <span>{link.name}</span>
                    {active && (
                      <motion.div
                        layoutId="navPill"
                        className="absolute bottom-0 inset-x-4 h-[3px] bg-brand-orange rounded-full"
                        style={{ originY: '0px' }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Top Right Utilities Area (Desktop) */}
            <div className="flex items-center gap-2.5">
              
              {/* Desktop Profile / Authenticate View (Hidden on direct mobile for simplification) */}
              <div className="hidden sm:flex items-center gap-3">
                {!user ? (
                  <button 
                    onClick={login}
                    className="bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full font-extrabold shadow-md shadow-brand-blue/10 transition-all active:scale-95 text-xs tracking-wide uppercase cursor-pointer"
                  >
                    Connexion
                  </button>
                ) : (
                  <>
                    <Link 
                      to="/create" 
                      className="bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange px-4 py-2.5 rounded-full flex items-center gap-2 font-extrabold transition-all text-xs tracking-wide uppercase group cursor-pointer"
                      title="Créer une recette"
                    >
                      <PlusSquare className="h-4.5 w-4.5 group-hover:rotate-90 transition-transform duration-300 shrink-0" />
                      <span>Créer</span>
                    </Link>
                    
                    <Link to="/profile" className="flex items-center gap-2 hover:bg-slate-50 px-3 py-1.5 rounded-2xl transition-all group shrink-0 border border-transparent hover:border-slate-100">
                      {profile?.photoURL ? (
                        <img src={profile.photoURL} alt="profile" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-brand-pink text-brand-blue rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                          {profile?.displayName?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="text-xs font-bold text-slate-700 group-hover:text-brand-blue">
                        {profile?.displayName?.split(' ')[0] || 'Profil'}
                      </span>
                    </Link>

                    <button 
                      onClick={() => { logout(); navigate('/'); }}
                      className="text-slate-400 hover:text-red-500 p-2.5 hover:bg-red-50 rounded-full transition-all shrink-0 cursor-pointer"
                      title="Se déconnecter"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                    </button>
                  </>
                )}
              </div>

              {/* Mobile-only visible quick profile status to save viewport weight */}
              <div className="flex sm:hidden items-center">
                {user ? (
                  <Link to="/profile" className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-brand-pink text-brand-blue flex items-center justify-center font-extrabold text-sm">
                        {profile?.displayName?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </Link>
                ) : (
                  <button 
                    onClick={login}
                    className="bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded-full font-bold text-xs transition-all active:scale-95 cursor-pointer"
                  >
                    Connexion
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      </nav>

      {/* Floating Suspended Glass Bottom Navigation Panel (Mobile Specific) */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        <div className="max-w-md w-full bg-[#FFFFFF]/85 backdrop-blur-lg border border-slate-200/50 rounded-full py-2.5 px-3.5 shadow-[0_12px_40px_rgba(15,23,42,0.12)] flex items-center justify-around pointer-events-auto">
          
          {/* Mobile Home Nav Link */}
          <Link 
            to="/" 
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all relative ${
              isActive('/') ? 'text-brand-orange scale-105' : 'text-slate-400 active:scale-95'
            }`}
          >
            <Home className="w-5.5 h-0.5 min-h-[22px] min-w-[22px]" />
            <span className="text-[9px] font-bold mt-0.5 tracking-tight uppercase">Accueil</span>
          </Link>

          {/* Mobile Create Recipe Nav Link */}
          <Link 
            to="/create" 
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all relative ${
              isActive('/create') ? 'text-brand-orange scale-105' : 'text-slate-400 active:scale-95'
            }`}
          >
            <PlusSquare className="w-5.5 h-0.5 min-h-[22px] min-w-[22px]" />
            <span className="text-[9px] font-bold mt-0.5 tracking-tight uppercase">Créer</span>
          </Link>

          {/* Mobile Contact Nav Link */}
          <Link 
            to="/contact" 
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all relative ${
              isActive('/contact') ? 'text-brand-orange scale-105' : 'text-slate-400 active:scale-95'
            }`}
          >
            <Mail className="w-5.5 h-0.5 min-h-[22px] min-w-[22px]" />
            <span className="text-[9px] font-bold mt-0.5 tracking-tight uppercase">Contact</span>
          </Link>

          {/* Mobile User Profile Link */}
          <Link 
            to="/profile" 
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all relative ${
              isActive('/profile') ? 'text-brand-orange scale-105' : 'text-slate-400 active:scale-95'
            }`}
          >
            <UserIcon className="w-5.5 h-0.5 min-h-[22px] min-w-[22px]" />
            <span className="text-[9px] font-bold mt-0.5 tracking-tight uppercase">Profil</span>
          </Link>
          
        </div>
      </div>
    </>
  );
}
