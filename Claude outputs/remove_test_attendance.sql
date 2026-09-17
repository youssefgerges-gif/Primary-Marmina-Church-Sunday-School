-- ========================================================
-- تصفير حضور "إيريني يوسف" (تجربة/غير حقيقي) عشان ترجع تظهر
-- غايبة زي باقي الخدام والمخدومين اللي لسه محضرش حد منهم فعليًا
-- ========================================================

DELETE FROM public.attendance_logs
WHERE user_id = (SELECT id FROM public.users WHERE name = 'إيريني يوسف' LIMIT 1);

-- تم. لو حبيت تتأكد إنها اتشالت، شغل السطر ده وشوف هيرجعلك صفوف:
-- SELECT * FROM public.attendance_logs
-- WHERE user_id = (SELECT id FROM public.users WHERE name = 'إيريني يوسف' LIMIT 1);
