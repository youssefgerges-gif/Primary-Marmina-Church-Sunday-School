import React, { useState } from 'react';
import { UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';
import { addScopedStudent, CLASSES } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { usePoints } from '../../context/PointsContext';

export default function AddStudentTool() {
  const { currentUser, refreshUsers } = useAuth();
  const { showToast, triggerRefresh } = usePoints();

  // As of 2026-09-20, servant / class_admin / assistant_admin all reach this
  // screen equally (see Navbar.jsx / BottomNav.jsx / App.jsx — a plain
  // servant used to have no menu button for it at all). All three always add
  // into THEIR OWN class — enforced server-side inside add_scoped_student()
  // (see schema.sql), not just hidden here — so there's no class picker for
  // them. super_admin isn't tied to one class, so they choose which class.
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const scopedClassName = !isSuperAdmin ? CLASSES.find(c => c.id === currentUser?.class_id)?.name : null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [classId, setClassId] = useState(CLASSES[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [addedStudent, setAddedStudent] = useState(null);

  // طلب 2026-09-20 (نسخة ثانية، نفس اليوم): تاريخ الميلاد + العنوان + رقم
  // ولي الأمر بقوا مطلوبين لأي مخدوم جديد (رقم المخدوم نفسه فضل اختياري) —
  // نفس الإلزام متفحوص تاني سيرفر سايد جوه add_scoped_student() في
  // schema.sql، مش بس هنا.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('خطأ في البيانات', 'يرجى إدخال اسم المخدوم', 0, 'error');
      return;
    }
    if (!birthDate) {
      showToast('خطأ في البيانات', 'يرجى إدخال تاريخ ميلاد المخدوم', 0, 'error');
      return;
    }
    if (!address.trim()) {
      showToast('خطأ في البيانات', 'يرجى إدخال عنوان المخدوم', 0, 'error');
      return;
    }
    if (!guardianPhone.trim()) {
      showToast('خطأ في البيانات', 'يرجى إدخال رقم ولي الأمر', 0, 'error');
      return;
    }
    if (isSuperAdmin && !classId) {
      showToast('خطأ في البيانات', 'يرجى اختيار الفصل الدراسي', 0, 'error');
      return;
    }

    setLoading(true);
    try {
      const newStudent = await addScopedStudent(
        {
          name: name.trim(),
          phone: phone.trim(),
          birthDate,
          address: address.trim(),
          guardianPhone: guardianPhone.trim(),
          class_id: isSuperAdmin ? classId : undefined
        },
        currentUser ? { role: currentUser.role, class_id: currentUser.class_id } : null
      );
      triggerRefresh();
      if (refreshUsers) refreshUsers();
      setAddedStudent(newStudent);
      setName('');
      setPhone('');
      setBirthDate('');
      setAddress('');
      setGuardianPhone('');
      showToast('تم إضافة المخدوم بنجاح! 🎉', `تم تسجيل "${newStudent.name}" في الكشوفات`, 0, 'success');
    } catch (err) {
      showToast('فشل الإضافة', err.message || 'حدث خطأ غير متوقع', 0, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 dir-rtl text-right">

      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
            <UserPlus className="w-3.5 h-3.5" /> إضافة مخدوم جديد{scopedClassName ? ` — فصل ${scopedClassName} فقط` : ''}
          </span>
          <h2 className="text-xl sm:text-2xl font-black">تسجيل مخدوم جديد في الكشوفات</h2>
          <p className="text-emerald-100 text-xs mt-1">
            {scopedClassName
              ? `إضافة مخدوم جديد لفصل "${scopedClassName}" — هيتولد له كود QR وكود دخول تلقائيًا`
              : 'إضافة مخدوم جديد لأي فصل — هيتولد له كود QR وكود دخول تلقائيًا'}
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shrink-0 shadow-inner self-start sm:self-auto">
          <Sparkles className="w-8 h-8" />
        </div>
      </div>

      {addedStudent ? (
        /* Success panel — shows the generated QR code / login code right
           away, since this screen doesn't have UserManagement's table/print
           tools to look them up again afterward. */
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-200 space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg">تم تسجيل {addedStudent.name} بنجاح 🎉</h3>
            {CLASSES.find(c => c.id === addedStudent.class_id) && (
              <p className="text-slate-500 text-xs mt-1">فصل {CLASSES.find(c => c.id === addedStudent.class_id)?.name}</p>
            )}
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">رمز QR</span>
              <span className="font-mono font-black text-slate-900">{addedStudent.qr_code}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">كود تسجيل الدخول</span>
              <span className="font-mono font-black text-sky-700">{addedStudent.username}</span>
            </div>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            ممكن تشارك كود الدخول ده مع المخدوم مباشرة، أو تطبع له كارت QR لاحقًا من شاشة "إدارة المستخدمين" (لو متاحة عندك).
          </p>
          <button
            onClick={() => setAddedStudent(null)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> إضافة مخدوم تاني
          </button>
        </div>
      ) : (
        /* Form Container */
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-5">

          <div>
            <label className="block text-xs font-extrabold text-slate-900 mb-2">اسم المخدوم بالكامل</label>
            <input
              type="text"
              required
              placeholder="مثال: مينا عماد..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          {isSuperAdmin && (
            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-2">الفصل الدراسي</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                {CLASSES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-slate-900 mb-2">تاريخ الميلاد</label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-900 mb-2">العنوان</label>
            <input
              type="text"
              required
              placeholder="مثال: شارع الجمهورية، أسوان"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-900 mb-2">رقم ولي الأمر</label>
            <input
              type="tel"
              required
              placeholder="01234567890"
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-900 mb-2">رقم هاتف المخدوم (واتساب) — اختياري</label>
            <input
              type="tel"
              placeholder="01234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            {loading ? 'جاري الإضافة...' : (<><UserPlus className="w-4 h-4" /> إضافة المخدوم وتوليد كارت QR</>)}
          </button>
        </form>
      )}

    </div>
  );
}
