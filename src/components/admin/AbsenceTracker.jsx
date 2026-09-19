import React, { useState, useEffect } from 'react';
import { CalendarX, Phone, Clock, AlertTriangle, Send, Users, User, Search } from 'lucide-react';
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

  // طلب 2026-09-19: بحث بالاسم جوه تاب المخدومين وتاب الخدام بدل ما أمين
  // الخدمة/الفصل يقعد يدور بعينه في القايمة كلها.
  const [searchQuery, setSearchQuery] = useState('');

  // Class admins / assistant admins / servants only ever get back THEIR
  // OWN class's people (see getAbsenceReport + get_absence_report() in
  // schema.sql for where that's actually enforced) — super_admin sees
  // everyone. currentUser.role/class_id is passed only as a fallback for
  // local/mock mode; against a real Supabase project the server checks who
  // is actually logged in itself, so this can't be spoofed from the app.
  const isScoped = currentUser && currentUser.role !== 'super_admin';
  const scopedClassName = isScoped ? CLASSES.find(c => c.id === currentUser.class_id)?.name : null;

  // Always fetch the FULL roster (everyone in scope), not just people who
  // are currently absent — get_absence_report(0, ...) in schema.sql computes
  // weeks_absent via GREATEST(0, ...) so it's never negative, meaning
  // min_weeks = 0 matches every single person in scope unconditionally.
  // `minWeeks` is then used purely client-side below as the "considered
  // irregular starting from how many weeks" threshold for the status badge —
  // it no longer filters who appears in the list at all.
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getAbsenceReport(0, currentUser ? { role: currentUser.role, class_id: currentUser.class_id } : null).then(data => {
      if (isMounted) {
        setAbsentStudents(data);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [currentUser?.role, currentUser?.class_id]);

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
  const baseList = absentStudents.filter(s => (personType === 'students' ? s.role === 'student' : s.role !== 'student'));
  const trimmedQuery = searchQuery.trim();
  const visibleList = trimmedQuery
    ? baseList.filter(s => s.name.includes(trimmedQuery))
    : baseList;
  const personTypeLabel = personType === 'students' ? 'المخدومين' : 'الخدام';

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* Banner — the Good Shepherd image is now the full banner background
          itself (not a small icon box), with a dark rose overlay on top so
          the white text stays readable. */}
      <div className="relative rounded-3xl text-white shadow-md overflow-hidden">
        <img
          src={goodShepherdImg}
          alt="الراعي الصالح"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 35%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-rose-950/90 via-rose-900/80 to-rose-900/55"></div>
        <div className="relative p-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
            <CalendarX className="w-3.5 h-3.5" /> متابعة افتقاد الغائبين{scopedClassName ? ` — ${scopedClassName} فقط` : ''}
          </span>
          <h2 className="text-xl sm:text-2xl font-black">سجل ورسائل الافتقاد الرعوي</h2>
          <p className="text-rose-100 text-xs mt-1 max-w-xl">
            {isScoped
              ? `حصر مخدومي وخدام فصل "${scopedClassName || ''}" المنقطعين أو الغائبين وإرسال رسائل افتقاد مخصصة عبر الواتساب`
              : 'حصر كل المخدومين والخدام المنقطعين أو الغائبين في كل الفصول وإرسال رسائل افتقاد وتنبيهات مخصصة عبر الواتساب'}
          </p>
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

        {/* Search by name */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`ابحث بالاسم في ${personTypeLabel}...`}
            className="w-full bg-slate-50 text-slate-900 font-semibold text-xs py-2.5 pr-10 pl-3 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
          />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-base">
              {isScoped ? `قائمة ${personTypeLabel} — فصل ${scopedClassName || ''} فقط` : `قائمة ${personTypeLabel} (كل الفصول)`}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">اعتبار الحالة "غير منتظم" لو انقطع:</span>
            <select
              value={minWeeks}
              onChange={(e) => setMinWeeks(Number(e.target.value))}
              className="bg-slate-50 text-slate-900 font-bold text-xs py-2 px-3 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 cursor-pointer transition-all"
            >
              <option value={1}>أسبوع واحد فأكثر</option>
              <option value={2}>أسبوعين فأكثر (الافتراضي)</option>
              <option value={3}>3 أسابيع فأكثر</option>
              <option value={4}>4 أسابيع فأكثر (انقطاع تام)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold text-sm">جاري حصر كشوفات الغياب... ⏳</div>
        ) : visibleList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-bold text-sm bg-slate-50 border border-slate-100 rounded-2xl p-4">
            {baseList.length === 0
              ? `لا يوجد ${personTypeLabel} ${isScoped ? `في فصل ${scopedClassName || ''}` : ''} مسجلين حالياً.`
              : `لا يوجد ${personTypeLabel} مطابقين لبحثك "${trimmedQuery}".`}
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
                          <div className="text-slate-900 font-bold flex items-center gap-1.5">
                            <span>{s.name}</span>
                            {s.weeks_absent < minWeeks ? (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[9px] inline-flex items-center gap-0.5 shrink-0">✅ منتظم</span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[9px] inline-flex items-center gap-0.5 shrink-0">⚠️ غير منتظم</span>
                            )}
                          </div>
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
                      <p className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                        <span className="truncate">{s.name}</span>
                        {s.weeks_absent < minWeeks ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[9px] shrink-0">✅ منتظم</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[9px] shrink-0">⚠️ غير منتظم</span>
                        )}
                      </p>
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
