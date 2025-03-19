
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LockKeyhole } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const VerificationForm = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

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
      
      // Fetch new hire using the verification code and email
      const { data: newHireData, error: newHireError } = await supabase
        .from('new_hires')
        .select('*')
        .eq('verification_code', trimmedCode)
        .eq('email', trimmedEmail)
        .maybeSingle();
      
      if (newHireError) {
        console.error('Error fetching new hire:', newHireError);
        toast.error('Verification failed. Please try again.');
        setIsLoading(false);
        return;
      }
      
      if (!newHireData) {
        toast.error('Invalid verification code or email. Please check and try again.');
        setIsLoading(false);
        return;
      }
      
      console.log('Verification successful, found new hire:', newHireData);
      
      // Update verification status to verified
      const { error: updateError } = await supabase
        .from('new_hires')
        .update({ verification_status: 'verified' })
        .eq('id', newHireData.id);
        
      if (updateError) {
        console.error('Error updating verification status:', updateError);
        toast.error('Error updating verification status. Please try again.');
        setIsLoading(false);
        return;
      }
      
      // Try to sign in the user with email/verification code
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedCode // Try using verification code as password first
      });

      if (authError) {
        console.log('Verification code is not the password, continuing to checklist:', authError.message);
        // If login fails, just navigate to checklist with token
        toast.success('Verification successful!');
        navigate(`/checklist/${newHireData.unique_token}`);
        return;
      }
      
      // Set user ID if login successful
      if (authData.user) {
        console.log('Login successful, checking for first login');
        setUserId(authData.user.id);
        
        // Check if first login
        const isFirstLogin = authData.user.user_metadata?.is_first_login;
        if (isFirstLogin) {
          console.log('First login detected, showing password reset dialog');
          setShowPasswordReset(true);
          setIsLoading(false);
          return;
        }
      }
      
      // Navigate to checklist page
      toast.success('Verification successful!');
      navigate(`/checklist/${newHireData.unique_token}`);
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Failed to verify access. Please try again later.');
    } finally {
      if (!showPasswordReset) {
        setIsLoading(false);
      }
    }
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        data: { is_first_login: false }
      });

      if (error) {
        throw error;
      }

      toast.success('Password updated successfully');
      setShowPasswordReset(false);
      
      // Fetch the new hire data to get token
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      
      if (!email) {
        throw new Error('Could not retrieve user email');
      }
      
      // Get new hire token
      const { data: newHireData } = await supabase
        .from('new_hires')
        .select('unique_token')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (!newHireData?.unique_token) {
        throw new Error('Could not retrieve onboarding token');
      }
      
      // Navigate to checklist page
      navigate(`/checklist/${newHireData.unique_token}`);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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

      <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Your New Password</DialogTitle>
            <DialogDescription>
              Since this is your first login, you must set a new password for your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handlePasswordReset} disabled={isLoading}>
              {isLoading ? 'Setting Password...' : 'Set Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VerificationForm;
