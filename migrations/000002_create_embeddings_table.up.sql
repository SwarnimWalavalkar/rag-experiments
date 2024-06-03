CREATE EXTENSION IF NOT EXISTS vector SCHEMA public;

CREATE TABLE IF NOT EXISTS public.user_embeddings (
  "id" serial PRIMARY KEY NOT NULL,
  "uuid" text UNIQUE DEFAULT replace(gen_random_uuid ()::text, '-', ''),

  "user_id" integer NOT NULL REFERENCES users (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  
  "url" text NOT NULL,
  "content" text NOT NULL,

  "embedding" vector (1536) NOT NULL,

  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TRIGGER user_embeddings_updated_at_update_trigger
  BEFORE UPDATE
  ON public.user_embeddings
  FOR EACH ROW  
EXECUTE PROCEDURE update_updated_at();
