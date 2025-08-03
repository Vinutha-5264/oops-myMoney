import { Injectable } from '@angular/core';
import { collection, addDoc, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Expense } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private expensesRef = collection(db, 'expenses');

  async addExpense(expense: Omit<Expense, 'date'>) {
    await addDoc(this.expensesRef, {
      ...expense,
      date: new Date().toISOString()
    });
  }

  async getExpensesByUser(username: string): Promise<Expense[]> {
    const q = query(this.expensesRef, where('username', '==', username));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
  }

 async getCategoriesForUser(username: string): Promise<string[]> {
  const ref = doc(db, 'categories', username);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data()['list'] || []) : [];
}

async saveCategory(username: string, newCat: string): Promise<void> {
  const ref = doc(db, 'categories', username);
  const snap = await getDoc(ref);
  const current = snap.exists() ? (snap.data()['list'] || []) : [];
  const updated = Array.from(new Set([...current, newCat]));
  await setDoc(ref, { list: updated });
}

}
