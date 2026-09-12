import React, { useState, useEffect } from 'react';
import { CalendarX, MessageCircle, Phone, Clock, AlertTriangle, Send } from 'lucide-react';
import { getAbsenceReport } from '../../services/supabase';
import { usePoints } from '../../context/PointsContext';
import WhatsAppModal from '../common/WhatsAppModal';

export default function AbsenceTracker() {
  const { showToast } = usePoints();
  const [absentStudents, setAbsentStudents] = useState([]);
  const [minWeeks, setMinWeeks] = useState(2);
  const [loading, setLoading] = useState(true);
  const [whatsappRecipient, setWhatsappRecipient] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getAbsenceReport(minWeeks).then(data => {
      if (isMounted) {
        setAbsentStudents(data);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [minWeeks]);

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-700 rounded-3xl p-6 text-white shadow-md flex items-center justify-between relative overflow-hidden">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
            <CalendarX className="w-3.5 h-3.5" /> متابعة افتقاد الغائبين
          </span>
          <h2 className="text-2xl font-black">سجل ورسائل الافتقاد الرعوي</h2>
          <p className="text-rose-100 text-xs mt-1">حصر المخدومين المنقطعين أو الغائبين وإرسال رسائل افتقاد وتنبيهات مخصصة عبر الواتساب</p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-rose-200 shrink-0 shadow-inner">
          <MessageCircle className="w-10 h-10" />
        </div>
      </div>

      {/* Controls & Table Container */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-base">قائمة المخدومين والخدام الغائبين</h3>
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
        ) : absentStudents.length === 0 ? (
          <div className="py-12 text-center text-emerald-700 font-bold text-sm bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            🎉 رائع جداً! لا يوجد مخدومين غائبين أكثر من {minWeeks} أسابيع حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-extrabold border-b border-slate-200/80">
                  <th className="p-3.5">الاسم</th>
                  <th className="p-3.5">رقم التليفون</th>
                  <th className="p-3.5">آخر حضور</th>
                  <th className="p-3.5">مدة الانقطاع</th>
                  <th className="p-3.5 text-center">إجراء الافتقاد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {absentStudents.map((s) => (
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
