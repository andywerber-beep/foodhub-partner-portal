import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import DetailsPendingView from './views/Onboarding/DetailsPendingView';
import VenueDetailsForm from './components/VenueDetailsForm';
import ActiveDashboardView from './views/Portal/ActiveDashboardView';
import { UnderReviewView } from './views/Review/UnderReviewView';

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

  switch (status) {
    case 'details_pending':
      return <VenueDetailsForm initialData={initialData} onSubmit={handleDetailsSubmit} />;
    case 'under_review':
      return <UnderReviewView />;
    case 'active':
      return <ActiveDashboardView />;
    default:
      return <DetailsPendingView partnerId={session?.user?.id || ''} onStepComplete={() => fetchVenueStatus(session?.user?.id || '')} />;
  }
}