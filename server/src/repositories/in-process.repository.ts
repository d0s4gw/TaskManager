export abstract class InProcessRepository<T extends { id: string }> {
  protected items: Map<string, T> = new Map();

  async getById(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }

  async create(data: T): Promise<void> {
    this.items.set(data.id, data);
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const item = this.items.get(id);
    if (item) {
      this.items.set(id, { ...item, ...data });
    }
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }

  async list(): Promise<T[]> {
    return Array.from(this.items.values());
  }
}
