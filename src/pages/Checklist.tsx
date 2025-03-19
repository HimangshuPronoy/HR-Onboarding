
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NewHire, Task, TaskCompletion, TaskWithCompletion } from '@/types';
import TaskItem from '@/components/TaskItem';
import Header from '@/components/Header';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
        
        // Get new hire with token
        const { data: hireData, error: hireError } = await supabase
          .from('new_hires')
          .select('*')
          .eq('unique_token', token)
          .maybeSingle();
          
        if (hireError) {
          console.error('Error fetching new hire:', hireError);
          setError('Error connecting to HR system. Please try again later.');
          setIsLoading(false);
          return;
        }
        
        if (!hireData) {
          console.error('New hire not found for token:', token);
          setError('Your onboarding profile was not found. Please contact HR for assistance.');
          setIsLoading(false);
          return;
        }
        
        console.log('Successfully found new hire:', hireData);
        setNewHire(hireData);

        // Get all tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*');
          
        if (tasksError) {
          console.error('Error fetching tasks:', tasksError);
          setError('Unable to load onboarding tasks. Please try again later.');
          setIsLoading(false);
          return;
        }
        
        if (!tasksData || tasksData.length === 0) {
          console.warn('No tasks found in the database');
          setTasks([]);
          setIsLoading(false);
          return;
        }

        // Get task completions for this new hire
        const { data: completionsData, error: completionsError } = await supabase
          .from('task_completions')
          .select('*')
          .eq('new_hire_id', hireData.id);
          
        if (completionsError) {
          console.error('Error fetching completions:', completionsError);
          // Continue with empty completions rather than failing
        }
        
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
        
        // Calculate progress
        const completedCount = tasksWithCompletion.filter(t => t.completed).length;
        const totalCount = tasksWithCompletion.length;
        setProgress(totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);
        
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(`Unable to connect to HR system. Please try again later or contact support.`);
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
              <CardTitle className="text-2xl font-bold text-center">Connection Error</CardTitle>
              <CardDescription className="text-center flex flex-col items-center gap-2">
                <AlertCircle className="h-10 w-10 text-destructive mb-2" />
                {error || 'Unable to connect to HR system'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <p className="text-center text-muted-foreground">
                Please contact your HR representative at:
              </p>
              <a 
                href="mailto:himangshupronoy@aol.com" 
                className="text-primary hover:text-primary/90 transition-colors font-medium"
              >
                himangshupronoy@aol.com
              </a>
              <Link 
                to="/" 
                className="text-primary/80 hover:text-primary transition-colors mt-4"
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
                No tasks have been assigned yet. Check back later or contact HR.
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
