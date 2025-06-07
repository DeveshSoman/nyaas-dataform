
import React from 'react';
import { Button } from '@/components/ui/button';

interface PasswordDialogProps {
  isOpen: boolean;
  password: string;
  onPasswordChange: (password: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const PasswordDialog: React.FC<PasswordDialogProps> = ({
  isOpen,
  password,
  onPasswordChange,
  onSubmit,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Enter Password</h3>
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className="w-full p-3 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent mb-4 bg-background text-foreground"
          placeholder="Enter password"
          onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
        />
        <div className="flex gap-2 justify-end">
          <Button
            onClick={onCancel}
            variant="outline"
          >
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PasswordDialog;
