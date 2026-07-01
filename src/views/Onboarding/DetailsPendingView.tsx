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
          town: formData.town,
          postcode: formData.postcode,
          insurance_provided: formData.insurance_provided,
          status: 'compliance_pending'
        })
        .eq('id', partnerId);

      if (updateError) throw updateError;

      if (formData.insuranceFile) {
        const fileExt = formData.insuranceFile.name.split('.').pop();
        const filePath = `${partnerId}/insurance-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('insurance-policies')
          .upload(filePath, formData.insuranceFile, { upsert: true });

        if (uploadError) throw uploadError;
      }

      onStepComplete();
    } catch (err) {
      console.error('Error saving profile configuration:', err);
      alert('Failed to save profile changes. Please review parameters and retry.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 animate-pulse font-medium">Retrieving venue onboarding profile status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col justify-center">
      <header className="max-w-xl mx-auto w-full text-center mb-4">
        <p className="text-sm font-medium text-gray-500">
          Please complete your partner venue profile to unlock compliance verification.
        </p>
      </header>

      <VenueDetailsForm 
        initialData={profileData} 
        onSubmit={handleSubmit} 
      />
    </div>
  );
}