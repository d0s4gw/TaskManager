import { arrayMove } from '@dnd-kit/sortable';
import { Task } from '../../../shared/task';

/**
 * Reorders an array of tasks and updates their position fields based on their new index.
 */
export const reorderTasks = (tasks: Task[], oldIndex: number, newIndex: number): Task[] => {
  const moved = arrayMove(tasks, oldIndex, newIndex);
  return moved.map((task, index) => ({
    ...task,
    position: index,
  }));
};
