import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getRecipeImages } from '../lib/storage';
import { Recipe } from '../types';
import { Clock, ChefHat, Heart, Share2, Printer, ChevronLeft, PlayCircle, Plus, Check, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RecipeTimer } from '../components/RecipeTimer';
import { motion } from 'motion/react';

export function RecipeDetails() {
  const { id } = useParams();
  const { isFavorite, toggleFavorite, user, login } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function loadRecipe() {
      if (!id) return;
      try {
         const docRef = doc(db, 'recipes', id);
         const snap = await getDoc(docRef);
         if (snap.exists()) {
           setRecipe({ id: snap.id, ...snap.data() } as Recipe);
           const imgs = await getRecipeImages(snap.id);
           setImages(imgs);
         }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500 font-bold animate-pulse text-lg">
        Chargement de la magnifique recette...
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-md mx-auto my-20 text-center bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-extrabold text-[#333333] mb-2">Recette introuvable</h2>
        <p className="text-slate-400 mb-6 font-medium">La recette demandée n&apos;existe plus ou a été retirée par son auteur.</p>
        <Link to="/" className="inline-flex bg-brand-blue text-white font-bold px-6 py-3 rounded-full text-sm">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Lien de partage copié dans le presse-papiers !');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddAllToGroceries = () => {
    if (!recipe) return;
    const current = localStorage.getItem('beensa_grocery_list');
    let list: string[] = current ? JSON.parse(current) : [];
    
    // Add unique recipe ingredients
    const newItems = recipe.ingredients.filter(ing => !list.includes(ing));
    list = [...list, ...newItems];
    
    localStorage.setItem('beensa_grocery_list', JSON.stringify(list));
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };

  const fav = isFavorite(recipe.id);

  const difficultyNames = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Expert'
  };

  const difficultyColors = {
    easy: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    medium: 'bg-amber-50 text-amber-600 border border-amber-100',
    hard: 'bg-rose-50 text-rose-600 border border-rose-100'
  };

  const placeholderImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000";

  const shareUrl = window.location.href;
  const shareText = `Découvrez la délicieuse recette de "${recipe.title}" sur Beensa Kitchen !`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;

  return (
    <div className="bg-[#FAFAFB] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation link styled as a clean back-pill */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-brand-blue bg-white px-4 py-2.5 rounded-full border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.01)] transition-all active:scale-95 duration-200"
          >
            <ChevronLeft className="w-4 h-4 text-brand-orange" /> Retour à l&apos;accueil
          </Link>
        </div>

        {/* Master Details Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Left panel: Media, story headers, ingredients, steps progression */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Featured Header Media Image with premium layout overlay */}
            <div className="w-full aspect-[21/10] bg-slate-100 rounded-[36px] overflow-hidden relative shadow-[0_15px_40px_rgba(0,0,0,0.04)] group">
              <img 
                src={images[0] || placeholderImage} 
                alt={recipe.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-103" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent" />
              
              {/* Floating aesthetic difficulty pill */}
              <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
                <span className={`px-4.5 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-lg ${difficultyColors[recipe.difficulty]}`}>
                  {difficultyNames[recipe.difficulty]}
                </span>
              </div>
            </div>

            {/* Essential Narrative and Ingredients Card */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-6 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.015)] space-y-8">
              <div>
                <div className="flex gap-2 mb-4">
                  {recipe.categories?.map((cat, i) => (
                    <span 
                      key={i} 
                      className="text-[9px] uppercase font-bold tracking-widest text-brand-orange bg-brand-orange/10 px-3.5 py-1.5 rounded-full"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                
                <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1a2531] tracking-tight leading-tight mb-4 font-sans">
                  {recipe.title}
                </h1>
                
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
                  {recipe.description}
                </p>
              </div>

              {/* Ingredients Card View with unified add groceries call-to-action */}
              <div className="pt-4 border-t border-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Ingrédients Requis</h2>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Doses prévues pour la préparation</p>
                  </div>
                  
                  <button 
                    onClick={handleAddAllToGroceries}
                    className={`inline-flex items-center gap-2 text-xs font-extrabold uppercase px-5 py-3 rounded-full transition-all duration-300 shadow-md ${
                      addedToCart 
                        ? 'bg-emerald-500 text-white shadow-emerald-500/10 scale-95' 
                        : 'bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white hover:scale-102 active:scale-95'
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-4 h-4 animate-bounce" />
                        <span>Recette ajoutée !</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Ajouter aux courses</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {recipe.ingredients.map((ing, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:border-brand-pink/20 hover:bg-white hover:shadow-md hover:shadow-brand-pink/[0.015] transition-all duration-300"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-pink/80 shrink-0" />
                      <span className="text-slate-700 text-xs sm:text-sm font-semibold tracking-tight leading-snug">{ing}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparation Steps timeline checklist */}
              <div className="pt-8 border-t border-slate-50">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mb-8">Préparation pas à pas</h2>
                <div className="relative pl-6 sm:pl-8 border-l border-slate-100 space-y-12">
                  {recipe.steps.map((step, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.45, delay: i * 0.08 }}
                      className="relative group pr-2"
                    >
                      {/* Timeline pointer */}
                      <div className="absolute -left-12 sm:-left-14 top-1 w-11 h-11 rounded-full bg-slate-100 border-4 border-white text-slate-500 flex items-center justify-center font-black text-sm shadow-sm group-hover:bg-brand-orange group-hover:text-white group-hover:border-orange-100 transition-all duration-300">
                        {i + 1}
                      </div>
                      
                      <div className="pt-1.5 pl-2 sm:pl-4">
                        <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed group-hover:text-slate-800 transition-colors duration-300">
                          {step}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Right panel: Static Side Box containing Timer widgets, print/share toolboxes, cooking video */}
          <div className="space-y-6">
            
            {/* Bento Sidebar performance stats box */}
            <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.01)] text-slate-800 space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-400">Métriques de cuisine</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all hover:bg-brand-pink/[0.02]">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Préparation</span>
                  <div className="flex items-center justify-center gap-1.5 text-slate-800 font-extrabold text-base">
                    <Clock className="w-4 h-4 text-brand-pink" />
                    <span>{recipe.prepTime} min</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all hover:bg-brand-orange/[0.02]">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cuisson</span>
                  <div className="flex items-center justify-center gap-1.5 text-slate-800 font-extrabold text-base">
                    <Clock className="w-4 h-4 text-brand-orange" />
                    <span>{recipe.cookTime} min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky interactive Cooking Timer widget */}
            <RecipeTimer prepTime={recipe.prepTime} cookTime={recipe.cookTime} />

            {/* Share and Print Toolbox block */}
            <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.015)] space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-400">Boîte à outils</h3>
              
              <div className="flex items-center gap-2 justify-center lg:justify-start flex-wrap">
                {/* Heart Button */}
                <button 
                  onClick={() => user ? toggleFavorite(recipe.id) : login()} 
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 border ${
                    fav 
                      ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100' 
                      : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-600'
                  }`}
                  title="Ajouter aux favoris"
                >
                  <Heart className={`w-5 h-5 ${fav ? 'fill-current animate-bounce' : ''}`} />
                </button>
                
                {/* Print button */}
                <button 
                  onClick={handlePrint} 
                  className="w-12 h-12 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100 rounded-full flex items-center justify-center transition-all active:scale-90" 
                  title="Imprimer la recette"
                >
                  <Printer className="w-5 h-5" />
                </button>

                <div className="h-6 w-px bg-slate-200 mx-2" />

                {/* Social icons */}
                <a 
                  href={facebookShareUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-slate-50 hover:bg-[#1877F2]/10 hover:text-[#1877F2] text-slate-500 hover:border-[#1877F2]/20 rounded-full flex items-center justify-center transition-all active:scale-90 border border-slate-100"
                  title="Partager sur Facebook"
                >
                  <Facebook className="w-4.5 h-4.5" />
                </a>

                <a 
                  href={twitterShareUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-slate-50 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] text-slate-500 hover:border-[#1DA1F2]/20 rounded-full flex items-center justify-center transition-all active:scale-90 border border-slate-100"
                  title="Partager sur Twitter / X"
                >
                  <Twitter className="w-4.5 h-4.5" />
                </a>

                <a 
                  href={whatsappShareUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-slate-50 hover:bg-[#25D366]/10 hover:text-[#25D366] text-slate-500 hover:border-[#25D366]/20 rounded-full flex items-center justify-center transition-all active:scale-90 border border-slate-100"
                  title="Partager sur WhatsApp"
                >
                  <MessageCircle className="w-4.5 h-4.5" />
                </a>

                {/* Direct clipboard share */}
                <button 
                  onClick={handleShare} 
                  className="w-12 h-12 bg-slate-50 hover:bg-brand-orange/10 hover:text-brand-orange text-slate-600 hover:border-brand-orange/20 rounded-full flex items-center justify-center transition-all active:scale-90 border border-slate-100" 
                  title="Copier le lien"
                >
                  <Share2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Interactive video tutorial helper */}
            {recipe.videoUrl && (
              <div className="bg-gradient-to-br from-indigo-900 to-slate-950 p-6 rounded-[28px] border border-indigo-950 flex items-center gap-4 text-white hover:scale-[1.01] transition-transform shadow-[0_12px_35px_rgba(42,92,138,0.1)]">
                <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-brand-orange/35 animate-pulse">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Atelier Vidéo Pas à Pas</h3>
                  <a 
                    href={recipe.videoUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-brand-orange font-bold text-xs hover:underline flex items-center gap-1 mt-1 transition-colors hover:text-orange-400"
                  >
                    Visionner la vidéo
                  </a>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
