
import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Clock, Save } from 'lucide-react';
import { useClerkAuth } from '@/contexts/ClerkContext';

interface ClerkHeaderProps {
  timeLeft: number;
  lastSaved: Date | null;
  hasSubmitted: boolean;
  onAddQuestion?: () => void;
  autoSubmitEnabled?: boolean;
  onToggleAutoSubmit?: () => void;
}

const ClerkHeader: React.FC<ClerkHeaderProps> = ({
  timeLeft,
  lastSaved,
  hasSubmitted,
  onAddQuestion,
  autoSubmitEnabled = true,
  onToggleAutoSubmit
}) => {
  const { user, isAdmin } = useClerkAuth();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-semibold text-gray-900">Code Practice Platform</h1>
          
          {isAdmin && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Admin
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-6">
          {/* Auto-submit toggle */}
          <div className="flex items-center space-x-2">
            <label htmlFor="auto-submit" className="text-sm font-medium text-gray-700">
              Auto-submit:
            </label>
            <Switch
              id="auto-submit"
              checked={autoSubmitEnabled}
              onCheckedChange={onToggleAutoSubmit}
            />
          </div>

          {/* Timer */}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className={`font-mono text-sm ${timeLeft < 300 ? 'text-red-600' : 'text-gray-700'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Last saved */}
          <div className="flex items-center space-x-2">
            <Save className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {formatLastSaved(lastSaved)}
            </span>
          </div>

          {/* Submission status */}
          {hasSubmitted && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              Submitted
            </Badge>
          )}

          {/* Admin controls */}
          {isAdmin && onAddQuestion && (
            <Button onClick={onAddQuestion} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Question
            </Button>
          )}

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-700">
              {user?.emailAddresses?.[0]?.emailAddress}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClerkHeader;
