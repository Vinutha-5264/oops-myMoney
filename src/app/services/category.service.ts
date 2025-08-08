import { Injectable } from '@angular/core';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categoryRef = collection(db, 'categories');

  async addCategory(name: string, username: string) {
    await addDoc(this.categoryRef, {
      name,
      username,
      subcategories: []
    });
  }

  async addSubcategory(categoryId: string, subcategory: string) {
    const categoryDocRef = doc(db, 'categories', categoryId);
    const categorySnap = await getDoc(categoryDocRef);

    if (!categorySnap.exists()) {
      throw new Error('Category not found');
    }

    const existingSubcategories = categorySnap.data()['subcategories'] || [];

    if (existingSubcategories.includes(subcategory)) return;

    await updateDoc(categoryDocRef, {
      subcategories: [...existingSubcategories, subcategory]
    });
  }

  async getCategoriesByUser(username: string): Promise<Category[]> {
    const q = query(this.categoryRef, where('username', '==', username));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  }

  async deleteCategory(categoryId: string) {
    const categoryDocRef = doc(db, 'categories', categoryId);
    await deleteDoc(categoryDocRef);
  }
}
