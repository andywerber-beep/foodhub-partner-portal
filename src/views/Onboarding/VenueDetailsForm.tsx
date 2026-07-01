import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface VenueDetailsFormProps {
  partnerId: string | number;
  currentStatus: 'details_pending' | 'compliance_pending' | 'under_review' | 'approved' | 'active';
  onStatusUpdate: (newStatus: 'details_pending' | 'compliance_pending' | 'under_review' | 'approved' | 'active') => void;
}

export default function VenueDetailsForm({ partnerId, currentStatus, onStatusUpdate }: VenueDetailsFormProps) {
  // Step 1: Details States
  const [name, setName] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [telNumber, setTelNumber] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [town, setTown] = useState('');
  const [postcode, setPostcode] = useState('');
  const [email, setEmail] = useState('');

  // Core Compliance Flags from DB
  const [dbIdProvided, setDbIdProvided] = useState(false);
  const [dbInsuranceProvided, setDbInsuranceProvided] = useState(false);

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

  // Fetch current database fields on mount or status rollback to ensure re-uploads target the correct missing gaps
  useEffect(() => {
    fetchExistingPartnerData();
  }, [partnerId, currentStatus]);

  const fetchExistingPartnerData = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', partnerId)
        .single();

      if (error) throw error;

      if (data) {
        setName(data.name || '');
        setCuisineType(data.cuisine_type || '');
        setTelNumber(data.tel_number || '');
        setAddress1(data.address1 || '');
        setAddress2(data.address2 || '');
        setTown(data.town || '');
        setPostcode(data.postcode || '');
        setEmail(data.email || '');
        setDbIdProvided(data.id_provided || false);
        setDbInsuranceProvided(data.insurance_provided || false);
        setInsuranceExpiry(data.insurance_expiry || '');
        
        if (data.hygiene_provided) {
          setHygieneVerified(true);
        }
      }
    } catch (err) {
      console.error("Error loading partner record profile context:", err);
    }
  };

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

    let latitude: number | null = null;
    let longitude: number | null = null;

    try {
      // 1. Geocode full address using official browser endpoint pipelines
      const formattedAddress = encodeURIComponent(`${address1}, ${town}, ${postcode}`);
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedAddress}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
      
      const geoResponse = await fetch(geocodeUrl);
      const geoData = await geoResponse.json();

      if (geoData.status === 'OK' && geoData.results?.[0]?.geometry?.location) {
        latitude = geoData.results[0].geometry.location.lat;
        longitude = geoData.results[0].geometry.location.lng;
      } else {
        console.warn(`⚠️ Geocoding failed with status: ${geoData.status}. Falling back to clean record updates.`);
      }

      // 2. Commit complete profile dataset along with coordinates down into Supabase
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
          latitude,
          longitude,
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
    
    // Validate uploads depending on whether database needs them re-provided
    if (!dbIdProvided && !idFile) {
      setGeneralError("Owner Identification (ID Proof) is required to proceed.");
      return;
    }
    if (!dbInsuranceProvided && !insuranceFile) {
      setGeneralError("Public Liability Insurance Document is required to proceed.");
      return;
    }
    if (!menuFile) {
      setGeneralError("Please upload an image of your trading menu.");
      return;
    }
    if (!insuranceExpiry) {
      setGeneralError("Please provide your insurance expiration date.");
      return;
    }

    setIsSubmitting(true);
    setGeneralError(null);

    try {
      if (idFile) {
        await uploadFileToBucket(idFile, 'compliance-docs', `${partnerId}/id_proof_${Date.now()}`);
      }
      if (insuranceFile) {
        await uploadFileToBucket(insuranceFile, 'compliance-docs', `${partnerId}/insurance_${Date.now()}`);
      }
      if (menuFile) {
        await uploadFileToBucket(menuFile, 'venue-media', `${partnerId}/menu_${Date.now()}`);
      }

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
    const isMissingId = !dbIdProvided;
    const isMissingInsurance = !dbInsuranceProvided;

    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', color: 'var(--text-primary)' }}>
        <form onSubmit={handleSaveComplianceAndMedia} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Compliance & Verification</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Please complete the required registration uploads below.</p>
          
          {isMissingId && (
            <div style={{ backgroundColor: 'rgba(219, 68, 85, 0.1)', border: '1px solid #db4455', color: '#db4455', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 500 }}>
              ⚠️ Action Required: Government Identity Verification is missing or was rejected. Please re-upload a clear file or photo of your ID.
            </div>
          )}

          {generalError && <div style={{ backgroundColor: 'rgba(219, 68, 85, 0.1)', border: '1px solid #db4455', color: '#db4455', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>{generalError}</div>}

          {/* Background FSA Sync Panel */}
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
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                Upload Owner Identification (ID Proof) {dbIdProvided && <span style={{ color: '#4CD137' }}>(✓ Uploaded)</span>}
              </label>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setIdFile(e.target.files?.[0] || null)} required={isMissingId} style={{ color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                Public Liability Insurance Document {dbInsuranceProvided && <span style={{ color: '#4CD137' }}>(✓ Uploaded)</span>}
              </label>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setInsuranceFile(e.target.files?.[0] || null)} required={isMissingInsurance} style={{ color: 'var(--text-primary)' }} />
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