import React, { useRef, useState } from 'react';
import { api } from '../services/api';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { safeText } from '../utils/safe';

interface UploadDataProps {
  onUploadSuccess: () => void;
}

export const UploadData: React.FC<UploadDataProps> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setMessage('Processing file...');

    try {
      const response = await api.uploadCSV(file);
      setStatus('success');
      setMessage(`Successfully imported ${safeText(response?.rows_imported, "some")} rows. Skipped ${safeText(response?.rows_skipped, "0")} rows.`);
      
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        if (status === 'success') {
          setStatus('idle');
        }
      }, 5000);

      onUploadSuccess();
    } catch (error: any) {
      console.error("Upload failed", error);
      setStatus('error');
      
      const errorDetail = error?.response?.data?.detail;
      setMessage(safeText(errorDetail, "Failed to upload file. Please check format and network connection."));
    }
  };

  const clearFile = () => {
    setFile(null);
    setStatus('idle');
    setMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="glass-panel p-5 mb-6 rounded-xl border border-gray-700/80">
      <div className="flex flex-col md:flex-row items-center gap-4">
        
        <div className="flex-1 w-full">
          <label className="flex items-center gap-3 text-sm font-medium text-gray-300 mb-2">
            <Upload size={16} className="text-secondary" />
            Upload Parking Violation Data (CSV)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className={`cursor-pointer flex-1 flex items-center justify-between border ${file ? 'border-secondary/50 bg-secondary/10' : 'border-gray-700 bg-gray-800/50'} rounded-lg px-4 py-2 hover:bg-gray-700 transition-colors`}
            >
              <span className="text-sm text-gray-400 truncate max-w-[200px] md:max-w-md">
                {file ? file.name : 'Choose CSV file...'}
              </span>
              <FileText size={16} className={file ? 'text-secondary' : 'text-gray-500'} />
            </label>
            
            {file && (
              <button 
                onClick={clearFile}
                className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                title="Clear file"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-end w-full md:w-auto h-[42px] mt-auto">
          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            className="w-full md:w-auto bg-primary hover:bg-primaryHover disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {status === 'uploading' ? (
              <><Loader2 size={16} className="animate-spin" /> Uploading...</>
            ) : (
              'Upload Data'
            )}
          </button>
        </div>

      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 text-sm border ${
          status === 'success' ? 'bg-success/10 border-success/30 text-success' : 
          status === 'error' ? 'bg-danger/10 border-danger/30 text-danger' : 
          'bg-primary/10 border-primary/30 text-primary'
        }`}>
          {status === 'success' && <CheckCircle size={16} className="mt-0.5 shrink-0" />}
          {status === 'error' && <AlertCircle size={16} className="mt-0.5 shrink-0" />}
          {status === 'uploading' && <Loader2 size={16} className="mt-0.5 shrink-0 animate-spin" />}
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};
