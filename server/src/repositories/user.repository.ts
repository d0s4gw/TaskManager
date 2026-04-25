import { BaseRepository } from './base.repository';
import { User } from '@shared/user';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  async getByEmail(email: string): Promise<User | null> {
    const snapshot = await this.collection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  }
}
