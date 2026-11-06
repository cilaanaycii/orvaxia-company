INSERT INTO public.products (
  name, slug, short_description, description, price, category, status,
  is_featured, is_available_for_po, sort_order
)
VALUES
  (
    'Rovella by Orvaxia',
    'rovella-3in1-tumbler-bag',
    '3-in-1 tas tumbler rajut, pouch serbaguna, dan gantungan kunci lipat.',
    'Orvaxia berkomitmen menghadirkan kerajinan rajutan berupa tempat botol minum yang praktis, fungsional, menarik, dan multifungsi.',
    NULL,
    'Tas Tumbler',
    'published',
    true,
    true,
    1
  ),
  (
    'Rovella Pocket Keychain Charm',
    'rovella-pocket-charm',
    'Gantungan kunci rajutan lipat aksesoris tas.',
    'Gantungan kunci rajut fleksibel dengan kompartemen kecil untuk koin, earphone, atau aksesoris mini.',
    NULL,
    'Aksesoris Rajut',
    'published',
    false,
    true,
    2
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_variants (product_id, name, description, sort_order)
SELECT product.id, variant.name, variant.description, variant.sort_order
FROM public.products AS product
JOIN (
  VALUES
    ('rovella-3in1-tumbler-bag', 'Pastel Blossom', 'Model rajutan motif bunga pastel pink.', 1),
    ('rovella-3in1-tumbler-bag', 'Lavender Dream', 'Model rajutan ungu lavender.', 2),
    ('rovella-3in1-tumbler-bag', 'Bru Slate Classic', 'Model rajutan biru slate.', 3),
    ('rovella-3in1-tumbler-bag', 'Dusty Peach Warmth', 'Model rajutan peach lembut.', 4),
    ('rovella-3in1-tumbler-bag', 'Pastel Sunbeam', 'Model rajutan kuning pastel.', 5),
    ('rovella-pocket-charm', 'Lavender Lilac', 'Aksen lavender klasik.', 1),
    ('rovella-pocket-charm', 'Pastel Yellow Blossom', 'Aksen kuning pastel.', 2)
) AS variant(slug, name, description, sort_order)
  ON product.slug = variant.slug
ON CONFLICT (product_id, name) DO NOTHING;

INSERT INTO public.product_sizes (product_id, name, price_adjustment, sort_order)
SELECT product.id, size.name, 0, 1
FROM public.products AS product
JOIN (
  VALUES
    ('rovella-3in1-tumbler-bag', 'Standard (Tinggi ±20 cm, Dia. 7-7.5 cm)'),
    ('rovella-pocket-charm', 'All Size Mini')
) AS size(slug, name)
  ON product.slug = size.slug
ON CONFLICT (product_id, name) DO NOTHING;
