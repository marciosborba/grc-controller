// Utility for collecting browser metadata for ethics reports
export interface BrowserMetadata {
  user_agent: string;
  ip_address?: string;
  device_info: string;
  location?: string;
  timestamp: string;
  source: string;
}

export const collectBrowserMetadata = async (): Promise<BrowserMetadata> => {
  const metadata: BrowserMetadata = {
    user_agent: navigator.userAgent,
    device_info: getDeviceInfo(),
    timestamp: new Date().toISOString(),
    source: 'web_form'
  };

  // Try to get location if permission is granted
  try {
    const location = await getLocationInfo();
    if (location) {
      metadata.location = location;
    }
  } catch (error) {
    console.log('Location access denied or not available');
  }

  return metadata;
};

const getDeviceInfo = (): string => {
  const userAgent = navigator.userAgent;
  
  // Mobile detection
  if (/Android/i.test(userAgent)) {
    return 'Android Mobile';
  }
  if (/iPhone/i.test(userAgent)) {
    return 'iPhone Mobile Safari';
  }
  if (/iPad/i.test(userAgent)) {
    return 'iPad Mobile Safari';
  }
  
  // Desktop browsers
  if (/Windows NT/i.test(userAgent)) {
    if (/Chrome/i.test(userAgent)) {
      return 'Windows Desktop Chrome';
    }
    if (/Firefox/i.test(userAgent)) {
      return 'Windows Desktop Firefox';
    }
    if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
      return 'Windows Desktop Safari';
    }
    return 'Windows Desktop';
  }
  
  if (/Mac OS X/i.test(userAgent)) {
    if (/Chrome/i.test(userAgent)) {
      return 'Mac Desktop Chrome';
    }
    if (/Firefox/i.test(userAgent)) {
      return 'Mac Desktop Firefox';
    }
    if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
      return 'Mac Desktop Safari';
    }
    return 'Mac Desktop';
  }
  
  if (/Linux/i.test(userAgent)) {
    return 'Linux Desktop';
  }
  
  return 'Unknown Device';
};

const getLocationInfo = (): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use reverse geocoding to get location name
          // Note: In a real implementation, you'd use a proper geocoding service
          // For now, we'll return coordinates
          const { latitude, longitude } = position.coords;
          resolve(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch (error) {
          resolve(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        }
      },
      (error) => {
        reject(`Geolocation error: ${error.message}`);
      },
      {
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        enableHighAccuracy: false
      }
    );
  });
};

export const sanitizeMetadata = (metadata: BrowserMetadata) => {
  return {
    reporter_user_agent: metadata.user_agent?.substring(0, 500) || null,
    reporter_device_info: metadata.device_info || null,
    reporter_location: metadata.location || null,
    submission_source: metadata.source,
    submission_timestamp: metadata.timestamp,
    metadata_collected_at: new Date().toISOString()
  };
};