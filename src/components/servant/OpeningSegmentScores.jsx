import React, { useState, useEffect } from 'react';
import { Music4, BookOpenText, HelpCircle, Moon, Trophy, Crown, Medal, Filter, CalendarDays, Save, Loader2, CalendarCheck } from 'lucide-react';
import { recordOpeningSegmentScore, getOpeningSegmentScore, getOpeningSegmentLeaderboard, CLASSES } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { usePoints } from '../../context/PointsContext';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// طلب Mr. Gerges 2026-09-27: "الفقرة الافتتاحية" — فقرة بتحصل في بداية كل
// لقاء أسبوعي (ترنيمة + قراءة إنجيل + أسئلة عن الإنجيل اللي اتقرا + هدوء)،
// وكل فصل بياخد درجات على أدائه ككل كفريق (مش لمخدوم بعينه جوه الفصل) —
// عشان يبقى في تنافس بين الفصول. المسؤول عن تسجيل الدرجات: خدام الفصل
// (خادم/أمين فصل/أمين فصل مساعد — لفصلهم بس) وأمين الخدمة العامة (لأي فصل).
// الحماية الحقيقية (فصل الخادم بس، إلا أمين الخدمة) جوه record_opening_
// segment_score() في schema.sql — مش مجرد قفل الدروب-داون هنا.
//
// طلب Mr. Gerges 2026-09-27 (تحديث): إدخال الدرجات بقى اختياري بند بند —
// ممكن فقرة معينة (زي الأسئلة) تتلغي في لقاء معين، فمفيش داعي "تتجبر" تدخل
// صفر لها. البند اللي تسيبه فاضي بيتسجل NULL (مش صفر) في قاعدة البيانات،
// يعني "البند ده متسجلش/اتلغى النهارده" — مش "الفصل جاب صفر فيه". وبرضو
// طلب يشوف "صدارة اليوم" (بس درجات اليوم الحالي) جنب "الصدارة العامة" (كل
// الدرجات من أول ما الميزة اشتغلت) في نفس الشاشة.
export default function OpeningSegmentScores() {
  const { currentUser } = useAuth();
  const { showToast, triggerRefresh, refreshKey } = usePoints();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [selectedClass, setSelectedClass] = useState(
    !isSuperAdmin && currentUser?.class_id ? currentUser.class_id : CLASSES[0]?.id
  );
  useEffect(() => {
    if (!isSuperAdmin && currentUser?.class_id) setSelectedClass(currentUser.class_id);
  }, [isSuperAdmin, currentUser?.class_id]);

  const currentClassInfo = CLASSES.find(c => c.id === selectedClass) || CLASSES[0];

  const [scoreDate, setScoreDate] = useState(todayStr());
  // الأربعة بنود دلوقتي نصوص ('' معناها "متسجلش/اتلغى") مش أرقام مبدئية
  // بصفر — عشان تفرق فعليًا بين "الفصل جاب صفر" و"الفقرة دي متعملتش النهارده".
  const [hymnScore, setHymnScore] = useState('');
  const [bibleReadingScore, setBibleReadingScore] = useState('');
  const [questionsScore, setQuestionsScore] = useState('');
  const [quietnessScore, setQuietnessScore] = useState('');
  const [loadingForm, setLoadingForm] = useState(true);
  const [saving, setSaving] = useState(false);

  const viewer = currentUser ? { role: currentUser.role, class_id: currentUser.class_id } : null;

  // null/undefined (البند متسجلش) بيرجع '' في الفورم؛ صفر حقيقي (0) لازم
  // يتعرض "0" مش يتحسب فاضي بالغلط.
  const toFieldValue = (n) => (n === null || n === undefined ? '' : String(n));

  // كل ما الفصل أو التاريخ يتغيّر، نجيب أي درجات اتسجلت قبل كده لنفس اليوم
  // عشان الفورم ميبدأش من صفر لو حد سجل جزء منها قبل كده. أي بند رجع NULL
  // من السيرفر (مش متسجل) بيفضل فاضي في الفورم.
  useEffect(() => {
    let isMounted = true;
    setLoadingForm(true);
    getOpeningSegmentScore({ classId: selectedClass, scoreDate }, viewer)
      .then(row => {
        if (!isMounted) return;
        setHymnScore(toFieldValue(row?.hymn_score));
        setBibleReadingScore(toFieldValue(row?.bible_reading_score));
        setQuestionsScore(toFieldValue(row?.questions_score));
        setQuietnessScore(toFieldValue(row?.quietness_score));
      })
      .catch(() => {
        if (isMounted) {
          setHymnScore(''); setBibleReadingScore(''); setQuestionsScore(''); setQuietnessScore('');
        }
      })
      .finally(() => { if (isMounted) setLoadingForm(false); });
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, scoreDate]);

  const [todayBoard, setTodayBoard] = useState([]);
  const [overallBoard, setOverallBoard] = useState([]);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [boardTab, setBoardTab] = useState('today'); // 'today' | 'overall'

  useEffect(() => {
    let isMounted = true;
    setLoadingBoard(true);
    Promise.all([
      getOpeningSegmentLeaderboard({ date: todayStr() }),
      getOpeningSegmentLeaderboard({})
    ])
      .then(([today, overall]) => {
        if (!isMounted) return;
        setTodayBoard(today);
        setOverallBoard(overall);
      })
      .catch(() => { if (isMounted) { setTodayBoard([]); setOverallBoard([]); } })
      .finally(() => { if (isMounted) setLoadingBoard(false); });
    return () => { isMounted = false; };
  }, [refreshKey]);

  // ترتيب كل الفصول المعرّفة في CLASSES — الفصول اللي لسه معاهاش درجات
  // بتتسجل بتظهر برصيد صفر (مش بتختفي من الترتيب خالص).
  const buildRanked = (rows) => CLASSES.map(c => {
    const row = rows.find(r => r.class_id === c.id);
    return {
      ...c,
      total_hymn: row?.total_hymn || 0,
      total_bible_reading: row?.total_bible_reading || 0,
      total_questions: row?.total_questions || 0,
      total_quietness: row?.total_quietness || 0,
      total_score: row?.total_score || 0
    };
  }).sort((a, b) => b.total_score - a.total_score);

  const rankedToday = buildRanked(todayBoard);
  const rankedOverall = buildRanked(overallBoard);
  const rankedClasses = boardTab === 'today' ? rankedToday : rankedOverall;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await recordOpeningSegmentScore({
        classId: selectedClass,
        scoreDate,
        hymnScore,
        bibleReadingScore,
        questionsScore,
        quietnessScore
      }, viewer);
      triggerRefresh();
      showToast('تم الحفظ 🎶', `درجات الفقرة الافتتاحية لفصل "${currentClassInfo.name}" اتحدثت`, 0, 'success');
    } catch (err) {
      showToast('خطأ', err.message || 'تعذر حفظ الدرجات', 0, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right max-w-2xl mx-auto">

      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-l from-indigo-600 to-sky-700 p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center shrink-0">
            <Music4 className="w-9 h-9 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">الفقرة الافتتاحية</h2>
            <p className="text-sky-100 text-xs mt-1">درجات الفصل ككل: ترنيمة، قراءة إنجيل، أسئلة، وهدوء — تنافس بين الفصول</p>
          </div>
        </div>
      </div>

      {/* Entry Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-5">

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">الفصل</span>
            {isSuperAdmin ? (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs py-2 px-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                >
                  {CLASSES.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.patron}</option>
                  ))}
                </select>
              </div>
            ) : (
              <h3 className="font-extrabold text-slate-900 text-sm">{currentClassInfo.name}</h3>
            )}
          </div>

          <div>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">تاريخ اللقاء</span>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={scoreDate}
                max={todayStr()}
                onChange={(e) => setScoreDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs py-2 px-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
              />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-medium -mt-2">
          سيب أي بند فاضي لو الفقرة دي اتلغت في اللقاء ده — مش هيتحسب صفر، هيتحسب "متعملتش".
        </p>

        {loadingForm ? (
          <div className="py-6 text-center text-slate-400 font-bold text-sm">جاري التحميل... ⏳</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 mb-1.5">
                <Music4 className="w-4 h-4 text-indigo-500" /> الترنيمة
              </label>
              <input
                type="number" min="0" placeholder="لم تُقم" value={hymnScore}
                onChange={(e) => setHymnScore(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-black text-center text-sm transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 mb-1.5">
                <BookOpenText className="w-4 h-4 text-emerald-600" /> قراءة الإنجيل
              </label>
              <input
                type="number" min="0" placeholder="لم تُقم" value={bibleReadingScore}
                onChange={(e) => setBibleReadingScore(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-black text-center text-sm transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 mb-1.5">
                <HelpCircle className="w-4 h-4 text-amber-500" /> الأسئلة
              </label>
              <input
                type="number" min="0" placeholder="لم تُقم" value={questionsScore}
                onChange={(e) => setQuestionsScore(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-black text-center text-sm transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 mb-1.5">
                <Moon className="w-4 h-4 text-slate-500" /> الهدوء
              </label>
              <input
                type="number" min="0" placeholder="لم تُقم" value={quietnessScore}
                onChange={(e) => setQuietnessScore(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-black text-center text-sm transition-all"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving || loadingForm}
          className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-extrabold py-3 rounded-xl transition-all shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ الدرجات
        </button>
      </form>

      {/* Leaderboard */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-extrabold text-slate-900 text-base">ترتيب الفصول</h3>
        </div>

        {/* صدارة اليوم / الصدارة العامة */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setBoardTab('today')}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
              boardTab === 'today' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarCheck className="w-4 h-4" /> صدارة اليوم
          </button>
          <button
            type="button"
            onClick={() => setBoardTab('overall')}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
              boardTab === 'overall' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Trophy className="w-4 h-4" /> الصدارة العامة
          </button>
        </div>

        {loadingBoard ? (
          <div className="py-6 text-center text-slate-400 font-bold text-sm">جاري التحميل... ⏳</div>
        ) : boardTab === 'today' && rankedToday.every(c => c.total_score === 0) ? (
          <div className="py-8 text-center text-slate-400 font-medium text-sm">
            لسه محدش سجّل درجات الفقرة الافتتاحية النهارده.
          </div>
        ) : (
          <div className="space-y-3">
            {rankedClasses.map((c, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              return (
                <div
                  key={c.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 card-hover ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-amber-300 shadow-sm'
                      : isSecond
                      ? 'bg-slate-100/60 border-slate-200'
                      : isThird
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-slate-50/60 border-slate-200/70'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="shrink-0 flex items-center justify-center">
                      {isFirst ? (
                        <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-sm border border-amber-300">
                          <Crown className="w-6 h-6 fill-amber-900 text-amber-900" />
                        </div>
                      ) : isSecond ? (
                        <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-800 flex items-center justify-center font-black shadow-sm border border-slate-300">
                          <Medal className="w-6 h-6 text-slate-700" />
                        </div>
                      ) : isThird ? (
                        <div className="w-10 h-10 rounded-2xl bg-amber-700/80 text-white flex items-center justify-center font-black shadow-sm">
                          <Medal className="w-6 h-6 text-amber-200" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                          #{index + 1}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-900 text-sm truncate">{c.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
                        🎵{c.total_hymn} · 📖{c.total_bible_reading} · ❓{c.total_questions} · 🤫{c.total_quietness}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-2xl shadow-sm border border-amber-400 shrink-0">
                    <span className="text-base">{c.total_score}</span>
                    <span className="text-xs font-normal">نقطة</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
