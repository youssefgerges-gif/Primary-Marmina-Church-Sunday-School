import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PointsProvider } from './context/PointsContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import Toast from './components/common/Toast';
import Login from './components/auth/Login';

// Scanner Component
import QRScanner from './components/scanner/QRScanner';

// Servant Components
import ClassLeaderboard from './components/servant/ClassLeaderboard';
import ManualPointsTool from './components/servant/ManualPointsTool';

// Admin Components
import Analytics from './components/admin/Analytics';
import AbsenceTracker from './components/admin/AbsenceTracker';
import UserManagement from './components/admin/UserManagement';

// Student Components
import StudentCard from './components/student/StudentCard';
import HistoryTimeline from './components/student/HistoryTimeline';

function MainContent() {
  const { role, currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('scanner');

  // Land on the right default tab once we know who's actually logged in
  // (role is unknown until the session/profile finishes loading, so this
  // can't be computed synchronously at mount like it used to be).
  useEffect(() => {
    if (role) {
      setActiveTab(role === 'super_admin' ? 'admin-analytics' : role === 'student' ? 'student-card' : 'scanner');
    }
  }, [role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 transition-colors duration-300">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-slate-50 text-slate-800 transition-colors duration-300 dir-rtl">
      
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Gamified Toast Popup */}
      <Toast />

      {/* View Router Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* GENERAL SERVICE ADMIN (أمناء الخدمة العامة: أبونا بيشوي / يوسف جرجس) */}
        {role === 'super_admin' && (
          <>
            {activeTab === 'admin-analytics' && <Analytics />}
            {activeTab === 'admin-efteqad' && <AbsenceTracker />}
            {activeTab === 'admin-users' && <UserManagement />}
            {/* أمين الخدمة العامة كمان لازم يقدر يشوف رصيد نقاط/كوبونات أي
                مخدوم — نفس شاشة لوحة الصدارة اللي أمناء الفصول والخدام
                شايفينها، بس هنا بتغطي كل الفصول (نفس الاختيار المتاح أصلاً
                من قايمة الفصول جوه الشاشة نفسها). */}
            {activeTab === 'servant-leaderboard' && <ClassLeaderboard />}
            {/* أمين الخدمة العامة ما كانش قدامه أي طريقة يسجل بيها حضور خالص
                (لا كاميرا ولا تسجيل يدوي) — نفس شاشة الماسح اللي أمناء
                الفصول/المساعدين/الخدام شايفينها، وبما إنه مش مقفول على فصل
                معين، هيشوف كل الفصول في تبويب التسجيل اليدوي (get_manual_
                attendance_roster() في schema.sql بترجع الكل لـ super_admin). */}
            {activeTab === 'scanner' && <QRScanner />}
          </>
        )}

        {/* CLASS ADMIN / ASSISTANT ADMIN / SERVANT (أمين الفصل / أمين مساعد / خادم) */}
        {(role === 'class_admin' || role === 'assistant_admin' || role === 'servant') && (
          <>
            {activeTab === 'scanner' && <QRScanner />}
            {activeTab === 'servant-leaderboard' && <ClassLeaderboard />}
            {activeTab === 'servant-manual-points' && <ManualPointsTool />}
            {activeTab === 'admin-efteqad' && <AbsenceTracker />}
          </>
        )}

        {/* STUDENT / PARENT (المخدوم / ولي الأمر) */}
        {role === 'student' && (
          <>
            {activeTab === 'student-card' && <StudentCard />}
            {activeTab === 'student-history' && <HistoryTimeline />}
          </>
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PointsProvider>
          <MainContent />
        </PointsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
