export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  favoriteRecipes: string[];
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  authorId: string;
  imageUrls: string[]; 
  videoUrl?: string;
  categories: string[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
