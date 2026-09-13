-- ========================================================
-- SUNDAY SCHOOL GAMIFICATION SYSTEM - SUPABASE DATABASE SCHEMA
-- كنيسة مارمينا والبابا كيرلس - خدمة مدارس الأحد
-- ========================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'class_admin', 'assistant_admin', 'servant', 'student', 'admin')),
  phone TEXT,
  qr_code TEXT UNIQUE NOT NULL,
  class_id TEXT DEFAULT 'grade-5',
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure title column exists if table was created previously without it
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS title TEXT;

-- Real login: a short, easy-to-share username (e.g. ADM01, SRV601) instead
-- of an email, and a link to the matching Supabase Auth account once the
-- person has set their own password (see the "REAL LOGIN" section below).
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON public.users (username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_auth_user_id_key ON public.users (auth_user_id) WHERE auth_user_id IS NOT NULL;

-- Update role check constraint if table was created previously with old constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'class_admin', 'assistant_admin', 'servant', 'student', 'admin'));

-- 2. Create Attendance Logs Table
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Points Ledger Table
CREATE TABLE IF NOT EXISTS public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  servant_id TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Gifts Table
CREATE TABLE IF NOT EXISTS public.gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  point_cost NUMERIC NOT NULL,
  stock NUMERIC DEFAULT 0,
  icon TEXT DEFAULT '🎁',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Gift Transactions Table
CREATE TABLE IF NOT EXISTS public.gift_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  gift_id UUID REFERENCES public.gifts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for public access
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;

-- Drop Policies if exist to prevent duplicate creation errors
DROP POLICY IF EXISTS "Public Users Access" ON public.users;
DROP POLICY IF EXISTS "Public Attendance Access" ON public.attendance_logs;
DROP POLICY IF EXISTS "Public Ledger Access" ON public.points_ledger;
DROP POLICY IF EXISTS "Public Gifts Access" ON public.gifts;
DROP POLICY IF EXISTS "Public Gift TX Access" ON public.gift_transactions;

CREATE POLICY "Public Users Access" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Attendance Access" ON public.attendance_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Ledger Access" ON public.points_ledger FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Gifts Access" ON public.gifts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Gift TX Access" ON public.gift_transactions FOR ALL USING (true) WITH CHECK (true);

