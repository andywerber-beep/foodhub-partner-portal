import React, { useState } from 'react';

interface VenueDetailsFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
}

export default function VenueDetailsForm({ initialData, onSubmit }: VenueDetailsFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [cuisineType, setCuisineType] = useState(initialData?.cuisine_type || '');
  const [telNumber, setTelNumber] = useState(initialData?.tel_number || '');
  const [address1, setAddress1] = useState(initialData?.address1 || '');
  const [town, setTown] = useState(initialData?.town || 'Worthing');
  const [postcode, setPostcode] = useState(initialData?.postcode || '');
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInsuranceFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await onSubmit({
      name,
      cuisine_type: cuisineType,
      tel_number: telNumber,
      address1,
      town,
      postcode,
      insuranceFile,
      insurance_provided: !!insuranceFile || !!initialData?.insurance_provided,
    });
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="block-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 700, margin: 0 }}>
          Partner Venue Profile Registration
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
          Provide your trading credentials and public liability cover to unlock map features.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Trading Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
            placeholder="e.g. The Worthing CrabShack"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Cuisine Type</label>
            <input
              type="text"
              required
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
              placeholder="e.g. Seafood"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Telephone Number</label>
            <input
              type="tel"
              required
              value={telNumber}
              onChange={(e) => setTelNumber(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
              placeholder="e.g. 01903 123456"
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Address Line 1</label>
          <input
            type="text"
            required
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Town/City</label>
            <input
              type="text"
              required
              value={town}
              onChange={(e) => setTown(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Postcode</label>
            <input
              type="text"
              required
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
              placeholder="e.g. BN11 3PN"
            />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0' }} />

        <div style={{ padding: '16px', backgroundColor: 'rgba(230, 126, 34, 0.05)', borderRadius: '12px', border: '1px solid rgba(230, 126, 34, 0.2)' }}>
          <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#e67e22', marginBottom: '6px' }}>
            📄 Public Liability Insurance Certificate
          </label>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
            Upload a clear photo, file, or PDF of your current cover policy. Identity parameters are verified separately and instantly via our financial partner, Stripe Connect.
          </p>
          <input
            type="file"
            required={!initialData?.insurance_provided}
            accept=".pdf,image/*"
            onChange={handleFileChange}
            style={{ color: 'var(--text-secondary)', fontSize: '14px' }}
          />
          {initialData?.insurance_provided && (
            <p style={{ color: 'var(--success-color)', fontSize: '13px', fontWeight: 500, marginTop: '8px', margin: 0 }}>
              ✓ Active policy document uploaded and securely archived.
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{ width: '100%', backgroundColor: isSubmitting ? 'var(--border-color)' : 'var(--coral-accent)', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', marginTop: '12px' }}
      >
        {isSubmitting ? 'Saving Operational Records...' : 'Save Profile Details'}
      </button>
    </form>
  );
}