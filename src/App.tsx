import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import DetailsPendingView from './views/Onboarding/DetailsPendingView';
import VenueDetailsForm from './components/VenueDetailsForm';
import ActiveDashboardView from './views/Portal/ActiveDashboardView';
import { UnderReviewView } from './views/Review/UnderReviewView';
import WelcomeView from './views/Onboarding/WelcomeView';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession) fetchVenueStatus(currentSession.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        fetchVenueStatus(currentSession.user.id);
      } else {
        setLoading(false);
        setStatus(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchVenueStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('partners')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setInitialData(data);
        setStatus(data.status);
      } else {
        setStatus('details_pending');
      }
    } catch (err) {
      console.error(err);
      setStatus('details_pending');
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsSubmit = async (formData: any) => {
    console.log('Profile submission payload:', formData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Syncing operational state portal network...</p>
      </div>
    );
  }

  // Secure Auth Guard aligned with your index.css global layout tokens
  if (!session) {
    return (
      <div className="app-container">
        <div className="block-card text-center" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            FoodHub
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
            Please sign in to access your partner workspace.
          </p>
          <div>
            <button 
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--coral-accent)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--coral-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--coral-accent)')}
            >
              Sign In to Partner Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  switch (status) {
    case 'details_pending':
      return <VenueDetailsForm initialData={initialData} onSubmit={handleDetailsSubmit} />;
    case 'under_review':
      return <UnderReviewView />;
    case 'approved':
      return (
        <WelcomeView 
          partnerId={session.user.id} 
          onEnterPortal={() => fetchVenueStatus(session.user.id)} 
        />
      );
    case 'active':
      return <ActiveDashboardView />;
    default:
      return (
        <DetailsPendingView 
          partnerId={session.user.id} 
          onStepComplete={() => fetchVenueStatus(session.user.id)} 
        />
      );
  }
}