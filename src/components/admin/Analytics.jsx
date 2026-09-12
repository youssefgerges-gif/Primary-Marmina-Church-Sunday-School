import React, { useState, useEffect } from 'react';
import { Users, UserCheck, CalendarCheck, Award, TrendingUp, Sparkles, Shield, Crown, User } from 'lucide-react';
import { getUsers, getLeaderboard, getServiceStats, CLASSES } from '../../services/supabase';
import { usePoints } from '../../context/PointsContext';
import SaintIconArt from '../common/SaintIconArt';

export default function Analytics() {
  const { refreshKey } = usePoints();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalServants: 0,
    superAdminsCount: 0,
    classAdminsCount: 0,
    assistantAdminsCount: 0,
    regularServantsCount: 0,
    totalPointsDistributed: 0,
    attendanceRate: '0%'
  });
  const [servantsByClass, setServantsByClass] = useState([]);

  useEffect(() => {
    Promise.all([getUsers(), getServiceStats()]).then(([users, serviceStats]) => {
      const allServants = users.filter(u => u.role !== 'student');
      const stuCount = users.filter(u => u.role === 'student').length;

      const superCount = users.filter(u => u.role === 'super_admin').length;
      const classAdminCount = users.filter(u => u.role === 'class_admin').length;
      const assistantCount = users.filter(u => u.role === 'assistant_admin').length;
      const regularServantCount = users.filter(u => u.role === 'servant').length;

      // Group servants by class
      const classBreakdown = CLASSES.map(c => {
        const count = users.filter(u => u.class_id === c.id && u.role !== 'student').length;
        return { ...c, servantCount: count };
      });

      setStats({
        totalStudents: stuCount,
        totalServants: allServants.length,
        superAdminsCount: superCount,
        classAdminsCount: classAdminCount,
        assistantAdminsCount: assistantCount,
        regularServantsCount: regularServantCount,
        totalPointsDistributed: serviceStats.totalPointsDistributed,
        attendanceRate: serviceStats.attendanceRate
      });

      setServantsByClass(classBreakdown);
    });
  }, [refreshKey]);

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-indigo-700 to-sky-800 rounded-3xl p-6 text-white shadow-md flex items-center justify-between relative overflow-hidden">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5" /> لوحة تحليلات أمين الخدمة العامة
          </span>
          <h2 className="text-2xl font-black">إحصائيات الخدمة وكشوفات الخدام الحقيقية</h2>
          <p className="text-sky-100 text-xs mt-1">عرض أعداد الخدام المسجلين بكافة الفصول الـ 7 مع تصفير المخدومين والنقاط للأدوار الجديدة</p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-sky-200 shrink-0 shadow-inner">
          <Award className="w-10 h-10" />
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Real Servants Count Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">إجمالي عدد الخدام الحقيقي</span>
            <h3 className="text-2xl font-black text-indigo-900 mt-1">{stats.totalServants} خادم وخادمة</h3>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full mt-2 inline-block border border-sky-100">
              مسجلين بالـ 7 فصول ⛪️
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Total Students Card (Zeroed) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">إجمالي المخدومين</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalStudents} مخدوم</h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block border border-emerald-100">
              تم التصفير جاهز للإضافة ✨
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Points & Coupons (Zeroed) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">رصيد النقاط والكوبونات</span>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.totalPointsDistributed} نقطة</h3>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full mt-2 inline-block border border-amber-100">
              سجل جديد مصفر 🌟
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">سجل افتقاد الحضور</span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.attendanceRate}</h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block border border-emerald-100">
              جاهز لتسجيل الحضور 📅
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Real Servants Role Breakdown */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <Shield className="w-5 h-5 text-sky-600" /> توزيع الأدوار الحقيقية للخدام ({stats.totalServants} خادم)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-purple-950 text-center">
            <span className="text-2xl font-black block text-purple-700">{stats.superAdminsCount}</span>
            <span className="text-xs font-bold mt-1 block text-purple-900">أمناء الخدمة العامة</span>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-950 text-center">
            <span className="text-2xl font-black block text-indigo-700">{stats.classAdminsCount}</span>
            <span className="text-xs font-bold mt-1 block text-indigo-900">أمناء الفصول (7 فصول)</span>
          </div>
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-sky-950 text-center">
            <span className="text-2xl font-black block text-sky-700">{stats.assistantAdminsCount}</span>
            <span className="text-xs font-bold mt-1 block text-sky-900">أمناء فصول مساعدون</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-center">
            <span className="text-2xl font-black block text-slate-700">{stats.regularServantsCount}</span>
            <span className="text-xs font-bold mt-1 block text-slate-800">خدام الكشوفات والافتفاد</span>
          </div>
        </div>
      </div>

      {/* Servants per Class Breakdown Grid with Real Saint Icon Photos */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500" /> صور القديسين وفصول الخدمة الـ 7 وكشوفات الخدام
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {servantsByClass.map(c => (
            <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative overflow-hidden flex flex-col justify-between hover:border-sky-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-amber-300 shrink-0 shadow-sm">
                  <SaintIconArt classId={c.id} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="font-black text-slate-900 text-xs block">{c.name}</span>
                  <p className="text-[11px] text-amber-700 font-bold leading-tight mt-0.5">
                    {c.saintName || c.patron}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-600">عدد الخدام:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-black text-xs border border-sky-200/60">
                  {c.servantCount} خادم
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
