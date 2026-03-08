-- Step 2: Migrate existing 'user' and 'moderator' roles to 'customer'
UPDATE public.user_roles SET role = 'customer' WHERE role = 'user';
UPDATE public.user_roles SET role = 'customer' WHERE role = 'moderator';