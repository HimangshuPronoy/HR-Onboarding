
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getNewHireByToken, getTasks, getTaskCompletions } from '@/lib/supabase';
import { NewHire, Task, TaskCompletion, TaskWithCompletion } from '@/types';
import TaskItem from '@/components/TaskItem';
import Header from '@/components/Header';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const Checklist = () => {
  const { token } = useParams<{ token: string }>();
  const [newHire, setNewHire] = useState<NewHire | null>(null);
  const [tasks, setTasks] = useState<TaskWithCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.error('No token provided in URL');
        setError('Invalid token');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching new hire with token:', token);
        
        // Fetch new hire data
        const hireData = await getNewHireByToken(token);
        console.log('New hire data response:', hireData);
        
        if (!hireData) {
          console.error('New hire not found for token:', token);
          setError('New hire not found. The link may be invalid or expired.');
          setIsLoading(false);
          return;
        }
        
        setNewHire(hireData);
        console.log('Successfully set new hire:', hireData.name);

        // Fetch tasks
        const tasksData = await getTasks();
        console.log('Tasks data:', tasksData);
        
        if (!tasksData || tasksData.length === 0) {
          console.warn('No tasks found in the database');
          setTasks([]);
          setIsLoading(false);
          return;
        }

        // Fetch task completions
        console.log('Fetching completions for new hire ID:', hireData.id);
        const completionsData = await getTaskCompletions(hireData.id);
        console.log('Completions data:', completionsData);
        
        // Combine tasks with completion status
        const tasksWithCompletion: TaskWithCompletion[] = tasksData.map((task: Task) => {
          const completion = completionsData?.find(
            (c: TaskCompletion) => c.task_id === task.id
          );
          
          return {
            ...task,
            completed: completion ? completion.completed : false,
          };
        });
        
        setTasks(tasksWithCompletion);
        console.log('Tasks with completion set:', tasksWithCompletion.length);
        
        // Calculate progress
        const completedCount = tasksWithCompletion.filter(t => t.completed).length;
        const totalCount = tasksWithCompletion.length;
        setProgress(totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);
        
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(`An error occurred: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-fade-in">
        <Header title="Onboarding Checklist" />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-3xl glass-card animate-pulse-slow m-6">
            <CardHeader className="h-32 bg-muted/30 rounded-t-2xl"></CardHeader>
            <CardContent className="p-6">
              <div className="h-4 w-3/4 bg-muted/50 rounded mb-4"></div>
              <div className="h-4 w-1/2 bg-muted/50 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !newHire) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-fade-in">
        <Header title="Onboarding Checklist" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md glass-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Error</CardTitle>
              <CardDescription className="text-center flex flex-col items-center gap-2">
                <AlertCircle className="h-10 w-10 text-destructive mb-2" />
                {error || 'Invalid or expired checklist link'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <p className="text-center text-muted-foreground">
                Please contact your HR representative to get a new onboarding link.
              </p>
              <Link 
                to="/" 
                className="text-primary hover:text-primary/90 transition-colors"
              >
                Return to home page
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const allTasksCompleted = progress === 100;

  return (
    <div className="min-h-screen flex flex-col bg-background animate-fade-in">
      <Header title="Onboarding Checklist" />
      
      <main className="container max-w-4xl mx-auto px-4 py-8 flex-1">
        <div className="text-center mb-8 animate-slide-in">
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {newHire.name}!</h1>
          <p className="text-muted-foreground mt-2">
            Complete these tasks to get started with your new role
          </p>
        </div>

        <Card className="glass-card mb-8 overflow-hidden animate-slide-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="bg-accent/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Your Onboarding Progress</CardTitle>
                <CardDescription>
                  {progress}% complete ({tasks.filter(t => t.completed).length} of {tasks.length} tasks)
                </CardDescription>
              </div>
              {allTasksCompleted && (
                <div className="mt-4 md:mt-0 px-4 py-2 bg-green-500/10 text-green-600 rounded-full flex items-center text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  All tasks completed!
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {tasks.length === 0 ? (
          <Card className="glass-card text-center p-8 animate-slide-in" style={{ animationDelay: '200ms' }}>
            <CardContent>
              <p className="text-muted-foreground">
                No tasks have been assigned yet. Check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 animate-slide-in" style={{ animationDelay: '200ms' }}>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                newHireId={newHire.id}
                isCompleted={task.completed}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Checklist;
