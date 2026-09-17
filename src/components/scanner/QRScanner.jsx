import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Camera, CheckCircle, Sparkles, RefreshCw, Smartphone } from 'lucide-react';
import { recordAttendance, getManualAttendanceRoster, CLASSES } from '../../services/supabase';
import { usePoints } from '../../context/PointsContext';
import { useAuth } from '../../context/AuthContext';

// Matches Navbar.jsx's role labels — a خادم عادي only ever sees مخدومين هنا،
// لكن أمين الفصل/المساعد بيشوفوا خدام تانيين كمان، فمحتاجين نعرض دور كل حد
// صح (كانت قبل كده بتتعرض كلها "أمين خدمة" حتى لو الشخص أمين فصل عادي).
const ROLE_LABELS = {
  class_admin: 'أمين فصل',
  assistant_admin: 'أمين فصل مساعد',
  servant: 'خادم',
  student: 'مخدوم'
};

export default function QRScanner({ onScanSuccess }) {
  const { showToast, triggerRefresh } = usePoints();
  const { currentUser } = useAuth();
  const [lastScannedUser, setLastScannedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanMethod, setScanMethod] = useState('camera'); // 'camera' or 'picker'
  const scannerRef = useRef(null);

  // Class-scoped, role-differentiated roster for the manual picker tab —
  // servant only ever sees مخدومين of their own class; class_admin /
  // assistant_admin see مخدومين AND خدام of their own class (see
  // get_manual_attendance_roster() in schema.sql for where this is actually
  // enforced server-side). currentUser.role/class_id here is only a fallback
  // for local/mock mode; against a real Supabase project the server checks
  // who's actually logged in itself, so this can't be spoofed from the app.
  const [rosterUsers, setRosterUsers] = useState([]);
  const isScoped = currentUser && currentUser.role !== 'super_admin';
  const scopedClassName = isScoped ? CLASSES.find(c => c.id === currentUser.class_id)?.name : null;

  useEffect(() => {
    getManualAttendanceRoster(currentUser ? { role: currentUser.role, class_id: currentUser.class_id } : null)
      .then(setRosterUsers)
      .catch(() => setRosterUsers([]));
  }, [currentUser?.role, currentUser?.class_id]);

  // Process QR string
  const handleQRProcess = async (qrString) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await recordAttendance(qrString);
      setLastScannedUser(result.user);
      triggerRefresh();

      if (result.user.role === 'student') {
        showToast(
          'تم تسجيل الحضور وإضافة النقاط! 🎉',
          `أهلاً بك يا ${result.user.name}. تم تسجيل حضورك وإضافة +${result.pointsAdded} نقاط لرصيدك!`,
          result.pointsAdded,
          'success'
        );
      } else {
        showToast(
          'تم تسجيل حضور الخادم ⛪️',
          `أهلاً بك يا ${result.user.name} في خدمة مدارس الأحد!`,
          0,
          'success'
        );
      }

      if (onScanSuccess) onScanSuccess(result);
    } catch (err) {
      showToast('خطأ في مسح QR', err.message || 'رمز QR غير معروف أو حدث خطأ أثناء التسجيل', 0, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Initialize html5-qrcode scanner when camera mode active
  useEffect(() => {
    let scanner = null;
    if (scanMethod === 'camera') {
      // Small timeout to allow element DOM rendering
      const timer = setTimeout(() => {
        try {
          scanner = new Html5QrcodeScanner(
            "reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              showTorchButtonIfSupported: true,
              // Ask for the rear/back camera by default (QR scanning is done
              // by pointing the phone at someone else's card, not a selfie).
              // "ideal" (not "exact") so it still falls back gracefully on a
              // laptop with only a front-facing webcam instead of failing.
              //
              // IMPORTANT: don't also force aspectRatio inside videoConstraints
              // (we used to set it to 1.0 here, matching the qrbox above) —
              // most phone rear cameras can't natively stream a strict 1:1
              // feed, and forcing it is what caused the black/empty camera
              // box on Android even after the permission prompt was accepted
              // (the getUserMedia call "succeeds" but the resulting video
              // stream never actually renders). The top-level aspectRatio
              // above already controls the on-screen scanning box shape —
              // the real camera stream itself should stay unconstrained.
              videoConstraints: {
                facingMode: { ideal: "environment" }
              }
            },
            /* verbose= */ false
          );

          scanner.render(
            (decodedText) => {
              handleQRProcess(decodedText);
            },
            (errorMessage) => {
              // Ignore standard frame scan errors
            }
          );
          scannerRef.current = scanner;
        } catch (e) {
          console.warn("Camera QR Scanner initialization:", e);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
        }
      };
    }
  }, [scanMethod]);

  return (
    <div className="max-w-xl mx-auto space-y-6 dir-rtl text-right">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
              <Camera className="w-3.5 h-3.5" /> ماسح كارت الخدمة
            </span>
            <h2 className="text-2xl font-black">تسجيل حضور المخدومين والخدام</h2>
            <p className="text-sky-100 text-xs mt-1">وجه كاميرا الهاتف نحو رمز QR الخاص بالكارت الخاص بالمخدوم</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shrink-0">
            <QrCode className="w-8 h-8" />
          </div>
        </div>

        {/* Mode Switcher Tabs (Camera vs Quick Picker for Desktop Testing) */}
        <div className="flex items-center gap-2 mt-5 bg-black/20 p-1.5 rounded-2xl backdrop-blur-md">
          <button
            onClick={() => setScanMethod('camera')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              scanMethod === 'camera' ? 'bg-white text-sky-800 shadow-md' : 'text-white/80 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" /> الكاميرا الحية
          </button>
          <button
            onClick={() => setScanMethod('picker')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              scanMethod === 'picker' ? 'bg-white text-sky-800 shadow-md' : 'text-white/80 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" /> تسجيل الحضور يدويًا
          </button>
        </div>
      </div>

      {/* Main Scanner Container */}
      {scanMethod === 'camera' ? (
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 text-center space-y-4 transition-colors duration-300">
          <p className="text-slate-600 font-semibold text-sm">قم بتوجيه الكاميرا إلى رمز QR تسجيل الحضور</p>

          <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-sky-300 bg-slate-50 min-h-[300px] flex items-center justify-center">
            <div id="reader" className="w-full"></div>
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-2">
                <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
                <span className="font-bold text-sky-800 text-sm">جاري تسجيل الحضور وإضافة النقاط...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* MANUAL (NO-CAMERA) ATTENDANCE PICKER */
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 space-y-4 transition-colors duration-300">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-600" />
              {isScoped
                ? `تسجيل حضور — فصل ${scopedClassName || ''} فقط`
                : 'اختر شخص لتسجيل حضوره'}
            </h3>
            <span className="text-xs text-slate-500 font-medium">اضغط للتسجيل الفوري</span>
          </div>

          {rosterUsers.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-8">لا يوجد أشخاص لعرضهم في فصلك حاليًا.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rosterUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQRProcess(user.qr_code)}
                  disabled={loading}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-sky-500 bg-slate-50 hover:bg-sky-50/50 flex items-center justify-between text-right transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 group-hover:bg-sky-600 text-sky-700 group-hover:text-white flex items-center justify-center font-bold text-sm transition-colors">
                      {user.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{user.name}</h4>
                      <span className="text-[10px] text-slate-500 block">
                        {ROLE_LABELS[user.role] || user.role} | {user.qr_code}
                      </span>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-bold text-[10px] group-hover:scale-105 transition-transform">
                    تسجيل ⚡️
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Success Popup Card overlay */}
      {lastScannedUser && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 shadow-lg flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-base">{lastScannedUser.name}</h4>
                <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  تم الحضور ✅
                </span>
              </div>
              <p className="text-emerald-800 text-xs mt-0.5 font-medium">
                {lastScannedUser.role === 'student' ? 'تمت إضافة 10 نقاط لحساب المخدوم بنجاح' : 'تم تسجل حضور الخادم'}
              </p>
            </div>
          </div>

          {lastScannedUser.role === 'student' && (
            <div className="bg-amber-400 text-slate-900 px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1 shadow-sm shrink-0">
              <Sparkles className="w-4 h-4 fill-amber-900" /> +10 نقاط
            </div>
          )}
        </div>
      )}

    </div>
  );
}
