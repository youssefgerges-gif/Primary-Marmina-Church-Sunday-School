import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials from environment or default to placeholder
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Instantiate Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if real valid Supabase keys are configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return (
    url &&
    key &&
    url !== 'https://placeholder.supabase.co' &&
    !url.includes('your-project-id') &&
    !key.includes('your-anon-key') &&
    key !== 'placeholder-key'
  );
};

// ==========================================
// CHURCH CLASSES DEFINITION (كنيسة مارمينا والبابا كيرلس)
// ==========================================
export const CLASSES = [
  {
    id: 'kg',
    name: 'فصل حضانة',
    patron: 'فصل الملاك ميخائيل والشهيد أبانوب',
    saintName: 'الملاك ميخائيل والشهيد أبانوب النهيسي',
    saintTitle: 'رئيس الجند السماوي وشفيع الأطفال 👼✨',
    saintIcon: '👼',
    color: 'from-amber-500 to-orange-500',
    admin: 'ماري ثروت',
    assistantAdmin: 'أبانوب مدحت'
  },
  {
    id: 'grade-1',
    name: 'فصل أولى ابتدائي',
    patron: 'فصل الشهيد كرياكوس وأمه يوليطه',
    saintName: 'الشهيد كرياكوس وأمه يوليطه',
    saintTitle: 'أصغر شهداء الكنيسة وأمه البارة 🕊️✨',
    saintIcon: '🕊️',
    color: 'from-sky-500 to-blue-600',
    admin: 'يوسف ماهر',
    assistantAdmin: 'سهير حكيم'
  },
  {
    id: 'grade-2',
    name: 'فصل ثانية ابتدائي',
    patron: 'فصل الشهيد أبي سيفين والأم إيريني',
    saintName: 'الشهيد أبي سيفين والأم إيريني',
    saintTitle: 'صاحب السيفين وأمنا رئيسة الدير ⚔️✨',
    saintIcon: '⚔️',
    color: 'from-indigo-600 to-purple-600',
    admin: 'بنيامين اسطاسي',
    assistantAdmin: 'مادونا زكريا'
  },
  {
    id: 'grade-3',
    name: 'فصل ثالثة ابتدائي',
    patron: 'فصل القديسين الأنبا بولا والأنبا أنطونيوس',
    saintName: 'الأنبا بولا والأنبا أنطونيوس',
    saintTitle: 'أول السواح وأبو جميع الرهبان 🍞✨',
    saintIcon: '🍞',
    color: 'from-emerald-600 to-teal-600',
    admin: 'رشا تواضروس',
    assistantAdmin: 'يوستينا سامح'
  },
  {
    id: 'grade-4',
    name: 'فصل رابعة ابتدائي',
    patron: 'فصل الشهيد مارمينا والبابا كيرلس',
    saintName: 'الشهيد مارمينا والبابا كيرلس السادس',
    saintTitle: 'شفيع كنيستنا العجائبي ورجل الصلاة 🐫✨',
    saintIcon: '🐫',
    color: 'from-blue-600 to-cyan-600',
    admin: 'سلوى عياد',
    assistantAdmin: 'كيرلس الأمير'
  },
  {
    id: 'grade-5',
    name: 'فصل خامسة ابتدائي',
    patron: 'فصل الشهيد مارجرجس والشهيدة مارينا',
    saintName: 'الشهيد مارجرجس والشهيدة مارينا',
    saintTitle: 'أمير الشهداء وقهارة الشياطين 🐎✨',
    saintIcon: '🐎',
    color: 'from-rose-600 to-red-600',
    admin: 'مينا ساويروس',
    assistantAdmin: 'دينا نبيل'
  },
  {
    id: 'grade-6',
    name: 'فصل سادسة ابتدائي',
    patron: 'فصل العذراء مريم والأنبا هدرا',
    saintName: 'العذراء مريم والأنبا هدرا الأسواني',
    saintTitle: 'أم النور وحمامة السلام وحبيب الصعيد 👑✨',
    saintIcon: '👑',
    color: 'from-purple-600 to-pink-600',
    admin: 'إبتهاج سليم',
    assistantAdmin: 'أبانوب روميل'
  },
];

