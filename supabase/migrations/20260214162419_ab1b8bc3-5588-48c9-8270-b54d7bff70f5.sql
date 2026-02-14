
-- Create custom_quotes table for both-way quote initiation
CREATE TABLE public.custom_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  responder_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  quantity INTEGER,
  unit TEXT,
  target_price NUMERIC,
  quoted_price NUMERIC,
  delivery_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_quotes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their quotes"
ON public.custom_quotes FOR SELECT
USING (requester_id = auth.uid() OR responder_id = auth.uid());

CREATE POLICY "Authenticated users can create quotes"
ON public.custom_quotes FOR INSERT
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Participants can update quotes"
ON public.custom_quotes FOR UPDATE
USING (requester_id = auth.uid() OR responder_id = auth.uid());

CREATE POLICY "Admins can manage all quotes"
ON public.custom_quotes FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Timestamp trigger using existing function
CREATE TRIGGER update_custom_quotes_updated_at
BEFORE UPDATE ON public.custom_quotes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
