
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import VerificationForm from '@/components/VerificationForm';
import { LogIn } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background animate-fade-in">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex gap-2 font-bold text-lg">
            <span className="text-primary">Onboard</span>
            <span>Mate</span>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <Link to="/login">
              <Button>
                <LogIn className="mr-2 h-4 w-4" />
                HR Login
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col space-y-4 text-center md:text-left">
            <h1 className="text-4xl font-bold tracking-tight animate-slide-in">
              Welcome to your <span className="text-primary">onboarding journey</span>
            </h1>
            <p className="text-xl text-muted-foreground animate-slide-in" style={{ animationDelay: '100ms' }}>
              Complete your onboarding tasks and get up to speed quickly
            </p>
            <div className="animate-slide-in" style={{ animationDelay: '200ms' }}>
              <p className="text-muted-foreground mt-2 mb-6">
                Enter the verification code sent to your email to access your personalized onboarding checklist
              </p>
            </div>
          </div>
          
          <div className="flex justify-center md:justify-end">
            <VerificationForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