// ==========================================
// MOCK DATA STORE (LOCAL STORAGE BACKUP)
// ==========================================
const INITIAL_MOCK_DATA = {
  users: [
    // --- أمناء الخدمة العامة (General Service Admins) ---
    { id: 'srv-000-1', name: 'أبونا بيشوي حليم', role: 'super_admin', phone: '01200000000', qr_code: 'QR-FATHER-BISHOY', class_id: 'all', title: 'كاهن الخدمة وأمين الخدمة' },
    { id: 'srv-000-2', name: 'يوسف جرجس', role: 'super_admin', phone: '01222222222', qr_code: 'QR-ADMIN-YOUSSEF', class_id: 'all', title: 'أمين الخدمة' },

    // --- 1. فصل سادسة ابتدائي ---
    { id: 'srv-601', name: 'إبتهاج سليم', role: 'class_admin', phone: '01200000601', qr_code: 'QR-SRV-601', class_id: 'grade-6', title: 'أمين فصل' },
    { id: 'srv-602', name: 'أبانوب روميل', role: 'assistant_admin', phone: '01200000602', qr_code: 'QR-SRV-602', class_id: 'grade-6', title: 'أمين فصل مساعد' },
    { id: 'srv-603', name: 'ماري منير', role: 'servant', phone: '01200000603', qr_code: 'QR-SRV-603', class_id: 'grade-6' },
    { id: 'srv-604', name: 'منى ميخائيل', role: 'servant', phone: '01200000604', qr_code: 'QR-SRV-604', class_id: 'grade-6' },
    { id: 'srv-605', name: 'إيريني يوسف', role: 'servant', phone: '01200000605', qr_code: 'QR-SRV-605', class_id: 'grade-6' },
    { id: 'srv-606', name: 'مرقس عادل', role: 'servant', phone: '01200000606', qr_code: 'QR-SRV-606', class_id: 'grade-6' },
    { id: 'srv-607', name: 'ماريان فيكتور', role: 'servant', phone: '01200000607', qr_code: 'QR-SRV-607', class_id: 'grade-6' },
    { id: 'srv-608', name: 'ليديا يعقوب', role: 'servant', phone: '01200000608', qr_code: 'QR-SRV-608', class_id: 'grade-6' },
    { id: 'srv-609', name: 'سيمون أيمن', role: 'servant', phone: '01200000609', qr_code: 'QR-SRV-609', class_id: 'grade-6' },
    { id: 'srv-610', name: 'يؤانا أبونا جورجيوس', role: 'servant', phone: '01200000610', qr_code: 'QR-SRV-610', class_id: 'grade-6' },
    { id: 'srv-611', name: 'ميرنا اسحاق', role: 'servant', phone: '01200000611', qr_code: 'QR-SRV-611', class_id: 'grade-6' },
    { id: 'srv-612', name: 'بافلي بيتر', role: 'servant', phone: '01200000612', qr_code: 'QR-SRV-612', class_id: 'grade-6' },
    { id: 'srv-613', name: 'كريم نشأت', role: 'servant', phone: '01200000613', qr_code: 'QR-SRV-613', class_id: 'grade-6' },
    { id: 'srv-614', name: 'مرقص القمص داود', role: 'servant', phone: '01200000614', qr_code: 'QR-SRV-614', class_id: 'grade-6' },

    // --- 2. فصل حضانة ---
    { id: 'srv-001', name: 'ماري ثروت', role: 'class_admin', phone: '01200000001', qr_code: 'QR-SRV-001', class_id: 'kg', title: 'أمين فصل' },
    { id: 'srv-002', name: 'أبانوب مدحت', role: 'assistant_admin', phone: '01200000002', qr_code: 'QR-SRV-002', class_id: 'kg', title: 'أمين فصل مساعد' },
    { id: 'srv-003', name: 'حنان بقطر', role: 'servant', phone: '01200000003', qr_code: 'QR-SRV-003', class_id: 'kg' },
    { id: 'srv-004', name: 'إيريني كريم', role: 'servant', phone: '01200000004', qr_code: 'QR-SRV-004', class_id: 'kg' },
    { id: 'srv-005', name: 'ماري ماهر', role: 'servant', phone: '01200000005', qr_code: 'QR-SRV-005', class_id: 'kg' },
    { id: 'srv-006', name: 'سارة اديب', role: 'servant', phone: '01200000006', qr_code: 'QR-SRV-006', class_id: 'kg' },
    { id: 'srv-007', name: 'جاكلين سعيد', role: 'servant', phone: '01200000007', qr_code: 'QR-SRV-007', class_id: 'kg' },
    { id: 'srv-008', name: 'احلام ناروز', role: 'servant', phone: '01200000008', qr_code: 'QR-SRV-008', class_id: 'kg' },
    { id: 'srv-009', name: 'سامية عادل', role: 'servant', phone: '01200000009', qr_code: 'QR-SRV-009', class_id: 'kg' },
    { id: 'srv-010', name: 'مارينا نصر', role: 'servant', phone: '01200000010', qr_code: 'QR-SRV-010', class_id: 'kg' },
    { id: 'srv-011', name: 'دولاجي', role: 'servant', phone: '01200000011', qr_code: 'QR-SRV-011', class_id: 'kg' },
    { id: 'srv-012', name: 'نجوى عادل', role: 'servant', phone: '01200000012', qr_code: 'QR-SRV-012', class_id: 'kg' },

    // --- 3. فصل أولى ابتدائي ---
    { id: 'srv-101', name: 'يوسف ماهر', role: 'class_admin', phone: '01200000101', qr_code: 'QR-SRV-101', class_id: 'grade-1', title: 'أمين فصل' },
    { id: 'srv-102', name: 'سهير حكيم', role: 'assistant_admin', phone: '01200000102', qr_code: 'QR-SRV-102', class_id: 'grade-1', title: 'أمين فصل مساعد' },
    { id: 'srv-103', name: 'مرثا منير', role: 'servant', phone: '01200000103', qr_code: 'QR-SRV-103', class_id: 'grade-1' },
    { id: 'srv-104', name: 'نيفين يسى', role: 'servant', phone: '01200000104', qr_code: 'QR-SRV-104', class_id: 'grade-1' },
    { id: 'srv-105', name: 'مريم حافظ', role: 'servant', phone: '01200000105', qr_code: 'QR-SRV-105', class_id: 'grade-1' },
    { id: 'srv-106', name: 'مارسيل', role: 'servant', phone: '01200000106', qr_code: 'QR-SRV-106', class_id: 'grade-1' },
    { id: 'srv-107', name: 'راندا عبد الملاك', role: 'servant', phone: '01200000107', qr_code: 'QR-SRV-107', class_id: 'grade-1' },
    { id: 'srv-108', name: 'رانيا نبيل', role: 'servant', phone: '01200000108', qr_code: 'QR-SRV-108', class_id: 'grade-1' },
    { id: 'srv-109', name: 'سارة بشرى', role: 'servant', phone: '01200000109', qr_code: 'QR-SRV-109', class_id: 'grade-1' },
    { id: 'srv-110', name: 'جرجس يعقوب', role: 'servant', phone: '01200000110', qr_code: 'QR-SRV-110', class_id: 'grade-1' },
    { id: 'srv-111', name: 'بيشوي نصر', role: 'servant', phone: '01200000111', qr_code: 'QR-SRV-111', class_id: 'grade-1' },
    { id: 'srv-112', name: 'ميريت أنور', role: 'servant', phone: '01200000112', qr_code: 'QR-SRV-112', class_id: 'grade-1' },
    { id: 'srv-113', name: 'نرمين ناروز', role: 'servant', phone: '01200000113', qr_code: 'QR-SRV-113', class_id: 'grade-1' },
    { id: 'srv-114', name: 'هايدي بقطر', role: 'servant', phone: '01200000114', qr_code: 'QR-SRV-114', class_id: 'grade-1' },

    // --- 4. فصل ثانية ابتدائي ---
    { id: 'srv-201', name: 'بنيامين اسطاسي', role: 'class_admin', phone: '01200000201', qr_code: 'QR-SRV-201', class_id: 'grade-2', title: 'أمين فصل' },
    { id: 'srv-202', name: 'مادونا زكريا', role: 'assistant_admin', phone: '01200000202', qr_code: 'QR-SRV-202', class_id: 'grade-2', title: 'أمين فصل مساعد' },
    { id: 'srv-203', name: 'دميانة سيفين', role: 'servant', phone: '01200000203', qr_code: 'QR-SRV-203', class_id: 'grade-2' },
    { id: 'srv-204', name: 'لليان جرجس', role: 'servant', phone: '01200000204', qr_code: 'QR-SRV-204', class_id: 'grade-2' },
    { id: 'srv-205', name: 'كرستين ميلاد', role: 'servant', phone: '01200000205', qr_code: 'QR-SRV-205', class_id: 'grade-2' },
    { id: 'srv-206', name: 'منيرفا', role: 'servant', phone: '01200000206', qr_code: 'QR-SRV-206', class_id: 'grade-2' },
    { id: 'srv-207', name: 'إيريني عبد الملاك', role: 'servant', phone: '01200000207', qr_code: 'QR-SRV-207', class_id: 'grade-2' },
    { id: 'srv-208', name: 'ميرفت ناجي', role: 'servant', phone: '01200000208', qr_code: 'QR-SRV-208', class_id: 'grade-2' },
    { id: 'srv-209', name: 'استر رأفت', role: 'servant', phone: '01200000209', qr_code: 'QR-SRV-209', class_id: 'grade-2' },
    { id: 'srv-210', name: 'فيرينا عادل', role: 'servant', phone: '01200000210', qr_code: 'QR-SRV-210', class_id: 'grade-2' },
    { id: 'srv-211', name: 'كيرلس مجدي', role: 'servant', phone: '01200000211', qr_code: 'QR-SRV-211', class_id: 'grade-2' },
    { id: 'srv-212', name: 'ماثيو القمص داود', role: 'servant', phone: '01200000212', qr_code: 'QR-SRV-212', class_id: 'grade-2' },
    { id: 'srv-213', name: 'انجي نبيل', role: 'servant', phone: '01200000213', qr_code: 'QR-SRV-213', class_id: 'grade-2' },
    { id: 'srv-214', name: 'نيفين نبيل', role: 'servant', phone: '01200000214', qr_code: 'QR-SRV-214', class_id: 'grade-2' },

    // --- 5. فصل ثالثة ابتدائي ---
    { id: 'srv-301', name: 'رشا تواضروس', role: 'class_admin', phone: '01200000301', qr_code: 'QR-SRV-301', class_id: 'grade-3', title: 'أمين فصل' },
    { id: 'srv-302', name: 'يوستينا سامح', role: 'assistant_admin', phone: '01200000302', qr_code: 'QR-SRV-302', class_id: 'grade-3', title: 'أمين فصل مساعد' },
    { id: 'srv-303', name: 'ماري ناجي', role: 'servant', phone: '01200000303', qr_code: 'QR-SRV-303', class_id: 'grade-3' },
    { id: 'srv-304', name: 'منال الغول', role: 'servant', phone: '01200000304', qr_code: 'QR-SRV-304', class_id: 'grade-3' },
    { id: 'srv-305', name: 'مدحت صفوت', role: 'servant', phone: '01200000305', qr_code: 'QR-SRV-305', class_id: 'grade-3' },
    { id: 'srv-306', name: 'مارفينا جرجس', role: 'servant', phone: '01200000306', qr_code: 'QR-SRV-306', class_id: 'grade-3' },
    { id: 'srv-307', name: 'إيريني يعقوب', role: 'servant', phone: '01200000307', qr_code: 'QR-SRV-307', class_id: 'grade-3' },
    { id: 'srv-308', name: 'صوفيا يسرى', role: 'servant', phone: '01200000308', qr_code: 'QR-SRV-308', class_id: 'grade-3' },
    { id: 'srv-309', name: 'مايفن ايمن', role: 'servant', phone: '01200000309', qr_code: 'QR-SRV-309', class_id: 'grade-3' },
    { id: 'srv-310', name: 'سلفانا صموئيل', role: 'servant', phone: '01200000310', qr_code: 'QR-SRV-310', class_id: 'grade-3' },
    { id: 'srv-311', name: 'ناردين أبونا بيشوي', role: 'servant', phone: '01200000311', qr_code: 'QR-SRV-311', class_id: 'grade-3' },
    { id: 'srv-312', name: 'مهرائيل هدرا', role: 'servant', phone: '01200000312', qr_code: 'QR-SRV-312', class_id: 'grade-3' },
    { id: 'srv-313', name: 'أميرة جميل', role: 'servant', phone: '01200000313', qr_code: 'QR-SRV-313', class_id: 'grade-3' },
    { id: 'srv-314', name: 'فريد إبراهيم', role: 'servant', phone: '01200000314', qr_code: 'QR-SRV-314', class_id: 'grade-3' },

    // --- 6. فصل رابعة ابتدائي ---
    { id: 'srv-401', name: 'سلوى عياد', role: 'class_admin', phone: '01200000401', qr_code: 'QR-SRV-401', class_id: 'grade-4', title: 'أمين فصل' },
    { id: 'srv-402', name: 'كيرلس الأمير', role: 'assistant_admin', phone: '01200000402', qr_code: 'QR-SRV-402', class_id: 'grade-4', title: 'أمين فصل مساعد' },
    { id: 'srv-403', name: 'مريم أبونا بيشوي', role: 'servant', phone: '01200000403', qr_code: 'QR-SRV-403', class_id: 'grade-4' },
    { id: 'srv-404', name: 'مارتينا روماني', role: 'servant', phone: '01200000404', qr_code: 'QR-SRV-404', class_id: 'grade-4' },
    { id: 'srv-405', name: 'سهير سمير', role: 'servant', phone: '01200000405', qr_code: 'QR-SRV-405', class_id: 'grade-4' },
    { id: 'srv-406', name: 'جورج صافي', role: 'servant', phone: '01200000406', qr_code: 'QR-SRV-406', class_id: 'grade-4' },
    { id: 'srv-407', name: 'ميرفت عزيز', role: 'servant', phone: '01200000407', qr_code: 'QR-SRV-407', class_id: 'grade-4' },
    { id: 'srv-408', name: 'تاسوني إيلين', role: 'servant', phone: '01200000408', qr_code: 'QR-SRV-408', class_id: 'grade-4' },
    { id: 'srv-409', name: 'كيرمينا جرجس', role: 'servant', phone: '01200000409', qr_code: 'QR-SRV-409', class_id: 'grade-4' },
    { id: 'srv-410', name: 'يوستينا ناصر', role: 'servant', phone: '01200000410', qr_code: 'QR-SRV-410', class_id: 'grade-4' },
    { id: 'srv-411', name: 'رانا رجائي', role: 'servant', phone: '01200000411', qr_code: 'QR-SRV-411', class_id: 'grade-4' },
    { id: 'srv-412', name: 'مارينا هاني', role: 'servant', phone: '01200000412', qr_code: 'QR-SRV-412', class_id: 'grade-4' },
    { id: 'srv-413', name: 'ساندي يعقوب', role: 'servant', phone: '01200000413', qr_code: 'QR-SRV-413', class_id: 'grade-4' },
    { id: 'srv-414', name: 'ماريان جوزيف', role: 'servant', phone: '01200000414', qr_code: 'QR-SRV-414', class_id: 'grade-4' },

    // --- 7. فصل خامسة ابتدائي ---
    { id: 'srv-501', name: 'مينا ساويروس', role: 'class_admin', phone: '01200000501', qr_code: 'QR-SRV-501', class_id: 'grade-5', title: 'أمين فصل' },
    { id: 'srv-502', name: 'دينا نبيل', role: 'assistant_admin', phone: '01200000502', qr_code: 'QR-SRV-502', class_id: 'grade-5', title: 'أمين فصل مساعد' },
    { id: 'srv-503', name: 'إيريني عبده', role: 'servant', phone: '01200000503', qr_code: 'QR-SRV-503', class_id: 'grade-5' },
    { id: 'srv-504', name: 'مارلين منير', role: 'servant', phone: '01200000504', qr_code: 'QR-SRV-504', class_id: 'grade-5' },
    { id: 'srv-505', name: 'مارينا أكرم', role: 'servant', phone: '01200000505', qr_code: 'QR-SRV-505', class_id: 'grade-5' },
    { id: 'srv-506', name: 'كريستين روميل', role: 'servant', phone: '01200000506', qr_code: 'QR-SRV-506', class_id: 'grade-5' },
    { id: 'srv-507', name: 'بيتر عماد', role: 'servant', phone: '01200000507', qr_code: 'QR-SRV-507', class_id: 'grade-5' },
    { id: 'srv-508', name: 'يواقيم إبراهيم', role: 'servant', phone: '01200000508', qr_code: 'QR-SRV-508', class_id: 'grade-5' },
    { id: 'srv-509', name: 'كيرمينا يسى', role: 'servant', phone: '01200000509', qr_code: 'QR-SRV-509', class_id: 'grade-5' },
    { id: 'srv-510', name: 'مارفيا هاني', role: 'servant', phone: '01200000510', qr_code: 'QR-SRV-510', class_id: 'grade-5' },
    { id: 'srv-511', name: 'ماريهان روماني', role: 'servant', phone: '01200000511', qr_code: 'QR-SRV-511', class_id: 'grade-5' },
    { id: 'srv-512', name: 'يونا جمال', role: 'servant', phone: '01200000512', qr_code: 'QR-SRV-512', class_id: 'grade-5' },
    { id: 'srv-513', name: 'مهرائيل جرجس', role: 'servant', phone: '01200000513', qr_code: 'QR-SRV-513', class_id: 'grade-5' },
  ],
  attendance_logs: [],
  points_ledger: []
};

