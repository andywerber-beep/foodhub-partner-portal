import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface WelcomeViewProps {
  partnerId: string;
  onEnterPortal: () => void;
}

export default function WelcomeView({ partnerId, onEnterPortal }: WelcomeViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGetStarted = async () => {
    setIsSubmitting(true);
    try {
      // Handshake update: flip status from approved to active
      const { error } = await supabase
        .from('partners')
        .update({ status: 'active' })
        .eq('id', partnerId);

      if (error) throw error;
      
      // Trigger frontend state reload to update router
      onEnterPortal();
    } catch (err) {
      console.error('Error activating partner portal dashboard:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            FoodHub
          </h1>
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome to the Portal!
          </h2>
        </div>

        <div className="p-6 bg-green-50 rounded-xl border border-green-200 flex flex-col items-center space-y-3">
          <span className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md">
            ✓
          </span>
          <p className="text-sm font-semibold text-green-900">
            Credentials & Compliance Verified Successfully
          </p>
          <p className="text-xs text-green-700">
            Your public cover policy and live parameters have passed standard platform review. Your partner profile is now completely unlocked.
          </p>
        </div>

        <p className="text-sm text-gray-600">
          You can now pin live partner venue markers to the public customer map, manage menu lists, configure local offers, and track direct purchase payouts.
        </p>

        <button
          onClick={handleGetStarted}
          disabled={isSubmitting}
          className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition duration-200 disabled:opacity-50 shadow-md"
        >
          {isSubmitting ? 'Configuring Workspace...' : 'Enter Portal'}
        </button>
      </div>
    </div>
  );
}