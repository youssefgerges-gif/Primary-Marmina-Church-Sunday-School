import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Search, Printer, Users, KeyRound, AlertTriangle, Save, Loader2, PenLine } from 'lucide-react';
import { getManualAttendanceRoster, resetLoginPassword, updateScopedStudent } from '../../services/supabase';
import { SAINT_IMAGES } from '../../services/saintImages';
import { useAuth } from '../../context/AuthContext';
import { usePoints } from '../../context/PointsContext';
import Modal from '../common/Modal';
import eparchyLogo from '../../assets/eparchy-logo.png';

// طلب Mr. Gerges 2026-09-27: تاريخ الميلاد/العنوان/رقم ولي الأمر بقوا
// اختياريين وقت تسجيل مخدوم جديد (AddStudentTool.jsx) — فمخدوم ناقصه أي
// واحد منهم بيبان عليه هنا علامة "بيانات ناقصة" عشان محدش ينسى يكملها.
const hasMissingData = (s) => !s.birth_date || !s.address || !s.guardian_phone;

// طلب 2026-09-20: كل الخدام (خادم عادي / أمين فصل / أمين فصل مساعد) بقى
// يقدروا يشوفوا كود QR وكود الدخول بتاع مخدومين فصلهم بس — قبل كده الشاشة
// دي كانت متاحة لأمين الخدمة العامة بس (من جوه "إدارة المستخدمين"). بدل ما
// نفتح شاشة "إدارة المستخدمين" الكاملة (فيها تعديل/حذف/فحص كشوفات، وبتعرض
// كل الفصول من غير قفل) للكل، الشاشة دي شاشة جديدة مخصصة: عرض بس (مفيش
// تعديل ولا حذف)، ومقفولة على فصل الخادم فقط سيرفر سايد — بتستخدم نفس
// get_manual_attendance_roster() اللي أصلاً مقفولة صح على الفصل (شوف
// schema.sql)، مفيش داعي لدالة SQL جديدة.
//
// نفس نمط عرض/طباعة كارت QR المستخدم في UserManagement.jsx (خلفية أيقونة
// القديس، QRCodeSVG، كود الدخول، زرار الطباعة) بس هنا مقصور على المخدومين
// (role === 'student') فقط — الروستر ممكن يرجع خدام تانيين كمان (سياستها في
// get_manual_attendance_roster لسه بترجع الخدام لو أمين خدمة عامة)، فبنفلتر
// هنا للمخدومين بس عشان الشاشة دي غرضها كروت QR المخدومين تحديدًا.
export default function StudentQRDirectory() {
  const { currentUser } = useAuth();
  const { showToast } = usePoints();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQRUser, setSelectedQRUser] = useState(null);
  const [resetting, setResetting] = useState(false);

  // طلب Mr. Gerges 2026-09-27: تعديل بيانات المخدوم (تليفون/تاريخ ميلاد/
  // عنوان/رقم ولي أمر) بقى متاح من هنا مباشرة — نفس الكارت اللي بيفتح كارت
  // الـQR، فورم التعديل جواه. مقفول سيرفر سايد جوه update_scoped_student()
  // في schema.sql (مش بس هنا) على فصل صاحب الحساب.
  const [editForm, setEditForm] = useState(null); // { phone, birthDate, address, guardianPhone }
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const roster = await getManualAttendanceRoster(
          currentUser ? { role: currentUser.role, class_id: currentUser.class_id } : null
        );
        if (!cancelled) {
          setStudents((roster || []).filter(u => u.role === 'student'));
        }
      } catch (err) {
        if (!cancelled) {
          showToast('تعذر تحميل الكشوفات', err.message || 'حدث خطأ، حاول تاني', 0, 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // طلب 2026-09-23: نسيان كلمة السر — الخادم/أمين الفصل/المساعد يقدر يعيد
  // تعيين كلمة سر أي مخدوم في فصله من هنا (نفس القفل الموجود أصلاً على
  // الشاشة دي بالظبط — مقصور على فصله بس، متأكد منه سيرفر سايد جوه
  // reset_login_password() في schema.sql، مش مجرد إخفاء زرار). بيمسح حساب
  // الدخول بتاعه فيرجع لحالة "مفيهوش باسورد" تاني، وهو يعمل "أول مرة تدخل"
  // بكلمة سر جديدة بنفس كود الدخول.
  const handleResetPassword = async (student) => {
    if (!student?.username || resetting) return;
    if (!window.confirm(`هل أنت متأكد من إعادة تعيين كلمة سر "${student.name}"؟ هيحتاج يعمل "أول مرة تدخل" تاني بكلمة سر جديدة، بنفس كود الدخول (${student.username}).`)) {
      return;
    }
    setResetting(true);
    try {
      const hadPassword = await resetLoginPassword(student.username);
      showToast(
        hadPassword ? 'تمت إعادة التعيين ✅' : 'مفيش تغيير',
        hadPassword
          ? `تم مسح كلمة سر "${student.name}" — يقدر يعمل "أول مرة تدخل" بكلمة سر جديدة بنفس الكود (${student.username})`
          : `"${student.name}" أصلاً من غير كلمة سر — يقدر يعمل "أول مرة تدخل" على طول`,
        0,
        'success'
      );
    } catch (err) {
      showToast('خطأ', err.message || 'تعذر إعادة تعيين كلمة السر', 0, 'error');
    } finally {
      setResetting(false);
    }
  };

  // كل ما تفتح كارت مخدوم تاني، الفورم بيتعبّى ببياناته هو (مش فاضل من
  // اللي قبله)، وبيتقفل لما تقفل الكارت.
  useEffect(() => {
    if (selectedQRUser) {
      setEditForm({
        phone: selectedQRUser.phone || '',
        birthDate: selectedQRUser.birth_date || '',
        address: selectedQRUser.address || '',
        guardianPhone: selectedQRUser.guardian_phone || ''
      });
    } else {
      setEditForm(null);
    }
  }, [selectedQRUser]);

  const handleSaveEdit = async () => {
    if (!selectedQRUser || !editForm || savingEdit) return;
    setSavingEdit(true);
    try {
      const updated = await updateScopedStudent(
        {
          studentId: selectedQRUser.id,
          phone: editForm.phone,
          birthDate: editForm.birthDate || null,
          clearBirthDate: !editForm.birthDate,
          address: editForm.address,
          guardianPhone: editForm.guardianPhone
        },
        currentUser ? { role: currentUser.role, class_id: currentUser.class_id } : null
      );
      // نحدّث القائمتين (الكارت المفتوح + القائمة تحت) بالبيانات الجديدة من
      // غير ما نحتاج نعيد تحميل الكشف كله من قاعدة البيانات تاني.
      setStudents(prev => prev.map(s => (s.id === selectedQRUser.id ? { ...s, ...updated } : s)));
      setSelectedQRUser(prev => (prev ? { ...prev, ...updated } : prev));
      showToast('تم الحفظ ✏️', `اتحدثت بيانات "${selectedQRUser.name}"`, 0, 'success');
    } catch (err) {
      showToast('تعذر الحفظ', err.message || 'حدث خطأ، حاول تاني', 0, 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name?.toLowerCase().includes(q) ||
      s.qr_code?.toLowerCase().includes(q) ||
      s.username?.toLowerCase().includes(q)
    );
  }).sort((a, b) => a.name.localeCompare(b.name, 'ar'));

  return (
    <div className="max-w-3xl mx-auto space-y-6 dir-rtl text-right">

      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-sky-700 to-indigo-800 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
            <QrCode className="w-3.5 h-3.5" /> أكواد QR المخدومين
          </span>
          <h2 className="text-xl sm:text-2xl font-black">أكواد QR وكروت الدخول لمخدومين فصلك</h2>
          <p className="text-sky-100 text-xs mt-1">
            اعرض كود QR أو كود الدخول لأي مخدوم في فصلك، اطبع كارته، أو كمّل/عدّل بياناته من هنا مباشرة
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shrink-0 shadow-inner self-start sm:self-auto">
          <Users className="w-8 h-8" />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="دور باسم المخدوم أو كود الدخول..."
          className="w-full py-3 pr-10 pl-3 rounded-2xl border border-slate-200 text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* List */}
      {loading ? (
        <p className="text-center text-slate-400 text-xs py-10">جاري التحميل...</p>
      ) : filteredStudents.length === 0 ? (
        <p className="text-center text-slate-400 text-xs py-10">
          {students.length === 0 ? 'لا يوجد مخدومين مسجلين في فصلك بعد' : 'مفيش نتايج تطابق البحث'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredStudents.map(student => (
            <button
              key={student.id}
              type="button"
              onClick={() => setSelectedQRUser(student)}
              className="flex items-center justify-between gap-2 p-3 rounded-2xl border border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50/60 active:scale-[0.99] transition-all text-right"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {student.name?.[0]}
                </div>
                <div className="min-w-0">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 truncate">
                    {student.name}
                    {hasMissingData(student) && (
                      <span
                        title="بيانات ناقصة — دوس للتكملة"
                        className="shrink-0 inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-amber-200"
                      >
                        <AlertTriangle className="w-2.5 h-2.5" /> بيانات ناقصة
                      </span>
                    )}
                  </span>
                  {student.username && (
                    <span className="block text-[10px] text-sky-700 font-mono font-bold">{student.username}</span>
                  )}
                </div>
              </div>
              <QrCode className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* QR Code Printable Card Modal — نفس نمط UserManagement.jsx بالظبط */}
      <Modal
        isOpen={!!selectedQRUser}
        onClose={() => setSelectedQRUser(null)}
        title="كارت الحضور الرقمي"
        icon={QrCode}
      >
        {selectedQRUser && (
          <div className="text-center space-y-4">
            <div className="relative p-6 rounded-3xl text-white shadow-xl space-y-4 border border-white/20 overflow-hidden">
              {SAINT_IMAGES[selectedQRUser.class_id] ? (
                <>
                  <img
                    src={SAINT_IMAGES[selectedQRUser.class_id]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-60"
                  />
                  <img
                    src={SAINT_IMAGES[selectedQRUser.class_id]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain p-1 opacity-80"
                    style={{ objectPosition: 'center center' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/50 to-slate-950/85" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-700 flex items-center justify-center">
                  <img src={eparchyLogo} alt="" className="w-36 h-36 rounded-full object-cover shadow-xl border-2 border-white/50" />
                </div>
              )}

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/20 pb-3">
                  <h4 className="font-extrabold text-sm">خدمة مدارس الأحد ⛪️</h4>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">مخدوم</span>
                </div>

                <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
                  <QRCodeSVG value={selectedQRUser.qr_code} size={160} />
                </div>

                <div>
                  <h3 className="text-lg font-black">{selectedQRUser.name}</h3>
                  <p className="text-xs text-sky-100 font-mono mt-0.5">{selectedQRUser.qr_code}</p>
                </div>

                {selectedQRUser.username && (
                  <div className="bg-white/15 rounded-2xl p-3 border border-white/20">
                    <p className="text-[10px] text-sky-100 font-bold mb-0.5">كود تسجيل الدخول على الموقع</p>
                    <p className="text-xl font-black tracking-wider font-mono">{selectedQRUser.username}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> طباعة الكارت 🖨️
              </button>
              {selectedQRUser.username && (
                <button
                  onClick={() => handleResetPassword(selectedQRUser)}
                  disabled={resetting}
                  className="flex-1 py-2.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 disabled:opacity-60 text-amber-700 dark:text-amber-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-amber-200 dark:border-amber-800"
                >
                  <KeyRound className="w-4 h-4" /> نسي الباسورد؟
                </button>
              )}
            </div>

            {/* طلب Mr. Gerges 2026-09-27: تعديل/تكملة بيانات المخدوم — تليفون،
                تاريخ ميلاد، عنوان، رقم ولي أمر. مقفول سيرفر سايد على فصل
                صاحب الحساب جوه update_scoped_student() في schema.sql. */}
            {editForm && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-right">
                <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <PenLine className="w-3.5 h-3.5 text-sky-600" /> تعديل بيانات المخدوم
                  {hasMissingData(selectedQRUser) && (
                    <span className="text-[9px] font-black text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
                      بيانات ناقصة
                    </span>
                  )}
                </h4>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">رقم تليفون المخدوم</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="01xxxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">تاريخ الميلاد</label>
                  <input
                    type="date"
                    value={editForm.birthDate}
                    onChange={(e) => setEditForm(f => ({ ...f, birthDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">العنوان</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="مثال: شارع الجمهورية، أسوان"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">رقم ولي الأمر</label>
                  <input
                    type="tel"
                    value={editForm.guardianPhone}
                    onChange={(e) => setEditForm(f => ({ ...f, guardianPhone: e.target.value }))}
                    placeholder="01xxxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                >
                  {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  حفظ التعديلات
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}
