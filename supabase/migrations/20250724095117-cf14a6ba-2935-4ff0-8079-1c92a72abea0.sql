-- Create storage bucket for policy documents
INSERT INTO storage.buckets (id, name, public) VALUES ('policy-documents', 'policy-documents', false);

-- Create policies for the policy documents bucket
-- Users can upload their own documents
CREATE POLICY "Users can upload policy documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'policy-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view documents they uploaded
CREATE POLICY "Users can view policy documents they uploaded" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'policy-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own policy documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'policy-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow admins and compliance officers to view all policy documents
CREATE POLICY "Admins can view all policy documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'policy-documents' AND (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'compliance_officer'::app_role) OR 
  has_role(auth.uid(), 'ciso'::app_role)
));

-- Create table for tracking policy approvers
CREATE TABLE public.policy_approvers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL,
  approver_role TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  order_sequence INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on policy_approvers table
ALTER TABLE public.policy_approvers ENABLE ROW LEVEL SECURITY;

-- Create policies for policy_approvers table
CREATE POLICY "All authenticated users can view policy approvers" 
ON public.policy_approvers 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Compliance officers and admins can manage policy approvers" 
ON public.policy_approvers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'compliance_officer'::app_role) OR has_role(auth.uid(), 'ciso'::app_role));

-- Add indexes for better performance
CREATE INDEX idx_policy_approvers_policy_id ON public.policy_approvers(policy_id);
CREATE INDEX idx_policy_approvers_approver_id ON public.policy_approvers(approver_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_policy_approvers_updated_at
BEFORE UPDATE ON public.policy_approvers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();