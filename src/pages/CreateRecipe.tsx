import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadImagesAsBase64 } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react';

const recipeSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères").max(100, "Le titre est trop long"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères").max(500),
  prepTime: z.number().min(0),
  cookTime: z.number().min(0),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  ingredients: z.array(z.object({ value: z.string().min(1, "L'ingrédient ne peut pas être vide") })).min(1, "Ajoutez au moins un ingrédient"),
  steps: z.array(z.object({ value: z.string().min(1, "L'étape ne peut pas être vide") })).min(1, "Ajoutez au moins une étape de préparation"),
  videoUrl: z.string().url("Veuillez saisir une URL de vidéo valide (https://...)").optional().or(z.literal('')),
  categories: z.string().min(1, "Ajoutez au moins une catégorie"),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

export function CreateRecipe() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      difficulty: 'medium',
      ingredients: [{ value: '' }],
      steps: [{ value: '' }],
    }
  });

  const { fields: ingFields, append: appendIng, remove: removeIng } = useFieldArray({ control, name: 'ingredients' });
  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({ control, name: 'steps' });

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="w-16 h-16 bg-brand-orange/15 rounded-full flex items-center justify-center mx-auto mb-6">
          <ImageIcon className="w-8 h-8 text-brand-orange" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 mb-2">Connectez-vous</h2>
        <p className="text-sm text-slate-500 mb-6">Vous devez avoir un compte pour partager vos magnifiques créations culinaires sur Beensa Kitchen.</p>
        <button 
          onClick={login}
          className="w-full bg-brand-blue hover:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-full transition-all shadow-md shadow-brand-blue/10 active:scale-95"
        >
          Se connecter avec Google
        </button>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files).slice(0, 5)); // max 5 images
    }
  };

  const onSubmit = async (data: RecipeFormData) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // 1. Create recipe doc first to get ID
      const docRef = await addDoc(collection(db, 'recipes'), {
        title: data.title,
        description: data.description,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        difficulty: data.difficulty,
        ingredients: data.ingredients.map(i => i.value),
        steps: data.steps.map(s => s.value),
        videoUrl: data.videoUrl || null,
        categories: data.categories.split(',').map(c => c.trim()).filter(Boolean),
        tags: [],
        authorId: user.uid,
        imageUrls: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // 2. Upload images and update recipe
      if (images.length > 0) {
        await uploadImagesAsBase64(docRef.id, images);
      }
      
      navigate(`/recipe/${docRef.id}`);
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la sauvegarde. Veuillez consulter la console.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)} 
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-blue mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="bg-white rounded-[32px] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 sm:p-12">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 font-sans">Créer une Recette</h1>
        <p className="text-slate-400 font-medium mb-10">Partagez votre art culinaire pas à pas avec notre éditeur moderne.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Titre de la recette</label>
              <input 
                {...register('title')} 
                placeholder="Ex. Carbonara crémeuse de Rome / Tarte fine aux pommes" 
                className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder-slate-400 text-sm font-medium" 
              />
              {errors.title && <p className="text-red-500 text-xs mt-2 font-semibold">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea 
                {...register('description')} 
                placeholder="Décrivez l'histoire ou l'essence de ce plat culinaire en quelques lignes..." 
                rows={3} 
                className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder-slate-400 text-sm font-medium" 
              />
              {errors.description && <p className="text-red-500 text-xs mt-2 font-semibold">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Préparation (minutes)</label>
                  <input 
                    type="number" 
                    {...register('prepTime', { valueAsNumber: true })} 
                    placeholder="15"
                    className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm font-bold text-slate-800" 
                  />
                  {errors.prepTime && <p className="text-red-500 text-xs mt-2 font-semibold">{errors.prepTime.message}</p>}
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Cuisson (minutes)</label>
                  <input 
                    type="number" 
                    {...register('cookTime', { valueAsNumber: true })} 
                    placeholder="25"
                    className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm font-bold text-slate-800" 
                  />
                  {errors.cookTime && <p className="text-red-500 text-xs mt-2 font-semibold">{errors.cookTime.message}</p>}
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Difficulté</label>
                  <select 
                    {...register('difficulty')} 
                    className="w-full border-slate-200 rounded-xl p-3.5 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm font-bold text-slate-800"
                  >
                    <option value="easy">Facile</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Expert</option>
                  </select>
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-3">Photos de présentation (JPEG/PNG)</label>
               <div className="flex flex-wrap items-center gap-4">
                 <label className="flex flex-col items-center justify-center w-28 h-28 rounded-2xl bg-brand-orange/5 text-brand-orange border-2 border-dashed border-brand-orange/30 cursor-pointer hover:bg-brand-orange/10 transition-colors">
                   <ImageIcon className="w-8 h-8" />
                   <span className="text-[10px] uppercase tracking-wider font-extrabold mt-2">Parcourir</span>
                   <input type="file" multiple accept="image/jpeg,image/png" className="hidden" onChange={handleImageChange} />
                 </label>
                 {images.length > 0 ? (
                   <div className="text-sm text-slate-600 bg-brand-pink/10 px-4 py-2.5 rounded-full border border-brand-pink/20 font-bold">
                     📸 {images.length} fichier(s) sélectionné(s)
                   </div>
                 ) : (
                   <span className="text-xs text-slate-400 font-medium">Aucun fichier sélectionné</span>
                 )}
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Lien Vidéo (Optionnel)</label>
               <input 
                 {...register('videoUrl')} 
                 placeholder="Lien YouTube, Vimeo, etc. (https://...)" 
                 className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder-slate-400 text-sm font-medium" 
               />
               {errors.videoUrl && <p className="text-red-500 text-xs mt-2 font-semibold">{errors.videoUrl.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <label className="block text-sm font-bold text-slate-800">Ingrédients Requis</label>
              </div>
              <div className="space-y-3">
                {ingFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input 
                      {...register(`ingredients.${index}.value`)} 
                      placeholder="Ex. 200g de jambon blanc de Parme / 2 cuillères de sucre roux" 
                      className="flex-1 border-slate-200 rounded-xl p-3 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder-slate-400 text-sm font-medium" 
                    />
                    <button 
                      type="button" 
                      onClick={() => removeIng(index)} 
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {errors.ingredients && <p className="text-red-500 text-xs font-semibold">{errors.ingredients.message}</p>}
                
                <button 
                  type="button" 
                  onClick={() => appendIng({ value: '' })} 
                  className="inline-flex items-center gap-1.5 text-brand-orange text-xs font-extrabold uppercase bg-brand-orange/10 px-4.5 py-2.5 rounded-full transition-all hover:bg-brand-orange/15 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Ajouter un ingrédient
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <label className="block text-sm font-bold text-slate-800">Étapes de Préparation</label>
              </div>
              <div className="space-y-4">
                {stepFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4">
                    <div className="flex-none w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-brand-blue/15">
                      {index + 1}
                    </div>
                    <textarea 
                      {...register(`steps.${index}.value`)} 
                      rows={2} 
                      placeholder="Ex. Épluchez délicatement les oignons puis hachez-les finement en fines lamelles..." 
                      className="flex-1 border-slate-200 rounded-xl p-3 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder-slate-400 text-sm font-medium" 
                    />
                    <button 
                      type="button" 
                      onClick={() => removeStep(index)} 
                      className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all self-start"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {errors.steps && <p className="text-red-500 text-xs font-semibold">{errors.steps.message}</p>}
                
                <button 
                  type="button" 
                  onClick={() => appendStep({ value: '' })} 
                  className="inline-flex items-center gap-1.5 text-brand-blue text-xs font-extrabold uppercase bg-brand-blue/10 px-4.5 py-2.5 rounded-full transition-all hover:bg-brand-blue/15 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Ajouter une étape de préparation
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Catégories d&apos;appartenance (séparées par des virgules)</label>
              <input 
                {...register('categories')} 
                placeholder="Ex. Desserts, Goûters, Automne / Repas, Viandes" 
                className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder-slate-400 text-sm font-medium" 
              />
              {errors.categories && <p className="text-red-500 text-xs mt-2 font-semibold">{errors.categories.message}</p>}
            </div>

          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-brand-orange hover:bg-orange-600 text-white font-extrabold text-base rounded-full py-4.5 flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-orange/15 select-none active:scale-98"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Publication en cours...</span>
              </>
            ) : (
              'Publier la Recette'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
