import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Sparkles, Flame, Filter } from 'lucide-react';
import { getLeaderboard, CLASSES } from '../../services/supabase';
import { usePoints } from '../../context/PointsContext';
import SaintBadge from '../common/SaintBadge';

export default function ClassLeaderboard() {
  const { refreshKey } = usePoints();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('grade-5');

  const currentClassInfo = CLASSES.find(c => c.id === selectedClass) || CLASSES[0];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getLeaderboard(selectedClass).then(data => {
      if (isMounted) {
        setLeaderboard(data);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [selectedClass, refreshKey]);

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* Saint Patron Card Badge */}
      <SaintBadge classInfo={currentClassInfo} />

      {/* Leaderboard Cards List */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        
        {/* Class Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">{currentClassInfo.name}</h3>
              <p className="text-[11px] text-slate-500 font-medium">({currentClassInfo.patron})</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs py-2 px-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-full sm:w-auto transition-all"
            >
              {CLASSES.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.patron}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold text-sm">
            جاري تحميل لوحة الصدارة... ⏳
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-medium text-sm">
            لا يوجد مخدومين مسجلين في هذا الفصل بعد.
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((student, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              return (
                <div
                  key={student.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 card-hover ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-amber-300 shadow-sm'
                      : isSecond
                      ? 'bg-slate-100/60 border-slate-200'
                      : isThird
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-slate-50/60 border-slate-200/70 hover:bg-slate-100/50'
                  }`}
                >
                  {/* Left: Rank Badge & Avatar Info */}
                  <div className="flex items-center gap-4">
                    {/* Rank Badge Icon */}
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

                    {/* Student Name */}
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        {student.name}
                        {isFirst && (
                          <span className="text-[10px] bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-black">
                            المركز الأول 🥇
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">كود: {student.qr_code}</p>
                    </div>
                  </div>

                  {/* Right: Points Pill */}
                  <div className="flex items-center gap-1.5 bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-2xl shadow-sm border border-amber-400 shrink-0">
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span className="text-base">{student.total_points || 0}</span>
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
