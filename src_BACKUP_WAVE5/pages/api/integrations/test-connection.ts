import { NextApiRequest, NextApiResponse } from 'next';
import { IntegrationFactory, SupportedIntegration } from '@/services/integrations/IntegrationFactory';
import { IntegrationCredentials } from '@/services/integrations/BaseIntegration';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, credentials }: { type: SupportedIntegration; credentials: IntegrationCredentials } = req.body;

    if (!type || !credentials) {
      return res.status(400).json({ error: 'Type and credentials are required' });
    }

    // Validate credentials
    const validationErrors = IntegrationFactory.validateCredentials(type, credentials);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Invalid credentials', 
        details: validationErrors 
      });
    }

    // Create integration instance
    const integration = IntegrationFactory.createIntegration({
      type,
      credentials,
      tenantId: '' // Not needed for connection test
    });

    // Test connection
    const isConnected = await integration.testConnection();

    if (isConnected) {
      res.status(200).json({ 
        success: true, 
        message: `Successfully connected to ${type}`,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: `Failed to connect to ${type}. Please check your credentials and server configuration.`
      });
    }

  } catch (error) {
    console.error('Connection test error:', error);
    
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}