// Initialize Mock Storage (forced refresh if old dataset exists or roles need sync)
const getMockData = () => {
  const data = localStorage.getItem('sunday_school_db');
  if (!data) {
    localStorage.setItem('sunday_school_db', JSON.stringify(INITIAL_MOCK_DATA));
    return INITIAL_MOCK_DATA;
  }
  let parsed = JSON.parse(data);
  let updated = false;

  // Purge any legacy demo students starting with 'stu-'
  if (parsed.users) {
    const hasDemoStudents = parsed.users.some(u => u.id?.startsWith('stu-') || u.qr_code?.startsWith('QR-STU-'));
    if (hasDemoStudents) {
      parsed.users = parsed.users.filter(u => !(u.id?.startsWith('stu-') || u.qr_code?.startsWith('QR-STU-')));
      parsed.attendance_logs = [];
      parsed.points_ledger = [];
      updated = true;
    }
  }

  // Ensure pre-seeded servants and super admins exist in storage and have updated roles/titles
  if (!parsed.users) {
    parsed.users = [...INITIAL_MOCK_DATA.users];
    updated = true;
  } else {
    // Sync roles and titles for pre-seeded users without deleting user-added users
    INITIAL_MOCK_DATA.users.forEach(initUser => {
      const existing = parsed.users.find(u => u.qr_code === initUser.qr_code || u.id === initUser.id);
      if (existing) {
        if (existing.role !== initUser.role || existing.title !== initUser.title || existing.class_id !== initUser.class_id) {
          existing.role = initUser.role;
          existing.title = initUser.title;
          existing.class_id = initUser.class_id;
          updated = true;
        }
      } else {
        parsed.users.push(initUser);
        updated = true;
      }
    });
  }

  if (updated) {
    localStorage.setItem('sunday_school_db', JSON.stringify(parsed));
  }
  return parsed;
};

