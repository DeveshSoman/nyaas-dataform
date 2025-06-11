
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { exportFamilyDataWithCounts } from '@/utils/excelExport';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ExportButton = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [password, setPassword] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleExport = async () => {
    if (!password) {
      toast.error('Please enter password');
      return;
    }

    setIsExporting(true);
    try {
      const result = await exportFamilyDataWithCounts(password);
      toast.success(result.message);
      setIsDialogOpen(false);
      setPassword('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          <FileSpreadsheet className="h-4 w-4" />
          Export Complete Database
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Complete Family Database</DialogTitle>
          <DialogDescription>
            This will export all family data with complete counts and statistics to Excel format.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter export password"
              onKeyDown={(e) => e.key === 'Enter' && handleExport()}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Export includes:
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Complete summary with all counts</li>
              <li>Family heads data</li>
              <li>Spouses information</li>
              <li>Children details (sons & daughters)</li>
              <li>Child spouses data</li>
              <li>Grandchildren information</li>
              <li>Occupation & age group breakdowns</li>
            </ul>
          </div>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || !password}
            className="w-full"
          >
            {isExporting ? 'Exporting...' : 'Export Database'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportButton;