-- Insert Real Servants Data (من كشوفات كنيسة مارمينا والبابا كيرلس)
-- ⚠️ ONE-TIME SEED ONLY: wrapped so this only ever runs the very first time
-- the database is empty. Without this guard, re-running schema.sql later
-- (e.g. to add a new function, like today) would silently overwrite any
-- name/role/class/title edit made afterward through the app's "تعديل"
-- screen back to these original hardcoded values, and would resurrect
-- anyone deleted through the app. Points, attendance, and anyone added as a
-- brand NEW person through the app (a new qr_code) were never at risk
-- either way — this only closes the gap for edits/deletes to people who
-- were already in this original seed list.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users LIMIT 1) THEN
    INSERT INTO public.users (name, role, phone, qr_code, class_id, title) VALUES
  -- أمناء الخدمة العامة
  ('أبونا بيشوي حليم', 'super_admin', '01200000000', 'QR-FATHER-BISHOY', 'all', 'كاهن الخدمة وأمين الخدمة'),
  ('يوسف جرجس', 'super_admin', '01222222222', 'QR-ADMIN-YOUSSEF', 'all', 'أمين الخدمة'),

  -- فصل سادسة ابتدائي
  ('إبتهاج سليم', 'class_admin', '01200000601', 'QR-SRV-601', 'grade-6', 'أمين فصل'),
  ('أبانوب روميل', 'assistant_admin', '01200000602', 'QR-SRV-602', 'grade-6', 'أمين فصل مساعد'),
  ('ماري منير', 'servant', '01200000603', 'QR-SRV-603', 'grade-6', NULL),
  ('منى ميخائيل', 'servant', '01200000604', 'QR-SRV-604', 'grade-6', NULL),
  ('إيريني يوسف', 'servant', '01200000605', 'QR-SRV-605', 'grade-6', NULL),
  ('مرقس عادل', 'servant', '01200000606', 'QR-SRV-606', 'grade-6', NULL),
  ('ماريان فيكتور', 'servant', '01200000607', 'QR-SRV-607', 'grade-6', NULL),
  ('ليديا يعقوب', 'servant', '01200000608', 'QR-SRV-608', 'grade-6', NULL),
  ('سيمون أيمن', 'servant', '01200000609', 'QR-SRV-609', 'grade-6', NULL),
  ('يؤانا أبونا جورجيوس', 'servant', '01200000610', 'QR-SRV-610', 'grade-6', NULL),
  ('ميرنا اسحاق', 'servant', '01200000611', 'QR-SRV-611', 'grade-6', NULL),
  ('بافلي بيتر', 'servant', '01200000612', 'QR-SRV-612', 'grade-6', NULL),
  ('كريم نشأت', 'servant', '01200000613', 'QR-SRV-613', 'grade-6', NULL),
  ('مرقص القمص داود', 'servant', '01200000614', 'QR-SRV-614', 'grade-6', NULL),

  -- فصل حضانة
  ('ماري ثروت', 'class_admin', '01200000001', 'QR-SRV-001', 'kg', 'أمين فصل'),
  ('أبانوب مدحت', 'assistant_admin', '01200000002', 'QR-SRV-002', 'kg', 'أمين فصل مساعد'),
  ('حنان بقطر', 'servant', '01200000003', 'QR-SRV-003', 'kg', NULL),
  ('إيريني كريم', 'servant', '01200000004', 'QR-SRV-004', 'kg', NULL),
  ('ماري ماهر', 'servant', '01200000005', 'QR-SRV-005', 'kg', NULL),
  ('سارة اديب', 'servant', '01200000006', 'QR-SRV-006', 'kg', NULL),
  ('جاكلين سعيد', 'servant', '01200000007', 'QR-SRV-007', 'kg', NULL),
  ('احلام ناروز', 'servant', '01200000008', 'QR-SRV-008', 'kg', NULL),
  ('سامية عادل', 'servant', '01200000009', 'QR-SRV-009', 'kg', NULL),
  ('مارينا نصر', 'servant', '01200000010', 'QR-SRV-010', 'kg', NULL),
  ('دولاجي', 'servant', '01200000011', 'QR-SRV-011', 'kg', NULL),
  ('نجوى عادل', 'servant', '01200000012', 'QR-SRV-012', 'kg', NULL),

  -- فصل أولى ابتدائي
  ('يوسف ماهر', 'class_admin', '01200000101', 'QR-SRV-101', 'grade-1', 'أمين فصل'),
  ('سهير حكيم', 'assistant_admin', '01200000102', 'QR-SRV-102', 'grade-1', 'أمين فصل مساعد'),
  ('مرثا منير', 'servant', '01200000103', 'QR-SRV-103', 'grade-1', NULL),
  ('نيفين يسى', 'servant', '01200000104', 'QR-SRV-104', 'grade-1', NULL),
  ('مريم حافظ', 'servant', '01200000105', 'QR-SRV-105', 'grade-1', NULL),
  ('مارسيل', 'servant', '01200000106', 'QR-SRV-106', 'grade-1', NULL),
  ('راندا عبد الملاك', 'servant', '01200000107', 'QR-SRV-107', 'grade-1', NULL),
  ('رانيا نبيل', 'servant', '01200000108', 'QR-SRV-108', 'grade-1', NULL),
  ('سارة بشرى', 'servant', '01200000109', 'QR-SRV-109', 'grade-1', NULL),
  ('جرجس يعقوب', 'servant', '01200000110', 'QR-SRV-110', 'grade-1', NULL),
  ('بيشوي نصر', 'servant', '01200000111', 'QR-SRV-111', 'grade-1', NULL),
  ('ميريت أنور', 'servant', '01200000112', 'QR-SRV-112', 'grade-1', NULL),
  ('نرمين ناروز', 'servant', '01200000113', 'QR-SRV-113', 'grade-1', NULL),
  ('هايدي بقطر', 'servant', '01200000114', 'QR-SRV-114', 'grade-1', NULL),

  -- فصل ثانية ابتدائي
  ('بنيامين اسطاسي', 'class_admin', '01200000201', 'QR-SRV-201', 'grade-2', 'أمين فصل'),
  ('مادونا زكريا', 'assistant_admin', '01200000202', 'QR-SRV-202', 'grade-2', 'أمين فصل مساعد'),
  ('دميانة سيفين', 'servant', '01200000203', 'QR-SRV-203', 'grade-2', NULL),
  ('لليان جرجس', 'servant', '01200000204', 'QR-SRV-204', 'grade-2', NULL),
  ('كرستين ميلاد', 'servant', '01200000205', 'QR-SRV-205', 'grade-2', NULL),
  ('منيرفا', 'servant', '01200000206', 'QR-SRV-206', 'grade-2', NULL),
  ('إيريني عبد الملاك', 'servant', '01200000207', 'QR-SRV-207', 'grade-2', NULL),
  ('ميرفت ناجي', 'servant', '01200000208', 'QR-SRV-208', 'grade-2', NULL),
  ('استر رأفت', 'servant', '01200000209', 'QR-SRV-209', 'grade-2', NULL),
  ('فيرينا عادل', 'servant', '01200000210', 'QR-SRV-210', 'grade-2', NULL),
  ('كيرلس مجدي', 'servant', '01200000211', 'QR-SRV-211', 'grade-2', NULL),
  ('ماثيو القمص داود', 'servant', '01200000212', 'QR-SRV-212', 'grade-2', NULL),
  ('انجي نبيل', 'servant', '01200000213', 'QR-SRV-213', 'grade-2', NULL),
  ('نيفين نبيل', 'servant', '01200000214', 'QR-SRV-214', 'grade-2', NULL),

  -- فصل ثالثة ابتدائي
  ('رشا تواضروس', 'class_admin', '01200000301', 'QR-SRV-301', 'grade-3', 'أمين فصل'),
  ('يوستينا سامح', 'assistant_admin', '01200000302', 'QR-SRV-302', 'grade-3', 'أمين فصل مساعد'),
  ('ماري ناجي', 'servant', '01200000303', 'QR-SRV-303', 'grade-3', NULL),
  ('منال الغول', 'servant', '01200000304', 'QR-SRV-304', 'grade-3', NULL),
  ('مدحت صفوت', 'servant', '01200000305', 'QR-SRV-305', 'grade-3', NULL),
  ('مارفينا جرجس', 'servant', '01200000306', 'QR-SRV-306', 'grade-3', NULL),
  ('إيريني يعقوب', 'servant', '01200000307', 'QR-SRV-307', 'grade-3', NULL),
  ('صوفيا يسرى', 'servant', '01200000308', 'QR-SRV-308', 'grade-3', NULL),
  ('مايفن ايمن', 'servant', '01200000309', 'QR-SRV-309', 'grade-3', NULL),
  ('سلفانا صموئيل', 'servant', '01200000310', 'QR-SRV-310', 'grade-3', NULL),
  ('ناردين أبونا بيشوي', 'servant', '01200000311', 'QR-SRV-311', 'grade-3', NULL),
  ('مهرائيل هدرا', 'servant', '01200000312', 'QR-SRV-312', 'grade-3', NULL),
  ('أميرة جميل', 'servant', '01200000313', 'QR-SRV-313', 'grade-3', NULL),
  ('فريد إبراهيم', 'servant', '01200000314', 'QR-SRV-314', 'grade-3', NULL),

  -- فصل رابعة ابتدائي
  ('سلوى عياد', 'class_admin', '01200000401', 'QR-SRV-401', 'grade-4', 'أمين فصل'),
  ('كيرلس الأمير', 'assistant_admin', '01200000402', 'QR-SRV-402', 'grade-4', 'أمين فصل مساعد'),
  ('مريم أبونا بيشوي', 'servant', '01200000403', 'QR-SRV-403', 'grade-4', NULL),
  ('مارتينا روماني', 'servant', '01200000404', 'QR-SRV-404', 'grade-4', NULL),
  ('سهير سمير', 'servant', '01200000405', 'QR-SRV-405', 'grade-4', NULL),
  ('جورج صافي', 'servant', '01200000406', 'QR-SRV-406', 'grade-4', NULL),
  ('ميرفت عزيز', 'servant', '01200000407', 'QR-SRV-407', 'grade-4', NULL),
  ('تاسوني إيلين', 'servant', '01200000408', 'QR-SRV-408', 'grade-4', NULL),
  ('كيرمينا جرجس', 'servant', '01200000409', 'QR-SRV-409', 'grade-4', NULL),
  ('يوستينا ناصر', 'servant', '01200000410', 'QR-SRV-410', 'grade-4', NULL),
  ('رانا رجائي', 'servant', '01200000411', 'QR-SRV-411', 'grade-4', NULL),
  ('مارينا هاني', 'servant', '01200000412', 'QR-SRV-412', 'grade-4', NULL),
  ('ساندي يعقوب', 'servant', '01200000413', 'QR-SRV-413', 'grade-4', NULL),
  ('ماريان جوزيف', 'servant', '01200000414', 'QR-SRV-414', 'grade-4', NULL),

  -- فصل خامسة ابتدائي
  ('مينا ساويروس', 'class_admin', '01200000501', 'QR-SRV-501', 'grade-5', 'أمين فصل'),
  ('دينا نبيل', 'assistant_admin', '01200000502', 'QR-SRV-502', 'grade-5', 'أمين فصل مساعد'),
  ('إيريني عبده', 'servant', '01200000503', 'QR-SRV-503', 'grade-5', NULL),
  ('مارلين منير', 'servant', '01200000504', 'QR-SRV-504', 'grade-5', NULL),
  ('مارينا أكرم', 'servant', '01200000505', 'QR-SRV-505', 'grade-5', NULL),
  ('كريستين روميل', 'servant', '01200000506', 'QR-SRV-506', 'grade-5', NULL),
  ('بيتر عماد', 'servant', '01200000507', 'QR-SRV-507', 'grade-5', NULL),
  ('يواقيم إبراهيم', 'servant', '01200000508', 'QR-SRV-508', 'grade-5', NULL),
  ('كيرمينا يسى', 'servant', '01200000509', 'QR-SRV-509', 'grade-5', NULL),
  ('مارفيا هاني', 'servant', '01200000510', 'QR-SRV-510', 'grade-5', NULL),
  ('ماريهان روماني', 'servant', '01200000511', 'QR-SRV-511', 'grade-5', NULL),
  ('يونا جمال', 'servant', '01200000512', 'QR-SRV-512', 'grade-5', NULL),
  ('مهرائيل جرجس', 'servant', '01200000513', 'QR-SRV-513', 'grade-5', NULL),
  ('بيشوي القمص داود', 'servant', '01200000514', 'QR-SRV-514', 'grade-5', NULL)
    ON CONFLICT (qr_code) DO UPDATE SET
      role = EXCLUDED.role,
      title = EXCLUDED.title,
      class_id = EXCLUDED.class_id,
      name = EXCLUDED.name;
  END IF;
