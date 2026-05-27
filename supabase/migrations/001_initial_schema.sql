-- ============================================================
-- ALBUM COPA 2026 — Schema inicial
-- Executar no SQL Editor do Supabase
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: user_stickers
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_stickers (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code           TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'Faltando'
                 CHECK (status IN ('Faltando', 'Tenho', 'Repetida')),
  duplicates     INTEGER NOT NULL DEFAULT 0,
  rarity         TEXT NOT NULL DEFAULT 'Comum',
  type_breakdown JSONB,
  obs            TEXT,
  added_at       TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, code)
);

-- ============================================================
-- TABELA: user_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_stickers_user_id
  ON public.user_stickers(user_id);

CREATE INDEX IF NOT EXISTS idx_user_stickers_code
  ON public.user_stickers(code);

CREATE INDEX IF NOT EXISTS idx_user_stickers_status
  ON public.user_stickers(user_id, status);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.user_stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stickers"
  ON public.user_stickers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stickers"
  ON public.user_stickers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stickers"
  ON public.user_stickers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stickers"
  ON public.user_stickers FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- TRIGGER: criar perfil automaticamente ao registrar
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_updated_at_user_stickers
  BEFORE UPDATE ON public.user_stickers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
