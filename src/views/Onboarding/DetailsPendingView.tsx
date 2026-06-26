import React from 'react';
// Removed the curly braces to correctly import the default export
import VenueDetailsForm from './VenueDetailsForm';

export const DetailsPendingView: React.FC = () => {
  return (
    <div style={{ width: '100%' }}>
      <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ color: 'var(--coral-accent)', fontSize: '28px', marginBottom: '8px', fontWeight: 700 }}>
          Venue Profile Setup
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Please complete your partner venue profile to unlock compliance verification.
        </p>
      </header>

      <VenueDetailsForm 
        partnerId="" 
        currentStatus="details_pending" 
        onStatusUpdate={() => {}} 
      />
    </div>
  );
};