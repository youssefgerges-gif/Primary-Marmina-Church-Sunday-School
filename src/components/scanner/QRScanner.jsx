import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Camera, CheckCircle, Sparkles, RefreshCw, Smartphone } from 'lucide-react';
import { recordAttendance } from '../../services/supabase';
import { usePoints } from '../../context/PointsContext';
import { useAuth } from '../../context/AuthContext';

export default function QRScanner({ onScanSuccess }) {
  const { showToast, triggerRefresh } = usePoints();
  const { allUsers } = useAuth();
  const [lastScannedUser, setLastScannedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanMethod, setScanMethod] = useState('camera'); // 'camera' or 'picker'
  const scannerRef = useRef(null);

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
              videoConstraints: {
                facingMode: { ideal: "environment" },
                aspectRatio: 1.0
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
            <Smartphone className="w-4 h-4" /> اختيار كارت للتجربة (Quick Test)
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
        /* QUICK TEST PICKER FOR DESKTOP */
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 space-y-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-600" /> اختر مخدوم محاكاة لمسح كارت QR
            </h3>
            <span className="text-xs text-slate-500 font-medium">اضغط للمسح الفوري</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allUsers.map((user) => (
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
                      {user.role === 'student' ? 'مخدوم' : user.role === 'servant' ? 'خادم' : 'أمين خدمة'} | {user.qr_code}
                    </span>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-bold text-[10px] group-hover:scale-105 transition-transform">
                  مسح QR ⚡️
                </div>
              </button>
            ))}
          </div>
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
