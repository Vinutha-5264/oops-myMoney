// src/app/services/category.service.ts
import { Injectable } from '@angular/core';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categoryRef = collection(db, 'categories');

  async addCategory(name: string, username: string) {
    await addDoc(this.categoryRef, { name, username });
  }

  async getCategoriesByUser(username: string): Promise<Category[]> {
    const q = query(this.categoryRef, where('username', '==', username));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  }
}
