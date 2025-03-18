
import React, { useState } from 'react';
import { updateTaskCompletion } from '@/lib/supabase';
import { Task } from '@/types';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  newHireId: string;
  isCompleted: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  newHireId, 
  isCompleted: initialCompleted
}) => {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      const newState = !isCompleted;
      await updateTaskCompletion(newHireId, task.id, newState);
      setIsCompleted(newState);
      
      if (newState) {
        toast.success(`Task "${task.task_name}" completed!`);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div 
      className={`mb-4 p-6 glass-card transition-standard hover-lift ${
        isCompleted ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-accent'
      }`}
    >
      <div className="flex items-start">
        <div
          className={`flex-shrink-0 w-6 h-6 rounded-md border cursor-pointer transition-all duration-300 mr-4 flex items-center justify-center ${
            isCompleted 
              ? 'bg-green-500 border-green-500' 
              : 'border-gray-300 hover:border-primary'
          } ${isUpdating ? 'opacity-50' : ''}`}
          onClick={handleToggle}
        >
          {isCompleted && <Check className="w-4 h-4 text-white" />}
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-medium transition-standard ${
            isCompleted ? 'text-muted-foreground line-through' : ''
          }`}>
            {task.task_name}
          </h3>
          <p className={`mt-1 text-sm transition-standard ${
            isCompleted ? 'text-muted-foreground' : 'text-gray-600'
          }`}>
            {task.task_description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