// طلب 2026-09-19: Mr. Gerges لاحظ إن أرقام تليفونات الخدام بترجع تتغير لأرقام
// وهمية (زي 01200000601) من وقت للتاني. السبب مكانش schema.sql (اللي أصلاً
// اتصلح ومحمي من أول الجلسة دي بـ IF NOT EXISTS) — السبب الحقيقي كان هنا:
// زرار "تحديث الكشوفات 🔄" في شاشة "إدارة المستخدمين" (`UserManagement.jsx`)
// كان بينادي على الدالة دي، واللي كانت بتعمل `upsert` (تحديث لو الكود موجود)
// لكل الـ~96 شخص بأرقامهم الوهمية الأصلية من `INITIAL_MOCK_DATA` فوق، على
// قاعدة البيانات الحقيقية على Supabase — يعني أي ضغطة على الزرار ده كانت
// بتمسح أي رقم تليفون حقيقي اتسجل بعد كده وترجعه للرقم الوهمي، لكل الـ96
// شخص دفعة واحدة، من غير أي تحذير. الحل: `ignoreDuplicates: true` يخلي
// الحفظ ده "إضافة الناقص بس" (INSERT ... ON CONFLICT DO NOTHING) بدل
// "تحديث كل حاجة" — فأي شخص موجود أصلاً (زي كل الـ96) يتجاهل تمامًا ومفيش
// حاجة فيه (لا الاسم ولا الدور ولا رقم التليفون) بتتلمس، والزرار يفضل مفيد
// بس لو حد من القائمة الأصلية اتمسح بالغلط ومحتاج يترجع.
export const resetMockData = async () => {
  localStorage.setItem('sunday_school_db', JSON.stringify(INITIAL_MOCK_DATA));

  if (isSupabaseConfigured()) {
    try {
      // Format users for Supabase insertion (excluding local auto-ids if needed)
      const usersToInsert = INITIAL_MOCK_DATA.users.map(u => ({
        name: u.name,
        role: u.role,
        phone: u.phone,
        qr_code: u.qr_code,
        class_id: u.class_id,
        title: u.title || null
      }));

      await supabase.from('users').upsert(usersToInsert, { onConflict: 'qr_code', ignoreDuplicates: true });
    } catch (err) {
      console.warn("Supabase auto-seed warning:", err);
    }
  }

  return INITIAL_MOCK_DATA;
};

const saveMockData = (data) => {
  localStorage.setItem('sunday_school_db', JSON.stringify(data));
};

// ==========================================
// SUPABASE API FUNCTIONS
// ==========================================

// طلب 2026-09-20 (نسخة ثانية، نفس اليوم): حضور الخدام (class_admin /
// assistant_admin / servant) بقى حصريًا في يد أمين الخدمة العامة بس —
// سواء اتسجل باختيار الاسم من القائمة اليدوية أو بمسح كارت الـQR بتاعه
// بالكاميرا. `viewer` هنا بيسمح بفحص سريع وبرسالة واضحة قبل حتى ما نحاول
// الإدراج (وده اللي بيحمي وضع mock/local بردو، اللي مفيهوش قاعدة بيانات
// حقيقية تطبق سياسة RLS) — الحماية الحقيقية اللي معاها مفيش طريقة تتلف
// عليها هي سياسة "Staff can record attendance" في schema.sql، اللي بترفض
// الإدراج فعليًا على مستوى قاعدة البيانات إلا لو الشخص المسجَّل حضوره
// مخدوم، أو الشخص المسجِّل نفسه أمين الخدمة العامة.
export async function recordAttendance(qrCodeStr, viewer = null) {
  if (isSupabaseConfigured()) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('qr_code', qrCodeStr)
      .single();

    // Only report "QR code not registered" when the query genuinely found no
    // matching user (PGRST116 = no rows for .single()). Any other error
    // (network drop, RLS denial, timeout, ...) used to be mislabeled the
    // same way, which was confusing during a live scanning session.
    if (userError && userError.code !== 'PGRST116') {
      throw new Error('تعذر الاتصال بقاعدة البيانات، حاول مرة أخرى');
    }
    if (userError || !user) throw new Error('رمز QR غير مسجل في النظام');

    if (user.role !== 'student' && viewer && viewer.role !== 'super_admin') {
      throw new Error('غير مصرح لك بتسجيل حضور خادم — تسجيل حضور الخدام لأمين الخدمة العامة فقط');
    }

    // Both inserts below share this exact timestamp (rather than each calling
    // `new Date().toISOString()` separately) so the attendance record and its
    // points-ledger entry are tied to the same instant — and so the caller
    // can hand this same timestamp back to cancelAttendance() / compare it
    // against a freshly-refetched attendance_logs row to confirm "this is
    // still the same record I just created" before undoing it.
    const timestamp = new Date().toISOString();

    const { data: attData, error: attError } = await supabase
      .from('attendance_logs')
      .insert([{ user_id: user.id, timestamp }])
      .select()
      .single();

    if (attError) throw attError;

    let pointsAdded = 0;
    let pointsLedgerId = null;
    if (user.role === 'student') {
      pointsAdded = 10;
      const { data: ledgerData, error: ledgerError } = await supabase
        .from('points_ledger')
        .insert([{
          student_id: user.id,
          amount: pointsAdded,
          reason: 'حضور اجتماع مدارس الأحد (رمز QR)',
          servant_id: 'system',
          created_at: timestamp
        }])
        .select()
        .single();

      if (ledgerError) console.error('Failed to add attendance points:', ledgerError);
      else pointsLedgerId = ledgerData?.id ?? null;
    }

    return { success: true, user, pointsAdded, attendanceLogId: attData?.id ?? null, pointsLedgerId, timestamp };
  } else {
    const db = getMockData();
    const user = db.users.find(u => u.qr_code === qrCodeStr);

    if (!user) {
      throw new Error('رمز QR غير مسجل في النظام');
    }

    if (user.role !== 'student' && viewer && viewer.role !== 'super_admin') {
      throw new Error('غير مصرح لك بتسجيل حضور خادم — تسجيل حضور الخدام لأمين الخدمة العامة فقط');
    }

    const timestamp = new Date().toISOString();
    const attRecord = {
      id: `att-${Date.now()}`,
      user_id: user.id,
      timestamp
    };
    db.attendance_logs.push(attRecord);

    let pointsAdded = 0;
    let pointsLedgerId = null;
    if (user.role === 'student') {
      pointsAdded = 10;
      pointsLedgerId = `pt-${Date.now()}`;
      db.points_ledger.push({
        id: pointsLedgerId,
        student_id: user.id,
        amount: 10,
        reason: 'حضور اجتماع مدارس الأحد (رمز QR)',
        servant_id: 'system',
        created_at: timestamp
      });
    }

    saveMockData(db);
    return { success: true, user, pointsAdded, attendanceLogId: attRecord.id, pointsLedgerId, timestamp };
  }
}

