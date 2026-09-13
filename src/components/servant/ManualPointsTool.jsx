import React, { useState, useEffect } from 'react';
import { Award, Plus, Minus, Search, Sparkles, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { getScopedStudents, addManualPoints, getStudentBalance, CLASSES } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { usePoints } from '../../context/PointsContext';

export default function ManualPointsTool() {
  const { currentUser } = useAuth();
  const { showToast, triggerRefresh, refreshKey } = usePoints();

  // Class admins / assistant admins / servants only ever get back students
  // from THEIR OWN class (see getScopedStudents + get_scoped_students() in
  // schema.sql for where that's actually enforced) — super_admin sees
  // everyone. currentUser.role/class_id is passed only as a fallback for
  // local/mock mode; against a real Supabase project the server checks who
  // is actually logged in itself, so this can't be spoofed from the app.
  const isScoped = currentUser && currentUser.role !== 'super_admin';
  const scopedClassName = isScoped ? CLASSES.find(c => c.id === currentUser.class_id)?.name : null;

  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentBalance, setStudentBalance] = useState(0);
  
  const [amount, setAmount] = useState(5);
  const [reason, setReason] = useState('إجابة سؤال أثناء الدرس 📖');
  const [loading, setLoading] = useState(false);

  // Quick Preset Reasons
  const PRESET_REASONS = [
    'إجابة سؤال أثناء الدرس 📖',
    'حفظ آية الأسبوع 📜',
    'مشاركة ممتازة في الأنشطة 🎨',
    'مواظبة وحضور قداس الأحد ⛪️',
    'سلوك ومحبة للمخدومين 🤝'
  ];

  // Quick Preset Amounts
  const PRESET_AMOUNTS = [5, 10, 15, 20, 25];

  useEffect(() => {
    getScopedStudents(currentUser ? { role: currentUser.role, class_id: currentUser.class_id } : null).then(stuList => {
      setStudents(stuList);
      if (stuList.length > 0 && !selectedStudent) {
        setSelectedStudent(stuList[0]);
      }
    });
  }, [currentUser?.role, currentUser?.class_id]);

  // Update selected student balance
  useEffect(() => {
    if (selectedStudent) {
      getStudentBalance(selectedStudent.id).then(pts => setStudentBalance(pts));
    }
  }, [selectedStudent, refreshKey]);

  const filteredStudents = students.filter(s =>
    s.name.includes(searchQuery) || (s.phone && s.phone.includes(searchQuery)) || s.qr_code.includes(searchQuery)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (!reason || reason.trim() === '') {
      showToast('خطأ في البيانات', 'يرجى إدخال سبب توزيع النقاط كشرط أساسي في السجل', 0, 'error');
      return;
    }

    setLoading(true);
    try {
      await addManualPoints(selectedStudent.id, amount, reason, currentUser?.id || 'servant-1');
      triggerRefresh();
      showToast(
        amount >= 0 ? 'تم إضافة النقاط بنجاح! 🌟' : 'تم خصم النقاط بنجاح ⚠️',
        `تم تسجيل ${amount > 0 ? '+' : ''}${amount} نقطة لـ ${selectedStudent.name}`,
        Math.max(0, amount),
        'success'
      );
    } catch (err) {
      showToast('فشل العملية', err.message || 'حدث خطأ غير متوقع', 0, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 dir-rtl text-right">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-indigo-700 to-sky-800 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5" /> أداة الخادم اليدوية{scopedClassName ? ` — ${scopedClassName} فقط` : ''}
          </span>
          <h2 className="text-xl sm:text-2xl font-black">منح النقاط والتشجيع</h2>
          <p className="text-sky-100 text-xs mt-1">
            {isScoped
              ? `توزيع النقاط التقديرية لمخدومي فصل "${scopedClassName || ''}" فقط لإجابة الأسئلة وحفظ الآيات والأجزاء`
              : 'توزيع النقاط التقديرية لإجابة الأسئلة وحفظ الآيات والأجزاء'}
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shrink-0 shadow-inner self-start sm:self-auto">
          <Sparkles className="w-8 h-8" />
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-5">
        
        {/* Student Selector */}
        <div>
          <label className="block text-xs font-extrabold text-slate-900 mb-2">1. اختيار المخدوم</label>
          
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            <input
              type="text"
              placeholder="ابحث باسم المخدوم أو رقم التليفون أو الكود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50 text-slate-900 transition-all"
            />
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200/80 p-2 rounded-2xl bg-slate-50">
            {filteredStudents.length === 0 && (
              <p className="text-center text-slate-400 text-[11px] font-bold py-3">
                {isScoped ? `لا يوجد مخدومين في فصل "${scopedClassName || ''}" حاليًا` : 'لا يوجد مخدومين مطابقين للبحث'}
              </p>
            )}
            {filteredStudents.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`w-full p-2.5 rounded-xl text-right flex items-center justify-between text-xs font-bold transition-all ${
                  selectedStudent?.id === s.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span>{s.name} ({s.qr_code})</span>
                {selectedStudent?.id === s.id && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Active Selected Student Preview */}
        {selectedStudent && (
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-sky-700 uppercase tracking-wider block">المخدوم المحدد</span>
              <h4 className="font-extrabold text-slate-900 text-sm">{selectedStudent.name}</h4>
            </div>
            <div className="bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>الرصيد الحالي: {studentBalance} نقطة</span>
            </div>
          </div>
        )}

        {/* Amount Input & Presets */}
        <div>
          <label className="block text-xs font-extrabold text-slate-900 mb-2">2. قيمة النقاط</label>
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setAmount(prev => Math.max(-50, prev - 5))}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 border border-slate-200 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="flex-1 text-center font-black text-lg py-2 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setAmount(prev => prev + 5)}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 border border-slate-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Chips */}
          <div className="flex flex-wrap gap-1.5">
            {PRESET_AMOUNTS.map((pts) => (
              <button
                key={pts}
                type="button"
                onClick={() => setAmount(pts)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  amount === pts ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                +{pts} نقطة
              </button>
            ))}
          </div>
        </div>

        {/* Reason Input (Mandatory) */}
        <div>
          <label className="block text-xs font-extrabold text-slate-900 mb-2 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-sky-600" /> 3. السبب (إجباري للأرشيف والسجل)
          </label>
          <input
            type="text"
            required
            placeholder="اكتب سبب منح النقاط..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
          />

          {/* Preset Reasons Chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {PRESET_REASONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReason(preset)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200/60"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedStudent}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? 'جاري الحفظ...' : `تسجيل ${amount > 0 ? '+' : ''}${amount} نقطة للمخدوم`}
        </button>

      </form>

    </div>
  );
}
