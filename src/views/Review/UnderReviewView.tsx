import React, { useState } from 'react';
import { usePartner } from '../../context/PartnerContext';

export const UnderReviewView: React.FC = () => {
  const { refreshPartnerStatus } = usePartner();
  const [checking, setChecking] = useState(false);

  const handleRefresh = async () => {
    setChecking(true);
    await refreshPartnerStatus();
    setChecking(false);
  };

  return (
    <div style={{ width: '100%', textAlign: 'center', padding: '40px 20px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ color: 'var(--coral-accent)', fontSize: '28px', marginBottom: '12px', fontWeight: 700 }}>
          Application Status
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '420px', margin: '0 auto' }}>
          Admin are reviewing your documents.
        </p>
      </header>

      <div className="block-card" style={{ maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Click below to check if your application approval is live.
        </p>
        
        <button
          type="button"
          onClick={handleRefresh}
          disabled={checking}
          style={{
            width: '100%',
            backgroundColor: checking ? 'var(--border-color)' : 'var(--coral-accent)',
            color: '#ffffff',
            border: 'none',
            padding: '14px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: checking ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease'
          }}
        >
          {checking ? 'Checking Status...' : 'Check Approval Status'}
        </button>
      </div>
    </div>
  );
};