// طلب 2026-09-20: تراجع عن آخر دوسة حضور غلط — بيتحذف سجل الحضور (وبتاع
// النقاط معاه لو كان الشخص مخدوم) بالـ id اللي رجّعه recordAttendance بالظبط،
// مش "آخر سجل حضور في الداتابيز" بشكل عام. كده مش هيتمسح غلط سجل حضور حقيقي
// اتسجل فعلاً (بالماسح أو QR) قبل كده — بس اللي أنا نفسي سجلته دلوقتي وغلطت فيه.
export async function cancelAttendance({ attendanceLogId, pointsLedgerId } = {}) {
  if (!attendanceLogId) throw new Error('لا يوجد سجل حضور يتم التراجع عنه');

  if (isSupabaseConfigured()) {
    const { error: attError } = await supabase
      .from('attendance_logs')
      .delete()
      .eq('id', attendanceLogId);

    if (attError) throw attError;

    if (pointsLedgerId) {
      const { error: ledgerError } = await supabase
        .from('points_ledger')
        .delete()
        .eq('id', pointsLedgerId);

      if (ledgerError) console.error('Failed to remove attendance points on undo:', ledgerError);
    }

    return { success: true };
  } else {
    const db = getMockData();
    db.attendance_logs = db.attendance_logs.filter(l => l.id !== attendanceLogId);
    if (pointsLedgerId) {
      db.points_ledger = db.points_ledger.filter(p => p.id !== pointsLedgerId);
    }
    saveMockData(db);
    return { success: true };
  }
}

// طلب 2026-09-20: لوحة الصدارة بقى فيها فرض حقيقي على الفصل من قاعدة
// البيانات، مش بس فلتر واجهة — الفلتر القديم كان بيسمح لأي خادم إنه يشوف
// نقاط فصل تاني غير فصله بمجرد ما يغيّر الاختيار من القائمة، لأن سياسات
// RLS ("Staff can view all users"/"Staff can view all points") بتسمح لأي
// عضو طاقم بقراءة أي فصل، ومفيش حاجة كانت بتفرض إن الفصل المطلوب هو فصله
// هو بالظبط. get_class_points_leaderboard() في schema.sql بتتجاهل أي
// classId متبعت لو الطالب مش super_admin، وتفرض current_user_class_id()
// بدالها — فمينفعش تتلف عليها حتى باستدعاء الـAPI مباشرة.
// `viewer` هنا بيستخدم في mock/local mode بس لتقليد نفس الفرض، زي باقي
// الدوال المشابهة في الملف ده.
export async function getClassLeaderboard(classId = 'grade-5', viewer = null) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('get_class_points_leaderboard', { p_class_id: classId });
    if (error) throw new Error(error.message || 'تعذر تحميل لوحة الصدارة');
    return (data || []).map(row => ({ ...row, total_points: Number(row.total_points) || 0 }));
  }

  const db = getMockData();
  const effectiveClassId = (viewer && viewer.role !== 'super_admin') ? viewer.class_id : classId;
  const classStudents = db.users.filter(u => u.role === 'student' && u.class_id === effectiveClassId);

  return classStudents.map(student => {
    const totalPoints = db.points_ledger
      .filter(entry => entry.student_id === student.id)
      .reduce((sum, entry) => sum + Number(entry.amount), 0);
    return { ...student, total_points: totalPoints };
  }).sort((a, b) => b.total_points - a.total_points);
}

// طلب 2026-09-20: تاب "الحضور" جوه لوحة الصدارة — بيرتب مخدومين الفصل
// بنسبة حضورهم من تاريخ انضمامهم (مش عدد مرات خام)، عشان مخدوم منضم حديثًا
// ما يتظلمش بإنه "أقل حضورًا" من واحد قاعد في الخدمة من سنين. الواجهة
// بتستخدم نفس القايمة دي مرتين: زي ما هي لـ"الأكثر حضورًا"، ومقلوبة
// لـ"الأقل حضورًا". نفس فرض الفصل اللي في getClassLeaderboard() فوق —
// enforced server-side جوه get_class_attendance_ranking() في schema.sql.
export async function getClassAttendanceRanking(classId = 'grade-5', viewer = null) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('get_class_attendance_ranking', { p_class_id: classId });
    if (error) throw new Error(error.message || 'تعذر تحميل ترتيب الحضور');
    return (data || []).map(row => ({
      ...row,
      elapsed_weeks: Number(row.elapsed_weeks) || 0,
      attended_weeks: Number(row.attended_weeks) || 0,
      attendance_percent: row.attendance_percent === null ? null : Number(row.attendance_percent)
    }));
  }

  const db = getMockData();
  const effectiveClassId = (viewer && viewer.role !== 'super_admin') ? viewer.class_id : classId;
  const classStudents = db.users.filter(u => u.role === 'student' && u.class_id === effectiveClassId);
  const now = Date.now();

  return classStudents
    .map(student => {
      // Mock data's hardcoded users don't carry a real created_at, so a
      // missing one falls back to 8 weeks ago rather than "now" — otherwise
      // elapsed_weeks would always be 0 and nobody would ever show up here
      // in local/mock mode.
      const createdAt = student.created_at ? new Date(student.created_at).getTime() : (now - 8 * 604800000);
      const elapsedWeeks = Math.max(0, Math.floor((now - createdAt) / 604800000));
      const attendedWeeksSet = new Set(
        db.attendance_logs
          .filter(a => a.user_id === student.id && new Date(a.timestamp).getTime() >= createdAt)
          .map(a => Math.floor((new Date(a.timestamp).getTime() - createdAt) / 604800000))
      );
      return {
        id: student.id,
        name: student.name,
        qr_code: student.qr_code,
        elapsed_weeks: elapsedWeeks,
        attended_weeks: attendedWeeksSet.size,
        attendance_percent: elapsedWeeks > 0 ? Math.round((attendedWeeksSet.size / elapsedWeeks) * 1000) / 10 : null
      };
    })
    .filter(row => row.elapsed_weeks > 0)
    .sort((a, b) => b.attendance_percent - a.attendance_percent);
}

