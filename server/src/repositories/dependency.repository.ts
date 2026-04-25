import { BaseRepository } from './base.repository';
import { DependencyData } from '@shared/dependency';

export class DependencyRepository extends BaseRepository<DependencyData> {
  constructor() {
    super('dependencies');
  }
}
