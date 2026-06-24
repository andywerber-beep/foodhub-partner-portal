export interface HygieneEstablishment {
  id: number;
  businessName: string;
  ratingValue: string;
  ratingDate: string;
  postCode: string;
}

/**
 * Service to interact with the UK Food Standards Agency (FSA) 
 * Food Hygiene Rating Scheme (FHARS) API.
 */
export const hygieneApi = {
  /**
   * Search for a venue's official hygiene rating using their business name and postcode.
   * @param name - The trading name of the partner venue
   * @param postcode - The postcode of the establishment
   */
  async searchEstablishment(name: string, postcode: string): Promise<HygieneEstablishment | null> {
    try {
      // Clean up the inputs to prevent formatting errors in the URL string
      const cleanName = encodeURIComponent(name.trim());
      const cleanPostcode = encodeURIComponent(postcode.trim().toUpperCase());
      
      const url = `https://api.ratings.food.gov.uk/Establishments?name=${cleanName}&address=${cleanPostcode}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-api-version': '2', // Mandatory API version header required by the FSA server
          'content-type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`FSA API responded with status: ${response.status}`);
      }

      const data = await response.json();

      // If no establishments match the criteria, return null safely
      if (!data.establishments || data.establishments.length === 0) {
        return null;
      }

      // Grab the best matching record from the results
      const match = data.establishments[0];

      return {
        id: match.id,
        businessName: match.BusinessName,
        ratingValue: match.RatingValue,
        ratingDate: match.RatingDate,
        postCode: match.PostCode
      };

    } catch (error) {
      console.error('Error fetching data from UK Hygiene API:', error);
      return null;
    }
  }
};