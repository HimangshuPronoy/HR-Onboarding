
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/supabase';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  showLogout?: boolean;
  showBackButton?: boolean;
  backTo?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showLogout = false,
  showBackButton = false,
  backTo = '/',
}) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="w-full py-6 px-8 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(backTo)}
            className="hover-lift"
          >
            ← Back
          </Button>
        )}
        <Link to="/" className="flex items-center">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mr-3">
            <span className="text-primary-foreground font-semibold text-lg">O</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </Link>
      </div>
      {showLogout && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="group hover-lift"
        >
          <LogOut className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
          Sign Out
        </Button>
      )}
    </header>
  );
};

export default Header;
