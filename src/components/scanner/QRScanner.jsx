import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Camera, CheckCircle, Sparkles, RefreshCw, Smartphone, AlertTriangle, Search } from 'lucide-react';
import { recordAttendance, getManualAttendanceRoster, CLASSES } from '../../services/supabase';
import { usePoints } from '../../context/PointsContext';
import { useAuth } from '../../context/AuthContext';

// Matches Navbar.jsx's role labels — بتتعرض جنب كل اسم في القائمة اليدوية.
// أمين الخدمة العامة لسه بيشوف مخدومين وخدام مع بعض (فمحتاج كل التسميات)؛
// باقي الأدوار دلوقتي (2026-09-20) بتشوف مخدومين بس من فصلها.
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
  const [cameraError, setCameraError] = useState(null);
  const [cameraRetryKey, setCameraRetryKey] = useState(0);
  const scannerRef = useRef(null);

  // Class-scoped roster for the manual picker tab — servant, class_admin and
  // assistant_admin all see مخدومين (students) of their own class only; any
  // data/attendance about خدام is exclusive to super_admin (Mr. Gerges'
  // explicit 2026-09-20 decision — a same-day experiment briefly let them
  // see each other's class too, then this was reverted the same day). See
  // get_manual_attendance_roster() in schema.sql for where this is actually
  // enforced server-side. currentUser.role/class_id here is only a fallback
  // for local/mock mode; against a real Supabase project the server checks
  // who's actually logged in itself, so this can't be spoofed from the app.
  const [rosterUsers, setRosterUsers] = useState([]);
  const isScoped = currentUser && currentUser.role !== 'super_admin';
  const scopedClassName = isScoped ? CLASSES.find(c => c.id === currentUser.class_id)?.name : null;

  // طلب 2026-09-19: بحث بالاسم جوه تبويب "تسجيل الحضور يدويًا" لكل الأدوار،
  // وتقسيم القائمة لفصول لأمين الخدمة العامة تحديدًا لأنه الوحيد اللي شايف
  // كل الفصول مجمّعة في قائمة واحدة طويلة (باقي الأدوار أصلاً مقفولة على
  // فصلها من get_manual_attendance_roster() في قاعدة البيانات).
  const [manualSearchQuery, setManualSearchQuery] = useState('');

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
      const result = await recordAttendance(
        qrString,
        currentUser ? { role: currentUser.role, class_id: currentUser.class_id } : null
      );
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

  // Initialize the camera when camera mode is active — using the lower-level
  // Html5Qrcode API (Html5Qrcode.getCameras() + .start(cameraId, ...))
  // instead of the higher-level Html5QrcodeScanner widget we used before.
  //
  // Why: the widget picks a camera via a "facingMode" hint, and on some
  // Android camera stacks that hint gets silently accepted (the permission
  // prompt shows and is granted normally) but the resulting video stream
  // never actually renders — an empty/black box with no error anywhere.
  // Explicitly listing the real camera devices and starting a specific one
  // by its device ID (the officially recommended pattern for this exact
  // failure mode) sidesteps that facingMode negotiation entirely. We also
  // now show any startup error directly on screen (see cameraError below)
  // instead of only logging it to the console, so this can be diagnosed
  // without needing to plug the phone into a computer.
  useEffect(() => {
    if (scanMethod !== 'camera') return;
    let cancelled = false;
    let html5QrCode = null;
    setCameraError(null);

    const timer = setTimeout(async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const devices = await Html5Qrcode.getCameras();
        if (cancelled) return;
        if (!devices || devices.length === 0) {
          setCameraError('لم يتم العثور على أي كاميرا على هذا الجهاز.');
          return;
        }

        // Prefer a camera whose label mentions "back"/"rear" — most phones
        // report this once permission is granted. Otherwise, with more than
        // one camera the last one in the list is usually the main rear
        // camera on Android; with only one camera (most laptops), just use
        // it, front-facing or not.
        const backCamera =
          devices.find((d) => /back|rear|environment/i.test(d.label || '')) ||
          (devices.length > 1 ? devices[devices.length - 1] : devices[0]);

        await html5QrCode.start(
          backCamera.id,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            handleQRProcess(decodedText);
          },
          () => {
            // Ignore standard per-frame "no QR in this frame" scan errors
          }
        );
      } catch (e) {
        if (cancelled) return;
        console.warn("Camera QR Scanner initialization:", e);
        setCameraError(
          (e && (e.message || String(e))) ||
            'تعذر تشغيل الكاميرا. تأكد من السماح بإذن الكاميرا لهذا الموقع من إعدادات المتصفح، ثم أعد المحاولة.'
        );
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      const s = scannerRef.current;
      if (s) {
        if (s.isScanning) {
          s.stop().then(() => s.clear()).catch(() => {});
        } else {
          try { s.clear(); } catch (e) {}
        }
      }
    };
  }, [scanMethod, cameraRetryKey]);

  const trimmedManualQuery = manualSearchQuery.trim();
  const filteredRosterUsers = trimmedManualQuery
    ? rosterUsers.filter(u => u.name.includes(trimmedManualQuery))
    : rosterUsers;

  // تقسيم القائمة المفلترة على الفصول الـ 7 — لأمين الخدمة العامة فقط (مش
  // مقفول على فصل واحد زي باقي الأدوار)، وبنسيب أي فصل من غير حد ظاهر فيه
  // (بعد البحث) من غير ما نعرض عنوان فاضي له.
  const groupedByClass = !isScoped
    ? CLASSES
        .map(c => ({ classInfo: c, people: filteredRosterUsers.filter(u => u.class_id === c.id) }))
        .filter(g => g.people.length > 0)
    : null;

  const renderPersonCard = (user) => (
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
  );

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
            {cameraError && (
              <div className="absolute inset-0 bg-white flex flex-col items-center justify-center gap-3 p-6 text-center z-10">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
                <p className="text-slate-700 text-xs font-semibold leading-relaxed">{cameraError}</p>
                <button
                  onClick={() => setCameraRetryKey((k) => k + 1)}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}
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
            <>
              {/* Search by name */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={manualSearchQuery}
                  onChange={(e) => setManualSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم..."
                  className="w-full bg-slate-50 text-slate-900 font-semibold text-xs py-2.5 pr-10 pl-3 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                />
              </div>

              {filteredRosterUsers.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-8">لا يوجد نتائج مطابقة لبحثك "{trimmedManualQuery}".</p>
              ) : groupedByClass ? (
                <div className="space-y-5">
                  {groupedByClass.map((g) => (
                    <div key={g.classInfo.id}>
                      <h4 className="text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
                        {g.classInfo.name} ({g.people.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {g.people.map(renderPersonCard)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredRosterUsers.map(renderPersonCard)}
                </div>
              )}
            </>
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
