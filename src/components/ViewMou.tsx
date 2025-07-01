import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import sreesign from '../assets/Mou/sreehari-sign.png';

type MouDocument = Database['public']['Tables']['mou_documents']['Row'];

const ViewMou: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mouId = location.state?.mouId as string | undefined;
  const [mouData, setMouData] = useState<MouDocument | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mouId) {
      setError('No MOU ID provided');
      setLoading(false);
      return;
    }

    const fetchMouData = async () => {
      try {
        // Fetch MOU data from mou_documents table
        const { data, error: fetchError } = await supabase
          .from('mou_documents')
          .select('*')
          .eq('id', mouId)
          .single();

        if (fetchError) {
          console.error('Error fetching MOU data:', fetchError.message);
          throw new Error(`Failed to fetch MOU data: ${fetchError.message}`);
        }

        if (!data) {
          throw new Error('MOU not found');
        }

        setMouData(data);

        // signature_url already contains the complete public URL
        if (data.signature_url) {
          setSignatureUrl(data.signature_url);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error in fetchMouData:', err);
        setError(err.message || 'An error occurred while loading the MOU');
        setLoading(false);
      }
    };

    fetchMouData();
  }, [mouId]);

  const handlePrint = () => {
    window.print();
  };

  // MOU content renderer
  const renderMouContent = () => {
    if (!mouData) return null;

    return (
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
          This Memorandum of Understanding (``MOU'') is made and entered into as on{' '}
          {mouData.signed_at
            ? new Date(mouData.signed_at).toLocaleDateString('en-IN', {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '[Signed Date]'}{' '}
          (``Effective date'') BY AND BETWEEN;
        </p>
        <p style={{ marginTop: '8px' }}>
          <strong>Sreez Spendwisely Solutions Pvt Ltd aka Sponsor Studio</strong> having its
          registered address at RAM NIVAS, CP/IV/73A, DESOM, ALUVA, Desom, Aluva, Ernakulam-683102,
          Kerala (hereinafter referred to as ``First Party'', which expression shall mean and include
          its legal heirs, administrators and permitted assigns)
        </p>
        <p style={{ marginTop: '8px' }}><strong>AND</strong></p>
        <p style={{ marginTop: '8px' }}>
          <strong>{mouData.organization_name ?? '[Organization Name]'}</strong> having its registered address at{' '}
          {mouData.organization_address ?? '[Organization Address]'} (hereinafter referred to as ``Second Party'', which
          expression shall mean and include its legal heirs, administrators and permitted assigns)
        </p>
        <p style={{ marginTop: '8px' }}>
          In this MoU, First Party and Second Party shall be collectively referred to as the
          ``Parties'' and individually as a ``Party'' as the context may require.
        </p>
        <div style={{ marginTop: '20px' }}>
          <strong>WHEREAS</strong>
        </div>
        <p style={{ marginTop: '8px' }}>
          Both the parties are partnering for, {mouData.title ?? '[Opportunity Name]'} at{' '}
          {mouData.location ?? '[Location]'} on dates {mouData.start_date ?? '[Start Date]'} to{' '}
          {mouData.end_date ?? '[End Date]'}, and both parties agree to the following terms:
        </p>
        <div style={{ marginTop: '20px' }}>
          <strong>Deliverables from First Party</strong>
        </div>
        <ol style={{ marginLeft: '20px', marginTop: '8px' }}>
          <li>
            <strong>Opportunity Listing & Matchmaking:</strong>
            <ul style={{ marginLeft: '20px' }}>
              <li>
                First Party agrees to list the {mouData.title ?? '[Opportunity Name]'} on First
                Party's platform and help the {mouData.organization_name ?? '[Organization Name]'} in receiving brand
                matches for the same.
              </li>
            </ul>
          </li>
          <li style={{ marginTop: '8px' }}>
            <strong>Outreach and Negotiation:</strong>
            <ul style={{ marginLeft: '20px' }}>
              <li>
                Support the {mouData.organization_name ?? '[Organization Name]'} in meeting with matched brands through
                appropriate channels (email, phone, or in-person/online meetings).
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
            amounts to {mouData.organization_name ?? '[Organization Name]'} Bank Account.
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
          {mouData.signed_at
            ? new Date(mouData.signed_at).toLocaleDateString('en-IN', {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '[Signed Date]'}{' '}
          and shall remain in force till {mouData.organization_name ?? '[Organization Name]'}'s{' '}
          {mouData.title ?? '[Opportunity Name]'} is completed. The MoU can be terminated by
          either party by giving 7 days notice to the other party, in writing. The termination
          shall not relieve the parties from liabilities and responsibilities incurred during the
          tenure of this MoU, towards each other.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <tr>
            <td style={{ border: '0px solid #000', padding: '10px', width: '50%', verticalAlign: 'top' }}>
                <img
                  src={sreesign}
                  alt="Sreehari Sreekumar Signature"
                  style={{ width: '80px', height: 'auto' }}
                />
              <strong>Sreehari Sreekumar</strong>
              <br />Founder
              <br />Sponsor Studio
            </td>
            <td style={{ border: '0px solid #000', padding: '10px', width: '50%', verticalAlign: 'top' }}>
                 {signatureUrl && (
                <div style={{ marginTop: '10px' }}>
                  <img
                    src={signatureUrl}
                    alt="Signature"
                    style={{ width: '80px', height: 'auto' }}
                  />
                </div>
              )}
              <strong>{mouData.poc_name ?? '[POC Name]'}</strong>
              <br />
              {mouData.poc_position ?? '[POC Position]'}
              <br />
              {mouData.organization_name ?? '[Organization Name]'}
             
            </td>
          </tr>
        </table>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          Kochi, Kerala
        </div>
      </div>
    );
  };

  if (!mouId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Error</h2>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-red-600">No MOU ID provided</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
          <p className="text-sm text-gray-700">Loading MOU...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Error</h2>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white">
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            #mou-section {
              font-size: 12pt !important;
              line-height: 1.5 !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
            }
            #mou-section img {
              max-width: 150px !important;
            }
            #mou-section table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
            #mou-section table td {
              border: 1px solid black !important;
              padding: 10px !important;
              vertical-align: top !important;
            }
            .print\\:bg-white {
              background: white !important;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}
      </style>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md print:shadow-none print:p-0">
        <div className="flex justify-between items-center mb-6 no-print">
          <h1 className="text-2xl font-bold text-gray-800">Memorandum of Understanding</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-6">
          {renderMouContent()}
        </div>
        <div className="flex justify-end space-x-4 no-print">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print MOU
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewMou;