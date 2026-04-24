import { expect, it, describe } from 'vitest';
import { reorderTasks } from './reorder';
import { Task } from '../../../shared/task';

const mockTasks: Task[] = [
  { id: '1', title: 'Task 1', position: 0 } as Task,
  { id: '2', title: 'Task 2', position: 1 } as Task,
  { id: '3', title: 'Task 3', position: 2 } as Task,
];

describe('reorderTasks', () => {
  it('moves an item from start to end', () => {
    const result = reorderTasks(mockTasks, 0, 2);
    
    expect(result[0].id).toBe('2');
    expect(result[1].id).toBe('3');
    expect(result[2].id).toBe('1');
    
    // Check positions are updated
    expect(result[0].position).toBe(0);
    expect(result[1].position).toBe(1);
    expect(result[2].position).toBe(2);
  });

  it('moves an item from end to start', () => {
    const result = reorderTasks(mockTasks, 2, 0);
    
    expect(result[0].id).toBe('3');
    expect(result[1].id).toBe('1');
    expect(result[2].id).toBe('2');
    
    expect(result[0].position).toBe(0);
    expect(result[1].position).toBe(1);
    expect(result[2].position).toBe(2);
  });
});
