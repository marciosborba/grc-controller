import { NextApiRequest, NextApiResponse } from 'next';
import { IntegrationFactory } from '@/services/integrations/IntegrationFactory';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supportedIntegrations = IntegrationFactory.getSupportedIntegrations();

    res.status(200).json({
      success: true,
      data: supportedIntegrations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting supported integrations:', error);
    
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}