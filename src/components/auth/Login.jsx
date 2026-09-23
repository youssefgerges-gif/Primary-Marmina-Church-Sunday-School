import React, { useState } from 'react';
import { User, Lock, ArrowRight, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { findUserByUsername, claimAccount, loginWithUsername } from '../../services/supabase';
import logo from '../../assets/eparchy-logo.png';

const ROLE_LABELS = {
  super_admin: 'أمين خدمة',
  class_admin: 'أمين فصل',
  assistant_admin: 'أمين فصل مساعد',
  servant: 'خادم',
  student: 'مخدوم'
};

export default function Login() {
  // step: 'username' -> 'set-password' (first time) | 'enter-password' (returning)
  const [step, setStep] = useState('username');
  const [username, setUsername] = useState('');
  const [foundProfile, setFoundProfile] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const resetToUsernameStep = () => {
    setStep('username');
    setFoundProfile(null);
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) return;

    setBusy(true);
    try {
      const profile = await findUserByUsername(username);
      if (!profile) {
        setError('الكود ده مش موجود، تأكد منه أو كلم أمين الخدمة');
        return;
      }
      setFoundProfile(profile);
      setStep(profile.has_password ? 'enter-password' : 'set-password');
    } catch (err) {
      setError(err.message || 'حصل خطأ، حاول تاني');
    } finally {
      setBusy(false);
    }
  };

  const handleSetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('كلمة السر لازم تكون 6 حروف/أرقام على الأقل');
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمة السر وتأكيدها مش متطابقين');
      return;
    }

    setBusy(true);
    try {
      await claimAccount(username, password);
      // On success, AuthContext's onAuthStateChange picks up the new
      // session automatically and swaps this screen out.
    } catch (err) {
      const msg = err.message || 'تعذر إنشاء الحساب، حاول تاني';
      // طلب 2026-09-20: كان لو حصل سباق نادر — الكود ده اتسجّل فعلاً بكلمة
      // سر (يمكن من محاولة سابقة قبل كام ثانية، أو من جهاز/تاب تاني بيحاول
      // في نفس اللحظة — وارد وقت أول استخدام جماعي لأكواد مشتركة زي دي)
      // بين لحظة ما دسنا "متابعة" ولحظة ما دسنا هنا — الشاشة كانت بتفضل
      // واقفة على "أول مرة تدخل، اختار كلمة سر" مع رسالة تحتها بتقول إن
      // كلمة السر اتعملت قبل كده، من غير ما تنقل المستخدم لشاشة الدخول
      // العادية — شاشة متناقضة ومسدودة، الزرار الوحيد فيها بيفشل تاني وتاني.
      // دلوقتي بننقله فورًا لشاشة "دخول" العادية بدل ما نسيبه واقف مكانه.
      if (msg.includes('تم إنشاء كلمة سر لهذا الكود من قبل')) {
        setPassword('');
        setConfirmPassword('');
        setStep('enter-password');
        setError('يبدو إن كلمة السر لهذا الكود اتعملت خلاص (يمكن من محاولة سابقة) — اكتب كلمة السر بتاعتك وسجّل دخولك 👇');
        return;
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleEnterPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) return;

    setBusy(true);
    try {
      await loginWithUsername(username, password);
    } catch (err) {
      setError(err.message || 'تعذر تسجيل الدخول، حاول تاني');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10 dir-rtl transition-colors duration-300">
      <div className="w-full max-w-sm">

        {/* Branding */}
        <div className="flex flex-col items-center mb-6 text-center">
          <img src={logo} alt="شعار الكنيسة" className="w-20 h-20 rounded-full shadow-lg object-cover mb-3" />
          <h1 className="font-extrabold text-slate-800 text-xl">خدمة مدارس الأحد</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">كنيسة مارمينا والبابا كيرلس ⛪️</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-5 transition-colors duration-300">

          {step === 'username' && (
            <form onSubmit={handleUsernameSubmit} className="space-y-4 text-right">
              <div>
                <h2 className="font-extrabold text-slate-800 text-base mb-1">تسجيل الدخول</h2>
                <p className="text-xs text-slate-500">اكتب الكود بتاعك (مثال: ADM01)</p>
              </div>

              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="الكود (Username)"
                  className="w-full py-3 pr-10 pl-3 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50 text-slate-900 focus:ring-2 focus:ring-sky-500 text-right dir-ltr"
                  style={{ textAlign: 'right' }}
                />
              </div>

              {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white rounded-2xl font-black text-sm shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 rotate-180" />}
                متابعة
              </button>
            </form>
          )}

          {step === 'set-password' && foundProfile && (
            <form onSubmit={handleSetPasswordSubmit} className="space-y-4 text-right">
              <div>
                <h2 className="font-extrabold text-slate-800 text-base mb-1 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-600" /> أهلاً {foundProfile.name} 👋
                </h2>
                <p className="text-xs text-slate-500">
                  {ROLE_LABELS[foundProfile.role] || foundProfile.role} — أول مرة تدخل بالكود ده، اختار كلمة سر خاصة بيك
                </p>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة السر الجديدة (6 حروف على الأقل)"
                  className="w-full py-3 pr-10 pl-3 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50 text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تأكيد كلمة السر"
                  className="w-full py-3 pr-10 pl-3 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50 text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                إنشاء كلمة السر والدخول
              </button>

              <button
                type="button"
                onClick={resetToUsernameStep}
                className="w-full text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                ده مش أنا، رجوع
              </button>
            </form>
          )}

          {step === 'enter-password' && foundProfile && (
            <form onSubmit={handleEnterPasswordSubmit} className="space-y-4 text-right">
              <div>
                <h2 className="font-extrabold text-slate-800 text-base mb-1 flex items-center gap-1.5">
                  <LogIn className="w-4 h-4 text-sky-600" /> أهلاً بيك تاني، {foundProfile.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {ROLE_LABELS[foundProfile.role] || foundProfile.role} — اكتب كلمة السر بتاعتك
                </p>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة السر"
                  className="w-full py-3 pr-10 pl-3 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50 text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white rounded-2xl font-black text-sm shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                دخول
              </button>

              {/* طلب 2026-09-23: مفيش إيميل حقيقي مسجل لحد، فرابط "استرجاع
                  كلمة السر" التلقائي (اللي بيبعت إيميل) مش وارد يشتغل هنا —
                  التوضيح ده بيوجّه المستخدم لأقرب حد يقدر يساعده، واللي عنده
                  دلوقتي زرار "إعادة تعيين كلمة السر" في شاشته. */}
              <p className="text-center text-[11px] text-slate-400 font-medium">
                نسيت كلمة السر؟ كلّم خادم فصلك أو أمين الخدمة عشان يعيد تعيينها لك
              </p>

              <button
                type="button"
                onClick={resetToUsernameStep}
                className="w-full text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                ده مش أنا، رجوع
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
