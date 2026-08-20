import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { PartnerProvider } from './context/PartnerContext';
import DetailsPendingView from './views/Onboarding/DetailsPendingView';
import { ActiveDashboardView } from './views/Portal/ActiveDashboardView';
import { UnderReviewView } from './views/Review/UnderReviewView';
import { WelcomeView } from './views/Onboarding/WelcomeView';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Authentication & Toggle States
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please fill in all fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setAuthError(null);

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data?.user) {
          const { error: profileError } = await supabase.from('partners').insert([{
            id: data.user.id,
            email: email,
            status: 'details_pending',
            id_provided: false,
            hygiene_provided: false,
            insurance_provided: false
          }]);
          if (profileError) console.error("Profile auto-creation log warning:", profileError);
        }

        setAuthError('Registration successful! Please check your email for a verification link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Syncing operational state portal network...</p>
      </div>
    );
  }

  // Dark Theme Authentication Gateway
  if (!session) {
    return (
      <div className="app-container">
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '36px', marginBottom: '8px', fontWeight: 800 }}>
            TAPDINE
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            {isSignUp ? 'Create a partner venue account' : 'Please sign in to access your partner workspace.'}
          </p>
        </header>

        <form onSubmit={handleAuthSubmit} className="block-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {authError && (
            <div style={{ 
              backgroundColor: authError.includes('successful') ? 'rgba(76, 209, 55, 0.1)' : 'rgba(255, 77, 77, 0.1)', 
              border: `1px solid ${authError.includes('successful') ? 'var(--success-color)' : 'var(--error-color)'}`, 
              color: authError.includes('successful') ? 'var(--success-color)' : 'var(--error-color)', 
              padding: '12px', 
              borderRadius: '8px', 
              fontSize: '14px' 
            }}>
              {authError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
              placeholder="venue@example.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
              Password
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', paddingRight: '50px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ width: '100%', backgroundColor: isSubmitting ? 'var(--border-color)' : 'var(--coral-accent)', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', marginTop: '12px' }}
          >
            {isSubmitting ? 'Processing Network Request...' : isSignUp ? 'Register Account' : 'Sign In to Partner Portal'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError(null);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--coral-accent)', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isSignUp ? 'Already registered? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <PartnerProvider>
      <div className="app-container">
        {(() => {
          switch (status) {
            case 'details_pending':
              return (
                <DetailsPendingView 
                  partnerId={session.user.id} 
                  onStepComplete={() => fetchVenueStatus(session.user.id)} 
                />
              );
            case 'under_review':
              return <UnderReviewView />;
            case 'approved':
              return (
                <WelcomeView 
                  partnerId={session.user.id} 
                  partnerName={initialData?.name || 'Partner Venue'} 
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
        })()}
      </div>
    </PartnerProvider>
  );
}