
ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS risk_score integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS sentiment text NOT NULL DEFAULT 'neutral',
  ADD COLUMN IF NOT EXISTS panic boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS emergency boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hazards jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision,
  ADD COLUMN IF NOT EXISTS official_english text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS weather jsonb,
  ADD COLUMN IF NOT EXISTS escalation_stage integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS citizens_affected integer,
  ADD COLUMN IF NOT EXISTS image_quality text,
  ADD COLUMN IF NOT EXISTS recommended_actions text[];

CREATE INDEX IF NOT EXISTS idx_complaints_lat_lng ON public.complaints (lat, lng);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints (category);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints (created_at DESC);
