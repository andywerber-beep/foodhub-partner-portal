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
      // 1. Geocode address via serverless endpoint
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
            'Could not verify venue location coordinates from the provided postcode and address. Please check your address details.'
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

      // 2. Direct Supabase update if partnerId is provided
      if (partnerId) {
        const { error: dbError } = await supabase
          .from('partners')
          .update(completeData)
          .eq('id', partnerId);

        if (dbError) throw dbError;
      }

      // 3. Fire parent callbacks
      if (onSubmit) {
        await onSubmit(completeData);
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Form submission error:', err);
      setErrorMessage(err.message || 'An error occurred while saving details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Venue Details</h2>

      {errorMessage && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Venue Name</label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cuisine Type</label>
        <input
          type="text"
          name="cuisine_type"
          required
          value={formData.cuisine_type}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          name="tel_number"
          required
          value={formData.tel_number}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
        <input
          type="text"
          name="address1"
          required
          value={formData.address1}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
        <input
          type="text"
          name="address2"
          value={formData.address2}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-black"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Town / City</label>
          <input
            type="text"
            name="town"
            required
            value={formData.town}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Postcode</label>
          <input
            type="text"
            name="postcode"
            required
            value={formData.postcode}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-black"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email Address</label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-black"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 mt-6"
      >
        {loading ? 'Verifying Address & Saving...' : 'Save & Continue'}
      </button>
    </form>
  );
};

export default VenueDetailsForm;