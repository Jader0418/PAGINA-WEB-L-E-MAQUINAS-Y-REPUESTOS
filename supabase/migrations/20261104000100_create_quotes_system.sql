-- L&E Máquinas y Repuestos
-- Cotizaciones: clientes, productos, consecutivos y evidencias de consentimiento.
-- Las tablas operativas no son accesibles desde anon/authenticated. La Edge Function
-- usa la clave secreta del servidor y la función RPC restringida a service_role.

create extension if not exists pgcrypto;

create table if not exists public.catalog_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.catalog_brands (name, slug) values
  ('JACK', 'jack'),
  ('KANSEW SPECIAL', 'kansew-special'),
  ('SIRUBA', 'siruba'),
  ('JUKI', 'juki'),
  ('BROTHER', 'brother'),
  ('SINGER', 'singer'),
  ('SERVEX', 'servex'),
  ('KANSAI SPECIAL', 'kansai-special')
on conflict (slug) do nothing;

create table if not exists public.catalog_products (
  slug text primary key,
  name text not null,
  category text not null,
  subcategory text,
  brand_id uuid references public.catalog_brands(id),
  model text,
  description text not null default '',
  audience text[] not null default array['workshop']::text[],
  price numeric(14,2) check (price is null or price >= 0),
  old_price numeric(14,2) check (old_price is null or old_price >= 0),
  discount_percent integer check (discount_percent is null or discount_percent between 1 and 99),
  photo_urls text[] not null default '{}',
  video_url text,
  technical_specs jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.catalog_products
  (slug, name, category, subcategory, description, audience)
values
  ('plana-electronica', 'Máquina plana electrónica', 'Planas', 'Electrónica',
   'Costura recta para operaciones de confección. Referencia y configuración por confirmar.',
   array['workshop','home']),
  ('fileteadora-mecatronica', 'Fileteadora mecatrónica', 'Fileteadoras', 'Mecatrónica',
   'Para operaciones de fileteado y acabado de prendas. Prestaciones por confirmar.',
   array['workshop']),
  ('fileteadora-industrial', 'Fileteadora industrial', 'Fileteadoras', 'Industrial',
   'Alternativa para procesos de sobrehilado. Configuración por confirmar.',
   array['workshop']),
  ('collarin-industrial', 'Collarín industrial', 'Collarines', 'Recubrimiento',
   'Equipo para acabados y recubrimiento en prendas. Referencia por confirmar.',
   array['workshop']),
  ('bordadora', 'Bordadora computarizada', 'Bordadoras', 'Bordado',
   'Soluciones de bordado para personalizar prendas. Modelo y cabezales por confirmar.',
   array['workshop','home']),
  ('presilladora', 'Presilladora industrial', 'Presilladoras', 'Refuerzo',
   'Para operaciones de refuerzo y presillas. Referencia por confirmar.',
   array['workshop']),
  ('repuestos', 'Repuestos para máquinas', 'Repuestos', 'Componentes',
   'Componentes y piezas para mantenimiento. Compatibilidad por validar.',
   array['workshop','home']),
  ('accesorios', 'Accesorios de confección', 'Accesorios', 'Complementos',
   'Complementos y herramientas para el espacio de costura.',
   array['workshop','home'])
on conflict (slug) do nothing;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_email_lower_uidx
  on public.customers (lower(email));

create table if not exists public.quote_sequences (
  quote_year integer primary key,
  last_number bigint not null check (last_number > 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  idempotency_key uuid not null unique,
  quote_year integer not null,
  customer_id uuid not null references public.customers(id),
  customer_name_snapshot text not null,
  email_snapshot text not null,
  phone_snapshot text not null,
  address_snapshot text not null,
  city_snapshot text not null,
  status text not null default 'received'
    check (status in ('received','in_review','sent','accepted','rejected','cancelled')),
  subtotal numeric(14,2),
  tax_amount numeric(14,2),
  total numeric(14,2),
  currency char(3) not null default 'COP',
  client_ip inet,
  user_agent text,
  pdf_path text,
  email_status text not null default 'pending'
    check (email_status in ('pending','not_configured','sent','partial','failed')),
  customer_email_sent_at timestamptz,
  business_email_sent_at timestamptz,
  email_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quotes_created_at_idx on public.quotes (created_at desc);
create index if not exists quotes_customer_id_idx on public.quotes (customer_id);
create index if not exists quotes_client_ip_created_idx on public.quotes (client_ip, created_at desc);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_slug text not null references public.catalog_products(slug),
  product_name_snapshot text not null,
  brand_name_snapshot text,
  category_snapshot text not null,
  model_snapshot text,
  quantity integer not null check (quantity between 1 and 50),
  unit_price numeric(14,2),
  old_unit_price numeric(14,2),
  discount_percent integer,
  line_total numeric(14,2),
  created_at timestamptz not null default now()
);

create index if not exists quote_items_quote_id_idx on public.quote_items (quote_id);

create table if not exists public.privacy_consents (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  customer_id uuid not null references public.customers(id),
  consent_type text not null check (consent_type in ('quote_processing','marketing')),
  accepted boolean not null,
  policy_version text not null,
  text_snapshot text not null,
  recorded_at timestamptz not null default now(),
  accepted_at timestamptz,
  client_ip inet,
  user_agent text,
  unique (quote_id, consent_type),
  check ((accepted and accepted_at is not null) or (not accepted and accepted_at is null))
);

create index if not exists privacy_consents_customer_idx
  on public.privacy_consents (customer_id, recorded_at desc);

-- Bucket privado: los PDF solo se entregan mediante enlaces firmados y temporales.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('quote-pdfs', 'quote-pdfs', false, 10485760, array['application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Una cotización y sus líneas se crean dentro de una sola transacción.
create or replace function public.create_quote_with_items(
  p_idempotency_key uuid,
  p_customer jsonb,
  p_items jsonb,
  p_data_consent jsonb,
  p_marketing_consent jsonb,
  p_client_ip inet,
  p_user_agent text,
  p_policy_version text,
  p_data_consent_text text,
  p_marketing_consent_text text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_now timestamptz := now();
  v_year integer := extract(year from timezone('America/Bogota', now()))::integer;
  v_number bigint;
  v_quote_number text;
  v_customer_id uuid;
  v_quote_id uuid;
  v_item jsonb;
  v_product public.catalog_products%rowtype;
  v_quantity integer;
  v_subtotal numeric(14,2) := 0;
  v_has_unpriced boolean := false;
  v_item_result jsonb := '[]'::jsonb;
  v_existing jsonb;
  v_line_total numeric(14,2);
  v_accepted boolean;
  v_marketing_accepted boolean;
begin
  if current_user <> 'service_role' then
    raise exception 'FORBIDDEN';
  end if;

  if jsonb_typeof(p_customer) is distinct from 'object'
     or jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) < 1
     or jsonb_array_length(p_items) > 20 then
    raise exception 'INVALID_PAYLOAD';
  end if;

  if coalesce(p_customer->>'firstName','') = ''
     or coalesce(p_customer->>'lastName','') = ''
     or coalesce(p_customer->>'phone','') = ''
     or coalesce(p_customer->>'email','') = ''
     or coalesce(p_customer->>'address','') = ''
     or coalesce(p_customer->>'city','') = '' then
    raise exception 'INVALID_CUSTOMER';
  end if;

  v_accepted := coalesce((p_data_consent->>'accepted')::boolean, false);
  if not v_accepted or coalesce(p_policy_version, '') = ''
     or coalesce(p_data_consent_text, '') = '' then
    raise exception 'CONSENT_REQUIRED';
  end if;
  v_marketing_accepted := coalesce((p_marketing_consent->>'accepted')::boolean, false);

  if p_idempotency_key is null then
    raise exception 'IDEMPOTENCY_KEY_REQUIRED';
  end if;

  -- Serializa reintentos con la misma clave para evitar cotizaciones y correos duplicados.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_idempotency_key::text, 0)
  );

  select jsonb_build_object(
    'id', q.id,
    'quoteNumber', q.quote_number,
    'createdAt', q.created_at,
    'customer', jsonb_build_object(
      'firstName', c.first_name,
      'lastName', c.last_name,
      'email', q.email_snapshot,
      'phone', q.phone_snapshot,
      'address', q.address_snapshot,
      'city', q.city_snapshot
    ),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'productId', qi.product_slug,
        'name', qi.product_name_snapshot,
        'brand', qi.brand_name_snapshot,
        'category', qi.category_snapshot,
        'model', qi.model_snapshot,
        'quantity', qi.quantity,
        'unitPrice', qi.unit_price,
        'oldUnitPrice', qi.old_unit_price,
        'discountPercent', qi.discount_percent,
        'lineTotal', qi.line_total
      ) order by qi.created_at, qi.id)
      from public.quote_items qi
      where qi.quote_id = q.id
    ), '[]'::jsonb),
    'subtotal', q.subtotal,
    'currency', q.currency,
    'emailStatus', q.email_status,
    'customerEmailSentAt', q.customer_email_sent_at,
    'businessEmailSentAt', q.business_email_sent_at,
    'marketingConsent', exists (
      select 1 from public.privacy_consents pc
      where pc.quote_id = q.id
        and pc.consent_type = 'marketing'
        and pc.accepted = true
    ),
    'idempotentReplay', true
  )
  into v_existing
  from public.quotes q
  join public.customers c on c.id = q.customer_id
  where q.idempotency_key = p_idempotency_key;

  if v_existing is not null then
    return v_existing;
  end if;

  -- Límite básico: máximo 8 solicitudes por dirección IP en una hora.
  if p_client_ip is not null and (
    select count(*) from public.quotes q
    where q.client_ip = p_client_ip
      and q.created_at > v_now - interval '1 hour'
  ) >= 8 then
    raise exception 'RATE_LIMITED';
  end if;

  insert into public.customers (
    first_name, last_name, email, phone, address, city
  ) values (
    trim(p_customer->>'firstName'),
    trim(p_customer->>'lastName'),
    lower(trim(p_customer->>'email')),
    trim(p_customer->>'phone'),
    trim(p_customer->>'address'),
    trim(p_customer->>'city')
  )
  on conflict (lower(email)) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = excluded.phone,
    address = excluded.address,
    city = excluded.city,
    updated_at = v_now
  returning id into v_customer_id;

  insert into public.quote_sequences (quote_year, last_number, updated_at)
  values (v_year, 1, v_now)
  on conflict (quote_year) do update set
    last_number = public.quote_sequences.last_number + 1,
    updated_at = v_now
  returning last_number into v_number;

  v_quote_number := 'COT-' || v_year::text || '-' || lpad(v_number::text, 4, '0');
  v_quote_id := gen_random_uuid();

  insert into public.quotes (
    id, quote_number, idempotency_key, quote_year, customer_id,
    customer_name_snapshot, email_snapshot, phone_snapshot,
    address_snapshot, city_snapshot, client_ip, user_agent, created_at
  ) values (
    v_quote_id, v_quote_number, p_idempotency_key, v_year, v_customer_id,
    trim(p_customer->>'firstName') || ' ' || trim(p_customer->>'lastName'),
    lower(trim(p_customer->>'email')),
    trim(p_customer->>'phone'),
    trim(p_customer->>'address'),
    trim(p_customer->>'city'),
    p_client_ip,
    left(coalesce(p_user_agent,''), 500),
    v_now
  );

  for v_item in select value from jsonb_array_elements(p_items) as item(value)
  loop
    if coalesce(v_item->>'productId','') = '' then
      raise exception 'INVALID_PRODUCT';
    end if;

    begin
      v_quantity := (v_item->>'quantity')::integer;
    exception when others then
      raise exception 'INVALID_QUANTITY';
    end;

    if v_quantity < 1 or v_quantity > 50 then
      raise exception 'INVALID_QUANTITY';
    end if;

    select * into v_product
    from public.catalog_products p
    where p.slug = v_item->>'productId'
      and p.is_active = true
    for share;

    if not found then
      raise exception 'PRODUCT_NOT_AVAILABLE';
    end if;

    if v_product.price is null then
      v_has_unpriced := true;
      v_line_total := null;
    else
      v_line_total := v_product.price * v_quantity;
      v_subtotal := v_subtotal + v_line_total;
    end if;

    insert into public.quote_items (
      quote_id, product_slug, product_name_snapshot, brand_name_snapshot,
      category_snapshot, model_snapshot, quantity, unit_price,
      old_unit_price, discount_percent, line_total
    ) values (
      v_quote_id, v_product.slug, v_product.name,
      (select b.name from public.catalog_brands b where b.id = v_product.brand_id),
      v_product.category, v_product.model, v_quantity, v_product.price,
      v_product.old_price, v_product.discount_percent, v_line_total
    );

    v_item_result := v_item_result || jsonb_build_array(jsonb_build_object(
      'productId', v_product.slug,
      'name', v_product.name,
      'brand', (select b.name from public.catalog_brands b where b.id = v_product.brand_id),
      'category', v_product.category,
      'model', v_product.model,
      'quantity', v_quantity,
      'unitPrice', v_product.price,
      'oldUnitPrice', v_product.old_price,
      'discountPercent', v_product.discount_percent,
      'lineTotal', v_line_total
    ));
  end loop;

  update public.quotes
  set subtotal = case when v_has_unpriced then null else v_subtotal end,
      total = case when v_has_unpriced then null else v_subtotal end,
      updated_at = v_now
  where id = v_quote_id;

  insert into public.privacy_consents (
    quote_id, customer_id, consent_type, accepted, policy_version,
    text_snapshot, recorded_at, accepted_at, client_ip, user_agent
  ) values (
    v_quote_id, v_customer_id, 'quote_processing', true, p_policy_version,
    p_data_consent_text, v_now, v_now, p_client_ip, left(coalesce(p_user_agent,''),500)
  );

  insert into public.privacy_consents (
    quote_id, customer_id, consent_type, accepted, policy_version,
    text_snapshot, recorded_at, accepted_at, client_ip, user_agent
  ) values (
    v_quote_id, v_customer_id, 'marketing', v_marketing_accepted, p_policy_version,
    coalesce(p_marketing_consent_text, 'No se registró autorización de mercadeo.'),
    v_now, case when v_marketing_accepted then v_now else null end,
    p_client_ip, left(coalesce(p_user_agent,''),500)
  );

  return jsonb_build_object(
    'id', v_quote_id,
    'quoteNumber', v_quote_number,
    'createdAt', v_now,
    'customer', jsonb_build_object(
      'firstName', trim(p_customer->>'firstName'),
      'lastName', trim(p_customer->>'lastName'),
      'email', lower(trim(p_customer->>'email')),
      'phone', trim(p_customer->>'phone'),
      'address', trim(p_customer->>'address'),
      'city', trim(p_customer->>'city')
    ),
    'items', v_item_result,
    'subtotal', case when v_has_unpriced then null else v_subtotal end,
    'currency', 'COP',
    'emailStatus', 'pending',
    'customerEmailSentAt', null,
    'businessEmailSentAt', null,
    'marketingConsent', v_marketing_accepted,
    'idempotentReplay', false
  );
