
-- Drop FK temporarily for seed data
ALTER TABLE public.recipes DROP CONSTRAINT recipes_author_id_fkey;

DO $$
DECLARE
  cat_italian uuid := gen_random_uuid();
  cat_indian uuid := gen_random_uuid();
  cat_mexican uuid := gen_random_uuid();
  cat_japanese uuid := gen_random_uuid();
  cat_thai uuid := gen_random_uuid();
  cat_vegan uuid := gen_random_uuid();
  cat_glutenfree uuid := gen_random_uuid();
  cat_dessert uuid := gen_random_uuid();
  cat_healthy uuid := gen_random_uuid();
  cat_quick uuid := gen_random_uuid();
  rec1 uuid := gen_random_uuid();
  rec2 uuid := gen_random_uuid();
  rec3 uuid := gen_random_uuid();
  rec4 uuid := gen_random_uuid();
  rec5 uuid := gen_random_uuid();
  rec6 uuid := gen_random_uuid();
  rec7 uuid := gen_random_uuid();
  rec8 uuid := gen_random_uuid();
  sys_author uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  INSERT INTO public.categories (id, name, type, icon) VALUES
    (cat_italian, 'Italian', 'cuisine', '🇮🇹'),
    (cat_indian, 'Indian', 'cuisine', '🇮🇳'),
    (cat_mexican, 'Mexican', 'cuisine', '🇲🇽'),
    (cat_japanese, 'Japanese', 'cuisine', '🇯🇵'),
    (cat_thai, 'Thai', 'cuisine', '🇹🇭'),
    (cat_vegan, 'Vegan', 'dietary', '🌱'),
    (cat_glutenfree, 'Gluten-Free', 'dietary', '🌾'),
    (cat_dessert, 'Dessert', 'cuisine', '🍰'),
    (cat_healthy, 'Healthy', 'dietary', '💚'),
    (cat_quick, 'Quick & Easy', 'cuisine', '⚡');

  INSERT INTO public.recipes (id, author_id, title, description, image_url, prep_time, cook_time, servings, instructions, status) VALUES
    (rec1, sys_author, 'Classic Spaghetti Carbonara', 'A rich and creamy Italian pasta made with eggs, pecorino cheese, guanciale, and black pepper.', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800', 15, 20, 4, '["Cook spaghetti in salted boiling water until al dente","Crisp guanciale in a pan until golden","Whisk eggs with pecorino and black pepper","Toss hot pasta with guanciale, remove from heat","Add egg mixture and toss quickly","Serve with extra pecorino"]', 'published'),
    (rec2, sys_author, 'Butter Chicken', 'Tender chicken in a velvety tomato-butter sauce with aromatic spices.', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800', 30, 40, 6, '["Marinate chicken in yogurt and spices","Grill chicken until charred","Sauté onions, ginger, garlic in butter","Add tomato puree, cream, and spices","Simmer until thickened","Add chicken and simmer 10 minutes"]', 'published'),
    (rec3, sys_author, 'Rainbow Buddha Bowl', 'A vibrant bowl with roasted vegetables, quinoa, avocado, and tahini dressing.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', 15, 25, 2, '["Cook quinoa","Roast sweet potato and chickpeas","Prepare tahini dressing","Slice avocado and cabbage","Arrange in a bowl","Drizzle with dressing"]', 'published'),
    (rec4, sys_author, 'Street-Style Fish Tacos', 'Crispy beer-battered fish in warm tortillas with cabbage slaw and chipotle crema.', 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800', 20, 15, 4, '["Make beer batter","Season fish","Prepare cabbage slaw","Fry fish until golden","Warm tortillas","Assemble tacos"]', 'published'),
    (rec5, sys_author, 'Molten Chocolate Lava Cake', 'Individual chocolate cakes with a gooey, molten center.', 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800', 15, 12, 4, '["Melt chocolate and butter","Whisk eggs and sugar","Fold together","Add flour","Pour into ramekins","Bake at 425°F for 12 minutes"]', 'published'),
    (rec6, sys_author, 'Homemade Salmon Sushi Rolls', 'Fresh maki rolls with sushi-grade salmon, avocado, and cucumber.', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800', 40, 20, 4, '["Cook sushi rice","Slice salmon","Cut avocado and cucumber","Spread rice on nori","Layer fillings and roll","Slice into pieces"]', 'published'),
    (rec7, sys_author, 'Authentic Pad Thai', 'Rice noodles stir-fried with shrimp, tofu, peanuts, and tamarind sauce.', 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800', 20, 10, 3, '["Soak rice noodles","Make tamarind sauce","Stir-fry shrimp and tofu","Scramble eggs","Add noodles and sauce","Serve with peanuts and lime"]', 'published'),
    (rec8, sys_author, 'Wild Mushroom Risotto', 'Creamy Arborio rice with wild mushrooms, white wine, and parmesan.', 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800', 10, 35, 4, '["Sauté mushrooms","Keep stock warm","Toast rice in olive oil","Deglaze with wine","Add stock gradually","Fold in parmesan and butter"]', 'published');

  INSERT INTO public.recipe_categories (recipe_id, category_id) VALUES
    (rec1, cat_italian), (rec2, cat_indian), (rec3, cat_vegan), (rec3, cat_healthy),
    (rec3, cat_glutenfree), (rec4, cat_mexican), (rec4, cat_quick), (rec5, cat_dessert),
    (rec6, cat_japanese), (rec7, cat_thai), (rec7, cat_quick), (rec8, cat_italian);

  INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, quantity, unit) VALUES
    (rec1, 'Spaghetti', 400, 'g'), (rec1, 'Guanciale', 200, 'g'), (rec1, 'Eggs', 4, 'whole'), (rec1, 'Pecorino Romano', 100, 'g'),
    (rec2, 'Chicken Thighs', 800, 'g'), (rec2, 'Yogurt', 200, 'ml'), (rec2, 'Tomato Puree', 400, 'ml'), (rec2, 'Heavy Cream', 200, 'ml'), (rec2, 'Butter', 100, 'g'),
    (rec3, 'Quinoa', 200, 'g'), (rec3, 'Sweet Potato', 2, 'medium'), (rec3, 'Chickpeas', 400, 'g'), (rec3, 'Avocado', 1, 'whole'),
    (rec4, 'White Fish', 500, 'g'), (rec4, 'Corn Tortillas', 8, 'whole'), (rec4, 'Purple Cabbage', 200, 'g'),
    (rec5, 'Dark Chocolate', 200, 'g'), (rec5, 'Butter', 100, 'g'), (rec5, 'Eggs', 3, 'whole'), (rec5, 'Sugar', 80, 'g'),
    (rec6, 'Salmon', 300, 'g'), (rec6, 'Sushi Rice', 400, 'g'), (rec6, 'Nori Sheets', 4, 'sheets'),
    (rec7, 'Rice Noodles', 250, 'g'), (rec7, 'Shrimp', 200, 'g'), (rec7, 'Tofu', 150, 'g'), (rec7, 'Peanuts', 50, 'g'),
    (rec8, 'Arborio Rice', 300, 'g'), (rec8, 'Wild Mushrooms', 300, 'g'), (rec8, 'White Wine', 150, 'ml'), (rec8, 'Parmesan', 80, 'g');

  INSERT INTO public.recipe_nutrition (recipe_id, calories, protein, carbs, fat) VALUES
    (rec1, 520, 22, 58, 24), (rec2, 480, 35, 12, 32), (rec3, 420, 15, 52, 18), (rec4, 380, 28, 34, 16),
    (rec5, 450, 8, 42, 28), (rec6, 350, 22, 48, 10), (rec7, 440, 24, 52, 16), (rec8, 480, 14, 58, 20);
END $$;

-- Re-add FK (without cascade delete to allow orphaned seed data)
ALTER TABLE public.recipes ADD CONSTRAINT recipes_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
