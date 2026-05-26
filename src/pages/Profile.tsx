import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Recipe } from '../types';
import { Link } from 'react-router-dom';
import { ChefHat, BookOpen, Heart, Clock } from 'lucide-react';

export function Profile() {
  const { user, profile, login } = useAuth();
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [favRecipes, setFavRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user || !profile) return;
      try {
        // Fetch My Recipes
        const qMy = query(collection(db, 'recipes'), where('authorId', '==', user.uid));
        const snapMy = await getDocs(qMy);
        const my = snapMy.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
        setMyRecipes(my);

        // Fetch Favorite Recipes
        const favs: Recipe[] = [];
        const favIds = profile.favoriteRecipes.slice(0, 20); // limits
        for (const id of favIds) {
           const d = await getDoc(doc(db, 'recipes', id));
           if (d.exists()) {
             favs.push({ id: d.id, ...d.data() } as Recipe);
           }
        }
        setFavRecipes(favs);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, profile]);

  if (!user || !profile) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="w-16 h-16 bg-brand-pink/15 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-brand-pink" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 mb-2">Connectez-vous</h2>
        <p className="text-sm text-slate-500 mb-6">Consultez vos recettes favorites et votre profil personnalisé en vous connectant.</p>
        <button 
          onClick={login}
          className="w-full bg-brand-blue hover:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-full transition-all shadow-md shadow-brand-blue/10 active:scale-95"
        >
          Se connecter avec Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 pb-32">
      {/* Profile Header Card */}
      <div className="bg-white rounded-[32px] p-8 sm:p-12 mb-12 shadow-[0_4px_30px_rgba(0,0,0,0.015)] border border-slate-100/80 flex flex-col sm:flex-row items-center sm:items-start gap-8">
        {profile.photoURL ? (
          <img src={profile.photoURL} alt="profile" className="w-28 h-28 rounded-full shadow-md object-cover border-4 border-white" />
        ) : (
          <div className="w-28 h-28 rounded-full shadow-md bg-brand-orange text-white flex items-center justify-center font-extrabold text-4xl border-4 border-white">
            {profile.displayName?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-1 font-sans">{profile.displayName}</h1>
          <p className="text-slate-400 font-semibold text-sm mb-6">{profile.email}</p>
          <div className="flex justify-center sm:justify-start gap-8">
            <div className="text-center sm:text-left">
              <span className="block text-3xl font-extrabold text-brand-blue">{myRecipes.length}</span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Recettes publiées</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="block text-3xl font-extrabold text-brand-pink">{profile.favoriteRecipes.length}</span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Favoris enregistrés</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {/* Saved Favorites Section */}
        <section>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
            <Heart className="w-6 h-6 text-brand-pink fill-current" /> 
            Mes Recettes Favorites
          </h2>
          {loading ? (
             <div className="h-40 bg-white rounded-3xl animate-pulse"></div>
          ) : favRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {favRecipes.map(recipe => (
                <RecipeMinCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 font-semibold bg-white rounded-[24px] border border-slate-100">
              Aucune recette favorite enregistrée pour le moment.
            </div>
          )}
        </section>

        {/* My Recipes Section */}
        <section>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-blue" /> 
            Mes Créations
          </h2>
          {loading ? (
             <div className="h-40 bg-white rounded-3xl animate-pulse"></div>
          ) : myRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {myRecipes.map(recipe => (
                <RecipeMinCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 font-semibold bg-white rounded-[24px] border border-slate-100 flex flex-col items-center">
              <p className="mb-4">Vous n&apos;avez pas encore publié de recettes.</p>
              <Link to="/create" className="text-brand-orange font-extrabold bg-brand-orange/10 px-6 py-2.5 rounded-full text-xs uppercase tracking-wide hover:bg-brand-orange/15 transition-all">
                Publier ma première recette
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function RecipeMinCard({ recipe }: { recipe: Recipe; key?: React.Key }) {
  const difficultyNames = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Expert'
  };

  const difficultyColors = {
    easy: 'text-emerald-500',
    medium: 'text-amber-500',
    hard: 'text-rose-500'
  };

  return (
    <Link to={`/recipe/${recipe.id}`} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-brand-blue/20 hover:shadow-md transition-all group">
      <div className="w-20 h-20 rounded-xl bg-slate-50 shrink-0 overflow-hidden">
        {recipe.imageUrls?.[0] ? (
          <img src={recipe.imageUrls[0]} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ChefHat className="w-8 h-8" />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center">
        <h3 className="font-extrabold text-sm text-slate-800 line-clamp-1 group-hover:text-brand-blue transition-colors">{recipe.title}</h3>
        <span className={`text-[10px] font-extrabold uppercase tracking-wider mt-1 ${difficultyColors[recipe.difficulty] || 'text-slate-450'}`}>
          {difficultyNames[recipe.difficulty]}
        </span>
        <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-400 uppercase">
          <Clock className="w-3.5 h-3.5 text-brand-orange" /> {recipe.prepTime + recipe.cookTime} min
        </div>
      </div>
    </Link>
  );
}
