declare const process: any;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { address, town, postcode } = body;

    if (!postcode) {
      return res.status(400).json({ error: 'Postcode is required for geocoding.' });
    }

    const fullAddress = `${address || ''}, ${town || ''}, ${postcode}, UK`;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error('Geocoding Server Error: Missing GOOGLE_MAPS_API_KEY in environment variables.');
      return res.status(500).json({ error: 'Server configuration error: Google Maps API key is missing.' });
    }

    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      fullAddress
    )}&key=${apiKey}`;

    const response = await fetch(googleUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
      const { lat, lng } = data.results[0].geometry.location;
      return res.status(200).json({
        success: true,
        latitude: lat,
        longitude: lng,
        formatted_address: data.results[0].formatted_address,
      });
    }

    console.warn(`Google Geocoding failed for "${fullAddress}". Status: ${data.status}`);
    return res.status(422).json({
      error: `Unable to locate address via Google Maps API (${data.status}).`,
    });
  } catch (error: any) {
    console.error('Server Geocoding Exception:', error);
    return res.status(500).json({ error: 'Internal server error during geocoding lookup.' });
  }
}