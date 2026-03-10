import { NextApiRequest, NextApiResponse } from 'next';
import { ApplicationIntegrationFactory, SupportedApplicationIntegration } from '@/services/integrations/ApplicationIntegrationFactory';
import { ApplicationCredentials } from '@/services/integrations/ApplicationBaseIntegration';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      type, 
      credentials, 
      tenantId, 
      filters 
    }: { 
      type: SupportedApplicationIntegration; 
      credentials: ApplicationCredentials; 
      tenantId: string;
      filters?: any;
    } = req.body;

    if (!type || !credentials || !tenantId) {
      return res.status(400).json({ error: 'Type, credentials, and tenantId are required' });
    }

    // Validate credentials
    const validationErrors = ApplicationIntegrationFactory.validateCredentials(type, credentials);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Invalid credentials', 
        details: validationErrors 
      });
    }

    // Create integration instance
    const integration = ApplicationIntegrationFactory.createIntegration({
      type,
      credentials,
      tenantId
    });

    // Import applications
    const result = await integration.importApplications(filters);

    if (result.success && result.applications.length > 0) {
      // Save applications to database
      const savedCount = await integration['saveApplications'](result.applications, tenantId);
      
      res.status(200).json({
        success: true,
        message: `Successfully imported ${savedCount} applications from ${type}`,
        data: {
          total_found: result.total_found,
          imported: savedCount,
          skipped: result.skipped,
          errors: result.errors
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(200).json({
        success: result.success,
        message: result.success ? 'No applications found to import' : 'Import failed',
        data: {
          total_found: result.total_found,
          imported: result.imported,
          skipped: result.skipped,
          errors: result.errors
        }
      });
    }

  } catch (error) {
    console.error('Application import error:', error);
    
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}

// Increase timeout for long-running imports
export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  maxDuration: 300, // 5 minutes
};