END $$;

-- ========================================================
-- REAL LOGIN: username backfill
-- Gives every existing person a short username instead of an email:
--   - the two general-service admins become ADM01 / ADM02
--   - everyone else gets their existing QR code with "QR-" and the dashes
--     stripped (e.g. QR-SRV-601 -> SRV601), so it stays recognizable and
--     matches the paper class lists already in use.
-- Safe to re-run: only fills in usernames that are still empty, never
-- overwrites one that's already set (so a person who already claimed their
-- account keeps their username and password link).
-- ========================================================
UPDATE public.users SET username = 'ADM01' WHERE qr_code = 'QR-FATHER-BISHOY' AND username IS NULL;
UPDATE public.users SET username = 'ADM02' WHERE qr_code = 'QR-ADMIN-YOUSSEF' AND username IS NULL;

UPDATE public.users
SET username = UPPER(REPLACE(REPLACE(qr_code, 'QR-', ''), '-', ''))
WHERE username IS NULL;

-- ========================================================
-- ATOMIC GIFT REDEMPTION FUNCTION
-- Fixes a race condition: the app used to read gift.stock, then separately
-- write stock - 1, with no locking — two servants redeeming the same gift
-- at the same instant could both pass the "in stock?" check and both
-- decrement stock, overselling it. This function locks the gift row
-- (FOR UPDATE) so a second concurrent call waits for the first to finish
-- and re-checks against the up-to-date stock, and does the balance check
-- plus all three writes (gift_transactions, points_ledger, stock update)
-- in one atomic transaction.
-- Run this once in the Supabase SQL editor to add it to an existing project.
-- ========================================================
CREATE OR REPLACE FUNCTION public.redeem_gift(
  p_student_id UUID,
  p_gift_id UUID,
  p_servant_id TEXT DEFAULT 'system'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gift RECORD;
  v_balance NUMERIC;
BEGIN
  SELECT * INTO v_gift FROM public.gifts WHERE id = p_gift_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الهدية غير متوفرة';
  END IF;

  IF v_gift.stock <= 0 THEN
    RAISE EXCEPTION 'الهدية نفذت من المخزون!';
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_balance
  FROM public.points_ledger WHERE student_id = p_student_id;

  IF v_balance < v_gift.point_cost THEN
    RAISE EXCEPTION 'رصيد المخدوم غير كافٍ. المطلوب: % نقطة، الرصيد: % نقطة', v_gift.point_cost, v_balance;
  END IF;

  INSERT INTO public.gift_transactions (student_id, gift_id)
  VALUES (p_student_id, p_gift_id);

  INSERT INTO public.points_ledger (student_id, amount, reason, servant_id)
  VALUES (p_student_id, -v_gift.point_cost, 'استبدال هدية: ' || v_gift.name, p_servant_id);

  UPDATE public.gifts SET stock = stock - 1 WHERE id = p_gift_id;

  RETURN jsonb_build_object(
    'success', true,
    'giftName', v_gift.name,
    'newBalance', v_balance - v_gift.point_cost
  );
END;
$$;

-- Only a signed-in person should be able to redeem a gift (previously also
-- granted to anon, from before real login existed).
REVOKE EXECUTE ON FUNCTION public.redeem_gift(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_gift(UUID, UUID, TEXT) TO authenticated;

-- ========================================================
-- RLS LOCKDOWN
-- Replaces the "FOR ALL USING (true) WITH CHECK (true)" policies above
-- (which let anyone with the app's public anon key read or write anything
-- directly via the Supabase API, logged in or not) with real per-role
-- checks. From here on, every table requires a real login — nothing is
-- readable or writable anonymously.
--
-- Design (kept intentionally simple — a good v1, not a full re-architecture):
--   - Staff (any role except student) can see the whole roster/ledger/
--     attendance/gift-history, same as they effectively could through the
--     app's screens before. This is NOT split further per class yet.
--   - A student can only see their own row and their own history.
--   - Only super_admin can add/edit/delete people or manage the gift
--     catalogue (matches what the UI already restricts to that role).
--   - gift_transactions has no direct INSERT policy at all: only the
--     redeem_gift() function (SECURITY DEFINER, bypasses RLS) writes there,
--     so a redemption can only ever happen through that one atomic,
--     balance-checked path.
--   - Logging in itself needs two narrow SECURITY DEFINER functions
--     (find_login_account, claim_login_account) since a logged-out visitor
--     has no direct table access anymore — see supabase.js.
-- Safe to re-run.
-- ========================================================

DROP POLICY IF EXISTS "Public Users Access" ON public.users;
DROP POLICY IF EXISTS "Public Attendance Access" ON public.attendance_logs;
DROP POLICY IF EXISTS "Public Ledger Access" ON public.points_ledger;
DROP POLICY IF EXISTS "Public Gifts Access" ON public.gifts;
DROP POLICY IF EXISTS "Public Gift TX Access" ON public.gift_transactions;

-- Also drop the granular policies created below, before re-creating them.
-- Postgres has no "CREATE POLICY IF NOT EXISTS", so without this a second
-- run of this file fails with "policy ... already exists" the moment it
-- reaches the first CREATE POLICY further down — this is what actually
-- happened just now. These 17 drops make the whole RLS section genuinely
-- safe to re-run any number of times, matching what the comment above it
-- already claimed.
DROP POLICY IF EXISTS "Users can view own row" ON public.users;
DROP POLICY IF EXISTS "Staff can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admin can insert users" ON public.users;
DROP POLICY IF EXISTS "Super admin can update users" ON public.users;
DROP POLICY IF EXISTS "Super admin can delete users" ON public.users;
DROP POLICY IF EXISTS "Staff can view all attendance" ON public.attendance_logs;
DROP POLICY IF EXISTS "Students can view own attendance" ON public.attendance_logs;
DROP POLICY IF EXISTS "Staff can record attendance" ON public.attendance_logs;
DROP POLICY IF EXISTS "Staff can view all points" ON public.points_ledger;
DROP POLICY IF EXISTS "Students can view own points" ON public.points_ledger;
DROP POLICY IF EXISTS "Staff can add points" ON public.points_ledger;
DROP POLICY IF EXISTS "Signed-in users can view gifts" ON public.gifts;
DROP POLICY IF EXISTS "Super admin can add gifts" ON public.gifts;
DROP POLICY IF EXISTS "Super admin can update gifts" ON public.gifts;
DROP POLICY IF EXISTS "Super admin can delete gifts" ON public.gifts;
DROP POLICY IF EXISTS "Staff can view all gift transactions" ON public.gift_transactions;
DROP POLICY IF EXISTS "Students can view own gift transactions" ON public.gift_transactions;

-- Helpers used inside policies to look up the caller's own role / users.id
-- from their Supabase Auth id (auth.uid()). SECURITY DEFINER so this
-- lookup bypasses RLS internally — without that, a policy on `users` that
-- queries `users` to find the caller's role would recurse into itself.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT role FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.current_user_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_id() TO authenticated;

-- ===== users =====
CREATE POLICY "Users can view own row" ON public.users
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Staff can view all users" ON public.users
  FOR SELECT TO authenticated
  USING (public.current_user_role() IS NOT NULL AND public.current_user_role() <> 'student');

CREATE POLICY "Super admin can insert users" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() = 'super_admin');

CREATE POLICY "Super admin can update users" ON public.users
  FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

CREATE POLICY "Super admin can delete users" ON public.users
  FOR DELETE TO authenticated
  USING (public.current_user_role() = 'super_admin');

-- ===== attendance_logs =====
CREATE POLICY "Staff can view all attendance" ON public.attendance_logs
  FOR SELECT TO authenticated
  USING (public.current_user_role() IS NOT NULL AND public.current_user_role() <> 'student');

CREATE POLICY "Students can view own attendance" ON public.attendance_logs
  FOR SELECT TO authenticated
  USING (user_id = public.current_user_id());

CREATE POLICY "Staff can record attendance" ON public.attendance_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IS NOT NULL AND public.current_user_role() <> 'student');