export async function addManualPoints(studentId, amount, reason, servantId) {
  if (!reason || reason.trim() === '') {
    throw new Error('سبب إضافة/خصم النقاط مطلوب للأرشيف');
  }

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('points_ledger')
      .insert([{
        student_id: studentId,
        amount: Number(amount),
        reason: reason.trim(),
        servant_id: servantId,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return data[0];
  } else {
    const db = getMockData();
    const newEntry = {
      id: `pt-${Date.now()}`,
      student_id: studentId,
      amount: Number(amount),
      reason: reason.trim(),
      servant_id: servantId || 'srv-501',
      created_at: new Date().toISOString()
    };
    db.points_ledger.push(newEntry);
    saveMockData(db);
    return newEntry;
  }
}

export async function getStudentBalance(studentId) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('points_ledger')
      .select('amount')
      .eq('student_id', studentId);

    if (error) throw error;
    return data.reduce((sum, item) => sum + Number(item.amount), 0);
  } else {
    const db = getMockData();
    return db.points_ledger
      .filter(item => item.student_id === studentId)
      .reduce((sum, item) => sum + Number(item.amount), 0);
  }
}

// Class-scoped absence report: a class admin, assistant admin, or plain
// servant should only ever see (and follow up on) the students AND fellow
// servants of their OWN class — never another class's people, and never
// another servant outside their class. Only super_admin sees everyone.
//
// `viewer` is only used in local/mock mode (no real Supabase project) to
// replicate that scoping client-side, since there's no real server-side
// login there to check. When talking to a real Supabase project, the
// scoping is enforced *server-side* inside the get_absence_report() SQL
// function (see schema.sql) based on who's actually logged in — so it
// can't be bypassed by calling the API directly, regardless of what the
// app's UI does or doesn't show.
// طلب 2026-09-20: سجل الافتقاد بقى حصري لأمين الخدمة العامة بس — كان متاحًا
// لأمين الفصل والمساعد كمان (لفصلهم بس) قبل كده. الإنفورسمنت الحقيقي في
// get_absence_report() في schema.sql (بترفض أي حد مش super_admin)؛ هنا في
// mock mode بنكرر نفس الرفض عشان لو حد جرب يفتح الشاشة محليًا من غير
// Supabase يشوف نفس السلوك بالظبط.
export async function getAbsenceReport(minWeeksAbsent = 2, viewer = null) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('get_absence_report', { min_weeks: minWeeksAbsent });
    if (error) throw new Error(error.message || 'تعذر تحميل سجل الافتقاد');
    return (data || []).map(row => ({
      ...row,
      last_attended: row.last_attended_at ? new Date(row.last_attended_at).toLocaleDateString('ar-EG') : 'لم يحضر من قبل'
    }));
  }

  if (viewer && viewer.role !== 'super_admin') {
    throw new Error('غير مصرح لك بعرض سجل الافتقاد — الشاشة دي لأمين الخدمة العامة فقط');
  }

  const db = getMockData();
  const users = db.users.filter(u => u.role !== 'super_admin');

  const logs = db.attendance_logs;
  const now = new Date();

  return users.map(person => {
    const personLogs = logs
      .filter(l => l.user_id === person.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const lastAttended = personLogs[0] ? new Date(personLogs[0].timestamp) : null;
    let weeksAbsent = 0;

    if (!lastAttended) {
      weeksAbsent = 4;
    } else {
      const diffDays = Math.floor((now - lastAttended) / (1000 * 60 * 60 * 24));
      weeksAbsent = Math.floor(diffDays / 7);
    }

    return {
      ...person,
      last_attended: lastAttended ? lastAttended.toLocaleDateString('ar-EG') : 'لم يحضر من قبل',
      weeks_absent: weeksAbsent
    };
  }).filter(s => s.weeks_absent >= minWeeksAbsent)
    .sort((a, b) => b.weeks_absent - a.weeks_absent);
}

// Class-scoped student roster: used by ManualPointsTool.jsx so a servant /
// class admin / assistant admin can only pick a student to give points to
// from their OWN class — never a student who belongs to a different class.
// Only super_admin gets the full student roster.
//
// `viewer` is only used in local/mock mode to replicate that scoping
// client-side, since there's no real server-side login there to check.
// Against a real Supabase project the scoping is enforced *server-side*
// inside get_scoped_students() (see schema.sql) based on who's actually
// logged in, so it can't be bypassed by calling the API directly.
export async function getScopedStudents(viewer = null) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('get_scoped_students');
    if (error) throw new Error(error.message || 'تعذر تحميل قائمة المخدومين');
    return data || [];
  }

  const db = getMockData();
  let students = db.users.filter(u => u.role === 'student');
  if (viewer && viewer.role !== 'super_admin' && viewer.class_id) {
    students = students.filter(s => s.class_id === viewer.class_id);
  }
  return students.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}

// Class-scoped roster for QRScanner.jsx's manual/no-camera picker tab
// ("تسجيل الحضور يدويًا") — used to record attendance by picking a card
// instead of scanning with the camera.
//   - servant / class_admin / assistant_admin -> مخدومين AND خدام of their
//                                       own class, all equally (as of
//                                       2026-09-20 — a plain servant used to
//                                       see مخدومين only)
//   - super_admin                   -> everyone (not currently reachable from
//                                       the app's UI, which never gives
//                                       super_admin a "scanner" tab — kept
//                                       for consistency with every other
//                                       scoped function here)
//
// `viewer` is only used in local/mock mode to replicate that scoping
// client-side, since there's no real server-side login there to check.
// Against a real Supabase project the scoping is enforced *server-side*
// inside get_manual_attendance_roster() (see schema.sql) based on who's
// actually logged in, so it can't be bypassed by calling the API directly.
//
// طلب 2026-09-20 (نسخة ثانية، نفس اليوم): servant / class_admin /
// assistant_admin كلهم بيشوفوا مخدومين فصلهم بس تاني — أي حاجة تخص خدام
// تانيين (بياناتهم أو تسجيل حضورهم) بقت حصرية لأمين الخدمة العامة بس.
export async function getManualAttendanceRoster(viewer = null) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('get_manual_attendance_roster');
    if (error) throw new Error(error.message || 'تعذر تحميل قائمة تسجيل الحضور اليدوي');
    return data || [];
  }

  const db = getMockData();
  let roster = db.users.filter(u => u.role !== 'super_admin');
  if (viewer && viewer.role !== 'super_admin') {
    roster = roster.filter(u => u.role === 'student' && u.class_id === viewer.class_id);
  }
  return roster.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}

