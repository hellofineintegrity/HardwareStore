-- ============================================================
-- Seed Products — Run in Supabase SQL Editor
-- ============================================================

INSERT INTO public.products (
  category_id, name_en, name_mr, description_en, description_mr,
  price_inr, unit, stock_quantity, is_visible, seo_keywords, specifications
)
SELECT
  c.id,
  'UltraTech OPC 53 Grade Cement',
  'अल्ट्राटेक ओपीसी ५३ ग्रेड सिमेंट',
  'Ultratech OPC 53 Grade Ordinary Portland Cement is the ideal choice for high-strength concrete construction in Maharashtra''s climate. Conforming to IS 269:2015, it achieves a minimum 28-day compressive strength of 53 MPa. Suitable for RCC foundations, columns, beams, bridges, and pre-stressed concrete.',
  'अल्ट्राटेक ओपीसी ५३ ग्रेड साधा पोर्टलँड सिमेंट हे महाराष्ट्राच्या हवामानात उच्च-शक्तीच्या कॉंक्रीट बांधकामासाठी आदर्श आहे. IS 269:2015 नुसार, हे सिमेंट 28 दिवसांत किमान 53 MPa दाब-शक्ती प्राप्त करते.',
  420.00,
  '50kg Bag',
  500,
  TRUE,
  ARRAY['OPC 53 cement Maharashtra','Ultratech cement price','53 grade cement bag','IS 269 cement','RCC cement supplier'],
  '{"Grade":"OPC 53","IS Code":"IS 269:2015","28-Day Compressive Strength":"≥ 53 MPa","Initial Setting Time":"≥ 30 minutes","Final Setting Time":"≤ 600 minutes","Fineness":"≥ 225 m²/kg","Pack Weight":"50 kg","Manufacturer":"UltraTech Cement Ltd."}'::jsonb
FROM public.categories c WHERE c.slug = 'cement-binding';

INSERT INTO public.products (
  category_id, name_en, name_mr, description_en, description_mr,
  price_inr, unit, stock_quantity, is_visible, seo_keywords, specifications
)
SELECT
  c.id,
  'TATA Tiscon Fe550D TMT Steel Bars',
  'टाटा टिसकॉन Fe550D टीएमटी स्टील बार',
  'TATA Tiscon Fe550D TMT (Thermo-Mechanically Treated) bars are high-ductility reinforcement steel conforming to IS 1786:2008. The ''D'' designation certifies superior ductility, making these bars earthquake-resistant — a critical property for seismic zone III structures across Maharashtra.',
  'टाटा टिसकॉन Fe550D टीएमटी (थर्मो-मेकॅनिकली ट्रीटेड) बार हे IS 1786:2008 नुसार उच्च-लवचिकता मजबुती स्टील आहेत.',
  62500.00,
  'Metric Tonne',
  80,
  TRUE,
  ARRAY['Fe550D TMT bars Maharashtra','TATA Tiscon price','earthquake resistant steel','TMT steel bar supplier','IS 1786 steel bars'],
  '{"Grade":"Fe550D","IS Code":"IS 1786:2008","Yield Strength (Min)":"550 MPa","Ultimate Tensile Strength":"600 MPa","Elongation (Min)":"14.5%","Available Diameters":"8mm, 10mm, 12mm, 16mm, 20mm, 25mm, 32mm","Ductility":"Superior (D Grade)","Brand":"TATA Tiscon"}'::jsonb
FROM public.categories c WHERE c.slug = 'steel-tmt';

