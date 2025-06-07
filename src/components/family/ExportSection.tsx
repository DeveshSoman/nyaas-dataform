
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportSectionProps {
  onDownloadRequest: () => void;
}

const ExportSection: React.FC<ExportSectionProps> = ({ onDownloadRequest }) => {
  return (
    <div className="mb-8 p-4 bg-muted rounded-lg border-2 border-primary/20">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Export Data</h3>
          <p className="text-sm text-muted-foreground">Download all family data in CSV format</p>
        </div>
        <Button
          onClick={onDownloadRequest}
          variant="default"
          size="lg"
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
        >
          <Download size={20} />
          Download CSV
        </Button>
      </div>
    </div>
  );
};

export default ExportSection;
