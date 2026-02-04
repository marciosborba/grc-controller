import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ActionPlansDashboard } from './ActionPlansDashboard';
import { ActionPlansManagement } from './ActionPlansManagement';
import { ActionPlanDetails } from './ActionPlanDetails';
import { ActionPlanForm } from './ActionPlanForm';
import { ActionPlansReports } from './ActionPlansReports';
import { ActionPlansSettings } from './ActionPlansSettings';

export const ActionPlansModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route path="/" element={<ActionPlansDashboard />} />
        <Route path="/management" element={<ActionPlansManagement />} />
        <Route path="/details/:id" element={<ActionPlanDetails />} />
        <Route path="/create" element={<ActionPlanForm />} />
        <Route path="/edit/:id" element={<ActionPlanForm />} />
        <Route path="/reports" element={<ActionPlansReports />} />
        <Route path="/settings" element={<ActionPlansSettings />} />
      </Routes>
    </div>
  );
};