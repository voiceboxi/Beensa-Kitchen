import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Recipe } from '../types';
import { Link } from 'react-router-dom';
import { Clock, ChefHat, Heart, Search, Check, ShoppingBag, Trash, Filter, CheckSquare, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRecipeImages } from '../lib/storage';
import { motion, AnimatePresence } from 'motion/react';

function RecipeCard({ recipe }: { recipe: Recipe; key?: React.Key }) {
  const { isFavorite, toggleFavorite, user, login } = useAuth();
  const [fav, setFav] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    setFav(isFavorite(recipe.id));
  }, [recipe.id, isFavorite]);

  useEffect(() => {
    if (recipe.imageUrls && recipe.imageUrls.length > 0) {
      setImage(recipe.imageUrls[0]);
    } else {
      getRecipeImages(recipe.id).then(imgs => {
        if (imgs && imgs.length > 0) {
          setImage(imgs[0]);
        }
      });
    }
  }, [recipe]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      await login();
      return;
    }
    setFav(!fav);
    await toggleFavorite(recipe.id);
  };

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

  // Curated elegant food image placeholders if not provided
  const placeholderImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600";

  // Dynamic aesthetic profile colored tags for beautiful authorship simulation
  const authorInitials = recipe.title ? recipe.title[0].toUpperCase() : 'B';
  const authorBadgeColors = [
    'bg-indigo-100 text-indigo-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-pink-100 text-pink-700',
    'bg-teal-100 text-teal-700'
  ];
  // Stable selection based on recipe difficulty or title length
  const accentColor = authorBadgeColors[recipe.title.length % authorBadgeColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Link 
        to={`/recipe/${recipe.id}`} 
        className="group relative bg-[#FDFDFD] rounded-[28px] border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_20px_40px_rgba(42,92,138,0.06)] transition-all duration-500 flex flex-col h-full"
      >
        {/* Interactive image container */}
        <div className="aspect-[4/3.1] bg-slate-50 overflow-hidden relative shrink-0">
          <img 
            src={image || placeholderImage} 
            alt={recipe.title} 
            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-1000 ease-out" 
          />
          
          {/* Refined gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-950/5 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          
          {/* Favorite button with bounce effect */}
          <button 
            onClick={handleFavoriteClick}
            className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
              fav 
                ? 'bg-rose-500 text-white shadow-lg active:scale-90 scale-100' 
                : 'bg-white/95 text-slate-700 hover:bg-rose-50 hover:text-rose-600 shadow-md hover:scale-105 active:scale-95'
            }`}
          >
            <Heart className={`w-4 h-4 transition-transform ${fav ? 'scale-110 fill-current' : ''}`} />
          </button>

          {/* Difficulty pill */}
          <span className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${difficultyColors[recipe.difficulty] || 'bg-slate-100 text-slate-700'}`}>
            {difficultyNames[recipe.difficulty]}
          </span>
        </div>

        {/* Info elements */}
        <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between bg-white relative z-10">
          <div>
            <div className="flex gap-2 mb-2.5 flex-wrap">
              {recipe.categories?.slice(0, 2).map((cat, i) => (
                <span 
                  key={i} 
                  className="text-[9px] uppercase font-bold tracking-widest text-brand-orange bg-brand-orange/10 px-2.5 py-1 rounded-md"
                >
                  {cat}
                </span>
              ))}
            </div>

            <h3 className="font-bold text-base sm:text-lg text-slate-800 line-clamp-1 mb-1.5 group-hover:text-brand-blue transition-colors duration-300 tracking-tight leading-snug">
              {recipe.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mb-5 leading-relaxed font-medium">
              {recipe.description}
            </p>
          </div>

          {/* Author simulation panel and recipes indices */}
          <div className="pt-4 border-t border-slate-50 mt-auto flex flex-col gap-3">
            <div className="flex items-center justify-between">
              {/* Simulator Author badge matching Dribbble profile design */}
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${accentColor} shrink-0`}>
                  {authorInitials}
                </div>
                <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-800 transition-colors">
                  Chef {authorInitials === 'C' ? 'Cédric' : authorInitials === 'P' ? 'Pierre' : 'Beensa'}
                </span>
              </div>

              {/* Time Indicators */}
              <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-orange/80" />
                  <span>{recipe.prepTime + recipe.cookTime} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat className="w-3.5 h-3.5 text-brand-blue/80" />
                  <span>{recipe.ingredients?.length || 0} ingr.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Toutes');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Grocery List state persisted locally
  const [groceryList, setGroceryList] = useState<string[]>(() => {
    const list = localStorage.getItem('beensa_grocery_list');
    return list ? JSON.parse(list) : [
      '3 Oeufs biologiques',
      '200g Pâtes fraîches',
      'Crème liquide entière',
      'Parmigiano Reggiano'
    ];
  });
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    async function loadRecipes() {
      try {
        const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'), limit(30));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
        setRecipes(fetched);
      } catch (e) {
        console.error("Error loading recipes", e);
      } finally {
        setLoading(false);
      }
    }
    loadRecipes();
  }, []);

  const handleAddGrocery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const updated = [...groceryList, newItem.trim()];
    setGroceryList(updated);
    localStorage.setItem('beensa_grocery_list', JSON.stringify(updated));
    setNewItem('');
  };

  const handleRemoveGrocery = (index: number) => {
    const updated = groceryList.filter((_, i) => i !== index);
    setGroceryList(updated);
    localStorage.setItem('beensa_grocery_list', JSON.stringify(updated));
  };

  const handleClearGrocery = () => {
    setGroceryList([]);
    localStorage.setItem('beensa_grocery_list', JSON.stringify([]));
  };

  const categories = ['Toutes', 'Petit-déjeuner', 'Repas', 'Dessert', 'Boisson'];
  const difficulties = [
    { key: 'Toutes', label: 'Toutes' },
    { key: 'easy', label: 'Facile' },
    { key: 'medium', label: 'Moyen' },
    { key: 'hard', label: 'Expert' }
  ];

  // Filtering Logic
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.categories?.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = 
      selectedCategory === 'Toutes' || 
      recipe.categories?.some(c => c.toLowerCase() === selectedCategory.toLowerCase());

    const matchesDifficulty = 
      selectedDifficulty === 'Toutes' || 
      recipe.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Featured Recipe of the day (First or custom)
  const featuredRecipe = recipes[0];

  return (
    <div className="bg-[#FAFAFB] min-h-screen">
      {/* Dynamic Header / Hero Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="relative rounded-[36px] p-8 sm:p-14 lg:p-16 mb-12 text-white overflow-hidden shadow-[0_12px_45px_rgba(15,23,42,0.08)] bg-slate-900 border border-slate-800">
          
          {/* Image filling the entire banner background */}
          <img 
            src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="Decorative cooking background"
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-transparent" />

          {/* Curated ambient glow effects */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/20 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] bg-brand-pink/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -left-10 top-1/4 w-32 h-32 bg-blue-500/15 rounded-full blur-[50px] pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl flex flex-col items-start">
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 bg-brand-orange/15 border border-brand-orange/30 text-brand-orange text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" /> Chef d'Atelier Numérique
            </motion.span>
            
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-[1.1] tracking-tight text-white font-sans">
                La cuisine <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-rose-400">à votre image</span>
              </h1>
            </div>
            
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg mb-8 max-w-lg font-medium leading-relaxed">
              Créez, planifiez vos listes de courses et partagez des recettes d&apos;exception avec la communauté.
            </p>
            
            {/* Elegant Floating Search Capsule */}
            <div className="w-full relative max-w-xl group bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1.5 shadow-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-blue/10 transition-all duration-300">
              <div className="flex items-center">
                <div className="pl-4 text-slate-400 group-focus-within:text-brand-orange transition-colors">
                  <Search className="w-5 h-5 shrink-0" />
                </div>
                <input 
                  type="text" 
                  placeholder="Recette, ingrédient, saveur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-none text-white focus:text-slate-900 placeholder-slate-400 focus:placeholder-slate-400 rounded-full py-3.5 pl-3 pr-4 focus:outline-none text-sm sm:text-base font-semibold"
                />
                <button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold py-2.5 sm:py-3 px-6 rounded-full text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0">
                  Trouver
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Board Grid layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        
        {/* Unified & Responsive Categories Row with sliding Framer-Motion indicators */}
        <div className="bg-white rounded-3xl p-3 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Scrollable Track */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="relative px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-tight transition-all duration-300 whitespace-nowrap shrink-0 overflow-hidden cursor-pointer"
                  >
                    {/* Sliding active pill indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryIndicator"
                        className="absolute inset-0 bg-brand-blue"
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      />
                    )}
                    <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mobile utilities toggle panel trigger */}
            <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-3.5 sm:pt-0 border-t sm:border-t-0 border-slate-50 px-2">
              <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)} 
                className={`lg:hidden flex items-center gap-2 text-xs font-extrabold uppercase px-4 py-2.5 rounded-full transition-all border ${
                  showMobileFilters 
                    ? 'bg-brand-orange text-white border-brand-orange' 
                    : 'bg-slate-50 text-slate-600 border-slate-100'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Boîte à Outils</span>
              </button>

              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-100">
                {filteredRecipes.length} Recette{filteredRecipes.length > 1 ? 's' : ''}
              </span>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Area: Filters and Grocery Generator (Bento Aesthetic) */}
          <div className={`space-y-6 lg:col-span-1 order-2 lg:order-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            
            {/* Difficulty Filter Panel */}
            <div className="bg-white rounded-[24px] border border-slate-100/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare className="w-4 h-4 text-brand-orange" />
                <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-800">
                  Difficulté
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff.key}
                    onClick={() => setSelectedDifficulty(diff.key)}
                    className={`px-3 py-2.5 rounded-xl text-center text-xs font-bold transition-all border ${selectedDifficulty === diff.key ? 'bg-brand-orange text-white border-brand-orange shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
                   {/* Dynamic grocery generator */}
            <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-brand-orange" />
                  </div>
                  <h3 className="font-extrabold text-[13px] uppercase tracking-wider text-slate-800">
                    Courses
                  </h3>
                </div>
                {groceryList.length > 0 && (
                  <button 
                    onClick={handleClearGrocery} 
                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase transition-colors"
                  >
                    Vider
                  </button>
                )}
              </div>

              {/* Form to add course items with elegant focus styles */}
              <form onSubmit={handleAddGrocery} className="mb-4">
                <input 
                  type="text" 
                  placeholder="Ajouter un ingrédient..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white text-slate-800 font-semibold transition-all placeholder-slate-400"
                />
              </form>

              {groceryList.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  <AnimatePresence initial={false}>
                    {groceryList.map((item, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, height: 0, y: -4 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: 4 }}
                        transition={{ duration: 0.2 }}
                        className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-3 group/item hover:border-brand-orange/25 hover:bg-brand-orange/[0.01] transition-all"
                      >
                        <span className="text-xs font-semibold text-slate-700 tracking-tight">{item}</span>
                        <button 
                          onClick={() => handleRemoveGrocery(idx)}
                          className="text-slate-300 hover:text-rose-500 p-1 rounded-full transition-colors"
                          title="Supprimer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 font-medium">
                  Votre liste est vide.
                </div>
              )}
            </div>

          </div>

          {/* Right Area: Grid List of recipes */}
          <div className="lg:col-span-3 space-y-10 order-1 lg:order-2">
            
            {/* Featured recipe banner if available */}
            {selectedCategory === 'Toutes' && selectedDifficulty === 'Toutes' && !searchTerm && featuredRecipe && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="group relative h-80 sm:h-[360px] rounded-[36px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.03)]"
              >
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent z-10" />
                <img 
                  src={featuredRecipe.imageUrls?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000'} 
                  alt="Featured Recipe" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-104" 
                />
                <div className="relative z-20 h-full p-8 sm:p-12 flex flex-col justify-end max-w-xl">
                  <span className="bg-brand-orange text-white text-[9px] font-extrabold tracking-widest px-4 py-1.5 rounded-full w-fit mb-4 uppercase shadow-md">
                    ✨ Recette Vedette
                  </span>
                  
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 leading-tight tracking-tight">
                    {featuredRecipe.title}
                  </h2>
                  
                  <p className="text-slate-200 text-xs sm:text-sm font-medium line-clamp-2 mb-6 leading-relaxed">
                    {featuredRecipe.description}
                  </p>
                  
                  <Link 
                    to={`/recipe/${featuredRecipe.id}`}
                    className="bg-white hover:bg-brand-orange hover:text-white text-slate-900 font-bold px-7 py-3.5 rounded-full text-xs uppercase tracking-wider w-fit transition-all shadow-lg hover:shadow-brand-orange/20 active:scale-95"
                  >
                    Découvrir l&apos;Atelier
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Recipe Index view */}
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100/60">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                  {searchTerm ? `Résultats pour "${searchTerm}"` : 'Toutes les Recettes'}
                </h2>
                <span className="text-[10px] font-extrabold text-brand-blue uppercase tracking-wider bg-brand-blue/5 border border-brand-blue/10 px-3.5 py-1.5 rounded-full">
                  {filteredRecipes.length} disponible{filteredRecipes.length > 1 ? 's' : ''}
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="bg-white rounded-[28px] h-96 animate-pulse border border-slate-100 shadow-sm" />
                  ))}
                </div>
              ) : filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredRecipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.01)] px-6">
                  <div className="w-[100px] h-[100px] bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ChefHat className="w-12 h-12 text-slate-300" />
                  </div>
                  <p className="text-lg font-bold text-slate-700">Aucune recette trouvée</p>
                  <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto font-medium">Ajustez vos filtres ou effectuez une nouvelle recherche pour explorer d&apos;autres saveurs.</p>
                </div>
              )}
            </div>

          </div>

          </div>

        </div>
      </div>
    </div>
  );
}
