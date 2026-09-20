import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Plus, QrCode, Phone, Search, Shield, User, Download, Printer, Edit2, Trash2, CheckCircle2, MessageCircle } from 'lucide-react';
import { getUsers, saveUser, deleteUser, CLASSES, resetMockData } from '../../services/supabase';
import { SAINT_IMAGES } from '../../services/saintImages';
import { usePoints } from '../../context/PointsContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import WhatsAppModal from '../common/WhatsAppModal';
import eparchyLogo from '../../assets/eparchy-logo.png';

export default function UserManagement() {
  const { showToast, triggerRefresh, refreshKey } = usePoints();
  const { refreshUsers } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedQRUser, setSelectedQRUser] = useState(null);
  const [whatsappUser, setWhatsappUser] = useState(null);
  const [isPrintingBatch, setIsPrintingBatch] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: 'student',
    phone: '',
    birth_date: '',
    address: '',
    guardian_phone: '',
    class_id: 'grade-5',
    title: 'مخدوم'
  });

  const loadUsersList = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsersList();
  }, [refreshKey]);

  // Batch card printing: the hidden #batch-print-cards grid (see index.css)
  // only shows up in the print/"Save as PDF" output, never on screen. Once
  // it's rendered we wait for every card's background image (church logo /
  // saint photos) to actually finish loading before opening the print
  // dialog — a fixed short delay isn't enough on a phone, where dozens of
  // images across many cards may still be downloading/decoding, and a
  // browser's print/PDF snapshot only captures what has already painted.
  // Skipping this wait is why cards were printing with blank backgrounds.
  // A safety timeout still opens the dialog even if an image never loads.
  useEffect(() => {
    if (!isPrintingBatch) return;
    let cancelled = false;
    let printed = false;

    const doPrint = () => {
      if (printed || cancelled) return;
      printed = true;
      window.print();
    };

    const timer = setTimeout(() => {
      const container = document.getElementById('batch-print-cards');
      const imgs = container ? Array.from(container.querySelectorAll('img')) : [];
      const pending = imgs.filter((img) => !img.complete);

      if (pending.length === 0) {
        doPrint();
        return;
      }

      let remaining = pending.length;
      const onSettled = () => {
        remaining -= 1;
        if (remaining <= 0) doPrint();
      };
      pending.forEach((img) => {
        img.addEventListener('load', onSettled, { once: true });
        img.addEventListener('error', onSettled, { once: true });
      });

      // Safety net: don't leave the user stuck with no print dialog if an
      // image somehow never fires load/error.
      setTimeout(doPrint, 5000);
    }, 60);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isPrintingBatch]);

  useEffect(() => {
    const handleAfterPrint = () => setIsPrintingBatch(false);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const filteredUsers = users.filter(u => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      u.name?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.qr_code?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.title?.toLowerCase().includes(q);

    let matchesRole = true;
    if (roleFilter === 'student') matchesRole = u.role === 'student';
    else if (roleFilter === 'servants_group') matchesRole = u.role !== 'student';
    else if (roleFilter === 'super_admin') matchesRole = u.role === 'super_admin';
    else if (roleFilter === 'class_admin') matchesRole = u.role === 'class_admin' || u.role === 'assistant_admin';
    
    return matchesSearch && matchesRole;
  });

  const handleResetData = async () => {
    setLoading(true);
    try {
      await resetMockData();
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
      if (refreshUsers) refreshUsers();
      showToast('تم فحص الكشوفات! 🔄', 'تم إضافة أي شخص كان ناقصًا من القائمة الأصلية بس — أي حد موجود أصلاً متلمسش خالص (لا اسمه ولا دوره ولا رقم تليفونه)', 0, 'success');
    } catch (err) {
      showToast('خطأ في التحديث', err.message || 'حدث خطأ أثناء تحميل البيانات', 0, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      role: 'servant',
      phone: '',
      birth_date: '',
      address: '',
      guardian_phone: '',
      class_id: 'grade-5',
      title: 'خادم'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      id: user.id,
      name: user.name,
      role: user.role,
      phone: user.phone || '',
      birth_date: user.birth_date || '',
      address: user.address || '',
      guardian_phone: user.guardian_phone || '',
      class_id: user.class_id || 'grade-5',
      title: user.title || (user.role === 'student' ? 'مخدوم' : 'خادم'),
      qr_code: user.qr_code
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`هل أنت تأكد من حذف "${userName}" من النظام؟`)) {
      try {
        await deleteUser(userId);
        const updated = await getUsers();
        setUsers(updated);
        triggerRefresh();
        if (refreshUsers) refreshUsers();
        showToast('تم الحذف 🗑️', `تم حذف ${userName} من الكشوفات بنجاح`, 0, 'success');
      } catch (err) {
        showToast('خطأ', err.message || 'فشل حذف الشخص', 0, 'error');
      }
    }
  };

  const handleRoleChange = (newRole) => {
    let defaultTitle = 'مخدوم';
    if (newRole === 'super_admin') defaultTitle = 'أمين الخدمة';
    else if (newRole === 'class_admin') defaultTitle = 'أمين فصل';
    else if (newRole === 'assistant_admin') defaultTitle = 'أمين فصل مساعد';
    else if (newRole === 'servant') defaultTitle = 'خادم';

    setFormData({ ...formData, role: newRole, title: defaultTitle });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const savedUser = await saveUser(formData);
      const updated = await getUsers();
      setUsers(updated);
      triggerRefresh();
      if (refreshUsers) refreshUsers();

      // Show newly added user immediately in the table
      setRoleFilter('all');
      setSearchQuery(formData.name.trim());

      setIsModalOpen(false);
      showToast(
        editingUser ? 'تم تعديل البيانات بنجاح! ✏️' : 'تم إضافة الشخص بنجاح! 🎉',
        `تم حفظ بيانات "${formData.name}" بصفتـه (${formData.title || formData.role})`,
        0,
        'success'
      );
    } catch (err) {
      showToast('خطأ', err.message || 'تعذر حفظ البيانات', 0, 'error');
    }
  };

  const getRoleBadge = (user) => {
    if (user.role === 'super_admin') {
      return <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-md font-bold text-[10px] inline-flex items-center gap-1">👑 أمين خدمة عامة</span>;
    }
    if (user.role === 'class_admin') {
      return <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-md font-bold text-[10px] inline-flex items-center gap-1">⛪️ أمين فصل</span>;
    }
    if (user.role === 'assistant_admin') {
      return <span className="bg-sky-100 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-md font-bold text-[10px] inline-flex items-center gap-1">🤝 أمين فصل مساعد</span>;
    }
    if (user.role === 'servant') {
      return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md font-bold text-[10px] inline-flex items-center gap-1">✝️ خادم</span>;
    }
    return <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-md font-bold text-[10px] inline-flex items-center gap-1">🧒 مخدوم</span>;
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* Banner — text block and the 2 action buttons used to sit in one
          rigid row (flex justify-between). On a phone there isn't enough
          width for a long Arabic heading AND two buttons side by side, so
          the heading was wrapping into a squeezed narrow column and the
          "إضافة شخص جديد" button was getting pushed half off-screen. Now
          it stacks: text on top, full-width button row below, on small
          screens — and returns to the original side-by-side row from the
          sm breakpoint up (tablet/desktop), where there's room for both. */}
      <div className="bg-gradient-to-r from-sky-800 via-indigo-800 to-purple-800 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" /> كنيسة مارمينا والبابا كيرلس - كشوفات ودليل الخدمة
          </span>
          <h2 className="text-xl sm:text-2xl font-black">إدارة كشوفات وأدوار الخدام والمخدومين</h2>
          <p className="text-sky-100 text-xs mt-1">إضافة أشخاص جديد وتحديد أدوارهم (أمين خدمة، أمين فصل، أمين مساعد، خادم، أو مخدوم)</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleResetData}
            className="flex-1 sm:flex-none px-3.5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            title="إضافة أي شخص ناقص من القائمة الأصلية — آمن، مش بيلمس حد موجود أصلاً"
          >
            تحديث الكشوفات 🔄
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> إضافة شخص جديد
          </button>
        </div>
      </div>

      {/* Filter & Users List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-slate-800 space-y-4 transition-colors duration-300">
        
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الهاتف، أو الكود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${roleFilter === 'all' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              الكل ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('super_admin')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${roleFilter === 'super_admin' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              أمناء الخدمة ({users.filter(u => u.role === 'super_admin').length})
            </button>
            <button
              onClick={() => setRoleFilter('class_admin')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${roleFilter === 'class_admin' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              أمناء الفصول ({users.filter(u => u.role === 'class_admin' || u.role === 'assistant_admin').length})
            </button>
            <button
              onClick={() => setRoleFilter('servants_group')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${roleFilter === 'servants_group' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              كافة الخدام ({users.filter(u => u.role !== 'student').length})
            </button>
            <button
              onClick={() => setRoleFilter('student')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${roleFilter === 'student' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              المخدومين ({users.filter(u => u.role === 'student').length})
            </button>

            <button
              onClick={() => setIsPrintingBatch(true)}
              disabled={filteredUsers.length === 0}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
              title="يطبع كارنيه لكل شخص ظاهر في القايمة الحالية حسب الفلتر فوق — اختر «كافة الخدام» أو «المخدومين» أو أي فلتر تاني الأول"
            >
              <Printer className="w-3.5 h-3.5" /> طباعة الكارنيهات (PDF) — {filteredUsers.length}
            </button>
          </div>
        </div>

        {/* Users List: a real table on wider screens (tablet/desktop), and
            a stacked card list on phones — a table with 7 columns simply
            can't fit a phone's width, and scrolling it sideways hides the
            action buttons (edit/delete) off-screen where a non-technical
            user won't find them. Both render from the same filteredUsers
            data, only one is visible at a time per breakpoint. */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold text-sm">جاري تحميل كشوفات الأسماء... ⏳</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">لا يوجد أسماء تطابق البحث حالياً. اضغط "إضافة شخص جديد".</div>
        ) : (
          <>
            {/* Table — md screens and up */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold">
                    <th className="p-3.5 rounded-r-xl">الاسم بالكامل</th>
                    <th className="p-3.5">الدور والصفة</th>
                    <th className="p-3.5">الفصل المخصص</th>
                    <th className="p-3.5">رقم التليفون</th>
                    <th className="p-3.5">رمز QR</th>
                    <th className="p-3.5">كود الدخول</th>
                    <th className="p-3.5 rounded-l-xl text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 flex items-center justify-center font-black shrink-0">
                          {u.name[0]}
                        </div>
                        <div>
                          <span className="block font-bold">{u.name}</span>
                          {u.title && <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">{u.title}</span>}
                        </div>
                      </td>
                      <td className="p-3.5">
                        {getRoleBadge(u)}
                      </td>
                      <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                        {u.class_id === 'all' ? 'جميع الفصول 🌐' : CLASSES.find(c => c.id === u.class_id)?.name || 'غير محدد'}
                      </td>
                      <td className="p-3.5 font-medium text-slate-600 dark:text-slate-400">{u.phone || 'غير مسجل'}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">{u.qr_code}</td>
                      <td className="p-3.5 font-mono font-black text-sky-700 dark:text-sky-300">
                        {u.username || <span className="text-slate-400 dark:text-slate-600 font-sans font-medium">—</span>}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setWhatsappUser(u)}
                            className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs inline-flex items-center gap-1 transition-colors border border-emerald-200 dark:border-emerald-800"
                            title="إرسال رسالة واتساب"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedQRUser(u)}
                            className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold text-xs inline-flex items-center gap-1 transition-colors border border-sky-200 dark:border-sky-800"
                            title="عرض كارت QR"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs inline-flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700"
                            title="تعديل الدور أو البيانات"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 font-bold text-xs inline-flex items-center gap-1 transition-colors border border-rose-200 dark:border-rose-800"
                            title="حذف من الكشوفات"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card list — phones only, below md */}
            <div className="md:hidden space-y-3">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 flex items-center justify-center font-black shrink-0">
                      {u.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{u.name}</p>
                      {u.title && <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{u.title}</p>}
                    </div>
                    <div className="shrink-0">{getRoleBadge(u)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-3 text-[11px]">
                    <div className="text-slate-500 dark:text-slate-400 truncate">
                      الفصل: <span className="font-bold text-slate-700 dark:text-slate-300">{u.class_id === 'all' ? 'جميع الفصول 🌐' : CLASSES.find(c => c.id === u.class_id)?.name || 'غير محدد'}</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 truncate">
                      الهاتف: <span className="font-bold text-slate-700 dark:text-slate-300">{u.phone || 'غير مسجل'}</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 truncate">
                      رمز QR: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{u.qr_code}</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 truncate">
                      كود الدخول: <span className="font-mono font-black text-sky-700 dark:text-sky-300">{u.username || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setWhatsappUser(u)}
                      className="flex-1 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 active:bg-emerald-100 dark:active:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800"
                      title="إرسال رسالة واتساب"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedQRUser(u)}
                      className="flex-1 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 active:bg-sky-100 dark:active:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center border border-sky-200 dark:border-sky-800"
                      title="عرض كارت QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700"
                      title="تعديل الدور أو البيانات"
                    >
                      <Edit2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="flex-1 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 active:bg-rose-100 dark:active:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center border border-rose-200 dark:border-rose-800"
                      title="حذف من الكشوفات"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `تعديل بيانات: ${editingUser.name}` : "إضافة شخص جديد وتحديد دوره"}
        icon={User}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم بالكامل</label>
            <input
              type="text"
              required
              placeholder="مثال: يوسف جرجس..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الصفة والدور القيادي</label>
              <select
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
              >
                <option value="student" className="dark:bg-slate-900">🧒 مخدوم (Student)</option>
                <option value="servant" className="dark:bg-slate-900">✝️ خادم (Servant)</option>
                <option value="class_admin" className="dark:bg-slate-900">⛪️ أمين فصل (Class Admin)</option>
                <option value="assistant_admin" className="dark:bg-slate-900">🤝 أمين فصل مساعد (Assistant Admin)</option>
                <option value="super_admin" className="dark:bg-slate-900">👑 أمين خدمة عامة (Super Admin)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الفصل الدراسي المخصص</label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
              >
                <option value="all" className="dark:bg-slate-900">جميع الفصول (عام)</option>
                {CLASSES.map(c => (
                  <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المسمى الوظيفي / الاختصاص</label>
            <input
              type="text"
              placeholder="مثال: أمين فصل، خادم افتقاد، كاهن الخدمة..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف (واتساب)</label>
            <input
              type="tel"
              placeholder="01234567890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* طلب 2026-09-20: بيانات إضافية خاصة بالمخدومين بس (تاريخ ميلاد /
              عنوان / رقم ولي أمر) — من هنا بيتم التعديل عليها لمخدوم موجود
              أصلاً (add_scoped_student() في schema.sql بيفرضها إلزامية وقت
              الإضافة الأولى من شاشة "إضافة مخدوم"، بس هنا في شاشة التعديل
              الشاملة دي مش إلزامية، عشان الشاشة دي بتتستخدم كمان لتعديل خدام
              مالهمش هذه البيانات أصلاً). */}
          {formData.role === 'student' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ الميلاد</label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">العنوان</label>
                <input
                  type="text"
                  placeholder="مثال: شارع الجمهورية، أسوان"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم ولي الأمر</label>
                <input
                  type="tel"
                  placeholder="01234567890"
                  value={formData.guardian_phone}
                  onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold text-xs shadow-md mt-2 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> {editingUser ? "حفظ التعديلات والتحديث ✅" : "إضافة الشخص وتوليد كارت QR ✅"}
          </button>
        </form>
      </Modal>

      {/* QR Code Printable Card Modal */}
      <Modal
        isOpen={!!selectedQRUser}
        onClose={() => setSelectedQRUser(null)}
        title="كارت الحضور الرقمي"
        icon={QrCode}
      >
        {selectedQRUser && (
          <div className="text-center space-y-4">
            <div className="relative p-6 rounded-3xl text-white shadow-xl space-y-4 border border-white/20 overflow-hidden">

              {/* Class Patron Saint Background — for roles with no class
                  saint image (super_admin's class_id is 'all', not one of
                  the 7 classes), show the church logo instead of an empty
                  gradient. object-position keeps faces/halos in frame
                  instead of the plain center-crop cutting them off, since
                  these portrait icons are taller than the card is wide. */}
              {SAINT_IMAGES[selectedQRUser.class_id] ? (
                <>
                  {/* Blurred ambient background to fill full card aspect ratio */}
                  <img
                    src={SAINT_IMAGES[selectedQRUser.class_id]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-60"
                  />
                  {/* Full uncropped saint portrait */}
                  <img
                    src={SAINT_IMAGES[selectedQRUser.class_id]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain p-1 opacity-80"
                    style={{ objectPosition: 'center center' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/50 to-slate-950/85" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-700 flex items-center justify-center">
                  <img src={eparchyLogo} alt="" className="w-36 h-36 rounded-full object-cover shadow-xl border-2 border-white/50" />
                </div>
              )}

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/20 pb-3">
                  <h4 className="font-extrabold text-sm">خدمة مدارس الأحد ⛪️</h4>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    {selectedQRUser.role === 'student' ? 'مخدوم' : selectedQRUser.title || 'خادم'}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
                  <QRCodeSVG value={selectedQRUser.qr_code} size={160} />
                </div>

                <div>
                  <h3 className="text-lg font-black">{selectedQRUser.name}</h3>
                  <p className="text-xs text-sky-100 font-mono mt-0.5">{selectedQRUser.qr_code}</p>
                </div>

                {selectedQRUser.username && (
                  <div className="bg-white/15 rounded-2xl p-3 border border-white/20">
                    <p className="text-[10px] text-sky-100 font-bold mb-0.5">كود تسجيل الدخول على الموقع</p>
                    <p className="text-xl font-black tracking-wider font-mono">{selectedQRUser.username}</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> طباعة الكارت 🖨️
            </button>
          </div>
        )}
      </Modal>

      {/* WhatsApp Messaging Modal */}
      <WhatsAppModal
        isOpen={!!whatsappUser}
        onClose={() => setWhatsappUser(null)}
        recipient={whatsappUser}
      />

      {/* Batch ID-Card (كارنيهات) Printable Sheet — invisible on screen,
          only rendered into the page when printing / saving as PDF (see the
          #batch-print-cards rules in index.css). Always kept in the DOM
          (rather than mounted only while isPrintingBatch is true) so
          window.print() has content ready the instant the button is
          clicked, with no render-timing race. 8 cards per A4 page. */}
      <div id="batch-print-cards">
        {Array.from({ length: Math.ceil(filteredUsers.length / 8) }, (_, pageIdx) => {
          const totalPages = Math.ceil(filteredUsers.length / 8);
          const pageUsers = filteredUsers.slice(pageIdx * 8, pageIdx * 8 + 8);
          return (
            <div
              key={pageIdx}
              className="grid grid-cols-2 grid-rows-4 gap-3"
              style={{
                height: '277mm',
                pageBreakAfter: pageIdx < totalPages - 1 ? 'always' : 'auto',
                breakAfter: pageIdx < totalPages - 1 ? 'page' : 'auto',
              }}
            >
              {pageUsers.map(u => (
                <div
                  key={u.id}
                  className="relative rounded-2xl overflow-hidden text-white p-3 flex flex-col justify-between"
                  style={{ breakInside: 'avoid' }}
                >
                  {SAINT_IMAGES[u.class_id] ? (
                    <>
                      {/* Blurred ambient background to fill full card aspect ratio */}
                      <img
                        src={SAINT_IMAGES[u.class_id]}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-60"
                      />
                      {/* Full uncropped saint portrait */}
                      <img
                        src={SAINT_IMAGES[u.class_id]}
                        alt=""
                        className="absolute inset-0 w-full h-full object-contain p-1 opacity-80"
                        style={{ objectPosition: 'center center' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/50 to-slate-950/85" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-sky-700 via-indigo-700 to-purple-800 flex items-center justify-center">
                      <img src={eparchyLogo} alt="" className="w-20 h-20 rounded-full object-cover shadow-lg border border-white/40" />
                    </div>
                  )}

                  <div className="relative z-10 flex items-center gap-1.5">
                    <img src={eparchyLogo} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/40" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-extrabold leading-tight truncate">خدمة مدارس الأحد ⛪️</p>
                      <p className="text-[7px] opacity-80 leading-tight truncate">كنيسة مارمينا والبابا كيرلس</p>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center gap-2">
                    <div className="bg-white p-1 rounded-lg shrink-0">
                      <QRCodeSVG value={u.qr_code} size={54} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-[13px] leading-tight truncate">{u.name}</p>
                      <p className="text-[9px] opacity-90 font-bold truncate">
                        {u.role === 'student' ? 'مخدوم' : (u.title || 'خادم')}
                      </p>
                      <p className="text-[8px] font-mono opacity-80 truncate">{u.qr_code}</p>
                      {u.username && (
                        <p className="text-[8px] font-mono font-bold opacity-95 truncate">كود الدخول: {u.username}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

    </div>
  );
}
