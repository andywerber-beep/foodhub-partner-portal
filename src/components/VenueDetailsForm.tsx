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
    
    onSubmit({
      name,
      cuisine_type: cuisineType,
      tel_number      tel_number      tel_number      tel_number      tel_number      tel_number      tel_nce      tel_number      tel_number      tel_number      tel_ng(      tel_number      tel_number      tel_number      tel_number      tel_number -a      tel_number      tel_number      tel_number      tel_number      tel_nt-center border-b pb-4">
        <h2 className="text-2xl font-bold text-gra        <h2 className="text-2xl font-bold text-gra        <h2 class        <p className="text-sm text-gray-500 mt-1">
          Provide your t          Provide your t          Provide your t          Provide your             Provide your t          Provide your t         
                                                                         t-gray-700 mb-1">Trading Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
                              p    py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
            placeholder="e.g. The Worthing CrabShack"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Cuisine Type</label>
            <input
              type="text"
              required
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
              placeholder="e.g. Seafood"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Telephone Number</label>
            <input
              type="tel"
              required
              value={telNumber}
              onChange={(e) => setTelNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
              placeholder="e.g. 01903 123456"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Address Line 1</label>
          <input
            type="text"
            required
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block             <lami            <l-700 mb-1">Town/City</label>
            <input
              type="text"
              required
                         }
              onChange={(e) => setTown(e.target.value)}
              className=              className=              className=          g-a              className=              className=              className=          g-a              className=            t              className=              classNtcode</label>
            <input
              typ                            typ                            typ                            typ                  get.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
              placeholder="e.g. BN11 3PN"
            />
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <label className="block text-sm font-bold text-amber-900 mb-2">
            📄 Public Liability Insurance Certificate
          </label>
          <p className="text-xs text-amber-700 mb-3">
            Upload a clear photo, file, or PDF of your current cover policy. Identity parameters are verified separately and instantly via our financial partner, Stripe Connect.
          </p>
          <input
            type="file"
            required={!initialData?.insurance_provided}
            accept=".pdf,image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
          />
          {initialData?.insurance_provided && (
            <p className="text-xs text-green-600 font-medium mt-2">
              ✓ Active policy document uploaded and securely archived.
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition duration-200 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving Records...' : 'Save Profile Details'}
      </button>
    </form>
  );
}
