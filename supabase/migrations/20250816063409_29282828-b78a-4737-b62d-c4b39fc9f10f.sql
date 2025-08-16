
-- 1) Enum de papéis e tabela de user roles
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'moderator', 'user');
  end if;
end;
$$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Função para checar papel (evita RLS recursiva)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- Políticas em user_roles
-- Usuário pode ver seus próprios papéis
drop policy if exists "Users can view their roles" on public.user_roles;
create policy "Users can view their roles"
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Primeiro admin pode se auto-atribuir (somente se ainda não existir admin)
drop policy if exists "First admin can self-assign" on public.user_roles;
create policy "First admin can self-assign"
  on public.user_roles
  for insert
  to authenticated
  with check (
    role = 'admin'
    and not exists (select 1 from public.user_roles ur where ur.role = 'admin')
    and auth.uid() = user_id
  );

-- Admin pode gerenciar papéis
drop policy if exists "Admins can manage roles" on public.user_roles;
create policy "Admins can manage roles"
  on public.user_roles
  for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 2) Tabela de produtos
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null check (price >= 0), -- em centavos
  image_url text,
  category text,
  is_active boolean not null default true,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Políticas de produtos:
-- Público pode ver apenas produtos ativos
drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true);

-- Admin pode ver todos (ativos e inativos)
drop policy if exists "Admins can view all products" on public.products;
create policy "Admins can view all products"
  on public.products
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- CRUD somente admin
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products
  for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products
  for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products
  for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 3) Habilitar RLS em orders e order_items e restringir a admin
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- SELECT orders só admin
drop policy if exists "Admins can select orders" on public.orders;
create policy "Admins can select orders"
  on public.orders
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- UPDATE orders só admin (ex.: alterar status manualmente)
drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders
  for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- SELECT order_items só admin
drop policy if exists "Admins can select order_items" on public.order_items;
create policy "Admins can select order_items"
  on public.order_items
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 4) Triggers de updated_at
drop trigger if exists set_updated_at_orders on public.orders;
create trigger set_updated_at_orders
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_order_items on public.order_items;
create trigger set_updated_at_order_items
before update on public.order_items
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_products on public.products;
create trigger set_updated_at_products
before update on public.products
for each row
execute function public.set_updated_at();