end;
$function$;

revoke all on function public.create_quote_with_items(
  uuid,jsonb,jsonb,jsonb,jsonb,inet,text,text,text,text
) from public, anon, authenticated;
grant execute on function public.create_quote_with_items(
  uuid,jsonb,jsonb,jsonb,jsonb,inet,text,text,text,text
) to service_role;

-- Protección explícita para todas las tablas: el navegador no puede leer ni escribir datos personales.
alter table public.catalog_brands enable row level security;
alter table public.catalog_products enable row level security;
alter table public.customers enable row level security;
alter table public.quote_sequences enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.privacy_consents enable row level security;

revoke all on table
  public.catalog_brands,
  public.catalog_products,
  public.customers,
  public.quote_sequences,
  public.quotes,
  public.quote_items,
  public.privacy_consents
from anon, authenticated;

grant all on table
  public.catalog_brands,
  public.catalog_products,
  public.customers,
  public.quote_sequences,
  public.quotes,
  public.quote_items,
  public.privacy_consents
to service_role;

alter default privileges in schema public
  revoke all on tables from anon, authenticated;

comment on table public.customers is 'Datos personales de clientes L&E. Acceso exclusivo desde backend autorizado.';
comment on table public.quotes is 'Solicitudes de cotización con consecutivo por año y fecha/hora del servidor.';
comment on table public.privacy_consents is 'Evidencia de consentimientos por finalidad y versión de política.';
comment on table public.catalog_products is 'Catálogo maestro. El precio y las especificaciones deben ser verificados por L&E.';