INSERT INTO public.products (
  category_id, name_en, name_mr, description_en, description_mr,
  price_inr, unit, stock_quantity, is_visible, seo_keywords, specifications
)
SELECT
  c.id,
  'AAC Blocks (Autoclaved Aerated Concrete)',
  'एएसी ब्लॉक्स (ऑटोक्लेव्ड एरेटेड काँक्रीट)',
  'AAC (Autoclaved Aerated Concrete) blocks are a modern, lightweight alternative to conventional red bricks. With thermal insulation 3x better than brick, they significantly reduce air-conditioning loads. Manufactured to IS 2185 Part 3:1984.',
  'एएसी (ऑटोक्लेव्ड एरेटेड काँक्रीट) ब्लॉक्स हे पारंपारिक लाल विटांचा आधुनिक, हलका पर्याय आहे.',
  4800.00,
  'Cubic Meter',
  200,
  TRUE,
  ARRAY['AAC blocks Maharashtra','lightweight blocks price','autoclaved aerated concrete','thermal insulation blocks','IS 2185 blocks'],
  '{"IS Code":"IS 2185 Part 3:1984","Density":"550–650 kg/m³","Compressive Strength":"≥ 3.5 MPa","Thermal Conductivity":"0.16 W/m·K","Fire Resistance":"Up to 4 hours","Sound Reduction":"42 dB (200mm wall)","Standard Size (L×H×W)":"600 × 200 × 100–300 mm","Water Absorption":"≤ 20%"}'::jsonb
FROM public.categories c WHERE c.slug = 'bricks-blocks';

INSERT INTO public.products (
  category_id, name_en, name_mr, description_en, description_mr,
  price_inr, unit, stock_quantity, is_visible, seo_keywords, specifications
)
SELECT
  c.id,
  'Manufactured Sand (M-Sand) — Zone II',
  'कृत्रिम वाळू (एम-सँड) — झोन II',
  'Zone II Manufactured Sand (M-Sand) is a sustainable alternative to river sand, produced by crushing granite/hard basalt rock. Fully conforming to IS 383:2016, it provides consistent particle size, zero silt content, and superior angular texture.',
  'झोन II कृत्रिम वाळू (एम-सँड) हे नदी वाळूचा टिकाऊ पर्याय आहे, जे ग्रॅनाइट/कठीण बेसाल्ट खडक चिरडून तयार केले जाते.',
  2200.00,
  'Brass',
  150,
  TRUE,
  ARRAY['M-Sand Maharashtra','manufactured sand price','river sand alternative','IS 383 Zone II sand','construction sand supplier Maharashtra'],
  '{"IS Code":"IS 383:2016","Zone":"Zone II","Fineness Modulus":"2.60 – 2.90","Silt Content":"< 2%","Moisture Content":"< 5%","Source Rock":"Granite / Hard Basalt","Particle Shape":"Angular","1 Brass Volume":"100 Cubic Feet ≈ 2.83 m³"}'::jsonb
FROM public.categories c WHERE c.slug = 'sand-aggregates';

INSERT INTO public.products (
  category_id, name_en, name_mr, description_en, description_mr,
  price_inr, unit, stock_quantity, is_visible, seo_keywords, specifications
)
SELECT
  c.id,
  'Traditional Red Clay Bricks (First Class)',
  'पारंपारिक लाल मातीच्या विटा (प्रथम श्रेणी)',
  'First Class traditional red clay bricks, kiln-fired to IS 1077:1992 standards. Sourced from the renowned brick kilns of the Vidarbha and Marathwada regions. A compressive strength of ≥ 7.5 MPa makes them suitable for load-bearing walls.',
  'प्रथम श्रेणीच्या पारंपारिक लाल मातीच्या विटा, IS 1077:1992 मानकांनुसार भट्टीत जाळलेल्या.',
  8500.00,
  'Per 1000 Pieces',
  50000,
  TRUE,
  ARRAY['red clay bricks Maharashtra','first class bricks price','IS 1077 bricks','Vidarbha clay bricks','load bearing brick supplier'],
  '{"IS Code":"IS 1077:1992","Class":"First Class","Compressive Strength":"≥ 7.5 MPa","Water Absorption":"≤ 20%","Standard Size (L×W×H)":"190 × 90 × 90 mm","Efflorescence":"Nil to Slight","Firing":"High-temperature kiln","Origin":"Vidarbha / Marathwada Region, Maharashtra"}'::jsonb
FROM public.categories c WHERE c.slug = 'bricks-blocks';
