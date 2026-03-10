import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImportSource, ImportPreview, ConnectionConfig } from './types/import';

interface ImportPreviewComponentProps {
  source: ImportSource;
  file: File | null;
  connectionConfig: ConnectionConfig;
  onPreviewGenerated: (preview: ImportPreview) => void;
}

export default function ImportPreviewComponent({ 
  source, 
  file, 
  connectionConfig, 
  onPreviewGenerated 
}: ImportPreviewComponentProps) {
  
  useEffect(() => {
    // Simulate preview generation
    if (file || (connectionConfig.api_url && source.category === 'api')) {
      const mockPreview: ImportPreview = {
        source_type: source.type,
        total_records: 150,
        sample_records: [
          { title: 'SQL Injection', severity: 'High', asset: 'web-server-01' },
          { title: 'XSS Vulnerability', severity: 'Medium', asset: 'web-app-02' },
          { title: 'Outdated Software', severity: 'Low', asset: 'server-03' }
        ],
        detected_fields: ['title', 'severity', 'asset', 'description', 'cvss_score'],
        field_mapping_suggestions: {
          title: 'title',
          description: 'description',
          severity: 'severity',
          asset_name: 'asset'
        },
        validation_results: {
          valid_records: 145,
          invalid_records: 5,
          warnings: [],
          errors: []
        },
        estimated_import_time: 30
      };
      
      setTimeout(() => {
        onPreviewGenerated(mockPreview);
      }, 1000);
    }
  }, [file, connectionConfig, source, onPreviewGenerated]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview dos Dados</CardTitle>
        <CardDescription>
          Visualização dos dados que serão importados do {source.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Gerando preview dos dados...
        </p>
      </CardContent>
    </Card>
  );
}