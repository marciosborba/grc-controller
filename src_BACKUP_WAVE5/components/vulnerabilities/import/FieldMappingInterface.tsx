import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImportSource, ImportPreview } from './types/import';

interface FieldMappingInterfaceProps {
  source: ImportSource;
  preview: ImportPreview;
  onMappingChange: (mapping: any) => void;
}

export default function FieldMappingInterface({ source, preview, onMappingChange }: FieldMappingInterfaceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapeamento de Campos</CardTitle>
        <CardDescription>
          Configure como os campos do {source.name} serão mapeados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Interface de mapeamento de campos em desenvolvimento...
        </p>
      </CardContent>
    </Card>
  );
}