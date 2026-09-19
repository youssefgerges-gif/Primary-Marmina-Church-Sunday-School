import React, { useMemo, useState } from 'react';
import { UserCheck, UserX, Shield, Users, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import SaintIconArt from '../common/SaintIconArt';
import { recordAttendance } from '../../services/supabase';
import { usePoints } from '../../context/PointsContext';

const ROLE_LABELS = {
  class_admin: 'أمين فصل',
  assistant_admin: 'أمين فصل مساعد',
  servant: 'خادم'
};

// "حاضر" here means: attended within the last 7 days (same rolling window
// Analytics' own attendance-rate KPI card already uses via getServiceStats())
// — matches a weekly Sunday-meeting rhythm without needing a separate
// "which week is this" concept.
const PRESENT_WINDOW_DAYS = 7;

export default function ClassRosterModal({ isOpen, onClose, classInfo, users, attendanceLogs }) {
  const { showToast, triggerRefresh } = usePoints();
  // طلب 2026-09-19: طريقة تالتة لتسجيل الحضور (غير QR واليدوي في شاشة
  // الماسح) — أمين الخدمة العامة يدوس على اسم أي حد غايب هنا في كشف الفصل
  // فيتسجل حضوره فورًا، من غير ما يحتاج يفتح شاشة الماسح أصلاً.
  const [markingId, setMarkingId] = useState(null);

  const handleMarkPresent = async (person) => {
    if (markingId) return;
    setMarkingId(person.id);
    try {
      await recordAttendance(person.qr_code);
      triggerRefresh();
      showToast('تم تسجيل الحضور ✅', `تم تسجيل حضور ${person.name} بنجاح`, 0, 'success');
    } catch (err) {
      showToast('تعذر تسجيل الحضور', err.message || 'حدث خطأ أثناء تسجيل الحضور، حاول مرة أخرى', 0, 'error');
    } finally {
      setMarkingId(null);
    }
  };

  const lastAttendedMap = useMemo(() => {
    const map = new Map();
    (attendanceLogs || []).forEach(log => {
      const t = new Date(log.timestamp);
      const prev = map.get(log.user_id);
      if (!prev || t > prev) map.set(log.user_id, t);
    });
    return map;
  }, [attendanceLogs]);

  const isPresent = (userId) => {
    const last = lastAttendedMap.get(userId);
    if (!last) return false;
    const days = (new Date() - last) / (1000 * 60 * 60 * 24);
    return days < PRESENT_WINDOW_DAYS;
  };

  if (!classInfo) return null;

  const classUsers = (users || []).filter(u => u.class_id === classInfo.id);
  const servants = classUsers
    .filter(u => u.role !== 'student')
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  const students = classUsers
    .filter(u => u.role === 'student')
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'));

  const servantsPresent = servants.filter(u => isPresent(u.id)).length;
  const studentsPresent = students.filter(u => isPresent(u.id)).length;

  const renderRow = (person) => {
    const present = isPresent(person.id);
    const marking = markingId === person.id;
    return (
      <button
        key={person.id}
        type="button"
        onClick={() => handleMarkPresent(person)}
        disabled={present || marking}
        title={present ? undefined : 'اضغط لتسجيل حضوره الآن'}
        className={`w-full flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all text-right ${
          present
            ? 'bg-slate-50 border-slate-200/70 cursor-default'
            : 'bg-slate-50 border-slate-200/70 hover:border-sky-400 hover:bg-sky-50/60 active:scale-[0.99] cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0">
            {person.name?.[0]}
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-slate-900 truncate">{person.name}</span>
            {person.role !== 'student' && (
              <span className="block text-[10px] text-sky-700 font-bold">
                {ROLE_LABELS[person.role] || person.title || 'خادم'}
              </span>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 ${
            present
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : 'bg-rose-100 text-rose-800 border-rose-200'
          }`}
        >
          {marking ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : present ? (
            <UserCheck className="w-3 h-3" />
          ) : (
            <UserX className="w-3 h-3" />
          )}
          {marking ? 'جاري التسجيل...' : present ? 'حاضر' : 'غايب'}
        </span>
      </button>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`فصل ${classInfo.name}`} icon={Shield}>
      <div className="space-y-5 text-right dir-rtl">

        {/* Class identity strip */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-100">
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-300 shrink-0">
            <SaintIconArt classId={classInfo.id} className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="block text-xs font-black text-slate-900">{classInfo.name}</span>
            <span className="block text-[11px] text-amber-700 font-bold">
              {classInfo.saintName || classInfo.patron}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-bold -mt-1">
          اضغط على اسم أي حد "غايب" عشان تسجّل حضوره فورًا 👇
        </p>

        {/* Servants in this class */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-sky-600" /> الخدام ({servants.length})
            </h4>
            {servants.length > 0 && (
              <span className="text-[10px] font-bold text-slate-500">
                {servantsPresent} حاضر / {servants.length - servantsPresent} غايب
              </span>
            )}
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {servants.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-3">لا يوجد خدام مسجلين بهذا الفصل</p>
            ) : (
              servants.map(renderRow)
            )}
          </div>
        </div>

        {/* Students (مخدومين) in this class */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" /> المخدومين ({students.length})
            </h4>
            {students.length > 0 && (
              <span className="text-[10px] font-bold text-slate-500">
                {studentsPresent} حاضر / {students.length - studentsPresent} غايب
              </span>
            )}
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {students.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-3">لا يوجد مخدومين مسجلين بهذا الفصل بعد</p>
            ) : (
              students.map(renderRow)
            )}
          </div>
        </div>

      </div>
    </Modal>
  );
}
