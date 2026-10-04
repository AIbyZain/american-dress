-- New users get a profile, the customer role and an empty wishlist.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict (user_id) do nothing;
  insert into public.wishlists (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Places an order for the signed-in user.
-- Prices, product names and stock are read from the database; the client only sends variant ids and quantities.
create or replace function public.place_order(
  p_items jsonb,
  p_shipping jsonb,
  p_email text,
  p_payment_method text,
  p_notes text default null
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_order_id uuid;
  v_item jsonb;
  v_qty integer;
  v_variant_id uuid;
  v_row record;
  v_image text;
  v_subtotal numeric(12,2) := 0;
  v_fee numeric(12,2);
  v_settings public.store_settings%rowtype;
  v_number text;
begin
  if v_user is null then
    raise exception 'Sign in to place an order' using errcode = '28000';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your bag is empty';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'Too many items in one order';
  end if;
  if p_payment_method not in ('cod', 'store_pickup') then
    raise exception 'Unsupported payment method';
  end if;
  if p_email is null or p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Enter a valid email address';
  end if;

  select * into v_settings from public.store_settings where id = 1;
  v_number := 'ADH-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders (order_number, user_id, email, payment_method, currency, shipping_address, notes)
  values (v_number, v_user, lower(p_email), p_payment_method, coalesce(v_settings.currency, 'PKR'), p_shipping, nullif(p_notes, ''))
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::integer;
    v_variant_id := (v_item->>'variantId')::uuid;
    if v_qty is null or v_qty < 1 or v_qty > 20 then
      raise exception 'Invalid quantity';
    end if;

    select pv.id, pv.size, pv.color, pv.product_id, coalesce(pv.price_override, p.price) as price,
           p.name, p.status, i.quantity as stock
      into v_row
      from public.product_variants pv
      join public.products p on p.id = pv.product_id
      join public.inventory i on i.variant_id = pv.id
     where pv.id = v_variant_id
       for update of i;

    if not found or v_row.status <> 'active' then
      raise exception 'An item in your bag is no longer available';
    end if;
    if v_row.stock < v_qty then
      raise exception 'Only % left of % (size %, %)', v_row.stock, v_row.name, v_row.size, v_row.color;
    end if;

    update public.inventory set quantity = quantity - v_qty where variant_id = v_row.id;

    select url into v_image from public.product_images where product_id = v_row.product_id order by sort_order limit 1;

    insert into public.order_items (order_id, product_id, variant_id, product_name, size, color, image_url, unit_price, quantity)
    values (v_order_id, v_row.product_id, v_row.id, v_row.name, v_row.size, v_row.color, v_image, v_row.price, v_qty);

    v_subtotal := v_subtotal + v_row.price * v_qty;
    update public.products set popularity = popularity + v_qty where id = v_row.product_id;
  end loop;

  v_fee := case
    when coalesce(v_settings.free_shipping_threshold, 0) > 0 and v_subtotal >= v_settings.free_shipping_threshold then 0
    when p_payment_method = 'store_pickup' then 0
    else coalesce(v_settings.shipping_flat_fee, 0)
  end;

  update public.orders set subtotal = v_subtotal, shipping_fee = v_fee, total = v_subtotal + v_fee where id = v_order_id;
  return v_order_id;
end $$;

revoke all on function public.place_order(jsonb, jsonb, text, text, text) from public, anon;
grant execute on function public.place_order(jsonb, jsonb, text, text, text) to authenticated;

-- Promote a user to admin (run in the SQL editor as the project owner):
--   update public.user_roles set role = 'admin'
--   where user_id = (select id from auth.users where email = 'owner@example.com');