// Add a new student (إضافة مخدوم جديد) — servant / class_admin /
// assistant_admin / super_admin (as of 2026-09-20; a plain servant used to
// have no access to this at all). servant/class_admin/assistant_admin always
// add into THEIR OWN class; super_admin must specify which class. Against a
// real Supabase project this is enforced *server-side* inside
// add_scoped_student() (see schema.sql) — it generates the new person's
// qr_code/username itself and can't be bypassed by calling the API directly
// (e.g. to add a non-student, or into another class). `viewer` is only used
// in local/mock mode to replicate that scoping client-side, since there's no
// real server-side login there.
export async function addScopedStudent({ name, phone, class_id } = {}, viewer = null) {
  const cleanName = (name || '').trim();
  if (!cleanName) {
    throw new Error('اسم المخدوم مطلوب');
  }
  const cleanPhone = (phone || '').trim();

  if (isSupabaseConfigured()) {
    const params = { p_name: cleanName, p_phone: cleanPhone || null };
    if (viewer && viewer.role === 'super_admin') {
      params.p_class_id = class_id || null;
    }
    const { data, error } = await supabase.rpc('add_scoped_student', params);
    if (error) throw new Error(error.message || 'تعذر إضافة المخدوم');
    return data && data[0];
  }

  const db = getMockData();
  const resolvedClassId = (viewer && viewer.role === 'super_admin')
    ? (class_id || 'grade-5')
    : (viewer?.class_id || 'grade-5');
  const qrCode = `QR-STU-${Math.floor(10000 + Math.random() * 90000)}`;
  const username = qrCode.replace('QR-', '').replace(/-/g, '');
  const newStudent = {
    id: `usr-${Date.now()}`,
    name: cleanName,
    role: 'student',
    phone: cleanPhone || null,
    class_id: resolvedClassId,
    title: 'مخدوم',
    qr_code: qrCode,
    username,
    created_at: new Date().toISOString()
  };
  db.users.push(newStudent);
  saveMockData(db);
  return newStudent;
}

// Real dashboard stats: total points ever awarded, and the % of students
// who attended within the last 7 days. Previously these were hardcoded
// to 0 / 100% in Analytics.jsx and never reflected real data.
export async function getServiceStats() {
  const fetchAllData = async () => {
    if (isSupabaseConfigured()) {
      const { data: students } = await supabase.from('users').select('id').eq('role', 'student');
      const { data: logs } = await supabase.from('attendance_logs').select('user_id, timestamp');
      const { data: ledger } = await supabase.from('points_ledger').select('amount');
      return { students: students || [], logs: logs || [], ledger: ledger || [] };
    } else {
      const db = getMockData();
      return {
        students: db.users.filter(u => u.role === 'student'),
        logs: db.attendance_logs,
        ledger: db.points_ledger
      };
    }
  };

  const { students, logs, ledger } = await fetchAllData();

  const totalPointsDistributed = ledger
    .filter(entry => Number(entry.amount) > 0)
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const now = new Date();
  const studentsAttendedThisWeek = new Set(
    logs
      .filter(l => (now - new Date(l.timestamp)) / (1000 * 60 * 60 * 24) < 7)
      .map(l => l.user_id)
  );
  const presentCount = students.filter(s => studentsAttendedThisWeek.has(s.id)).length;
  const attendanceRate = students.length > 0
    ? `${Math.round((presentCount / students.length) * 100)}%`
    : '0%';

  return { totalPointsDistributed, attendanceRate };
}

// Note: WhatsApp sending for absence follow-up is handled by
// src/components/common/WhatsAppModal.jsx (which lets the servant pick a
// template and edit it). A duplicate sendWhatsAppEfteqad() used to live
// here, unused by anything — removed to avoid two diverging copies of the
// same feature.

export async function getUsers() {
  if (isSupabaseConfigured()) {
    // Note: previously this swallowed any Supabase error/timeout and silently
    // fell back to local mock data, which could make the UI show a stale
    // local list while the real database has different data. Now a real
    // connection/database error is surfaced to the caller instead of hidden.
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data || [];
  }
  return getMockData().users;
}

// Raw attendance log rows (just user_id + timestamp), for screens that need
// to work out "attended recently" per-person themselves — e.g. أمين الخدمة
// العامة's class-roster view in Analytics.jsx, which shows حاضر/غايب for
// every servant and مخدوم inside a class. Only staff roles can read this
// (RLS's "Staff can view all attendance" policy — see schema.sql), which is
// fine since every caller of this function is already staff-only screens.
export async function getAttendanceLogs() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('attendance_logs').select('user_id, timestamp');
    if (error) throw error;
    return data || [];
  }
  return getMockData().attendance_logs;
}

// سجل غياب وحضور الخدام (super_admin فقط) — بيرجع لكل خادم (أمين فصل / أمين
// فصل مساعد / خادم عادي، من غير super_admin نفسه لأنه مش "خادم") عدد جُمع
// موسم المتابعة اللي حضرها من إجمالي الجُمع اللي عدّت لحد دلوقتي.
//
// الموسم: مدارس الأحد بتقابل يوم الجمعة الساعة 5:30 عصرًا، وموسم المتابعة ده
// بيبدأ من جمعة 25 سبتمبر 2026 لغاية جمعة 18 سبتمبر 2027 — نفس التواريخ
// المحسوبة *سيرفر سايد* جوه get_servant_attendance_log() في schema.sql
// (SECURITY DEFINER بترفض أي حد مش super_admin)، فمينفعش حد يشوف الداتا دي
// أو يتلاعب بيها من غير ما يبقى فعلاً أمين خدمة عامة.
//
// `viewer` مستخدم بس في وضع التجربة المحلي (بدون Supabase حقيقي) عشان نكرر
// نفس حساب الموسم client-side، لأنه مفيش سيرفر حقيقي هناك يتأكد بيه.
export async function getServantAttendanceLog() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('get_servant_attendance_log');
    if (error) throw new Error(error.message || 'تعذر تحميل سجل حضور الخدام');
    return data || [];
  }

  const db = getMockData();
  const SEASON_START = new Date('2026-09-25T00:00:00');
  const SEASON_END = new Date('2027-09-18T00:00:00');
  const now = new Date();
  const effectiveEnd = now < SEASON_END ? now : SEASON_END;

  const fridays = [];
  if (effectiveEnd >= SEASON_START) {
    for (let d = new Date(SEASON_START); d <= effectiveEnd; d.setDate(d.getDate() + 7)) {
      fridays.push(new Date(d).toDateString());
    }
  }
  const fridaySet = new Set(fridays);

  const servants = db.users.filter(u => ['class_admin', 'assistant_admin', 'servant'].includes(u.role));

  return servants.map(s => {
    const attendedFridaySet = new Set(
      db.attendance_logs
        .filter(l => l.user_id === s.id)
        .map(l => new Date(l.timestamp).toDateString())
        .filter(dateStr => fridaySet.has(dateStr))
    );
    const attended = attendedFridaySet.size;
    return {
      id: s.id,
      name: s.name,
      role: s.role,
      class_id: s.class_id,
      qr_code: s.qr_code,
      total_fridays: fridays.length,
      attended_fridays: attended,
      attendance_percent: fridays.length === 0 ? 0 : Math.round((attended / fridays.length) * 1000) / 10
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}

// Generates the same style of short login username used for the existing
// roster (see schema.sql's backfill): "ADM01", "ADM02"... for general
// service admins, and the QR code with "QR-" and dashes stripped for
// everyone else (e.g. QR-SRV-601 -> SRV601) — so it's always unique and
// always matches the code already printed on that person's QR card.
async function generateUsername(role, qrCode) {
  if (role === 'super_admin') {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('users').select('username').ilike('username', 'ADM%');
      if (error) throw error;
      const nums = (data || [])
        .map(u => parseInt(String(u.username || '').replace(/[^0-9]/g, ''), 10))
        .filter(n => Number.isFinite(n));
      const next = (nums.length ? Math.max(...nums) : 0) + 1;
      return `ADM${String(next).padStart(2, '0')}`;
    }
    const db = getMockData();
    const nums = db.users
      .map(u => /^ADM(\d+)$/.exec(u.username || ''))
      .filter(Boolean)
      .map(m => parseInt(m[1], 10));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return `ADM${String(next).padStart(2, '0')}`;
  }
  return String(qrCode).toUpperCase().replace(/^QR-/, '').replace(/-/g, '');
}

export async function saveUser(userData) {
  const generatedQrCode = userData.qr_code || `QR-${userData.role === 'student' ? 'STU' : 'SRV'}-${Math.floor(10000 + Math.random() * 90000)}`;

  // New person, no username set yet (editing an existing person keeps
  // their current username untouched — only a brand-new row gets one).
  let generatedUsername = userData.username;
  if (!userData.id && !generatedUsername) {
    generatedUsername = await generateUsername(userData.role, generatedQrCode);
  }

  const payload = {
    ...userData,
    qr_code: generatedQrCode,
    ...(generatedUsername ? { username: generatedUsername } : {})
  };

  if (isSupabaseConfigured()) {
    // Note: previously a Supabase error here was swallowed and the save
    // silently redirected to local mock data — meaning a servant could see
    // "saved" while the real database never received the change. Now the
    // error is thrown so the UI can tell the user the save actually failed.
    if (payload.id) {
      const { data, error } = await supabase.from('users').update(payload).eq('id', payload.id).select();
      if (error) throw error;
      return data[0];
    } else {
      const { data, error } = await supabase.from('users').insert([payload]).select();
      if (error) throw error;
      return data[0];
    }
  }

  const db = getMockData();
  let resultUser = payload;

  if (payload.id) {
    const index = db.users.findIndex(u => u.id === payload.id);
    if (index !== -1) db.users[index] = { ...db.users[index], ...payload };
  } else {
    resultUser = {
      ...payload,
      id: `usr-${Date.now()}`
    };
    db.users.push(resultUser);
  }

  saveMockData(db);
  return resultUser;
}

export async function deleteUser(userId) {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
  } else {
    const db = getMockData();
    db.users = db.users.filter(u => u.id !== userId);
    saveMockData(db);
  }
}

