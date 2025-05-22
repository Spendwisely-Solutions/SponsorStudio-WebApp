import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SuccessPageProps {
  onSubmit: (formData: any) => void;
}

export default function SuccessPage({ onSubmit }: SuccessPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [reUploadedFiles, setReUploadedFiles] = useState<{
    media_files: File[];
    sponsorship_brochure_file?: File;
  }>({ media_files: [] });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse query parameters
    const query = new URLSearchParams(location.search);
    const opportunityIdFromQuery = query.get('opportunity_id');

    if (opportunityIdFromQuery) {
      // Retrieve formData and opportunityId from localStorage
      const storedData = localStorage.getItem('pendingOpportunity');
      if (storedData) {
        const { opportunityId, formData } = JSON.parse(storedData);
        if (opportunityId === opportunityIdFromQuery) {
          // Prepare formData with re-uploaded files (if provided)
          const finalFormData = {
            ...formData,
            media_files: reUploadedFiles.media_files.length > 0 ? reUploadedFiles.media_files : undefined,
            sponsorship_brochure_file: reUploadedFiles.sponsorship_brochure_file || undefined,
          };
          onSubmit(finalFormData);
          localStorage.removeItem('pendingOpportunity');
          navigate('/dashboard');
        } else {
          setError('Invalid opportunity ID.');
        }
      } else {
        setError('No form data found. Please try again.');
      }
    }
  }, [location.search, onSubmit, reUploadedFiles, navigate]);

  const handleFileReUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'media_files' | 'sponsorship_brochure_file') => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setReUploadedFiles((prev) => ({
        ...prev,
        [field]: field === 'media_files' ? files : files[0],
      }));
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Successful</h2>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">Please re-upload your files to complete the opportunity creation.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Re-upload Media Files (Images/Videos)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFileReUpload(e, 'media_files')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              {reUploadedFiles.media_files.length > 0 && (
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                  {reUploadedFiles.media_files.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Re-upload Sponsorship Brochure (PDF)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileReUpload(e, 'sponsorship_brochure_file')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              {reUploadedFiles.sponsorship_brochure_file && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {reUploadedFiles.sponsorship_brochure_file.name}
                </p>
              )}
            </div>
          </div>
          <p className="text-gray-600 mt-4">Processing your opportunity...</p>
        </div>
      )}
    </div>
  );
}