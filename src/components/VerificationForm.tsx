
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getNewHireByVerificationCode, updateNewHireVerificationStatus } from '@/lib/supabase';
import { toast } from 'sonner';
import { LockKeyhole } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const VerificationForm = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const testSupabaseConnection = async () => {
    try {
      // Simple ping to test connection
      const { data, error } = await supabase.from('new_hires').select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        return false;
      }
      
      console.log('Supabase connection test successful');
      return true;
    } catch (error) {
      console.error('Failed to test Supabase connection:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Attempting verification with:', { email, code });
      
      // Trim inputs to remove any accidental whitespace
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedCode = code.trim();
      
      if (!trimmedEmail || !trimmedCode) {
        toast.error('Please enter both email and verification code');
        setIsLoading(false);
        return;
      }
      
      // Test connection before proceeding
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        toast.error('Unable to connect to database. Please try again later.');
        setIsLoading(false);
        return;
      }
      
      // Proceed with verification
      console.log('Fetching new hire with code:', trimmedCode, 'and email:', trimmedEmail);
      const newHire = await getNewHireByVerificationCode(trimmedCode, trimmedEmail);
      console.log('Verification response:', newHire);
      
      if (!newHire) {
        toast.error('Invalid verification code or email. Please check and try again.');
        setIsLoading(false);
        return;
      }
      
      // Update verification status to verified
      await updateNewHireVerificationStatus(newHire.id, 'verified');
      
      // Navigate to checklist page
      toast.success('Verification successful!');
      navigate(`/checklist/${newHire.unique_token}`);
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Failed to verify access. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md glass-card animate-slide-in">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-3 w-14 h-14 flex items-center justify-center">
            <LockKeyhole className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Onboarding Access</CardTitle>
        <CardDescription>
          Enter your verification code and email to access your onboarding checklist
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">
              Verification Code
            </label>
            <Input
              id="code"
              placeholder="Enter your verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono tracking-widest text-center"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full hover-lift"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Access Onboarding'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col text-center">
        <p className="text-sm text-muted-foreground">
          The verification code was sent to your email by HR
        </p>
      </CardFooter>
    </Card>
  );
};

export default VerificationForm;
