import { useState, useEffect } from 'react';
import VenueDetailsForm from '../../components/VenueDetailsForm';
import { supabase } from '../../lib/supabaseClient';

interface DetailsPendingViewProps {
  partnerId: string;
  onStepComplete: () => void;
}

export default function DetailsPendingView({ partnerId, onStepComplete }: DetailsPendingViewProps) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartnerProfile() {
      try {
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .eq('id', partnerId)
          .single();

        if (error) throw error;
        if (data) {
          setProfileData(data);
        }
      } catch (err) {
        console.error('Error fetching partner details:', err);
      } finally {
        setLoading(false);
      }
    }

    if (partnerId) {
      fetchPartnerProfile();
    }
  }, [partnerId]);

  const handleSubmit = async (formData: any) => {
    try {
      const { error: updateError } = await supabase
        .from('partners')
        .update({
          name: formData.name,
          cuisine_type: formData.cuisine_type,
          tel_number: formData.tel_number,
          address1: formData.address1,
          address2: formData.address2,
          town: formData.town,
          postcode: formData.postcode,
          email: formData.email,
          latitude: formData.latitude,
          longitude: formData.longitude,
          status: 'compliance_pending'
        })
        .eq('id', partnerId);

      if (updateError) throw updateError;

      onStepComplete();
    } catch (err) {
      console.error('Error saving profile configuration:', err);
      alert('Failed to save profile changes. Please review parameters and retry.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Retrieving venue onboarding profile status...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 0' }}>
      <header style={{ textAlign: 'center', marginBottom: '24px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          Please complete your partner venue profile to unlock compliance verification.
        </p>
      </header>

      <VenueDetailsForm 
        partnerId={partnerId}
        initialData={profileData} 
        onSubmit={handleSubmit} 
      />
    </div>
  );
}