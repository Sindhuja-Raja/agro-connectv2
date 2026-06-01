
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value_en text,
  value_ta text,
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read active settings
CREATE POLICY "Anyone can view active settings"
  ON public.site_settings FOR SELECT
  TO public
  USING (is_active = true);

-- Admins can manage all settings
CREATE POLICY "Admins can manage settings"
  ON public.site_settings FOR ALL
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default banner
INSERT INTO public.site_settings (key, value_en, value_ta, is_active)
VALUES (
  'offer_banner',
  'Get 20% off on all seeds! Shop today',
  'விதைகளில் 20% தள்ளுபடி! இன்றே வாங்குங்கள்',
  true
);
