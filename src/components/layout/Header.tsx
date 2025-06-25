
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Plus, Clock, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  timeLeft: number;
  lastSaved: Date | null;
  hasSubmitted: boolean;
  onAddQuestion?: () => void;
}

const Header: React.FC<HeaderProps> = ({ timeLeft, lastSaved, hasSubmitted, onAddQuestion }) => {
  const { signOut, profile, isAdmin } = useAuth();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 300) return 'text-green-600';
    if (timeLeft > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-800">DSA Code Editor</h1>
        <Badge variant="secondary">
          {hasSubmitted ? 'Submitted' : 'In Progress'}
        </Badge>
        {isAdmin && (
          <Badge className="bg-purple-100 text-purple-800">
            Admin
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <span className={`text-lg font-mono font-semibold ${getTimerColor()}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        
        {lastSaved && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Save className="w-4 h-4" />
            <span>Saved at {lastSaved.toLocaleTimeString()}</span>
          </div>
        )}

        {isAdmin && onAddQuestion && (
          <Button
            onClick={onAddQuestion}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </Button>
        )}
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Welcome, {profile?.full_name || profile?.email}</span>
          <Button onClick={signOut} variant="ghost" size="sm">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
