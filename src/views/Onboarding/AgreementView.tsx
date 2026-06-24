import React, { useState } from 'react';
import { usePartner } from '../../context/PartnerContext';

export const AgreementView: React.FC = () => {
  const { updatePartnerData } = usePartner();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAcceptTerms = async () => {
    if (!agreed) {
      setError('You must accept the Merchant Service Agreement terms to proceed.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Enforce your true 10% model commission rate and move to document verification track
      const success = await updatePartnerData({
        commission_rate: 10.0,
        status: 'compliance_pending'
      });

      if (!success) {
        setError('Failed to securely sign contract data with the server.');
      }
    } catch (err) {
      setError('An unhandled exception occurred during terms execution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', color: 'var(--coral-accent, #FF6B6B)', letterSpacing: '-0.05em', fontWeight: 700, marginBottom: '16px' }}>
          FOODHUB
        </h1>
        <h2 style={{ color: '#fff', fontSize: '28px', margin: '0 0 8px 0', fontWeight: 700 }}>
          Merchant Agreement
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
          Finalize your contract terms to unlock compliance verification checks.
        </p>
      </header>

      <div className="block-card" style={{ padding: '32px', textAlign: 'left', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 600, color: '#fff' }}>Partner Venue Terms of Service</h3>
        
        <div style={{ 
          backgroundColor: '#181818', 
          border: '1px solid #2a2a2a', 
          borderRadius: '8px', 
          padding: '16px', 
          height: '180px', 
          overflowY: 'scroll', 
          fontSize: '13px', 
          color: '#aaa',
          lineHeight: '150%',
          marginBottom: '24px'
        }}>
          <p style={{ marginBottom: '12px', fontWeight: 600, color: '#fff' }}>1. Platform Target & Scope</p>
          <p style={{ marginBottom: '12px' }}>This software application functions solely and exclusively for partner venues to manage digital menu uploads, administer local promotional offers, and look up point-of-sale mapping analytics. There is no employer interface or structural affiliation tied to employee personnel within this dashboard framework.</p>
          
          <p style={{ marginBottom: '12px', fontWeight: 600, color: '#fff' }}>2. Marketplace Transaction Commission</p>
          <p style={{ marginBottom: '12px' }}>A flat commission rate of 10% will be applied to purchases processed on behalf of the partner venue via the platform payment infrastructure. This commission structure is seamlessly and automatically deducted by Stripe directly from the venue side at the exact milestone of purchase execution.</p>
          
          <p style={{ marginBottom: '12px', fontWeight: 600, color: '#fff' }}>3. Point of Sale Configurations</p>
          <p style={{ marginBottom: '12px' }}>Purchases are initiated over secure contactless communication architecture involving dedicated digital triggers. Venues retain full autonomous control over uploaded asset registries, immediate clear-out inventory target metrics, and real-time menu updates.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)', border: '1px solid var(--error-color)', color: 'var(--error-color)', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a2a', borderRadius: '12px', marginBottom: '24px' }}>
          <div style={{ marginTop: '2px' }}>
            <input 
              type="checkbox" 
              id="accept"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--coral-accent, #FF6B6B)', cursor: 'pointer' }}
            />
          </div>
          <label htmlFor="accept" style={{ fontSize: '14px', color: '#fff', cursor: 'pointer', userSelect: 'none', lineHeight: '140%' }}>
            <span style={{ fontWeight: 600, display: 'block', marginBottom: '2px' }}>Confirm Commercial Baseline</span>
            I accept the commercial parameters, verifying the 10% platform transaction deduction structure applied on the venue marketplace ledger.
          </label>
        </div>

        <button
          onClick={handleAcceptTerms}
          disabled={isSubmitting}
          style={{ width: '100%', backgroundColor: isSubmitting ? '#2a2a2a' : 'var(--coral-accent, #FF6B6B)', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}
        >
          {isSubmitting ? 'Executing Digital Signature...' : 'Sign Agreement & Open Compliance Track →'}
        </button>
      </div>
    </div>
  );
};

export default AgreementView;