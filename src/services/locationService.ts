import { UserLocationData } from '../types';

export interface LocationDetectionResult {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  ipBased: boolean;
  formattedAddress: string;
}

/**
 * Detects real-time location via Geolocation API with reverse geocoding
 * Falls back to IP-based location if GPS permission is denied or unavailable.
 */
export async function detectRealtimeLocation(): Promise<LocationDetectionResult> {
  // 1. Try Browser HTML5 Geolocation first (high accuracy)
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 30000
        });
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const accuracy = position.coords.accuracy || 10;

      // Reverse geocode coordinates to City & Country
      const geocoded = await reverseGeocodeCoordinates(lat, lon);
      return {
        city: geocoded.city,
        country: geocoded.country,
        latitude: lat,
        longitude: lon,
        accuracy,
        ipBased: false,
        formattedAddress: geocoded.formattedAddress
      };
    } catch (geoError) {
      console.warn('GPS Geolocation unavailable or denied, falling back to IP Geolocation:', geoError);
    }
  }

  // 2. Fallback to IP-based Geolocation
  return await fetchIpLocation();
}

/**
 * Reverse geocodes latitude/longitude to City, Country
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<{ city: string; country: string; formattedAddress: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Using BigDataCloud client-side free reverse geocode API (CORS friendly, no key required)
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || 'City Center';
      const country = data.countryName || 'Global';
      return {
        city,
        country,
        formattedAddress: `${city}, ${country}`
      };
    }
  } catch (err) {
    console.warn('Primary reverse geocoding failed, trying secondary fallback:', err);
  }

  // Secondary fallback: OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' }
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.state_district || addr.state || 'Local City';
      const country = addr.country || 'Global';
      return {
        city,
        country,
        formattedAddress: `${city}, ${country}`
      };
    }
  } catch (err) {
    console.warn('Secondary reverse geocode failed:', err);
  }

  // Default coordinate approximation
  return {
    city: 'Live Location',
    country: 'Global',
    formattedAddress: `${lat.toFixed(3)}°, ${lon.toFixed(3)}°`
  };
}

/**
 * IP-based location fallback
 */
async function fetchIpLocation(): Promise<LocationDetectionResult> {
  // Try ipapi.co
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.city) {
        return {
          city: data.city,
          country: data.country_name || 'Global',
          latitude: Number(data.latitude) || 20.5937,
          longitude: Number(data.longitude) || 78.9629,
          accuracy: 5000,
          ipBased: true,
          formattedAddress: `${data.city}, ${data.country_name || 'Global'}`
        };
      }
    }
  } catch (err) {
    console.warn('ipapi fallback failed:', err);
  }

  // Try ipwho.is as alternate
  try {
    const res = await fetch('https://ipwho.is/');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return {
          city: data.city || 'Dubai',
          country: data.country || 'UAE',
          latitude: data.latitude || 25.2048,
          longitude: data.longitude || 55.2708,
          accuracy: 10000,
          ipBased: true,
          formattedAddress: `${data.city || 'Dubai'}, ${data.country || 'UAE'}`
        };
      }
    }
  } catch (err) {
    console.warn('ipwho fallback failed:', err);
  }

  // Graceful default for Amorex Live
  return {
    city: 'Mumbai',
    country: 'India',
    latitude: 19.076,
    longitude: 72.8777,
    accuracy: 25000,
    ipBased: true,
    formattedAddress: 'Mumbai, India'
  };
}
