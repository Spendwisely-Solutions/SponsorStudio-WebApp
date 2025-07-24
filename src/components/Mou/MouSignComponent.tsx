import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Upload, Pen, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { Database } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

import sreeSign from "../../assets/Mou/sreehari-sign.png"

type Opportunity = Database['public']['Tables']['opportunities']['Row'];

interface MouSignComponentProps {
  formData: Partial<Opportunity> & {
    organization_name?: string;
    organization_address?: string;
    poc_name?: string;
    poc_position?: string;
    media_files?: File[];
    sponsorship_brochure_file?: File;
  };
  onMouSigned: (mouId: string) => void;
  onCancel: () => void;
}

const MouSignComponent: React.FC<MouSignComponentProps> = ({ formData, onMouSigned, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitCount = useRef(0);

  // Lock scroll when modal is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    modalRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      // Clean up preview URL
      if (signaturePreview) {
        URL.revokeObjectURL(signaturePreview);
      }
    };
  }, [signaturePreview]);

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file for your signature.');
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Signature image must be less than 2MB.');
        return;
      }
      setSignatureFile(file);
      // Create preview
      if (signaturePreview) {
        URL.revokeObjectURL(signaturePreview);
      }
      const preview = URL.createObjectURL(file);
      setSignaturePreview(preview);
    }
  };

  const removeSignature = () => {
    setSignatureFile(null);
    if (signaturePreview) {
      URL.revokeObjectURL(signaturePreview);
      setSignaturePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadSignatureToSupabase = async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `signatures/${fileName}`;

    // Convert file to ArrayBuffer like other successful uploads in the codebase
    const fileBuffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('mou-documents')
      .upload(filePath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type, // Explicitly set the content type
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('mou-documents')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const timeout = (promise: Promise<any>, ms: number) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms)),
    ]);

  const debounce = (func: () => Promise<void>, wait: number) => {
    let isDebouncing = false;
    return async () => {
      if (isDebouncing) {
        console.log('Debounce: Submission blocked, already processing');
        return;
      }
      isDebouncing = true;
      try {
        await func();
      } finally {
        isDebouncing = false;
      }
    };
  };

  const handleAgreeAndSave = useCallback(async () => {
    submitCount.current += 1;
    console.log(`MouSignComponent handleAgreeAndSave called, attempt #${submitCount.current}, hasProcessed: ${hasProcessed}`);
    if (hasProcessed) {
      console.log('Agree and Save blocked: Already processed');
      return;
    }
    if (!formData.organization_name || !formData.organization_address || !formData.poc_name || !formData.poc_position) {
      toast.error('Please ensure all required MOU fields (Organization Name, Address, POC Name, POC Position) are filled in the form.');
      return;
    }
    setIsProcessing(true);
    setHasProcessed(true);
    try {
      // Step 1: Authenticate user
      console.log('Authenticating user...');
      const { data: { user }, error: authError } = await timeout(supabase.auth.getUser(), 5000);
      if (authError || !user) {
        throw new Error('User not authenticated. Please log in.');
      }
      console.log('Authenticated user:', user.id);
      // Step 2: Upload signature if provided
      let signatureUrl = null;
      if (signatureFile) {
        console.log('Uploading signature...');
        setUploadingSignature(true);
        try {
          signatureUrl = await uploadSignatureToSupabase(signatureFile);
          console.log('Signature uploaded:', signatureUrl);
        } catch (signatureError) {
          console.error('Signature upload failed:', signatureError);
          // Continue without signature if upload fails
        } finally {
          setUploadingSignature(false);
        }
      }
      // Step 3: Insert MOU details
      console.log('Inserting MOU metadata...');
      const mouId = crypto.randomUUID();
      const mouData = {
        id: mouId,
        organization_name: formData.organization_name,
        organization_address: formData.organization_address,
        poc_name: formData.poc_name,
        poc_position: formData.poc_position,
        signature_url: signatureUrl,
        title: formData.title,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date,
        signed_at: new Date().toISOString(),
      };
      const { data: mou, error: mouInsertError } = await supabase
        .from('mou_documents')
        .insert(mouData)
        .select('id')
        .single();
      if (mouInsertError || !mou) {
        throw new Error(`Failed to save MOU details: ${mouInsertError?.message || 'No data returned'}`);
      }
      console.log('MOU metadata saved, ID:', mou.id);
      // Step 4: Trigger callback
      console.log('Calling onMouSigned with mouId:', mou.id);
      onMouSigned(mou.id);
    } catch (error: any) {
      console.error('MOU saving failed:', error);
      toast.error(`Failed to save MOU details: ${error?.message || 'Unknown error occurred'}`);
      setHasProcessed(false);
      setIsProcessing(false);
    }
  }, [formData, onMouSigned, signatureFile, hasProcessed, uploadSignatureToSupabase]);

  const debouncedAgreeAndSave = debounce(handleAgreeAndSave, 1000);

  const renderMouContent = () => (
    <div id="mou-section" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: 1.5, color: '#000' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
          <img
            src="/sponsor_studio_logo.png"
            alt="Sponsor Studio Logo"
            style={{ width: '100px', height: 'auto' }}
          />
        </div>
        <div style={{ color: '#2B4B9B', fontSize: '20px', fontWeight: 'bold', marginTop: '10px' }}>
          MEMORANDUM OF UNDERSTANDING
        </div>
      </div>
      <p style={{ marginTop: '10px' }}>
        This Memorandum of Understanding ("MOU") is made and entered into as on{' '}
        {new Date().toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}{' '}
        ("Effective date") BY AND BETWEEN;
      </p>
      <p style={{ marginTop: '8px' }}>
        <strong>Sreez Spendwisely Solutions Pvt Ltd aka Sponsor Studio</strong> having its
        registered address at RAM NIVAS, CP/IV/73A, DESOM, ALUVA, Desom, Aluva, Ernakulam-683102,
        Kerala (hereinafter referred to as "First Party", which expression shall mean and include
        its legal heirs, administrators and permitted assigns)
      </p>
      <p style={{ marginTop: '8px' }}><strong>AND</strong></p>
      <p style={{ marginTop: '8px' }}>
        <strong>{formData.organization_name || '[Organization Name]'}</strong> having its registered address at{' '}
        {formData.organization_address || '[Organization Address]'} (hereinafter referred to as "Second Party", which
        expression shall mean and include its legal heirs, administrators and permitted assigns)
      </p>
      <p style={{ marginTop: '8px' }}>
        In this MoU, First Party and Second Party shall be collectively referred to as the
        "Parties" and individually as a "Party" as the context may require.
      </p>
      <div style={{ marginTop: '20px' }}>
        <strong>WHEREAS</strong>
      </div>
      <p style={{ marginTop: '8px' }}>
        Both the parties are partnering for, {formData.title || '[Opportunity Name]'} at{' '}
        {formData.location || '[Location]'} on dates {formData.start_date || '[Start Date]'} to{' '}
        {formData.end_date || '[End Date]'}, and both parties agree to the following terms:
      </p>
      <div style={{ marginTop: '20px' }}>
        <strong>Deliverables from First Party</strong>
      </div>
      <ol style={{ marginLeft: '20px', marginTop: '8px' }}>
        <li>
          <strong>Opportunity Listing & Matchmaking:</strong>
          <ul style={{ marginLeft: '20px' }}>
            <li>
              First Party agrees to list the {formData.title || '[Opportunity Name]'} on First
              Party's platform and help the {formData.organization_name || '[Organization Name]'} in receiving brand
              matches for the same.
            </li>
          </ul>
        </li>
        <li style={{ marginTop: '8px' }}>
          <strong>Outreach and Negotiation:</strong>
          <ul style={{ marginLeft: '20px' }}>
            <li>
              Support the {formData.organization_name || '[Organization Name]'} in meeting with
              matched brands through appropriate channels (email, phone, or in-person/online meetings).
            </li>
            <li>
              Support in developing and presenting tailored sponsorship proposals highlighting
              unique value propositions for each prospect.
            </li>
            <li>
              Conduct negotiations to secure optimal sponsorship deals, including financial
              support and in-kind contributions.
            </li>
          </ul>
        </li>
        <li style={{ marginTop: '8px' }}>
          <strong>Analytics and Reports:</strong>
          <ul style={{ marginLeft: '20px' }}>
            <li>Access to an analytics dashboard to see the progress of the listed opportunity.</li>
            <li>
              Prepare post-opportunity reports for each brand, highlighting the impact of their
              contribution and return on investment.
            </li>
          </ul>
        </li>
      </ol>
      <div style={{ marginTop: '20px' }}>
        <strong>Deliverables from Second Party</strong>
      </div>
      <ol style={{ marginLeft: '20px', marginTop: '8px' }}>
        <li>
          <strong>Financial Compensation:</strong> 10% of the Sponsorship Amount Raised through
          brand matches through First Party, Credited within 7 days of receiving partnership
          amounts to {formData.organization_name || '[Organization Name]'} Bank Account.
        </li>
      </ol>
      <div style={{ marginTop: '20px' }}>
        <strong>FORCE MAJEURE</strong>
      </div>
      <p style={{ marginTop: '8px' }}>
        In no event shall the parties be responsible or liable to each other for any failure or
        delay in the performance of their obligations hereunder arising out of or caused by,
        directly or indirectly, forces beyond their control, including, without limitation,
        strikes, work stoppages, accidents, acts of war or terrorism, civil or military
        disturbances, nuclear or natural catastrophes or acts of God, and interruptions, loss
        or malfunctions of utilities, communications or computer (software and hardware)
        services; it being understood that the affected party shall use reasonable efforts
        which are consistent with accepted practices to resume performance as soon as
        practicable under the circumstances. If the condition continues beyond 3 months, then
        the MoU shall stand terminated.
      </p>
      <div style={{ marginTop: '20px' }}>
        <strong>EFFECTIVE DATE AND TENURE OF THE MoU</strong>
      </div>
      <p style={{ marginTop: '8px' }}>
        The MoU is effective from{' '}
        {new Date().toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}{' '}
        and shall remain in force till {formData.organization_name || '[Organization Name]'}'s{' '}
        {formData.title || '[Opportunity Name]'} is completed. The MoU can be terminated by
        either party by giving 7 days notice to the other party, in writing. The termination
        shall not relieve the parties from liabilities and responsibilities incurred during the
        tenure of this MoU, towards each other.
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <tr>
          <td style={{ border: '1px solid #000', padding: '10px', width: '50%' }}>
            <strong>Sreehari Sreekumar</strong>
            <br />Founder
            <br />Sponsor Studio
            <br />
            <div style={{ marginTop: '20px' }}>
              <img
                src={sreeSign}
                alt="Sreehari Signature"
                style={{ maxWidth: '150px', maxHeight: '60px' }}
              />
            </div>
          </td>
          <td style={{ border: '1px solid #000', padding: '10px', width: '50%' }}>
            <strong>{formData.poc_name || '[POC Name]'}</strong>
            <br />
            {formData.poc_position || '[POC Position]'}
            <br />
            {formData.organization_name || '[Organization Name]'}
            <br />
            <div style={{ marginTop: '20px', minHeight: '60px' }}>
              {signaturePreview ? (
                <img
                  src={signaturePreview}
                  alt="POC Signature"
                  style={{ maxWidth: '150px', maxHeight: '60px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ 
                  border: '2px dashed #ccc', 
                  padding: '10px', 
                  textAlign: 'center', 
                  color: '#666',
                  fontSize: '10px'
                }}>
                  Digital Signature
                </div>
              )}
            </div>
          </td>
        </tr>
      </table>
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        Kochi, Kerala
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-gray-800/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-labelledby="mou-modal-title"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl sm:max-w-4xl max-h-[90vh] flex flex-col mx-auto will-change-transform relative">
        <div className="flex justify-between items-center mb-4">
          <h2 id="mou-modal-title" className="text-xl font-bold text-gray-800">
            Memorandum of Understanding
          </h2>
          <button
            onClick={() => {
              console.log('Cancel button clicked');
              setIsProcessing(false);
              setHasProcessed(false);
              onCancel();
            }}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto mb-4 pr-2">
          <p className="text-sm text-gray-700 mb-6">
            Please review the MOU below and upload your signature to proceed.
          </p>
          
          {renderMouContent()}
          
          {/* Signature Upload Section - Moved to bottom with enhanced UI */}
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <Pen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Digital Signature</h3>
                  <p className="text-sm text-gray-600">Upload your signature to complete the MOU</p>
                </div>
              </div>
              {signaturePreview && (
                <div className="text-green-600 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">Ready</span>
                </div>
              )}
            </div>
            
            {!signaturePreview ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-white/50 hover:bg-white/70 transition-colors">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                        disabled={uploadingSignature}
                      >
                        {uploadingSignature ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Uploading...
                          </span>
                        ) : (
                          'Choose Signature Image'
                        )}
                      </button>
                      <p className="text-sm text-gray-500 mt-2">or drag and drop your signature here</p>
                    </div>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                />
                <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                  <div className="flex items-center">
                    <ImageIcon className="w-4 h-4 mr-1" />
                    JPG, PNG, GIF
                  </div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div>Max 2MB</div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="text-blue-600">Optional</div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={signaturePreview}
                        alt="Signature Preview"
                        className="w-24 h-12 object-contain border border-gray-200 rounded bg-white shadow-sm"
                      />
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Signature Ready</p>
                      <p className="text-xs text-gray-500">Your signature will appear in the MOU document</p>
                    </div>
                  </div>
                  <button
                    onClick={removeSignature}
                    className="flex items-center px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              console.log('Cancel button clicked');
              setIsProcessing(false);
              setHasProcessed(false);
              onCancel();
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={debouncedAgreeAndSave}
            className={`px-4 py-2 ${isProcessing || hasProcessed ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2B4B9B] hover:bg-[#1a2f61]'} text-white rounded-lg`}
            disabled={isProcessing || hasProcessed}
          >
            {isProcessing || hasProcessed ? 'Processing...' : 'Agree'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MouSignComponent;