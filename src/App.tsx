import { useState } from 'react';
import { supabase } from './lib/supabaseClient'; 
import { usePartner } from './context/PartnerContext';

// Import Onboarding Views (Named Exports wrapped in brackets)
import { DetailsPendingView } from './views/Onboarding/DetailsPendingView';
import { CompliancePendingView } from './views/Onboarding/CompliancePendingView';

// Import Review View
import { UnderReviewView } from './views/Review/UnderReviewView';

// Import Portal Views
import ActiveDashboardView from './views/Portal/ActiveDashboardView';

export default function App() {
  const { partner, loading, refreshPartnerStatus } = usePartner();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // If the context is fetching the initial session or partner row, show a clean loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ fontFamily: 'goch_hand' }}>Loading...</p>
      </div>
    );
  }

  // If no authenticated user or partner profile exists, show a standard fallback/login placeholder
  if (!partner) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ fontFamily: 'goch_hand' }}>Please sign in to access the partner portal.</p>
      </div>
    );
  }

  // Handle the transition from "approved" to "active" upon entering the portal
  const handleEnterPortal = async () => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('partners')
        .update({ status: 'active' })
        .eq('id', partner.id);

      if (error) throw error;
      
      // Refresh the context state so it flips to the 'active' dashboard view immediately
      await refreshPartnerStatus();
    } catch (err) {
      console.error('Error updating status to active:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Database-driven onboarding and compliance view switching logic
  switch (partner.status) {
    case 'details_pending':
      return <DetailsPendingView />;

    case 'compliance_pending':
      return <CompliancePendingView />;

    case 'under_review':
      return <UnderReviewView />;

    case 'approved':
      // Welcome to FoodHub screen gate logic
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontFamily: 'goch_hand', fontSize: '2.5rem', marginBottom: '16px' }}>
            Welcome to FoodHub
          </h1>
          <p style={{ marginBottom: '24px', maxWidth: '400px' }}>
            Your partner venue registration has been approved! You are ready to open your portal dashboard.
          </p>
          <button
            onClick={handleEnterPortal}
            disabled={updatingStatus}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              cursor: updatingStatus ? 'not-allowed' : 'pointer'
            }}
          >
            {updatingStatus ? 'Opening Portal...' : 'Enter Portal'}
          </button>
        </div>
      );

    case 'active':
      return <ActiveDashboardView />;

    default:
      // Fallback screen for safety in case status is undefined or unexpected
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p style={{ fontFamily: 'goch_hand' }}>Account status error. Please contact support.</p>
        </div>
      );
  }
}