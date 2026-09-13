import React, { useState, useEffect } from 'react';
import { Award, Shield, User, QrCode, Sparkles, Trophy, Gift, Users, CalendarCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePoints } from '../../context/PointsContext';
import { getStudentBalance } from '../../services/supabase';
import logo from '../../assets/eparchy-logo.png';

const ROLE_LABELS = {
  super_admin: 'أمين خدمة',
  class_admin: 'أمين فصل',
  assistant_admin: 'أمين فصل مساعد',
  servant: 'خادم',
  student: 'مخدوم'
};

export default function Navbar({ activeTab, setActiveTab }) {
  const { role, currentUser, logout } = useAuth();
  const { refreshKey } = usePoints();
  const [studentPoints, setStudentPoints] = useState(0);

  // Fetch student balance whenever student user or transaction happens
  useEffect(() => {
    if (currentUser && currentUser.role === 'student') {
      getStudentBalance(currentUser.id).then(pts => setStudentPoints(pts));
    }
  }, [currentUser, refreshKey]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="شعار الكنيسة" className="w-10 h-10 rounded-full shadow-md object-cover shrink-0" />
            <div>
              <h1 className="font-extrabold text-slate-900 text-lg leading-tight">
                خدمة مدارس الأحد
              </h1>
              <p className="text-xs text-slate-500 font-medium">خدمة التربية الكنسية</p>
            </div>
          </div>

          {/* Desktop Navigation Links based on 5 Roles */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
            
            {/* 1. أمين الخدمة العامة (Super Admin) */}
            {role === 'super_admin' && (
              <>
                <button
                  onClick={() => setActiveTab('admin-analytics')}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    activeTab === 'admin-analytics' ? 'bg-white text-sky-700 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-amber-500" /> الإحصائيات العامة
                </button>
                <button
                  onClick={() => setActiveTab('admin-efteqad')}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    activeTab === 'admin-efteqad' ? 'bg-white text-sky-700 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4 text-rose-500" /> سجل الافتقاد
                </button>
                <button
                  onClick={() => setActiveTab('admin-gifts')}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    activeTab === 'admin-gifts' ? 'bg-white text-sky-700 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Gift className="w-4 h-4 text-emerald-500" /> مخزون الهدايا
                </button>
                <button
                  onClick={() => setActiveTab('admin-users')}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    activeTab === 'admin-users' ? 'bg-white text-sky-700 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Users className="w-4 h-4 text-sky-600" /> الخدام والمخدومين
                </button>
              </>
            )}

            {/* 2. أمين الفصل & 3. أمين الفصل المساعد & 4. الخادم */}
            {(role === 'class_admin' || role === 'assistant_admin' || role === 'servant') && (
              <>
                <button
                  onClick={() => setActiveTab('scanner')}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    activeTab === 'scanner' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <QrCode className="w-4 h-4" /> مسح QR الحضور
                </button>
                <button
                  onClick={() => setActiveTab('servant-leaderboard')}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    activeTab === 'servant-leaderboard' ? 'bg-white text-sky-700 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-amber-500" /> لوحة صدارة الفصل
                </button>
                <button
                  onClick={() => setActiveTab('servant-manual-points')}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    activeTab === 'servant-manual-points' ? 'bg-white text-sky-700 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Award className="w-4 h-4 text-indigo-500" /> إضافة نقاط يدوي
                </button>
                <button
                  onClick={() => setActiveTab('servant-shop')}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    activeTab === 'servant-shop' ? 'bg-white text-sky-700 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Gift className="w-4 h-4 text-emerald-500" /> متجر الهدايا
                </button>
                {/* افتقاد الفصل: أمين الفصل وأمين الفصل المساعد فقط (مش الخادم
                    العادي) — وحتى لو حد وصلّها بطريقة تانية، الداتا نفسها
                    متقفلة على فصله بس من get_absence_report() في قاعدة
                    البيانات، مش مجرد إخفاء الزرار. */}
                {(role === 'class_admin' || role === 'assistant_admin') && (
                  <button
                    onClick={() => setActiveTab('admin-efteqad')}
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      activeTab === 'admin-efteqad' ? 'bg-white text-sky-700 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4 text-rose-500" /> افتقاد الفصل
                  </button>
                )}
              </>
            )}

            {/* 5. المخدوم / ولي الأمر */}
            {role === 'student' && (
              <>
                <button
                  onClick={() => setActiveTab('student-card')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    activeTab === 'student-card' ? 'bg-white text-sky-700 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <User className="w-4 h-4 text-sky-600" /> كارت المخدوم الرقمي
                </button>
                <button
                  onClick={() => setActiveTab('student-history')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    activeTab === 'student-history' ? 'bg-white text-sky-700 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4 text-indigo-600" /> سجل الحضور والنقاط
                </button>
              </>
            )}
          </nav>

          {/* Right Controls: Student Balance Badge, Logged-in Person Info & Logout */}
          <div className="flex items-center gap-2">

            {/* Live Student Points Counter */}
            {currentUser && currentUser.role === 'student' && (
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3.5 py-1.5 rounded-2xl shadow-sm border border-amber-400 flex items-center gap-1.5 text-xs font-black animate-pulse-glow">
                <Sparkles className="w-4 h-4 fill-white" />
                <span>{studentPoints}</span>
                <span className="opacity-90 font-normal">نقطة</span>
              </div>
            )}

            {/* Logged-in identity + logout */}
            {currentUser && (
              <div className="flex items-center gap-2.5 bg-slate-100/80 border border-slate-200 rounded-2xl py-1.5 pr-1.5 pl-3">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {currentUser.name?.[0]}
                </div>
                <div className="leading-tight text-right hidden sm:block">
                  <span className="block text-xs font-extrabold text-slate-900 max-w-[140px] truncate">{currentUser.name}</span>
                  <span className="block text-[10px] font-bold text-sky-700">{ROLE_LABELS[role] || role}</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="تسجيل الخروج"
                  className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 border border-rose-200/60 transition-colors shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
