
// User types
export interface User {
  id: string;
  email: string;
}

// New hire types
export interface NewHire {
  id: string;
  name: string;
  email: string;
  unique_token: string;
  created_at?: string;
}

// Task types
export interface Task {
  id: string;
  task_name: string;
  task_description: string;
}

export interface TaskCompletion {
  id: string;
  new_hire_id: string;
  task_id: string;
  completed: boolean;
}

export interface TaskWithCompletion extends Task {
  completed: boolean;
}
