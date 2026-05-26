import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageSquare, Send, CheckCircle2, User, HelpCircle, Phone, MapPin } from 'lucide-react';

export function Contact() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: 'Feedback',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;
    
    setLoading(true);
    // Simulate high-fidelity api response
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 1200);
  };

  const handleReset = () => {
    setFormState({
      name: '',
      email: '',
      subject: 'Feedback',
      message: ''
    });
    setIsSubmitted(false);
  };

  return (
    <div className="bg-[#FAFAFB] min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full">
        
        {/* Decorative Grid Top Title */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 bg-brand-pink/15 border border-brand-pink/30 text-brand-pink text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
          >
            <HelpCircle className="w-3 h-3" /> Une suggestion ou une question ?
          </motion.span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Contactez notre <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-pink">Atelier</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-3 leading-relaxed font-medium">
            Une idée de recette, un partenariat ou simplement envie de saluer notre chef ? Notre équipe se tient à votre entière disposition.
          </p>
        </div>

        {/* Bento Grid Design Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white rounded-[36px] overflow-hidden border border-slate-100 shadow-[0_15px_50px_rgba(42,92,138,0.03)] p-6 sm:p-10">
          
          {/* Form container - 3 cols on desktop */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form 
                  key="contact-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name field */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Votre Nom</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-brand-orange transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <input 
                          type="text" 
                          required
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          placeholder="Ex: Cédric Beensa"
                          className="w-full bg-slate-50 border border-slate-100 text-slate-950 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white text-sm font-semibold transition-all placeholder-slate-400"
                        />
                      </div>
                    </div>

                    {/* Email field */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Adresse Email</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-brand-orange transition-colors">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input 
                          type="email" 
                          required
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          placeholder="Ex: hello@beensa.com"
                          className="w-full bg-slate-50 border border-slate-100 text-slate-950 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white text-sm font-semibold transition-all placeholder-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subject Radio tags */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Sujet de votre message</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['Feedback', 'Partenariat', 'Bug de l\'app', 'Autre'].map((subj) => (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => setFormState({ ...formState, subject: subj })}
                          className={`px-4.5 py-2.5 rounded-full text-xs font-bold tracking-tight transition-all duration-200 cursor-pointer ${
                            formState.subject === subj 
                              ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                              : 'bg-slate-50 hover:bg-slate-150 border border-slate-100 text-slate-600'
                          }`}
                        >
                          {subj}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Votre Message</label>
                    <div className="relative group">
                      <div className="absolute top-3.5 left-4 text-slate-400 group-focus-within:text-brand-orange transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <textarea
                        required
                        rows={5}
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        placeholder="Qu'aimeriez-vous nous raconter ? Partagez vos conseils, idées..."
                        className="w-full bg-slate-50 border border-slate-100 text-slate-950 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white text-sm font-semibold transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>

                  {/* Dynamic submit button */}
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-brand-orange text-white font-extrabold py-4 px-6 rounded-2xl text-sm shadow-md hover:shadow-brand-orange/20 transition-all duration-300 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Envoyer mon message</span>
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="feedback-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-12 flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Message envoyé !</h3>
                  <p className="text-sm font-semibold text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
                    Merci pour votre message ! Notre Chef ou un membre de notre équipe d'Atelier vous répondra sous 24 à 48 heures.
                  </p>
                  <button 
                    onClick={handleReset} 
                    className="px-6 py-3 rounded-full bg-slate-50 text-slate-600 border border-slate-100 text-xs font-bold uppercase transition-all shadow-sm hover:bg-slate-100 hover:text-slate-800"
                  >
                    Envoyer un autre message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Details Bento Cards - 2 cols on desktop */}
          <div className="lg:col-span-2 flex flex-col justify-between space-y-6 lg:pl-6 lg:border-l lg:border-slate-50">
            
            {/* Quick helper bento box */}
            <div className="bg-[#121E2F] text-white p-6 rounded-3xl relative overflow-hidden flex-1 flex flex-col justify-between shadow-md">
              {/* background decoration blobs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/20 rounded-full blur-2xl -mr-8 -mt-8" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-pink/15 rounded-full blur-xl -ml-6 -mb-6" />
              
              <div className="relative z-10">
                <ChefIcon className="w-8 h-8 text-brand-orange mb-4" />
                <h4 className="font-extrabold text-lg mb-2">Beensa Kitchen HQ</h4>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Basés au cœur du quartier de la gastronomie à Lyon, France. Notre mission est de simplifier l'accès à la cuisine d'exception de manière collaborative.
                </p>
              </div>

              <div className="relative z-10 pt-6 space-y-4 text-xs font-semibold">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-brand-orange" />
                  </div>
                  <span>+33 (0) 4 72 00 15 15</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-brand-pink" />
                  </div>
                  <span>corporate@beensa.com</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <span>Place Bellecour, 69002 Lyon</span>
                </div>
              </div>
            </div>

            {/* Quick response stats */}
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex items-center justify-between">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Temps de réponse de la team</span>
                <span className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                  &lt; 2 heures (En direct)
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// Decorative helper
function ChefIcon({ className }: { className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 18V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14" />
      <path d="M18 18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2" />
      <path d="M18 22H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14" />
    </svg>
  );
}
