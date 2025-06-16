

create table public.admin_profiles (
  id uuid not null,
  full_name text null,
  role text null default 'admin'::text,
  constraint admin_profiles_pkey primary key (id),
  constraint admin_profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.admin_profiles (
  id uuid not null,
  full_name text null,
  role text null default 'admin'::text,
  constraint admin_profiles_pkey primary key (id),
  constraint admin_profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.admin_profiles (
  id uuid not null,
  full_name text null,
  role text null default 'admin'::text,
  constraint admin_profiles_pkey primary key (id),
  constraint admin_profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.admin_profiles (
  id uuid not null,
  full_name text null,
  role text null default 'admin'::text,
  constraint admin_profiles_pkey primary key (id),
  constraint admin_profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.extras (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  description text null,
  price numeric(10, 2) not null,
  created_at timestamp with time zone null default now(),
  constraint extras_pkey primary key (id)
) TABLESPACE pg_default;

view geography_columns

view geometry_columns

create table public.pricing_rules (
  id uuid not null default extensions.uuid_generate_v4 (),
  origin_city text null,
  destination_city text null,
  vehicle_type text null,
  base_price numeric(10, 2) not null,
  price_per_km numeric(10, 2) null,
  currency character(3) null default 'GBP'::bpchar,
  created_at timestamp with time zone null default now(),
  constraint pricing_rules_pkey primary key (id)
) TABLESPACE pg_default;

create table public.pricing_rules (
  id uuid not null default extensions.uuid_generate_v4 (),
  origin_city text null,
  destination_city text null,
  vehicle_type text null,
  base_price numeric(10, 2) not null,
  price_per_km numeric(10, 2) null,
  currency character(3) null default 'GBP'::bpchar,
  created_at timestamp with time zone null default now(),
  constraint pricing_rules_pkey primary key (id)
) TABLESPACE pg_default;

create table public.vehicle_categories (
  id text not null,
  name text not null,
  capacity integer not null,
  base_price integer not null,
  description text null,
  features jsonb null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint vehicle_categories_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_vehicle_categories_active on public.vehicle_categories using btree (is_active) TABLESPACE pg_default;

create trigger update_vehicle_categories_updated_at BEFORE
update on vehicle_categories for EACH row
execute FUNCTION update_updated_at_column ();

create table public.vehicles (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  type text not null,
  passengers integer not null,
  luggage integer not null,
  year integer null,
  license_plate text null,
  status text not null,
  image_url text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint vehicles_pkey primary key (id),
  constraint vehicles_license_plate_key unique (license_plate),
  constraint vehicles_status_check check (
    (
      status = any (
        array[
          'active'::text,
          'maintenance'::text,
          'inactive'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

 viewm vw_bookings_full

 create table public.zone_pricing (
  id uuid not null default gen_random_uuid (),
  origin_zone_id text not null,
  destination_zone_id text not null,
  vehicle_category_id text not null,
  price integer not null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint zone_pricing_pkey primary key (id),
  constraint zone_pricing_origin_zone_id_destination_zone_id_vehicle_cat_key unique (
    origin_zone_id,
    destination_zone_id,
    vehicle_category_id
  ),
  constraint zone_pricing_destination_zone_id_fkey foreign KEY (destination_zone_id) references zones (id),
  constraint zone_pricing_origin_zone_id_fkey foreign KEY (origin_zone_id) references zones (id),
  constraint zone_pricing_vehicle_category_id_fkey foreign KEY (vehicle_category_id) references vehicle_categories (id)
) TABLESPACE pg_default;

create index IF not exists idx_zone_pricing_origin on public.zone_pricing using btree (origin_zone_id) TABLESPACE pg_default;

create index IF not exists idx_zone_pricing_destination on public.zone_pricing using btree (destination_zone_id) TABLESPACE pg_default;

create index IF not exists idx_zone_pricing_vehicle on public.zone_pricing using btree (vehicle_category_id) TABLESPACE pg_default;

create index IF not exists idx_zone_pricing_active on public.zone_pricing using btree (is_active) TABLESPACE pg_default;

create trigger update_zone_pricing_updated_at BEFORE
update on zone_pricing for EACH row
execute FUNCTION update_updated_at_column ();

create table public.zone_pricing (
  id uuid not null default gen_random_uuid (),
  origin_zone_id text not null,
  destination_zone_id text not null,
  vehicle_category_id text not null,
  price integer not null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint zone_pricing_pkey primary key (id),
  constraint zone_pricing_origin_zone_id_destination_zone_id_vehicle_cat_key unique (
    origin_zone_id,
    destination_zone_id,
    vehicle_category_id
  ),
  constraint zone_pricing_destination_zone_id_fkey foreign KEY (destination_zone_id) references zones (id),
  constraint zone_pricing_origin_zone_id_fkey foreign KEY (origin_zone_id) references zones (id),
  constraint zone_pricing_vehicle_category_id_fkey foreign KEY (vehicle_category_id) references vehicle_categories (id)
) TABLESPACE pg_default;

create index IF not exists idx_zone_pricing_origin on public.zone_pricing using btree (origin_zone_id) TABLESPACE pg_default;

create index IF not exists idx_zone_pricing_destination on public.zone_pricing using btree (destination_zone_id) TABLESPACE pg_default;

create index IF not exists idx_zone_pricing_vehicle on public.zone_pricing using btree (vehicle_category_id) TABLESPACE pg_default;

create index IF not exists idx_zone_pricing_active on public.zone_pricing using btree (is_active) TABLESPACE pg_default;

create trigger update_zone_pricing_updated_at BEFORE
update on zone_pricing for EACH row
execute FUNCTION update_updated_at_column ();