-- ========================================================
-- مسح كل حضور/غياب الخدام اللي اتسجل وقت التجربة
-- ========================================================
-- طلب Mr. Gerges 2026-09-23: "و كمان لو في اي حضور و غياب لخدام انا عايز
-- اشيله" — بيمسح كل سجلات الحضور (attendance_logs) بتاعة "الخدام" الثلاثة
-- (خادم / أمين فصل / أمين فصل مساعد) بالتحديد — نفس بالظبط التعريف
-- المستخدم في "سجل حضور الخدام" (get_servant_attendance_log() في
-- schema.sql: role IN ('class_admin', 'assistant_admin', 'servant')).
--
-- ✅ بيمسح: سجلات حضور class_admin / assistant_admin / servant بس —
--    "سجل حضور الخدام" هيرجع صفر لكل الخدام بعد كده (زي أول ما الموسم يبدأ).
--
-- ✅ مبيلمسش خالص:
--    - الخدام أنفسهم (البروفايل، الاسم، الفصل، كود الدخول) — الملف ده
--      بيمسح سجلات الحضور بس، مش الأشخاص.
--    - أمين الخدمة العامة (super_admin) — مش داخل تعريف "الخدام" في هذه
--      الشاشة بالتحديد، فحضوره (لو اتسجل أي حاجة وقت التجربة) مش بيتمسح هنا.
--    - أي نقط (points_ledger) — الخدام أصلاً مالهمش نقط في النظام ده،
--      النقط خاصة بالمخدومين بس.
--
-- ⚠️ الأمر نهائي ومفيهوش رجوع — أي حضور حقيقي اتسجل لخادم (مش تجربة) هيتمسح
--    برضو لو كان موجود وقت تشغيل الملف ده. شغّله بس لو متأكد إن كل الحضور
--    المسجل دلوقتي للخدام هو تجربة.
-- ========================================================

-- (اختياري) شوف قبل ما تشغل — هتمسح كام سجل حضور بالظبط، ولمين:
-- SELECT u.name, u.role, u.class_id, al.timestamp
-- FROM public.attendance_logs al
-- JOIN public.users u ON u.id = al.user_id
-- WHERE u.role IN ('class_admin', 'assistant_admin', 'servant')
-- ORDER BY u.name, al.timestamp;

DELETE FROM public.attendance_logs
WHERE user_id IN (
  SELECT id FROM public.users
  WHERE role IN ('class_admin', 'assistant_admin', 'servant')
);

-- تأكيد سريع بعد التنفيذ — المفروض يرجع صفر:
-- SELECT COUNT(*) AS remaining_staff_attendance
-- FROM public.attendance_logs al
-- JOIN public.users u ON u.id = al.user_id
-- WHERE u.role IN ('class_admin', 'assistant_admin', 'servant');
