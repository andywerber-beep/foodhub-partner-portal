import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface VenueDetailsFormProps {
  partnerId: string | number;
  currentStatus: 'details_pending' | 'compliance_pending' | 'under_review' | 'approved' | 'active';
  onStatusUpdate: (newStatus: 'details_pending' | 'compliance_pending' | 'under_review' | 'approved' | 'active') => void;
}

export default function VenueDetailsForm({ partnerId, currentStatus, onStatusUpdate }: VenueDetailsFormProps) {
  // Step 1: Details Pending States
  const [name, setName] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [telNumber, setTelNumber] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [town, setTown] = useState('');
  const [postcode, setPostcode] = useState('');
  const [email, setEmail] = useState('');

  // Step 2: Compliance Verification States
  const [isCheckingHygiene, setIsCheckingHygiene] = useState(false);
  const [hygieneVerified, setHygieneVerified] = useState(false);

  // Upload Tracking States
  const [idFile, setIdFile] = useState<File | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [insuranceExpiry, setInsuranceExpiry] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (currentStatus === 'compliance_pending') {
      checkBackendHygieneStatus();
    }
  }, [currentStatus]);

  const checkBackendHygieneStatus = async () => {
    setIsCheckingHygiene(true);
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('hygiene_provided, hygiene_expiry')
        .eq('id', partnerId)
        .single();

      if (error) throw error;

      if (data && data.hygiene_provided) {
        setHygieneVerified(true);
      }
    } catch (err) {
      console.error("Error verifying automated hygiene record:", err);
    } finally {
      setIsCheckingHygiene(false);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const { error } = await supabase
        .from('partners')
        .update({
          name,
          cuisine_type: cuisineType,
          tel_number: telNumber,
          address1,
          address2: address2 || null,
          town,
          postcode,
          email,
          status: 'compliance_pending'
        })
        .eq('id', partnerId);

      if (error) throw error;
      onStatusUpdate('compliance_pending');
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to save business details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadFileToBucket = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true
    });
    if (error) throw error;
    return data.path;
  };

  const handleSaveComplianceAndMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFile || !insuranceFile || !menuFile || !insuranceExpiry) {
      setGeneralError("Please provide all required ID, Insurance documents, and Menu images.");
      return;
    }

    setIsSubmitting(true);
    setGeneralError(null);

    try {
      // Resolved unused variable warnings by executing them directly or mapping references
      await uploadFileToBucket(idFile, 'compliance-docs', `${partnerId}/id_proof_${Date.now()}`);
      await uploadFileToBucket(insuranceFile, 'compliance-docs', `${partnerId}/insurance_${Date.now()}`);
      await uploadFileToBucket(menuFile, 'venue-media', `${partnerId}/menu_${Date.now()}`);

      const { error } = await supabase
        .from('partners')
        .update({
          id_provided: true,
          insurance_provided: true,
          insurance_expiry: insuranceExpiry,
          status: 'under_review'
        })
        .eq('id', partnerId);

      if (error) throw error;

      const { error: menuError } = await supabase
        .from('menus')
        .insert({
          venue_id: partnerId,
          name: `${name} Standard Menu`,
          description: 'Uploaded during registration flow'
        });

      if (menuError) throw menuError;

      onStatusUpdate('under_review');
    } catch (err: any) {
      setGeneralError(err.message || 'An error occurred during verification uploads.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStatus === 'details_pending') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', color: 'var(--text-primary)' }}>
        <form onSubmit={handleSaveDetails} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Partner Venue Registration</h2>
          {generalError && <div style={{ backgroundColor: 'rgba(219, 68, 85, 0.1)', border: '1px solid #db4455', color: '#db4455', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>{generalError}</div>}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>Trading/Business Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', background: 'var(--background-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>Cuisine Type</label>
              <input type="text" value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} required style={{ width: '100%', background: 'var(--background-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>Telephone Number</label>
              <input type="tel" value={telNumber} onChange={(e) => setTelNumber(e.target.value)} required style={{ width: '100%', background: 'var(--background-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', background: 'var(--background-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>Address Line 1</label>
              <input type="text" value={address1} onChange={(e) => setAddress1(e.target.value)} required style={{ width: '100%', background: 'var(--background-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>Address Line 2 (Optional)</label>
              <input type="text" value={address2} onChange={(e) => setAddress2(e.target.value)} style={{ width: '100%', background: 'var(--background-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>Town/City</label>
              <input type="text" value={town} onChange={(e) => setTown(e.target.value)} required style={{ width: '100%', background: 'var(--background-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>Postcode</label>
              <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} required style={{ width: '100%', background: 'var(--background-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" disabled={isSubmitting} style={{ width: '100%', background: 'var(--coral-accent)', color: '#fff', border: 'none', borderRadius: '6px', padding: '12px', fontWeight: 600, cursor: 'pointer', marginTop: '12px' }}>
              {isSubmitting ? 'Saving Profile...' : 'Continue to Verification'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (currentStatus === 'compliance_pending') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', color: 'var(--text-primary)' }}>
        <form onSubmit={handleSaveComplianceAndMedia} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Compliance & Verification</h2>
          {generalError && <div style={{ backgroundColor: 'rgba(219, 68, 85, 0.1)', border: '1px solid #db4455', color: '#db4455', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>{generalError}</div>}

          <div style={{ background: 'var(--background-dark)', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px 0' }}>Food Hygiene Rating Verification</h3>
            
            {isCheckingHygiene && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Confirming background database synchronization...</p>}
            
            {!isCheckingHygiene && hygieneVerified && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4CD137' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>✓</span>
                <p style={{ fontSize: '14px', margin: 0, fontWeight: 500 }}>Verified via live .GOV Database. Automated integration successful.</p>
              </div>
            )}

            {!isCheckingHygiene && !hygieneVerified && (
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 12px 0' }}>Automated lookup executing in background. Click verify to check state again.</p>
                <button type="button" onClick={checkBackendHygieneStatus} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Refresh Status</button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>Upload Owner Identification (ID Proof)</label>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setIdFile(e.target.files?.[0] || null)} required style={{ color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>Public Liability Insurance Document</label>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setInsuranceFile(e.target.files?.[0] || null)} required style={{ color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>Insurance Expiry Date</label>
              <input type="date" value={insuranceExpiry} onChange={(e) => setInsuranceExpiry(e.target.value)} required style={{ width: '100%', background: 'var(--background-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>Upload Current Trading Menu</label>
              <input type="file" accept="image/*" onChange={(e) => setMenuFile(e.target.files?.[0] || null)} required style={{ color: 'var(--text-primary)' }} />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} style={{ width: '100%', background: 'var(--coral-accent)', color: '#fff', border: 'none', borderRadius: '6px', padding: '12px', fontWeight: 600, cursor: 'pointer' }}>
            {isSubmitting ? 'Uploading Documents...' : 'Submit Profile for Final Review'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-primary)', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '40px' }}>
        {currentStatus === 'under_review' && (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Application Under Review</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '150%', margin: 0 }}>Thank you! Your verified business documents and automated hygiene records have been compiled. Our compliance admin team is reviewing your profile setup.</p>
          </>
        )}
        {currentStatus === 'approved' && (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Welcome!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>Your partner venue profile has been completely approved.</p>
            <button onClick={() => onStatusUpdate('active')} style={{ background: 'var(--coral-accent)', color: '#fff', border: 'none', borderRadius: '6px', padding: '12px 32px', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}>Enter Portal</button>
          </>
        )}
        {currentStatus === 'active' && (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Partner Dashboard Live</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>Your storefront connection is functional and ready to configure offers and track menu orders.</p>
          </>
        )}
      </div>
    </div>
  );
}