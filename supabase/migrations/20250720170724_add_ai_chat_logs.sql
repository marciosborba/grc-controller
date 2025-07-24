-- Create AI chat logs table
CREATE TABLE public.ai_chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant')),
  content TEXT NOT NULL,
  ai_type TEXT NOT NULL CHECK (ai_type IN ('general', 'assessment', 'risk', 'audit', 'policy', 'compliance')),
  context JSONB,
  response_time INTEGER, -- milliseconds for assistant responses
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own AI chat logs" 
ON public.ai_chat_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI chat logs" 
ON public.ai_chat_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all AI chat logs" 
ON public.ai_chat_logs 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_ai_chat_logs_user_id ON public.ai_chat_logs(user_id);
CREATE INDEX idx_ai_chat_logs_session_id ON public.ai_chat_logs(session_id);
CREATE INDEX idx_ai_chat_logs_created_at ON public.ai_chat_logs(created_at);
CREATE INDEX idx_ai_chat_logs_ai_type ON public.ai_chat_logs(ai_type);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_chat_logs_updated_at
BEFORE UPDATE ON public.ai_chat_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();