-- ===== points_ledger =====
CREATE POLICY "Staff can view all points" ON public.points_ledger
  FOR SELECT TO authenticated
  USING (public.current_user_role() IS NOT NULL AND public.current_user_role() <> 'student');

CREATE POLICY "Students can view own points" ON public.points_ledger
  FOR SELECT TO authenticated
  USING (student_id = public.current_user_id());

CREATE POLICY "Staff can add points" ON public.points_ledger
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IS NOT NULL AND public.current_user_role() <> 'student');

-- ===== gifts =====
CREATE POLICY "Signed-in users can view gifts" ON public.gifts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Super admin can add gifts" ON public.gifts
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() = 'super_admin');

CREATE POLICY "Super admin can update gifts" ON public.gifts
  FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

CREATE POLICY "Super admin can delete gifts" ON public.gifts
  FOR DELETE TO authenticated
  USING (public.current_user_role() = 'super_admin');

-- ===== gift_transactions =====
-- No INSERT policy on purpose: redemptions only ever happen through the
-- redeem_gift() function, which bypasses RLS as its owner.
CREATE POLICY "Staff can view all gift transactions" ON public.gift_transactions
  FOR SELECT TO authenticated
  USING (public.current_user_role() IS NOT NULL AND public.current_user_role() <> 'student');

