import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface WelcomeViewProps {
  partnerId: string;
  partnerName: string;
  onEnterPortal: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  partnerId,
  partnerName,
  onEnterPortal,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProgressToActive = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('partners')
        .update({ status: 'active' })
        .eq('id', partnerId);

      if (error) throw error;
      
      onEnterPortal();
    } catch (err) {
      console.error('Error transitioning onboarding status matrix:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#121212', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Clean Brand Header Logo Box */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '40px', 
          fontWeight: '800',
          margin: 0, 
          color: '#ffffff',
          letterSpacing: '-0.5px'
        }}>
          FoodHub
        </h1>
      </div>

      {/* Successful Verification Card Structure */}
      <div style={{ 
        maxWidth: '550px', 
        width: '100%', 
        backgroundColor: '#1a1a1a', 
        borderRadius: '12px', 
        border: '1px solid #2a2a2a', 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        padding: '40px', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* Specific Checkmark Span Container */}
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(76, 209, 55, 0.15)', 
          color: '#4CD137', 
          fontSize: '32px', 
          fontWeight: 'bold',
          marginBottom: '24px'
        }}>
          ✓
        </span>

        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          margin: '0 0 8px 0', 
          color: '#ffffff' 
        }}>
          Welcome to the Portal!
        </h2>
        
        <p style={{ 
          fontSize: '14px', 
          color: '#aaaaaa', 
          margin: '0 0 24px 0',
          fontWeight: '500'
        }}>
          {partnerName}
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid #2a2a2a', width: '100%', margin: '0 0 24px 0' }} />

        <div style={{ textAlign: 'left', width: '100%', marginBottom: '32px' }}>
          <h3 style={{ 
            fontSize: '15px', 
            fontWeight: '600', 
            color: '#4CD137', 
            margin: '0 0 12px 0' 
          }}>
            Your documents have been verified.
          </h3>
          
          <p style={{ fontSize: '14px', color: '#dddddd', lineHeight: '1.6', margin: '0 0 16px 0' }}>
            Your partner profile is now unlocked and you are live on the map.
          </p>
          
          <p style={{ fontSize: '14px', color: '#dddddd', lineHeight: '1.6', margin: 0 }}>
            You can now manage menu lists, configure local offers, and track direct purchase payouts.
          </p>
        </div>

        {/* Enter Portal Action Trigger Button */}
        <button
          disabled={isSubmitting}
          onClick={handleProgressToActive}
          style={{
            width: '100%',
            padding: '14px 24px',
            backgroundColor: isSubmitting ? '#333333' : '#4CD137',
            color: isSubmitting ? '#aaaaaa' : '#121212',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease',
            outline: 'none'
          }}
        >
          {isSubmitting ? 'Opening Environment...' : 'Enter Portal'}
        </button>
      </div>
    </div>
  );
};