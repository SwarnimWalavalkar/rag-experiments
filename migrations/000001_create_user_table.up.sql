CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;  
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.users (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" text DEFAULT REPLACE(gen_random_uuid()::text, '-', '' ),
	"name" text NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"roles" text[] DEFAULT '{user}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TRIGGER users_updated_at_update_trigger
  BEFORE UPDATE
  ON public.users
  FOR EACH ROW  
EXECUTE PROCEDURE update_updated_at();
