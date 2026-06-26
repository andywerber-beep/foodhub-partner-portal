import { useState } from 'react';
import { supabase } from './lib/supabaseClient'; 
import { PartnerProvider, usePartner } from './context/PartnerContext';

// Import Onboarding Views
import { DetailsPendingView } from './views/Onboarding/DetailsPendingView';
import { CompliancePendingView } from './views/Onboarding/CompliancePendingView';

// Import Review View
import { UnderReviewView } from './views/Review/UnderReviewView';

// Import Portal Views
import ActiveDashboardView from './views/Portal/ActiveDashboardView';

function MainAppContent() {
  const { partner, loading, refreshPartnerStatus } = usePartner();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Auth Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  // Handle Supabase Authentication
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Registration successful! Check your email for a verification link, or try signing in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // 1. Initial Data/Session loading screen
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background-dark)', color: 'var(--text-primary)' }}>
        <p style={{ fontSize: '18px', fontWeight: 500 }}>Syncing security credentials...</p>
      </div>
    );
  }

  // 2. If no user session exists, render the clean login/signup interface
  if (!partner) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#121214', padding: '20px' }}>
        <form onSubmit={handleAuth} style={{ background: '#1a1a1e', border: '1px solid #2e2e34', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '420px', textAlign: 'left', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          <header style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ color: 'var(--coral-accent, #db4455)', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
              FoodHub Partners
            </h2>
            <p style={{ color: '#a1a1aa', fontSize: '14px' }}>
              {isSignUp ? 'Create your merchant gateway account' : 'Sign in to access your partner workspace'}
            </p>
          </header>

          {authError && (
            <div style={{ backgroundColor: 'rgba(219, 68, 85, 0.1)', border: '1px solid #db4455', color: '#db4455', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>
              {authError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', background: '#121214', border: '1px solid #2e2e34', borderRadius: '6px', padding: '12px', color: '#fff', boxSizing: 'border-box', fontSize: '15px' }} placeholder="name@venue.com" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', background: '#121214', border: '1px solid #2e2e34', borderRadius: '6px', padding: '12px', color: '#fff', boxSizing: 'border-box', fontSize: '15px' }} placeholder="••••••••" />
            </div>

            <button type="submit" disabled={authLoading} style={{ width: '100%', background: 'var(--coral-accent, #db4455)', color: '#fff', border: 'none', borderRadius: '6px', padding: '14px', fontWeight: 600, cursor: authLoading ? 'not-allowed' : 'pointer', fontSize: '16px', marginTop: '8px', transition: 'background 0.2s' }}>
              {authLoading ? 'Verifying...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid #2e2e34', paddingTop: '20px' }}>
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setAuthError(null); }} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Register here"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Handle transitioning from approved -> active status
  const handleEnterPortal = async () => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('partners')
        .update({ status: 'active' })
        .eq('id', partner.id);

      if (error) throw error;
      await refreshPartnerStatus();
    } catch (err) {
      console.error('Error updating status to active:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // 3. Status Switcher Matrix
  switch (partner.status) {
    case 'details_pending':
      return <DetailsPendingView />;

    case 'compliance_pending':
      return <CompliancePendingView />;

    case 'under_review':
      return <UnderReviewView />;

    case 'approved':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px', textAlign: 'center', background: '#121214', color: '#fff' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', fontWeight: 700 }}>Welcome to FoodHub</h1>
          <p style={{ marginBottom: '24px', maxWidth: '400px', color: '#a1a1aa' }}>
            Your partner venue registration has been approved! You are ready to open your portal dashboard.
          </p>
          <button onClick={handleEnterPortal} disabled={updatingStatus} style={{ padding: '12px 32px', fontSize: '1rem', cursor: updatingStatus ? 'not-allowed' : 'pointer', background: 'var(--coral-accent, #db4455)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600 }}>
            {updatingStatus ? 'Opening Portal...' : 'Enter Portal'}
          </button>
        </div>
      );

    case 'active':
      return <ActiveDashboardView />;

    default:
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#121214', color: '#fff' }}>
          <p>Account status configuration error. Please contact support.</p>
        </div>
      );
  }
}

export default function App() {
  return (
    <PartnerProvider>
      <MainAppContent />
    </PartnerProvider>
  );
}