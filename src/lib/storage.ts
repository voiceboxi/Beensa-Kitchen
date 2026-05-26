import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from './firebase';

export async function uploadImagesAsBase64(recipeId: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      // compress before read ideally, but for demo we just read as data URL
      reader.readAsDataURL(file);
    });
    // Shrink the image using canvas
    const img = new Image();
    img.src = base64;
    await new Promise((resolve) => (img.onload = resolve));
    
    const canvas = document.createElement('canvas');
    const MAX_WIDTH = 800;
    const MAX_HEIGHT = 800;
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0, width, height);
    
    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6); // 60% quality

    // Save to a subcollection or separate collection to avoid 1MB document limit on recipe
    const docRef = await addDoc(collection(db, `recipes/${recipeId}/images`), {
      dataUrl: compressedBase64,
      createdAt: new Date().toISOString()
    });
    urls.push(compressedBase64);
  }
  return urls;
}

export async function getRecipeImages(recipeId: string): Promise<string[]> {
  try {
    const q = query(collection(db, `recipes/${recipeId}/images`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data().dataUrl);
  } catch (e) {
    console.error("Error fetching images", e);
    return [];
  }
}
