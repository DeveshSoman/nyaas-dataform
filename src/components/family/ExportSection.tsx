
import React from 'react';
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
        <button
          onClick={onDownloadRequest}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105 flex items-center gap-2"
        >
          <Download size={20} />
          Download CSV
        </button>
      </div>
    </div>
  );
};

export default ExportSection;
