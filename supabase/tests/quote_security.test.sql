begin;

select plan(5);

select ok(
  not has_table_privilege('anon', 'public.customers', 'SELECT'),
  'anon cannot read customer personal data'
);

select ok(
  not has_table_privilege('authenticated', 'public.quotes', 'SELECT'),
  'authenticated users cannot read quotes'
);

select ok(
  not has_table_privilege('anon', 'public.quote_items', 'INSERT'),
  'anon cannot create quote line items directly'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.create_quote_with_items(uuid,jsonb,jsonb,jsonb,jsonb,inet,text,text,text,text)',
    'EXECUTE'
  ),
  'anon cannot execute privileged quote creation RPC'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.create_quote_with_items(jsonb,jsonb,jsonb,jsonb,inet,text,text,text,text)',
    'EXECUTE'
  ),
  'authenticated users cannot execute privileged quote creation RPC'
);

select * from finish();

rollback;
