
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { Eye, EyeOff } from 'lucide-react';

const Admin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // This is a simple admin password - in a real app, this should be properly secured
  // The admin password is 'onboarding-admin-2024'
  const ADMIN_SECRET = 'onboarding-admin-2024';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adminPassword !== ADMIN_SECRET) {
      toast.error('Invalid admin password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the Edge Function instead of direct Supabase admin API
      const { data, error } = await supabase.functions.invoke('create-hr-user', {
        body: {
          email,
          password,
          adminPassword
        }
      });
      
      if (error) throw error;
      
      toast.success('HR account created successfully');
      
      // Clear form
      setEmail('');
      setPassword('');
      setAdminPassword('');
      
      // Optional: redirect to login page
      navigate('/login');
    } catch (error: any) {
      console.error('Create HR account error:', error);
      toast.error(error.message || 'Failed to create HR account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background animate-fade-in">
      <Header title="Admin Panel" showBackButton backTo="/" />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md glass-card animate-slide-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create HR Account</CardTitle>
            <CardDescription className="text-center">
              This is a restricted admin area for creating HR accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  HR Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hr@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="transition-standard"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="transition-standard"
                    required
                    minLength={8}
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="adminPassword" className="text-sm font-medium">
                  Admin Password
                </label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="transition-standard"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full hover-lift"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create HR Account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-sm text-muted-foreground text-center">
              This page is for authorized administrators only.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