export async function getStudentHistory(studentId) {
  if (isSupabaseConfigured()) {
    const { data: ledger, error } = await supabase
      .from('points_ledger')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ledger;
  } else {
    const db = getMockData();
    return db.points_ledger
      .filter(p => p.student_id === studentId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}

// ==========================================
// REAL LOGIN (username + self-chosen password)
// ==========================================
// Supabase Auth is built around email/password, so a short username like
// "ADM01" is mapped to a fake internal email behind the scenes — nobody
// ever sees or uses that email, they only ever type their username.
const AUTH_EMAIL_DOMAIN = 'sundayschool.local';
const usernameToEmail = (username) => `${String(username || '').trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;

// Looks up a person by their short login username (e.g. "ADM01", "SRV601").
// Returns null if no such username exists. Used both to show "is this you?"
// before asking for a password, and to tell a first-time login apart from
// a returning one (profile.has_password).
//
// This goes through the find_login_account() database function instead of
// selecting from `users` directly — once RLS is locked down, a logged-out
// visitor has no direct read access to the users table at all (that's the
// point), so the lookup needed for login itself has to go through a
// narrow function that only ever returns the few non-sensitive fields
// needed to show "is this you?" (never phone numbers, never the QR code).
export async function findUserByUsername(username) {
  const clean = String(username || '').trim().toUpperCase();
  if (!clean) return null;

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('find_login_account', { p_username: clean });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return row || null;
  }

  const db = getMockData();
  const found = db.users.find(u => (u.username || '').toUpperCase() === clean);
  return found ? { ...found, has_password: !!found.auth_user_id } : null;
}

// First-time login: creates the person's own Supabase Auth account with the
// password THEY choose (never set by an admin), then links it to their
// existing row in `users` via the claim_login_account() database function
// (runs as the now-signed-in person; it's the only way to set auth_user_id
// once direct writes to `users` are locked down to super_admin only).
export async function claimAccount(username, password) {
  if (!isSupabaseConfigured()) {
    throw new Error('تسجيل الدخول الحقيقي غير متاح في وضع التجربة المحلي (بدون إعداد Supabase)');
  }

  const profile = await findUserByUsername(username);
  if (!profile) throw new Error('الكود غير موجود، تأكد منه أو راجع أمين الخدمة');
  if (profile.has_password) {
    throw new Error('تم إنشاء كلمة سر لهذا الكود من قبل — سجّل الدخول بدل إنشاء حساب جديد');
  }

  let { data, error } = await supabase.auth.signUp({
    email: usernameToEmail(username),
    password
  });

  if (error) {
    // A previous "claim account" attempt for this exact username can have
    // already created the Auth account successfully and then failed on the
    // next step (linking it to the users row — e.g. the claim_login_account
    // ambiguous-column bug fixed today), leaving an orphaned Auth account
    // with no linked profile. Retrying signUp() then correctly reports
    // "already registered" even though the person never finished setting
    // up their account. Recover automatically by signing straight in with
    // the password they just typed — this succeeds if it matches whatever
    // they typed on that earlier, interrupted attempt.
    const alreadyRegistered = /already registered|already exists/i.test(error.message || '');
    if (!alreadyRegistered) {
      throw new Error(error.message || 'تعذر إنشاء الحساب');
    }

    const signInResult = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password
    });
    if (signInResult.error) {
      throw new Error('فيه محاولة سابقة لإنشاء حساب بالكود ده بكلمة سر مختلفة عن اللي كتبتها دلوقتي. جرب كلمة السر اللي استخدمتها في المحاولة الأولى، أو كلم أمين الخدمة عشان يمسح الحساب القديم من Supabase (Authentication > Users) وتبدأ من جديد');
    }
    data = signInResult.data;
  }

  if (!data.user) throw new Error('تعذر إنشاء الحساب، حاول مرة أخرى');

  // If the Supabase project still requires email confirmation, signUp()
  // won't return an active session yet. Try signing straight in — this
  // only succeeds once "Confirm email" has been turned off for this
  // project (see the setup note in the audit doc).
  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password
    });
    if (signInError) {
      throw new Error('تم إنشاء الحساب، لكن لازم تلغي تفعيل "Confirm email" من إعدادات Supabase Auth الأول عشان تقدر تدخل');
    }
  }

  const { data: claimed, error: claimError } = await supabase.rpc('claim_login_account', { p_username: username });
  if (claimError) throw new Error(claimError.message || 'تعذر ربط الحساب بالكود');

  return Array.isArray(claimed) ? claimed[0] : claimed;
}

// Returning login with an already-claimed username + password.
export async function loginWithUsername(username, password) {
  if (!isSupabaseConfigured()) {
    throw new Error('تسجيل الدخول الحقيقي غير متاح في وضع التجربة المحلي (بدون إعداد Supabase)');
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password
  });
  if (error) throw new Error('كلمة السر غير صحيحة');
}

export async function logoutUser() {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}

// The `users` row for the currently signed-in Supabase Auth account.
export async function getMyProfile(authUserId) {
  if (!authUserId) return null;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
