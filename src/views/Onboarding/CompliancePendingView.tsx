import React, { useState } from 'react';
import { usePartner } from '../../context/PartnerContext';
import { supabase } from '../../lib/supabaseClient';

export const CompliancePendingView: React.FC = () => {
  const { partner, refreshPartnerStatus } = usePartner();
  
  // Local upload state tracking variables
  const [idFile, setIdFile] = useState<File | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle manual sign out action to return to login/signup screen
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Refresh context status to trigger the root router reset
      await refreshPartnerStatus();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error logging out.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partner?.id) {
      setErrorMsg('Partner session context not found.');
      return;
    }

    // Dynamic validations based on what the database actually still requires
    if (!partner.id_provided && !idFile) {
      setErrorMsg('Please upload your owner identification document.');
      return;
    }

    if (!partner.insurance_provided && (!insuranceFile || !insuranceExpiry)) {
      setErrorMsg('Please upload your insurance document and provide the expiry date.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      let idUploaded = partner.id_provided;
      let insuranceUploaded = partner.insurance_provided;

      // 1. Conditional Owner Identity Document Upload Execution
      if (!partner.id_provided && idFile) {
        const idExt = idFile.name.split('.').pop();
        const idPath = `${partner.id}/id_proof_${Date.now()}.${idExt}`;
        const { error: idUploadError } = await supabase.storage
          .from('compliance-docs')
          .upload(idPath, idFile);

        if (idUploadError) throw idUploadError;
        idUploaded = true;
      }

      // 2. Conditional Insurance Document Upload Execution
      if (!partner.insurance_provided && insuranceFile) {
        const insExt = insuranceFile.name.split('.').pop();
        const insPath = `${partner.id}/insurance_${Date.now()}.${insExt}`;
        const { error: insUploadError } = await supabase.storage
          .from('compliance-docs')
          .upload(insPath, insuranceFile);

        if (insUploadError) throw insUploadError;
        insuranceUploaded = true;
      }

      // 3. Update status row dynamically inside public.partners
      const { error: updateError } = await supabase
        .from('partners')
        .update({
          id_provided: idUploaded,
          insurance_provided: insuranceUploaded,
          ...(insuranceExpiry && { insurance_expiry: insuranceExpiry }),
          status: 'under_review'
        })
        .eq('id', partner.id);

      if (updateError) throw updateError;

      // 4. Update parent engine dynamic state context
      await refreshPartnerStatus();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  // Determine if the form submission section needs to render at all
  const needsUploads = !partner?.id_provided || !partner?.insurance_provided;

  return (
    <div style={{ width: '100%' }}>
      <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ color: 'var(--coral-accent)', fontSize: '28px', marginBottom: '8px', fontWeight: 700 }}>
          Compliance & Verification
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '16px' }}>
          Please review your automated registration details and provide the required legal documentation.
        </p>
        
        {/* Visible Exit Controls Container */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              background: '#181818',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ← Exit to Login / Signup
          </button>
        </div>
      </header>

      <div className="block-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Dynamic Food Hygiene Verification Status Row */}
          {partner?.hygiene_provided ? (
            <div style={{ display: 'flex', alignItems: 'center', background: '#1a2e1a', border: '1px solid #234e23', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#2e7d32', color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Food Hygiene Certification</div>
                  <div style={{ fontSize: '12px', color: '#a1c1a1' }}>Automatically verified via Gov API Data</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', background: '#2e1a1a', border: '1px solid #4e2323', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#c62828', color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>!</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Food Hygiene Certification Pending</div>
                  <div style={{ fontSize: '12px', color: '#c1a1a1' }}>Background .GOV API lookup executing...</div>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Identity Verification Status Row */}
          {partner?.id_provided ? (
            <div style={{ display: 'flex', alignItems: 'center', background: '#1a2e1a', border: '1px solid #234e23', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#2e7d32', color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Partner Identity Check</div>
                  <div style={{ fontSize: '12px', color: '#a1c1a1' }}>Verified during digital onboarding entry</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', background: '#2e1a1a', border: '1px solid #4e2323', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#c62828', color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>!</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Partner Identity Missing</div>
                  <div style={{ fontSize: '12px', color: '#c1a1a1' }}>Upload proof of identity documentation below</div>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Public Liability Insurance Verification Status Row */}
          {partner?.insurance_provided && (
            <div style={{ display: 'flex', alignItems: 'center', background: '#1a2e1a', border: '1px solid #234e23', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#2e7d32', color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Public Liability Insurance</div>
                  <div style={{ fontSize: '12px', color: '#a1c1a1' }}>Valid policy uploaded and log active</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {needsUploads ? (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '-4px' }}>
                Required Uploads Pipeline
              </h3>

              {/* Conditional ID upload box wrapper with optional chaining safety guard */}
              {!partner?.id_provided && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Upload Owner Identification (PDF, PNG, JPG)
                  </label>
                  <input 
                    type="file" 
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                    style={{ width: '100%', background: '#181818', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', color: '#ffffff', cursor: 'pointer' }}
                  />
                </div>
              )}

              {/* Conditional Insurance upload fields wrapper with optional chaining safety guard */}
              {!partner?.insurance_provided && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      Upload Insurance Certificate (PDF, PNG, JPG)
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
                </>
              )}

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
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            🎉 All components verified. Hit refresh if routing pipeline doesn't update your view automatically.
          </div>
        )}
      </div>
    </div>
  );
};