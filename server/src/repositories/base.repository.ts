import * as admin from 'firebase-admin';

export abstract class BaseRepository<T extends { id: string }> {
  protected collection: admin.firestore.CollectionReference<T>;

  constructor(collectionName: string) {
    this.collection = admin.firestore().collection(collectionName) as admin.firestore.CollectionReference<T>;
  }

  async getById(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get();
    return doc.exists ? (doc.data() as T) : null;
  }

  async create(data: T): Promise<void> {
    await this.collection.doc(data.id).set(data);
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    await this.collection.doc(id).update(data as admin.firestore.UpdateData<T>);
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  async list(): Promise<T[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => doc.data() as T);
  }
}
