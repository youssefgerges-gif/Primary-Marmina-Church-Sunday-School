-- ========================================================
-- مسح كل المخدومين اللي اتضافوا كتيست (كامل — الشخص نفسه، مش بس نقطه)
-- ========================================================
-- طلب Mr. Gerges 2026-09-23: "امسح كل المخدومين اصلا انا لسة مضيفتش داتا
-- حقيقية" — يعني مسح كل صفوف role = 'student' بالكامل من الموقع، مش بس
-- تصفير نقطهم. بما إن لسه مفيش داتا حقيقية اتضافت، الملف ده بيمسح كل
-- المخدومين من غير استثناء.
--
-- ✅ بيتمسح تلقائيًا مع كل مخدوم (CASCADE، مفيش حاجة إضافية مطلوبة):
--    - كل نقطه في points_ledger (points_ledger.student_id مربوط بـ
--      ON DELETE CASCADE).
--    - كل سجلات حضوره في attendance_logs (نفس الفكرة، ON DELETE CASCADE).
--    - حساب تسجيل الدخول بتاعه (auth.users) — بيتمسح صراحة تحت، قبل مسح
--      الشخص نفسه، عشان مفيش حسابات دخول تايهة من غير صاحب.
--
-- ✅ مبيلمسش خالص:
--    - أي خادم / أمين فصل / أمين فصل مساعد / أمين خدمة عامة (role <> 'student').
--    - حضور أو نقط الخدام (سجل حضور الخدام بيفضل زي ما هو تمامًا).
--
-- ⚠️ الأمر نهائي ومفيهوش رجوع — أي مخدوم اتمسح كده، لو عايزينه تاني لازم
--    يتضاف من الأول (اسم جديد وكود QR/دخول جديد).
-- ========================================================

-- (اختياري) شوف قبل ما تشغل — هتمسح كام مخدوم بالظبط:
-- SELECT name, class_id, username, created_at
-- FROM public.users
-- WHERE role = 'student'
-- ORDER BY class_id, name;

-- الخطوة 1: مسح حسابات الدخول (auth.users) بتاعة أي مخدوم عنده باسورد
-- حاليًا — لازم تتعمل الأول قبل مسح public.users، عشان محتاجين auth_user_id
-- بتاعهم لسه موجود وقت المسح ده.
DELETE FROM auth.users
WHERE id IN (
  SELECT auth_user_id FROM public.users
  WHERE role = 'student' AND auth_user_id IS NOT NULL
);

-- الخطوة 2: مسح كل المخدومين نفسهم — نقطهم وحضورهم بيتمسحوا أوتوماتيك
-- معاهم (CASCADE، زي ما هو موضّح فوق).
DELETE FROM public.users
WHERE role = 'student';

-- تأكيد سريع بعد التنفيذ — المفروض يرجع صفر صفوف في الثلاثة:
-- SELECT COUNT(*) AS remaining_students FROM public.users WHERE role = 'student';
-- SELECT COUNT(*) AS remaining_student_points FROM public.points_ledger;
-- SELECT COUNT(*) AS remaining_student_attendance FROM public.attendance_logs al
--   JOIN public.users u ON u.id = al.user_id WHERE u.role = 'student';
