import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import type { Database } from '../../../lib/database.types';
import { supabase } from '../../../lib/supabase';

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
  const modalRef = useRef<HTMLDivElement>(null);
  const submitCount = useRef(0);

  // Lock scroll when modal is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    modalRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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
      alert('Please ensure all required MOU fields (Organization Name, Address, POC Name, POC Position) are filled in the form.');
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

      // Step 2: Insert MOU details
      console.log('Inserting MOU metadata...');
      const mouId = crypto.randomUUID();
      const mouData = {
        id: mouId,
        organization_name: formData.organization_name,
        organization_address: formData.organization_address,
        poc_name: formData.poc_name,
        poc_position: formData.poc_position,
        signature_url: null, // No signature required
        title: formData.title,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date,
        signed_at: new Date().toISOString(),
      };
      const { data: mou, error: mouInsertError } = await timeout(
        supabase.from('mou_documents').insert(mouData).select('id').single(),
        10000
      );
      if (mouInsertError || !mou) {
        throw new Error(`Failed to save MOU details: ${mouInsertError?.message || 'No data returned'}`);
      }
      console.log('MOU metadata saved, ID:', mou.id);

      // Step 3: Trigger callback
      console.log('Calling onMouSigned with mouId:', mou.id);
      onMouSigned(mou.id);
    } catch (error) {
      console.error('MOU saving failed:', error);
      alert(`Failed to save MOU details: ${error.message}`);
      setHasProcessed(false);
      setIsProcessing(false);
    }
  }, [formData, onMouSigned]);

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
          </td>
          <td style={{ border: '1px solid #000', padding: '10px', width: '50%' }}>
            <strong>{formData.poc_name || '[POC Name]'}</strong>
            <br />
            {formData.poc_position || '[POC Position]'}
            <br />
            {formData.organization_name || '[Organization Name]'}
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
      className="absolute top-0 left-0 w-full h-full bg-gray-800/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 pointer-events-none"
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-labelledby="mou-modal-title"
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl sm:max-w-4xl max-h-[90vh] flex flex-col mx-auto pointer-events-auto will-change-transform">
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
          <p className="text-sm text-gray-700 mb-4">
            Please review the MOU below and click "Agree" to proceed.
          </p>
          {renderMouContent()}
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