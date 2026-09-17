import React, { useState, useEffect } from 'react';
import { CalendarX, Phone, Clock, AlertTriangle, Send, Users, User } from 'lucide-react';
import { getAbsenceReport, CLASSES } from '../../services/supabase';
import { usePoints } from '../../context/PointsContext';
import { useAuth } from '../../context/AuthContext';
import WhatsAppModal from '../common/WhatsAppModal';
import goodShepherdImg from '../../assets/good-shepherd.jpg';

export default function AbsenceTracker() {
  const { showToast } = usePoints();
  const { currentUser } = useAuth();
  const [absentStudents, setAbsentStudents] = useState([]);
  const [minWeeks, setMinWeeks] = useState(2);
  const [loading, setLoading] = useState(true);
  const [whatsappRecipient, setWhatsappRecipient] = useState(null);

  // Servants tab vs. Students tab — the data itself already includes both
  // (get_absence_report() returns everyone except super_admin, already
  // scoped to the caller's own class where relevant), this just splits the
  // single combined list into two views instead of mixing خدام و مخدومين
  // together in one table.
  const [personType, setPersonType] = useState('students'); // 'students' or 'servants'

  // Class admins / assistant admins / servants only ever get back THEIR
  // OWN class's people (see getAbsenceReport + get_absence_report() in
  // schema.sql for where that's actually enforced) — super_admin sees
  // everyone. currentUser.role/class_id is passed only as a fallback for
  // local/mock mode; against a real Supabase project the server checks who
  // is actually logged in itself, so this can't be spoofed from the app.
  const isScoped = currentUser && currentUser.role !== 'super_admin';
  const scopedClassName = isScoped ? CLASSES.find(c => c.id === currentUser.class_id)?.name : null;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getAbsenceReport(minWeeks, currentUser ? { role: currentUser.role, class_id: currentUser.class_id } : null).then(data => {
      if (isMounted) {
        setAbsentStudents(data);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [minWeeks, currentUser?.role, currentUser?.class_id]);

  const roleBadge = (role) => {
    const styles = {
      student: 'bg-amber-100 text-amber-900 border-amber-200',
      class_admin: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      assistant_admin: 'bg-sky-100 text-sky-800 border-sky-200',
      servant: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    const labels = {
      student: '🧒 مخدوم',
      class_admin: '⛪️ أمين فصل',
      assistant_admin: '🤝 أمين فصل مساعد',
      servant: '✝️ خادم'
    };
    return (
      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border inline-flex items-center gap-1 ${styles[role] || styles.servant}`}>
        {labels[role] || labels.servant}
      </span>
    );
  };

  const studentsCount = absentStudents.filter(s => s.role === 'student').length;
  const servantsCount = absentStudents.filter(s => s.role !== 'student').length;
  const visibleList = absentStudents.filter(s => (personType === 'students' ? s.role === 'student' : s.role !== 'student'));
  const personTypeLabel = personType === 'students' ? 'المخدومين' : 'الخدام';

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-700 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
            <CalendarX className="w-3.5 h-3.5" /> متابعة افتقاد الغائبين{scopedClassName ? ` — ${scopedClassName} فقط` : ''}
          </span>
          <h2 className="text-xl sm:text-2xl font-black">سجل ورسائل الافتقاد الرعوي</h2>
          <p className="text-rose-100 text-xs mt-1">
            {isScoped
              ? `حصر مخدومي وخدام فصل "${scopedClassName || ''}" المنقطعين أو الغائبين وإرسال رسائل افتقاد مخصصة عبر الواتساب`
              : 'حصر كل المخدومين والخدام المنقطعين أو الغائبين في كل الفصول وإرسال رسائل افتقاد وتنبيهات مخصصة عبر الواتساب'}
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl border border-white/20 shrink-0 shadow-inner self-start sm:self-auto overflow-hidden">
          <img
            src={goodShepherdImg}
            alt="الراعي الصالح"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 35%' }}
          />
        </div>
      </div>

      {/* Controls & Table Container */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">

        {/* Servants / Students Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setPersonType('students')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              personType === 'students' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" /> المخدومين ({studentsCount})
          </button>
          <button
            type="button"
            onClick={() => setPersonType('servants')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              personType === 'servants' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> الخدام ({servantsCount})
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-base">
              {isScoped ? `قائمة ${personTypeLabel} الغائبين — فصل ${scopedClassName || ''} فقط` : `قائمة ${personTypeLabel} الغائبين (كل الفصول)`}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">تصفية حسب أسابيع الغياب:</span>
            <select
              value={minWeeks}
              onChange={(e) => setMinWeeks(Number(e.target.value))}
              className="bg-slate-50 text-slate-900 font-bold text-xs py-2 px-3 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 cursor-pointer transition-all"
            >
              <option value={1}>غائب أسبوع واحد فأكثر</option>
              <option value={2}>غائب أسبوعين فأكثر (إجباري افتقاد)</option>
              <option value={3}>غائب 3 أسابيع فأكثر</option>
              <option value={4}>انقطاع تام (4 أسابيع فأكثر)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold text-sm">جاري حصر كشوفات الغياب... ⏳</div>
        ) : visibleList.length === 0 ? (
          <div className="py-12 text-center text-emerald-700 font-bold text-sm bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            🎉 رائع جداً! لا يوجد من {personTypeLabel} {isScoped ? `في فصل ${scopedClassName || ''}` : ''} غائبين أكثر من {minWeeks} أسابيع حالياً.
          </div>
        ) : (
          <>
            {/* Table — md screens and up */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-extrabold border-b border-slate-200/80">
                    <th className="p-3.5">الاسم</th>
                    <th className="p-3.5">الصفة</th>
                    <th className="p-3.5">رقم التليفون</th>
                    <th className="p-3.5">آخر حضور</th>
                    <th className="p-3.5">مدة الانقطاع</th>
                    <th className="p-3.5 text-center">إجراء الافتقاد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {visibleList.map((s) => (
                    <tr key={s.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-black shrink-0 border border-rose-200/60">
                          {s.name[0]}
                        </div>
                        <div>
                          <div className="text-slate-900 font-bold">{s.name}</div>
                          <span className="text-[10px] text-slate-400 font-normal">كود: {s.qr_code}</span>
                        </div>
                      </td>
                      <td className="p-3.5">{roleBadge(s.role)}</td>
                      <td className="p-3.5 font-semibold text-slate-600">
                        <span className="flex items-center gap-1 dir-ltr justify-end">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {s.phone || 'غير مسجل'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">{s.last_attended}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full font-black text-[11px] inline-flex items-center gap-1 border ${
                          s.weeks_absent >= 3 ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          <Clock className="w-3 h-3" /> {s.weeks_absent} أسابيع متتالية
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setWhatsappRecipient(s)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm inline-flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" /> اختيار نموذج واتساب
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card list — phones only, below md */}
            <div className="md:hidden space-y-3">
              {visibleList.map((s) => (
                <div key={s.id} className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-black shrink-0 border border-rose-200/60">
                      {s.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 text-sm truncate">{s.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">كود: {s.qr_code}</p>
                    </div>
                    <div className="shrink-0">{roleBadge(s.role)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-3 text-[11px]">
                    <div className="text-slate-500 truncate flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {s.phone || 'غير مسجل'}
                    </div>
                    <div className="text-slate-500 truncate">آخر حضور: <span className="font-bold text-slate-700">{s.last_attended}</span></div>
                    <div className="col-span-2">
                      <span className={`px-2.5 py-1 rounded-full font-black text-[11px] inline-flex items-center gap-1 border ${
                        s.weeks_absent >= 3 ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        <Clock className="w-3 h-3" /> {s.weeks_absent} أسابيع متتالية
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setWhatsappRecipient(s)}
                    className="w-full mt-3 pt-3 border-t border-slate-200 py-2 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white font-extrabold text-xs shadow-sm inline-flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" /> اختيار نموذج واتساب
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* WhatsApp Messaging Modal */}
      <WhatsAppModal
        isOpen={!!whatsappRecipient}
        onClose={() => setWhatsappRecipient(null)}
        recipient={whatsappRecipient}
      />

    </div>
  );
}
