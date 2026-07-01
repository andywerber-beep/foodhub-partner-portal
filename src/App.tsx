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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 italic">Syncing operational state portal network...</p>
      </div>
    );
  }

  // Secure Auth Guard: Prevent unauthenticated fallthrough
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">FoodHub</h1>
          <p className="text-gray-600 text-sm">Please sign in to access your partner workspace.</p>
          <div className="pt-2">
            <button 
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
              className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition duration-200"
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