
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { addNewHire } from '@/lib/supabase';
import { toast } from 'sonner';
import Header from '@/components/Header';
import AuthChecker from '@/components/AuthChecker';
import { Copy, ShieldCheck } from 'lucide-react';

const AddNewHire = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newHireAdded, setNewHireAdded] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const newHire = await addNewHire(name, email);
      console.log('New hire added successfully:', newHire);
      
      if (!newHire || !newHire.unique_token) {
        throw new Error('Failed to generate unique token for new hire');
      }
      
      toast.success('New hire added successfully');
      
      // Generate and validate the invite link
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/checklist/${newHire.unique_token}`;
      console.log('Generated invite link:', link);
      console.log('Invite link token:', newHire.unique_token);
      setInviteLink(link);
      setVerificationCode(newHire.verification_code || '');
      
      // Store the generated password if available
      if (newHire.generatedPassword) {
        setGeneratedPassword(newHire.generatedPassword);
      }
      
      setNewHireAdded(true);
    } catch (error: any) {
      console.error('Add new hire error:', error);
      toast.error(error.message || 'Failed to add new hire');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAnother = () => {
    setName('');
    setEmail('');
    setNewHireAdded(false);
    setInviteLink('');
    setVerificationCode('');
    setGeneratedPassword('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    toast.success('Verification code copied to clipboard');
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast.success('Password copied to clipboard');
  };

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <AuthChecker>
      <div className="min-h-screen flex flex-col bg-background animate-fade-in">
        <Header 
          title="Add New Hire" 
          showLogout 
          showBackButton 
          backTo="/dashboard" 
        />
        
        <div className="flex-1 flex items-center justify-center p-6">
          {!newHireAdded ? (
            <Card className="w-full max-w-md glass-card animate-slide-in">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">New Hire Information</CardTitle>
                <CardDescription>
                  Enter details for the new employee to start the onboarding process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="transition-standard"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="transition-standard"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full hover-lift"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add New Hire'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground text-center">
                  An account will be created for the new hire to access their onboarding checklist
                </p>
              </CardFooter>
            </Card>
          ) : (
            <Card className="w-full max-w-md glass-card animate-slide-in">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">New Hire Added!</CardTitle>
                <CardDescription className="text-center">
                  {name} has been added to the system. Share the following information to start their onboarding process.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedPassword && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-800/30">
                    <div className="font-medium text-center mb-2 flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                      <ShieldCheck className="h-4 w-4" />
                      Login Credentials
                    </div>
                    <div className="flex mb-2">
                      <Input
                        value={email}
                        readOnly
                        className="flex-1 pr-10 bg-background/80 text-center font-mono"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-[-40px]"
                        onClick={() => {
                          navigator.clipboard.writeText(email);
                          toast.success('Email copied to clipboard');
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex">
                      <Input
                        value={generatedPassword}
                        type="password"
                        readOnly
                        className="flex-1 pr-10 bg-background/80 text-center font-mono"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-[-40px]"
                        onClick={handleCopyPassword}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-center mt-2 text-muted-foreground">
                      These credentials can be used to login directly at {window.location.origin}/login
                    </p>
                  </div>
                )}
                
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="font-medium text-center mb-2 text-primary">Verification Code</div>
                  <div className="flex">
                    <Input
                      value={verificationCode}
                      readOnly
                      className="flex-1 pr-10 bg-background/80 text-center font-mono text-lg tracking-widest"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-[-40px]"
                      onClick={handleCopyCode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium mb-2">Onboarding Link (Alternative Method):</p>
                  <div className="flex">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="flex-1 pr-10 bg-background/80"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-[-40px]"
                      onClick={handleCopyLink}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Message Template:</p>
                  <Textarea
                    className="h-40 bg-background/80"
                    readOnly
                    value={`Hello ${name},

Welcome to the team! To get started with your onboarding process, please use one of the following methods:

${generatedPassword ? `METHOD 1 (SIMPLEST): 
Use these login credentials:
Email: ${email}
Password: ${generatedPassword}
Visit: ${window.location.origin}/login

` : ''}METHOD ${generatedPassword ? '2' : '1'} (RECOMMENDED): 
Use your verification code: ${verificationCode}
Visit: ${window.location.origin}
Enter the code when prompted along with your email address.

METHOD ${generatedPassword ? '3' : '2'} (ALTERNATIVE):
Click this direct link to access your personalized onboarding checklist:
${inviteLink}

If you have any questions, please don't hesitate to reach out.

Best regards,
HR Team`}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 hover-lift"
                    onClick={handleAddAnother}
                  >
                    Add Another
                  </Button>
                  <Button 
                    className="flex-1 hover-lift"
                    onClick={handleReturnToDashboard}
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthChecker>
  );
};

export default AddNewHire;
