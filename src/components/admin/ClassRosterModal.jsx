import React, { useMemo, useState } from 'react';
import { UserCheck, UserX, Undo2, Shield, Users, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import SaintIconArt from '../common/SaintIconArt';
import { recordAttendance, cancelAttendance } from '../../services/supabase';
import { usePoints } from '../../context/PointsContext';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS = {
  class_admin: 'أمين فصل',
  assistant_admin: 'أمين فصل مساعد',
  servant: 'خادم'
};

// "حاضر" here means: attended within the last 7 days (same rolling window
// getServiceStats() in supabase.js already uses for its own weekly
// attendance-rate calculation) — matches a weekly Sunday-meeting rhythm
// without needing a separate "which week is this" concept.
const PRESENT_WINDOW_DAYS = 7;

export default function ClassRosterModal({ isOpen, onClose, classInfo, users, attendanceLogs }) {
  const { showToast, triggerRefresh } = usePoints();
  // هذه الشاشة نفسها مقفولة أصلاً على super_admin (بتتفتح بس من داخل درِل-داون
  // فصل في الإحصائيات العامة) — بنمرر currentUser هنا زيادة، دفاع في العمق،
  // عشان recordAttendance() تقدر تتأكد إن اللي بيسجل حضور خادم فعلاً هو
  // super_admin (نفس شرط "Staff can record attendance" في schema.sql).
  const { currentUser } = useAuth();
  // طلب 2026-09-19: طريقة تالتة لتسجيل الحضور (غير QR واليدوي في شاشة
  // الماسح) — أمين الخدمة العامة يدوس على اسم أي حد غايب هنا في كشف الفصل
  // فيتسجل حضوره فورًا، من غير ما يحتاج يفتح شاشة الماسح أصلاً.
  const [markingId, setMarkingId] = useState(null);

  // طلب 2026-09-20: لو دوس بالغلط، يقدر يتراجع. بنسجل هنا (id السجل اللي
  // احنا نفسنا عملناه + توقيته بالظبط) لكل شخص دوسنا عليه في الجلسة دي، عشان
  // لما يدوس تاني نعرف نمسح بالظبط اللي احنا سجلناه — مش أي سجل حضور تاني
  // ليه ممكن يكون حصل فعلاً بماسح QR قبل كده. لو حد اتسجل حضوره من طريقة
  // تانية (مش دوسة إحنا) أو مر وقت وسجل حضور تاني اتسجل بعدنا، مفيش تراجع.
  const [myAttendance, setMyAttendance] = useState({});

  const handleMarkPresent = async (person, present, canUndo) => {
    if (markingId) return;
    if (present && !canUndo) return; // صف مقفول، مفيش حاجة نعملها

    setMarkingId(person.id);
    try {
      if (present && canUndo) {
        const mine = myAttendance[person.id];
        await cancelAttendance({ attendanceLogId: mine.attendanceLogId, pointsLedgerId: mine.pointsLedgerId });
        setMyAttendance(prev => {
          const next = { ...prev };
          delete next[person.id];
          return next;
        });
        triggerRefresh();
        showToast('تم التراجع ⏪', `اتلغى حضور ${person.name}`, 0, 'success');
      } else {
        const result = await recordAttendance(
          person.qr_code,
          currentUser ? { role: currentUser.role, class_id: currentUser.class_id } : null
        );
        setMyAttendance(prev => ({
          ...prev,
          [person.id]: {
            attendanceLogId: result.attendanceLogId,
            pointsLedgerId: result.pointsLedgerId,
            timestampMs: new Date(result.timestamp).getTime()
          }
        }));
        triggerRefresh();
        showToast('تم تسجيل الحضور ✅', `تم تسجيل حضور ${person.name} بنجاح`, 0, 'success');
      }
    } catch (err) {
      showToast('تعذر تنفيذ العملية', err.message || 'حدث خطأ، حاول مرة أخرى', 0, 'error');
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
    const mine = myAttendance[person.id];
    const lastMs = lastAttendedMap.get(person.id)?.getTime();
    // قابل للتراجع بس لو إحنا اللي سجلنا الحضور ده دلوقتي في الجلسة دي، ولسه
    // هو آخر سجل حضور فعلي للشخص ده (يعني مفيش سجل حضور تاني اتسجل بعده).
    const canUndo = present && !!mine && mine.timestampMs === lastMs;
    const clickable = !present || canUndo;

    return (
      <button
        key={person.id}
        type="button"
        onClick={() => handleMarkPresent(person, present, canUndo)}
        disabled={!clickable || marking}
        title={
          !present
            ? 'اضغط لتسجيل حضوره الآن'
            : canUndo
              ? 'دوست بالغلط؟ اضغط تاني عشان تلغي الحضور'
              : undefined
        }
        className={`w-full flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all text-right ${
          !present
            ? 'bg-slate-50 border-slate-200/70 hover:border-sky-400 hover:bg-sky-50/60 active:scale-[0.99] cursor-pointer'
            : canUndo
              ? 'bg-emerald-50/60 border-emerald-200 hover:border-amber-400 hover:bg-amber-50/60 active:scale-[0.99] cursor-pointer'
              : 'bg-slate-50 border-slate-200/70 cursor-default'
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
            canUndo ? <Undo2 className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />
          ) : (
            <UserX className="w-3 h-3" />
          )}
          {marking ? (canUndo ? 'جاري الإلغاء...' : 'جاري التسجيل...') : present ? 'حاضر' : 'غايب'}
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
          اضغط على اسم أي حد "غايب" عشان تسجّل حضوره فورًا، ولو دوست بالغلط اضغط تاني عشان تتراجع 👇
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
