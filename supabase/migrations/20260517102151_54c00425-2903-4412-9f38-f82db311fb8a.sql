DELETE FROM public.categories WHERE id IN (
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);

INSERT INTO public.categories (name, slug, description) VALUES
  ('Cotton Fabrics', 'cotton-fabrics', 'Pure and blended cotton fabrics for apparel and home use'),
  ('Silk Fabrics', 'silk-fabrics', 'Premium silk fabrics including Banarasi, Tussar, and Mulberry'),
  ('Synthetic Fabrics', 'synthetic-fabrics', 'Polyester, nylon, rayon and blended synthetic fabrics'),
  ('Men''s Apparel', 'mens-apparel', 'Shirts, trousers, kurtas and formal wear for men'),
  ('Women''s Apparel', 'womens-apparel', 'Sarees, salwar suits, dresses and western wear for women'),
  ('Kids Apparel', 'kids-apparel', 'Clothing and ethnic wear for boys and girls'),
  ('Home Textiles', 'home-textiles', 'Bedsheets, curtains, towels and home furnishing fabrics'),
  ('Ethnic Wear', 'ethnic-wear', 'Traditional Indian wear including lehengas, sherwanis and dupattas'),
  ('Yarn & Threads', 'yarn-threads', 'Cotton, silk, woolen and synthetic yarns for weaving and knitting');