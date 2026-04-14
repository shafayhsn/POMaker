create table if not exists profiles (
  id uuid primary key,
  full_name text not null,
  role text not null check (role in ('Admin', 'Merchandiser', 'Account Manager', 'Sourcing', 'Store', 'Accounts', 'Director')),
  created_at timestamptz default now()
);

create table if not exists suppliers (
  id bigint generated always as identity primary key,
  supplier_code text unique not null,
  supplier_name text not null,
  category text not null,
  credit_days integer default 0,
  payment_terms text,
  tax_rate numeric(6,2) default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists jobs (
  id bigint generated always as identity primary key,
  job_no text unique not null,
  buyer text not null,
  style_name text,
  merchandiser text,
  status text not null check (status in ('Planning', 'Active', 'Hold', 'Closed', 'Cancelled')),
  budget_limit numeric(14,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists library_items (
  id bigint generated always as identity primary key,
  item_code text unique not null,
  category text not null,
  generic_name text not null,
  standard_description text,
  unit text not null,
  default_tax_rate numeric(6,2) default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists purchase_orders (
  id bigint generated always as identity primary key,
  po_no text,
  revision_no integer default 0,
  verification_code text unique,
  supplier_id bigint references suppliers(id),
  job_id bigint references jobs(id),
  department text not null,
  issue_date date,
  delivery_date date,
  delivery_place text,
  payment_terms text,
  status text not null check (status in ('Draft', 'Submitted', 'Approved', 'Issued', 'Cancelled', 'Revised')) default 'Draft',
  supplier_masked boolean default true,
  subtotal numeric(14,2) default 0,
  tax_total numeric(14,2) default 0,
  grand_total numeric(14,2) default 0,
  amount_in_words text,
  notes text,
  created_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  issued_at timestamptz,
  print_count integer default 0,
  duplicate_risk_flag boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists purchase_order_lines (
  id bigint generated always as identity primary key,
  po_id bigint not null references purchase_orders(id) on delete cascade,
  line_no integer not null,
  library_item_id bigint references library_items(id),
  description text not null,
  unit text not null,
  qty numeric(14,2) not null,
  rate numeric(14,2) not null,
  amount numeric(14,2) generated always as (qty * rate) stored,
  remarks text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists po_print_logs (
  id bigint generated always as identity primary key,
  po_id bigint not null references purchase_orders(id) on delete cascade,
  copy_type text not null check (copy_type in ('Original', 'Duplicate', 'Triplicate')),
  print_no integer not null,
  printed_by uuid,
  printed_at timestamptz default now()
);

create table if not exists audit_logs (
  id bigint generated always as identity primary key,
  entity_type text not null,
  entity_id bigint not null,
  action text not null,
  performed_by uuid,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz default now()
);

create or replace function prevent_draft_numbering()
returns trigger as $$
begin
  if new.status in ('Draft', 'Submitted') and new.po_no is not null then
    raise exception 'PO number cannot exist before Director approval';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_prevent_draft_numbering
before insert or update on purchase_orders
for each row execute function prevent_draft_numbering();
