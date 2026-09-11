CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE app_role AS ENUM ('master','admin','artist','user');
CREATE TYPE access_status AS ENUM ('active','disabled');
CREATE TYPE approval_status AS ENUM ('pending','approved','rejected');

CREATE TABLE users (
  id text PRIMARY KEY,
  email citext NOT NULL UNIQUE,
  full_name text NOT NULL,
  password_hash text,
  role app_role NOT NULL DEFAULT 'user',
  access access_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE artists (
  id text PRIMARY KEY,
  user_id text UNIQUE REFERENCES users(id),
  name text NOT NULL,
  bio text,
  instagram text,
  website text,
  pix_key_encrypted text,
  portfolio_files text[] NOT NULL DEFAULT '{}',
  status approval_status NOT NULL DEFAULT 'pending',
  commission_rate numeric(5,2) NOT NULL DEFAULT 25,
  reviewed_by text REFERENCES users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE categories (id text PRIMARY KEY, name text NOT NULL, slug text NOT NULL UNIQUE, description text, icon text, position_order integer NOT NULL DEFAULT 0);
CREATE TABLE collections (id text PRIMARY KEY, artist_id text NOT NULL REFERENCES artists(id), title text NOT NULL, slug text NOT NULL, banner_url text, description text, is_active boolean NOT NULL DEFAULT true, is_public boolean NOT NULL DEFAULT false, position_order integer NOT NULL DEFAULT 0, design_ids text[] NOT NULL DEFAULT '{}', UNIQUE(artist_id,slug));
CREATE TABLE artist_settings (artist_id text PRIMARY KEY REFERENCES artists(id), meta_pixel_id text, ga4_id text, tiktok_pixel_id text, custom_domain text);

CREATE TABLE products (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  description text,
  material text,
  fit text,
  category_id text REFERENCES categories(id),
  collection_id text REFERENCES collections(id),
  tags text[] NOT NULL DEFAULT '{}',
  base_price numeric(12,2) NOT NULL,
  base_cost numeric(12,2),
  catalog_product boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  colors text[] NOT NULL DEFAULT '{}',
  sizes text[] NOT NULL DEFAULT '{}',
  front_model_url text,
  back_model_url text,
  color_variants jsonb NOT NULL DEFAULT '[]'
);

CREATE TABLE product_variants (id text PRIMARY KEY, product_id text NOT NULL REFERENCES products(id), color text NOT NULL, size text NOT NULL, stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0), is_active boolean NOT NULL DEFAULT true, UNIQUE(product_id,color,size));

CREATE TABLE prints (
  id text PRIMARY KEY,
  artist_id text NOT NULL REFERENCES artists(id),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  category text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  price numeric(12,2) NOT NULL DEFAULT 0,
  status approval_status NOT NULL DEFAULT 'pending',
  production jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id text PRIMARY KEY,
  order_number text UNIQUE,
  customer_id text REFERENCES users(id),
  customer_email citext NOT NULL,
  customer_name text,
  subtotal numeric(12,2) NOT NULL,
  shipping_cost numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_intent_id text UNIQUE,
  shipping_address jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES products(id),
  variant_id text NOT NULL REFERENCES product_variants(id),
  print_id text NOT NULL REFERENCES prints(id),
  artist_id text NOT NULL REFERENCES artists(id),
  quantity integer NOT NULL CHECK(quantity > 0),
  size text NOT NULL,
  color text NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  artist_commission numeric(12,2) NOT NULL,
  production jsonb
);

CREATE INDEX idx_artists_status ON artists(status);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_prints_artist_status ON prints(artist_id,status);
CREATE INDEX idx_orders_customer ON orders(customer_email);
CREATE INDEX idx_order_items_order ON order_items(order_id);