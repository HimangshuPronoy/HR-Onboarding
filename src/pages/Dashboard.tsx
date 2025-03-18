
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getNewHires } from '@/lib/supabase';
import { NewHire } from '@/types';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { Plus, Mail, User, Clock, RefreshCw, ExternalLink } from 'lucide-react';
import AuthChecker from '@/components/AuthChecker';

const Dashboard = () => {
  const [newHires, setNewHires] = useState<NewHire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchNewHires = async () => {
    try {
      const data = await getNewHires();
      setNewHires(data || []);
    } catch (error) {
      console.error('Error fetching new hires:', error);
      toast.error('Failed to load new hires. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNewHires();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNewHires();
  };

  const handleAddNewHire = () => {
    navigate('/add-new-hire');
  };

  const handleSendReminder = async (newHire: NewHire) => {
    try {
      // In a real app, this would send an email reminder
      // For now we'll just show a toast
      toast.success(`Reminder sent to ${newHire.email}`);
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder. Please try again.');
    }
  };

  const handleViewChecklist = (token: string) => {
    window.open(`/checklist/${token}`, '_blank');
  };

  return (
    <AuthChecker>
      <div className="min-h-screen flex flex-col bg-background animate-fade-in">
        <Header title="HR Dashboard" showLogout />
        
        <main className="flex-1 container px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight animate-slide-in">New Hire Onboarding</h1>
              <p className="text-muted-foreground mt-2 animate-slide-in" style={{ animationDelay: '100ms' }}>
                Manage and track your new employee onboarding process
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hover-lift animate-slide-in" 
                style={{ animationDelay: '150ms' }}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={handleAddNewHire}
                className="hover-lift animate-slide-in" 
                style={{ animationDelay: '200ms' }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add New Hire
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="glass-card animate-pulse-slow">
                  <CardHeader className="h-32 bg-muted/30 rounded-t-2xl"></CardHeader>
                  <CardContent className="p-6">
                    <div className="h-4 w-3/4 bg-muted/50 rounded mb-4"></div>
                    <div className="h-4 w-1/2 bg-muted/50 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : newHires.length === 0 ? (
            <Card className="glass-card w-full text-center p-12 animate-slide-in" style={{ animationDelay: '300ms' }}>
              <CardContent>
                <div className="mx-auto w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">No new hires yet</h3>
                <p className="text-muted-foreground mb-6">
                  Add your first new hire to begin the onboarding process
                </p>
                <Button onClick={handleAddNewHire} className="hover-lift">
                  <Plus className="mr-2 h-4 w-4" /> Add New Hire
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newHires.map((newHire, index) => (
                <Card 
                  key={newHire.id} 
                  className="glass-card overflow-hidden hover-lift animate-slide-in" 
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <CardHeader className="bg-accent/50">
                    <CardTitle>{newHire.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      {newHire.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center text-sm text-muted-foreground mb-6">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {newHire.created_at 
                        ? new Date(newHire.created_at).toLocaleDateString() 
                        : 'Recently added'}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover-lift"
                        onClick={() => handleSendReminder(newHire)}
                      >
                        <Mail className="h-3.5 w-3.5 mr-1" />
                        Send Reminder
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover-lift"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/checklist/${newHire.unique_token}`
                          );
                          toast.success("Checklist link copied to clipboard");
                        }}
                      >
                        Copy Link
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="col-span-2 hover-lift"
                        onClick={() => handleViewChecklist(newHire.unique_token)}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        View Onboarding Checklist
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthChecker>
  );
};

export default Dashboard;
