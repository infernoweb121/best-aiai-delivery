
-- Orders & items para integração com AbacatePay

-- Extensões necessárias (se ainda não ativas)
create extension if not exists pgcrypto with schema public;

-- Tabela de pedidos
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending','paid','canceled')),
  total_amount integer not null, -- em centavos
  paid_amount integer,
  fee integer,
  payment_method text,
  dev_mode boolean,
  -- Identificadores da AbacatePay
  abacatepay_id text unique,     -- ex: bill_123
  abacatepay_url text,
  -- Dados do cliente (opcionais)
  customer_name text,
  customer_email text,
  customer_phone text,
  -- Metadados livres
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índice para consultas por id da AbacatePay
create index if not exists orders_abacatepay_id_idx on public.orders (abacatepay_id);

-- Trigger para updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_orders_set_updated_at on public.orders;
create trigger trg_orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

-- Tabela de itens do pedido
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text,             -- opcional: id interno do produto
  name text not null,          -- nome exibido
  unit_amount integer not null, -- em centavos
  quantity integer not null default 1,
  total_amount integer generated always as (unit_amount * quantity) stored
);

-- RLS (apenas funções com service role vão escrever/ler)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Nenhuma policy aberta é criada aqui de propósito.
-- O acesso será feito via Edge Functions usando a service role key.
