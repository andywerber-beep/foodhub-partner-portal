import React, { useState } from 'react';
import { usePartner } from '../../context/PartnerContext';
import { supabase } from '../../lib/supabaseClient';

export const CompliancePendingView: React.FC = () => {
  const { partner, refreshPartnerStatus } = usePartner();
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partner?.id) {
      setErrorMsg('Partner session context not found.');
      return;
    }

    if (!insuranceFile || !insuranceExpiry) {
      setErrorMsg('Please upload your insurance document and provide the expiry date.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Upload private storage document to your existing compliance-docs bucket
      const fileExt = insuranceFile.name.split('.').pop();
      const fileName = `${partner.id}/insurance_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('compliance-docs')
        .upload(fileName, insuranceFile);

      if (uploadError) throw uploadError;

      // 2. Update status and tracking columns in the partners table
      const { error: updateError } = await supabase
        .from('partners')
        .update({
          insurance_provided: true,
          insurance_expiry: insuranceExpiry,
          status: 'under_review'
        })
        .eq('id', partner.id);

      if (updateError) throw updateError;

      // 3. Refresh context status to push the dashboard routing router to the next step
      await refreshPartnerStatus();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ color: 'var(--coral-accent)', fontSize: '28px', marginBottom: '8px', fontWeight: 700 }}>
          Compliance & Verification
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Please review your automated registration details and provide the required legal documentation.
        </p>
      </header>

      <div className="block-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Food Hygiene Auto-Check Card */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a2e1a', border: '1px solid #234e23', padding: '16px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#2e7d32', color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Food Hygiene Certification</div>
                <div style={{ fontSize: '12px', color: '#a1c1a1' }}>Automatically verified via Gov API Data</div>
              </div>
            </div>
          </div>

          {/* Identity Verification Auto-Check Card */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a2e1a', border: '1px solid #234e23', padding: '16px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#2e7d32', color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Partner Identity Check</div>
                <div style={{ fontSize: '12px', color: '#a1c1a1' }}>Verified during digital onboarding entry</div>
              </div>
            </div>
          </div>

        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '-4px' }}>
            Public Liability Insurance
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Upload Certificate (PDF, PNG, JPG)
            </label>
            <input 
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setInsuranceFile(e.target.files?.[0] || null)}
              style={{ width: '100%', background: '#181818', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', color: '#ffffff', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Policy Expiry Date
            </label>
            <input 
              type="date" 
              value={insuranceExpiry}
              onChange={(e) => setInsuranceExpiry(e.target.value)}
              style={{ width: '100%', background: '#181818', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', color: '#ffffff', colorScheme: 'dark' }}
            />
          </div>

          {errorMsg && (
            <div style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)', border: '1px solid var(--error-color)', color: 'var(--error-color)', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              backgroundColor: submitting ? 'var(--border-color)' : 'var(--coral-accent)',
              color: '#ffffff',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              marginTop: '12px',
              transition: 'background-color 0.2s ease'
            }}
          >
            {submitting ? 'Uploading Documents...' : 'Submit Verification Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};