CREATE POLICY "Students can view own gift transactions" ON public.gift_transactions
  FOR SELECT TO authenticated
  USING (student_id = public.current_user_id());

-- ========================================================
-- LOGIN LOOKUP FUNCTIONS
-- A logged-out visitor now has no direct read access to `users` at all, so
-- the "type your username" step of login needs its own narrow function
-- that returns only the few safe fields needed to show "is this you?" —
-- never phone numbers, QR codes, or anything else.
-- ========================================================
CREATE OR REPLACE FUNCTION public.find_login_account(p_username TEXT)
RETURNS TABLE (id UUID, name TEXT, role TEXT, class_id TEXT, title TEXT, username TEXT, has_password BOOLEAN)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT id, name, role, class_id, title, username, (auth_user_id IS NOT NULL) AS has_password
  FROM public.users
  WHERE username = UPPER(TRIM(p_username));
$$;

REVOKE EXECUTE ON FUNCTION public.find_login_account(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_login_account(TEXT) TO anon, authenticated;

-- Links the just-created Supabase Auth account (the caller, once signed up)
-- to their existing `users` row. Only callable once signed in, only for a
-- username that hasn't been claimed yet, and only once per Auth account.
CREATE OR REPLACE FUNCTION public.claim_login_account(p_username TEXT)
RETURNS TABLE (id UUID, name TEXT, role TEXT, class_id TEXT, title TEXT, username TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_row public.users%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'لازم تسجل دخول الأول';
  END IF;

  SELECT * INTO v_row FROM public.users u WHERE u.username = UPPER(TRIM(p_username));
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الكود غير موجود';
  END IF;

  IF v_row.auth_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'تم إنشاء كلمة سر لهذا الكود من قبل';
  END IF;

  IF EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid()) THEN
    RAISE EXCEPTION 'الحساب ده مرتبط بكود تاني بالفعل';
  END IF;

  -- "id" is qualified here (public.users.id) for the same reason the
  -- SELECT above qualifies "username": this function's RETURNS TABLE
  -- declares an "id" column, which plpgsql turns into an in-scope variable
  -- for the whole function body — an unqualified "id" here would hit the
  -- exact same "column reference is ambiguous" error as before.
  UPDATE public.users SET auth_user_id = auth.uid() WHERE public.users.id = v_row.id;

  RETURN QUERY SELECT v_row.id, v_row.name, v_row.role, v_row.class_id, v_row.title, v_row.username;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_login_account(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_login_account(TEXT) TO authenticated;

-- ========================================================
-- ABSENCE REPORT (متابعة افتقاد الغائبين) — CLASS-SCOPED
-- Whoever calls this only gets back the people they're actually allowed to
-- manage absence for:
--   - super_admin (أمين الخدمة العامة): everyone (every class's students
--     and servants).
--   - class_admin / assistant_admin / servant (أمين فصل / أمين فصل مساعد /
--     خادم): ONLY the students and servants in their OWN class — never
--     another class's people, and never another servant outside their
--     class. This is enforced here, server-side, rather than only in the
--     app's UI, so it can't be bypassed by calling the API directly.
-- ========================================================
CREATE OR REPLACE FUNCTION public.current_user_class_id()
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT class_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.current_user_class_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_class_id() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_absence_report(min_weeks INTEGER DEFAULT 2)
RETURNS TABLE (
  id UUID,
  name TEXT,
  phone TEXT,
  qr_code TEXT,
  class_id TEXT,
  role TEXT,
  last_attended_at TIMESTAMPTZ,
  weeks_absent INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE
  v_role TEXT;
  v_class_id TEXT;
BEGIN
  v_role := public.current_user_role();
  IF v_role IS NULL OR v_role = 'student' THEN
    RAISE EXCEPTION 'غير مصرح لك بعرض سجل الافتقاد';
  END IF;

  IF v_role <> 'super_admin' THEN
    v_class_id := public.current_user_class_id();
  END IF;

  RETURN QUERY
  WITH scoped AS (
    SELECT
      u.id, u.name, u.phone, u.qr_code, u.class_id, u.role,
      (SELECT MAX(al.timestamp) FROM public.attendance_logs al WHERE al.user_id = u.id) AS last_attended_at
    FROM public.users u
    WHERE u.role <> 'super_admin'
      AND (v_role = 'super_admin' OR u.class_id = v_class_id)
  ),
  computed AS (
    SELECT
      scoped.id, scoped.name, scoped.phone, scoped.qr_code, scoped.class_id, scoped.role,
      scoped.last_attended_at,
      (CASE
        WHEN scoped.last_attended_at IS NULL THEN 4
        ELSE GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (now() - scoped.last_attended_at)) / 604800))::INTEGER
      END) AS weeks_absent_calc
    FROM scoped
  )
  SELECT
    computed.id, computed.name, computed.phone, computed.qr_code,
    computed.class_id, computed.role, computed.last_attended_at,
    computed.weeks_absent_calc
  FROM computed
  WHERE computed.weeks_absent_calc >= min_weeks
  ORDER BY computed.weeks_absent_calc DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_absence_report(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_absence_report(INTEGER) TO authenticated;

-- ========================================================
-- SCOPED STUDENT ROSTER (منح النقاط اليدوي / استبدال الهدايا) — CLASS-SCOPED
-- Used by ManualPointsTool.jsx and GiftRedemption.jsx so a servant / class
-- admin / assistant admin can only pick a student to give points or gifts
-- to from their OWN class — never a student who belongs to another class.
-- super_admin still gets the full student roster. Enforced here
-- server-side (not just hidden in the app's UI), same pattern as
-- get_absence_report() above — it can't be bypassed by calling the API
-- directly.
-- ========================================================
CREATE OR REPLACE FUNCTION public.get_scoped_students()
RETURNS TABLE (
  id UUID,
  name TEXT,
  phone TEXT,
  qr_code TEXT,
  class_id TEXT
)
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE
  v_role TEXT;
  v_class_id TEXT;
BEGIN
  v_role := public.current_user_role();
  IF v_role IS NULL OR v_role = 'student' THEN
    RAISE EXCEPTION 'غير مصرح لك بعرض قائمة المخدومين';
  END IF;

  IF v_role <> 'super_admin' THEN
    v_class_id := public.current_user_class_id();
  END IF;

  RETURN QUERY
  SELECT u.id, u.name, u.phone, u.qr_code, u.class_id
  FROM public.users u
  WHERE u.role = 'student'
    AND (v_role = 'super_admin' OR u.class_id = v_class_id)
  ORDER BY u.name;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_scoped_students() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_scoped_students() TO authenticated;
