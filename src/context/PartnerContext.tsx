import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase as supabaseClient } from '../lib/supabaseClient';

export const supabase = supabaseClient;

export interface Partner {
  id: number;
  created_at: string;
  name: string | null;
  cuisine_type: string | null;
  commission_rate: number; // 10% commission rate
  status: 'details_pending' | 'compliance_pending' | 'under_review' | 'approved' | 'active';
  id_provided: boolean;
  hygiene_provided: boolean;
  insurance_provided: boolean;
  insurance_expiry: string | null;
  town: string | null;
  postcode: string | null;
  tel_number: string | null;
  address1: string | null;
  address2: string | null;
  email: string | null;
  hygiene_expiry: string | null;
}

interface PartnerContextType {
  partner: Partner | null;
  loading: boolean;
  error: string | null;
  fetchPartnerDataByEmail: (email: string) => Promise<void>;
  refreshPartnerStatus: () => Promise<void>;
  updatePartnerData: (updates: Partial<Partner>) => Promise<boolean>;
  setPartnerState: React.Dispatch<React.SetStateAction<Partner | null>>;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetches data securely based on the authenticated user's email address
  const fetchPartnerDataByEmail = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let { data, error: dbError } = await supabase
        .from('partners')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (dbError) throw dbError;

      // If no row exists yet for this email, handle live creation instantly inline
      if (!data) {
        const { data: newPartner, error: createErr } = await supabase
          .from('partners')
          .insert([{ 
            email: email,
            name: '', 
            status: 'details_pending',
            commission_rate: 10.0 // 10% partner venue commission rate
          }])
          .select()
          .single();

        if (createErr) throw createErr;
        data = newPartner;
      }

      setPartner(data as Partner);
    } catch (err: any) {
      console.error('Error syncing partner profile data:', err);
      setError(err.message || 'Failed to sync with database');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetches the current partner state from the database to capture status updates instantly
  const refreshPartnerStatus = async () => {
    if (!partner?.email) return;
    try {
      let { data, error: dbError } = await supabase
        .from('partners')
        .select('*')
        .eq('email', partner.email)
        .maybeSingle();

      if (dbError) throw dbError;
      if (data) {
        setPartner(data as Partner);
      }
    } catch (err: any) {
      console.error('Error refreshing partner status:', err);
    }
  };

  const updatePartnerData = async (updates: Partial<Partner>): Promise<boolean> => {
    if (!partner) return false;
    try {
      setError(null);
      
      const { error: dbError } = await supabase
        .from('partners')
        .update(updates)
        .eq('id', partner.id);

      if (dbError) throw dbError;

      setPartner((prev) => (prev ? { ...prev, ...updates } : null));
      return true;
    } catch (err: any) {
      console.error('Error executing data update transaction:', err);
      setError(err.message || 'Failed to submit update');
      return false;
    }
  };

  // Securely monitors live login/logout state changes
  useEffect(() => {
    // 1. Check current session instantly on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        fetchPartnerDataByEmail(session.user.email);
      } else {
        setPartner(null);
        setLoading(false);
      }
    });

    // 2. Listen to real-time changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        fetchPartnerDataByEmail(session.user.email);
      } else {
        setPartner(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <PartnerContext.Provider 
      value={{ 
        partner, 
        loading, 
        error, 
        fetchPartnerDataByEmail, 
        refreshPartnerStatus, 
        updatePartnerData, 
        setPartnerState: setPartner 
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => {
  const context = useContext(PartnerContext);
  if (!context) {
    throw new Error('usePartner must be nested inside a valid PartnerProvider structure');
  }
  return context;
};