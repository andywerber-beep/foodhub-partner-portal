import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface VenueDetailsFormProps {
  partnerId?: string;
  initialData?: any;
  onSubmit?: (data: any) => void;
  onSuccess?: () => void;
}

export const VenueDetailsForm: React.FC<VenueDetailsFormProps> = ({
  partnerId,
  initialData,
  onSubmit,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    cuisine_type: initialData?.cuisine_type || '',
    tel_number: initialData?.tel_number || '',
    address1: initialData?.address1 || '',
    address2: initialData?.address2 || '',
    town: initialData?.town || '',
    postcode: initialData?.postcode || '',
    email: initialData?.email || '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Fetch location coordinates from Vercel Geocoding API
      const geocodeResponse = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: formData.address1,
          town: formData.town,
          postcode: formData.postcode,
        }),
      });

      const geocodeData = await geocodeResponse.json();

      if (!geocodeResponse.ok || !geocodeData.latitude || !geocodeData.longitude) {
        throw new Error(
          geocodeData.error ||
            'Could not verify venue location coordinates. Please check your address and postcode.'
        );
      }

      const completeData = {
        name: formData.name,
        cuisine_type: formData.cuisine_type,
        tel_number: formData.tel_number,
        address1: formData.address1,
        address2: formData.address2,
        town: formData.town,
        postcode: formData.postcode,
        email: formData.email,
        latitude: geocodeData.latitude,
        longitude: geocodeData.longitude,
        status: 'compliance_pending',
      };

      // 2. Direct Supabase update if partnerId exists
      if (partnerId) {
        const { error: dbError } = await supabase
          .from('partners')
          .update(completeData)
          .eq('id', partnerId);

        if (dbError) throw dbError;
      }

      // 3. Trigger parent callbacks
      if (onSubmit) {
        await onSubmit(completeData);
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Form submission error:', err);
      setErrorMessage(err.message || 'An error occurred while saving venue details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="block-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h2 style={{ color: 'var(--text-primary, #ffffff)', fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>
          Venue Details
        </h2>
        <p style={{ color: 'var(--text-secondary, #a0a0a0)', fontSize: '14px', margin: 0 }}>
          Please complete your venue contact and location details.
        </p>
      </header>

      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {errorMessage && (
          <div style={{
            backgroundColor: 'rgba(255, 77, 77, 0.1)',
            border: '1px solid var(--error-color, #ff4d4d)',
            color: 'var(--error-color, #ff4d4d)',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {errorMessage}
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
            Venue Name
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Malt"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
            Cuisine Type
          </label>
          <input
            type="text"
            name="cuisine_type"
            required
            value={formData.cuisine_type}
            onChange={handleChange}
            placeholder="e.g. Vegetarian"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
            Phone Number
          </label>
          <input
            type="tel"
            name="tel_number"
            required
            value={formData.tel_number}
            onChange={handleChange}
            placeholder="e.g. 01903 123456"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
            Address Line 1
          </label>
          <input
            type="text"
            name="address1"
            required
            value={formData.address1}
            onChange={handleChange}
            placeholder="e.g. 167 Montague Street"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            name="address2"
            value={formData.address2}
            onChange={handleChange}
            placeholder="Suite, Floor, etc."
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
              Town / City
            </label>
            <input
              type="text"
              name="town"
              required
              value={formData.town}
              onChange={handleChange}
              placeholder="e.g. Worthing"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
              Postcode
            </label>
            <input
              type="text"
              name="postcode"
              required
              value={formData.postcode}
              onChange={handleChange}
              placeholder="e.g. BN11 3BZ"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="venue@example.com"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#181818', color: '#fff', fontSize: '15px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: loading ? 'var(--border-color)' : 'var(--coral-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            marginTop: '12px',
          }}
        >
          {loading ? 'Verifying Location & Saving...' : 'Save & Continue'}
        </button>
      </form>
    </div>
  );
};

export default VenueDetailsForm;