import { useState } from 'react';
import { Role, Category, TicketCategory } from '../types/discord';
import { cn } from '../utils/cn';

interface TicketSettingsProps {
  roles: Role[];
  categories: Category[];
}

export function TicketSettings({ roles, categories }: TicketSettingsProps) {
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([
    {
      id: '1',
      name: 'دعم فني',
      categoryId: '1',
      mentionRoles: ['1', '2'],
      description: 'للمساعدة التقنية والمشاكل الفنية',
      emoji: '🔧',
    },
    {
      id: '2',
      name: 'استفسارات عامة',
      categoryId: '2',
      mentionRoles: ['3'],
      description: 'للأسئلة والاستفسارات العامة',
      emoji: '❓',
    },
  ]);

  const [welcomeMessage, setWelcomeMessage] = useState('مرحباً {user}! شكراً لتواصلك معنا. سيقوم فريق الدعم بالرد عليك قريباً.');
  const [closeMessage, setCloseMessage] = useState('شكراً لتواصلك معنا! تم إغلاق التيكت.');
  const [selectedLogChannel, setSelectedLogChannel] = useState('');
  const [selectedTranscriptChannel, setSelectedTranscriptChannel] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TicketCategory | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const handleDeleteCategory = (id: string) => {
    setTicketCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const handleAddCategory = (category: TicketCategory) => {
    if (editingCategory) {
      setTicketCategories(prev => prev.map(cat => cat.id === category.id ? category : cat));
    } else {
      setTicketCategories(prev => [...prev, { ...category, id: Date.now().toString() }]);
    }
    setShowAddModal(false);
    setEditingCategory(null);
  };

  return (
    <div className="flex-1 overflow-auto p-6" style={{ fontFamily: 'Tajawal, sans-serif' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">إعدادات التيكت</h1>
            <p className="text-[#b9bbbe] mt-1">قم بتخصيص نظام التيكت الخاص بسيرفرك</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={cn(
              "px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2",
              saveStatus === 'saved'
                ? "bg-[#3ba55c] text-white"
                : "bg-[#5865f2] text-white hover:bg-[#4752c4]"
            )}
          >
            {saveStatus === 'saving' ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>جاري الحفظ...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>تم الحفظ!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>حفظ التغييرات</span>
              </>
            )}
          </button>
        </div>

        {/* Ticket Categories */}
        <div className="bg-[#2f3136] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">أقسام التيكت</h2>
            <button
              onClick={() => { setEditingCategory(null); setShowAddModal(true); }}
              className="px-4 py-2 bg-[#3ba55c] text-white rounded-md hover:bg-[#2d8049] transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>إضافة قسم</span>
            </button>
          </div>

          <div className="space-y-3">
            {ticketCategories.map(category => (
              <div key={category.id} className="bg-[#36393f] rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{category.emoji}</span>
                  <div>
                    <h3 className="text-white font-medium">{category.name}</h3>
                    <p className="text-[#b9bbbe] text-sm">{category.description}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {category.mentionRoles.map(roleId => {
                        const role = roles.find(r => r.id === roleId);
                        return role ? (
                          <span
                            key={roleId}
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ backgroundColor: role.color + '20', color: role.color }}
                          >
                            @{role.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditingCategory(category); setShowAddModal(true); }}
                    className="p-2 text-[#b9bbbe] hover:text-white hover:bg-[#202225] rounded-md transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-[#f04747] hover:bg-[#f04747]/10 rounded-md transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Settings */}
        <div className="bg-[#2f3136] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">رسائل التيكت</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[#b9bbbe] text-sm font-medium mb-2">
                رسالة الترحيب
              </label>
              <textarea
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full bg-[#202225] text-white placeholder-[#72767d] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5865f2] transition-all resize-none h-24"
                placeholder="رسالة الترحيب عند فتح التيكت..."
              />
              <p className="text-[#72767d] text-xs mt-1">استخدم {'{user}'} للإشارة للمستخدم</p>
            </div>

            <div>
              <label className="block text-[#b9bbbe] text-sm font-medium mb-2">
                رسالة الإغلاق
              </label>
              <textarea
                value={closeMessage}
                onChange={(e) => setCloseMessage(e.target.value)}
                className="w-full bg-[#202225] text-white placeholder-[#72767d] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5865f2] transition-all resize-none h-24"
                placeholder="رسالة عند إغلاق التيكت..."
              />
            </div>
          </div>
        </div>

        {/* Channel Settings */}
        <div className="bg-[#2f3136] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">إعدادات القنوات</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#b9bbbe] text-sm font-medium mb-2">
                قناة السجلات (Logs)
              </label>
              <select
                value={selectedLogChannel}
                onChange={(e) => setSelectedLogChannel(e.target.value)}
                className="w-full bg-[#202225] text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5865f2] transition-all"
              >
                <option value="">اختر قناة...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}># {cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#b9bbbe] text-sm font-medium mb-2">
                قناة النسخ (Transcripts)
              </label>
              <select
                value={selectedTranscriptChannel}
                onChange={(e) => setSelectedTranscriptChannel(e.target.value)}
                className="w-full bg-[#202225] text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5865f2] transition-all"
              >
                <option value="">اختر قناة...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}># {cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {showAddModal && (
        <CategoryModal
          category={editingCategory}
          roles={roles}
          categories={categories}
          onClose={() => { setShowAddModal(false); setEditingCategory(null); }}
          onSave={handleAddCategory}
        />
      )}
    </div>
  );
}

interface CategoryModalProps {
  category: TicketCategory | null;
  roles: Role[];
  categories: Category[];
  onClose: () => void;
  onSave: (category: TicketCategory) => void;
}

function CategoryModal({ category, roles, categories, onClose, onSave }: CategoryModalProps) {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [emoji, setEmoji] = useState(category?.emoji || '📋');
  const [categoryId, setCategoryId] = useState(category?.categoryId || '');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(category?.mentionRoles || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: category?.id || '',
      name,
      description,
      emoji,
      categoryId,
      mentionRoles: selectedRoles,
    });
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#36393f] rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-[#202225]">
          <h2 className="text-xl font-bold text-white">
            {category ? 'تعديل القسم' : 'إضافة قسم جديد'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <label className="block text-[#b9bbbe] text-sm font-medium mb-2">الإيموجي</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-16 bg-[#202225] text-white text-center text-2xl rounded-md px-2 py-3 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                maxLength={2}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[#b9bbbe] text-sm font-medium mb-2">اسم القسم</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#202225] text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                placeholder="مثال: دعم فني"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#b9bbbe] text-sm font-medium mb-2">الوصف</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#202225] text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              placeholder="وصف مختصر للقسم..."
            />
          </div>

          <div>
            <label className="block text-[#b9bbbe] text-sm font-medium mb-2">الكاتيقوري</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-[#202225] text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              required
            >
              <option value="">اختر كاتيقوري...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#b9bbbe] text-sm font-medium mb-2">الرتب المذكورة (Mention)</label>
            <div className="flex flex-wrap gap-2">
              {roles.map(role => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => toggleRole(role.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm transition-all",
                    selectedRoles.includes(role.id)
                      ? "ring-2 ring-white"
                      : "opacity-60 hover:opacity-100"
                  )}
                  style={{ backgroundColor: role.color + '30', color: role.color }}
                >
                  @{role.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white hover:underline"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#5865f2] text-white rounded-md hover:bg-[#4752c4] transition-all"
            >
              {category ? 'حفظ التعديلات' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
