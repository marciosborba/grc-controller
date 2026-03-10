import React from 'react';
import { useParams } from 'react-router-dom';
import { PublicVendorAssessment } from '@/components/vendor-risk/public/PublicVendorAssessment';

export default function PublicVendorAssessmentPage() {
  const { publicLinkId } = useParams<{ publicLinkId: string }>();
  
  if (!publicLinkId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-red-900 mb-2">Link Inválido</h1>
          <p className="text-red-700">
            O link de assessment fornecido é inválido ou está malformado.
          </p>
        </div>
      </div>
    );
  }
  
  return <PublicVendorAssessment publicLinkId={publicLinkId} />;
}