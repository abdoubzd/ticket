import { useState } from 'react';
import { Member, Role } from '../types/discord';
import { cn } from '../utils/cn';

interface MembersManagementProps {
  members: Member[];
  roles: Role[];
  onMemberAction: (memberId: string, action: 'kick' | 'ban' | 'timeout', duration?: number) => void;
  isProcessing?: boolean;
}

export function MembersManagement({ members, roles, onMemberAction, isProcessing = false }: MembersManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [actionModal, setActionModal] = useState<{ member: Member; action: 'kick' | 'ban' | 'timeout' } | null>(null);
  const [timeoutDuration, setTimeoutDuration] = useState(60);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.id.includes(searchQuery);
    const matchesRole = !selectedRole || member.roles.includes(selectedRole);
    return matchesSearch && matchesRole;
  });

  const getStatusColor = (status: Member['status']) => {
    switch (status) {
      case 'online': return 'bg-[#3ba55c]';
      case 'idle': return 'bg-[#faa61a]';
      case 'dnd': return 'bg-[#ed4245]';
      default: return 'bg-[#747f8d]';
    }
  };

  const getStatusText = (status: Member['status']) => {
    switch (status) {
      case 'online': return 'متصل';
      case 'idle': return 'غير نشط';
      case 'dnd': return 'مشغول';
      default: return 'غير متصل';
    }
  };

  const handleAction = () => {
    if (actionModal && !isProcessing) {
      onMemberAction(
        actionModal.member.id,
        actionModal.action,
        actionModal.action === 'timeout' ? timeoutDuration : undefined
      );
      setActionModal(null);
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getAvatarUrl = (member: Member) => {
    if (member.avatar) {
      return `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png?size=128`;
    }
    // Default avatar based on discriminator
    const defaultAvatarIndex = parseInt(member.discriminator) % 5;
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
  };

  const getRandomColor = (id: string) => {
    const colors = ['#5865f2', '#3ba55c', '#faa61a', '#ed4245', '#9b59b6', '#e91e63'];
    const index = parseInt(id.slice(-2), 10) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex-1 overflow-auto p-6" style={{ fontFamily: 'Tajawal, sans-serif' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة الأعضاء</h1>
          <p className="text-[#b9bbbe] mt-1">عرض وإدارة أعضاء السيرفر ({members.length} عضو)</p>
        </div>

        {/* Filters */}
        <div className="bg-[#2f3136] rounded-lg p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#72767d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث بالاسم أو الآيدي..."
                className="w-full bg-[#202225] text-white placeholder-[#72767d] rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              />
            </div>
          </div>
          <div className="md:w-64">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-[#202225] text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
            >
              <option value="">جميع الرتب</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Info Banner */}
        {members.length === 0 && (
          <div className="bg-[#faa61a]/10 border border-[#faa61a]/30 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-6 h-6 text-[#faa61a] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-[#faa61a] font-medium">لا يمكن عرض الأعضاء</h3>
              <p className="text-[#b9bbbe] text-sm mt-1">
                تأكد من تفعيل "Server Members Intent" في إعدادات البوت على Discord Developer Portal.
                بدون هذا الإذن، لن يتمكن البوت من جلب قائمة الأعضاء.
              </p>
            </div>
          </div>
        )}

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map(member => (
            <div key={member.id} className="bg-[#2f3136] rounded-lg p-4 hover:bg-[#36393f] transition-all">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {member.avatar ? (
                    <img 
                      src={getAvatarUrl(member)} 
                      alt={member.username}
                      className="w-12 h-12 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div
                    className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg", member.avatar && "hidden")}
                    style={{ backgroundColor: getRandomColor(member.id) }}
                  >
                    {getInitials(member.nickname || member.username)}
                  </div>
                  <div className={cn(
                    "absolute bottom-0 left-0 w-4 h-4 rounded-full border-2 border-[#2f3136]",
                    getStatusColor(member.status)
                  )} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium truncate">
                      {member.nickname || member.username}
                    </h3>
                    {member.isAdmin && (
                      <span className="px-1.5 py-0.5 bg-[#faa61a]/20 text-[#faa61a] text-xs rounded flex-shrink-0">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-[#72767d] text-sm truncate" dir="ltr">
                    @{member.username}
                  </p>
                  <p className="text-[#72767d] text-xs mt-1">
                    {getStatusText(member.status)} • انضم {new Date(member.joinedAt).toLocaleDateString('ar-SA')}
                  </p>

                  {/* Roles */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.roles.slice(0, 3).map(roleId => {
                      const role = roles.find(r => r.id === roleId);
                      return role ? (
                        <span
                          key={roleId}
                          className="px-1.5 py-0.5 rounded text-xs"
                          style={{ backgroundColor: role.color + '20', color: role.color }}
                        >
                          {role.name}
                        </span>
                      ) : null;
                    })}
                    {member.roles.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-[#202225] text-[#72767d] rounded text-xs">
                        +{member.roles.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions - Only for non-admins */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-[#202225]">
                <button
                  onClick={() => setActionModal({ member, action: 'timeout' })}
                  disabled={member.isAdmin || isProcessing}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm transition-all",
                    member.isAdmin || isProcessing
                      ? "bg-[#202225] text-[#72767d] cursor-not-allowed"
                      : "bg-[#faa61a]/10 text-[#faa61a] hover:bg-[#faa61a]/20"
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>تايم اوت</span>
                </button>
                <button
                  onClick={() => setActionModal({ member, action: 'kick' })}
                  disabled={member.isAdmin || isProcessing}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm transition-all",
                    member.isAdmin || isProcessing
                      ? "bg-[#202225] text-[#72767d] cursor-not-allowed"
                      : "bg-[#f04747]/10 text-[#f04747] hover:bg-[#f04747]/20"
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                  </svg>
                  <span>طرد</span>
                </button>
                <button
                  onClick={() => setActionModal({ member, action: 'ban' })}
                  disabled={member.isAdmin || isProcessing}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm transition-all",
                    member.isAdmin || isProcessing
                      ? "bg-[#202225] text-[#72767d] cursor-not-allowed"
                      : "bg-[#ed4245]/10 text-[#ed4245] hover:bg-[#ed4245]/20"
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span>حظر</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && members.length > 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-[#72767d] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-white font-medium">لا يوجد نتائج</h3>
            <p className="text-[#72767d] text-sm mt-1">لم يتم العثور على أعضاء بهذه المعايير</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#36393f] rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-[#202225]">
              <h2 className="text-xl font-bold text-white">
                {actionModal.action === 'kick' && 'طرد العضو'}
                {actionModal.action === 'ban' && 'حظر العضو'}
                {actionModal.action === 'timeout' && 'تايم اوت'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[#202225] rounded-lg">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: getRandomColor(actionModal.member.id) }}
                >
                  {getInitials(actionModal.member.nickname || actionModal.member.username)}
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    {actionModal.member.nickname || actionModal.member.username}
                  </h3>
                  <p className="text-[#72767d] text-sm" dir="ltr">
                    @{actionModal.member.username}
                  </p>
                </div>
              </div>

              {actionModal.action === 'timeout' && (
                <div>
                  <label className="block text-[#b9bbbe] text-sm font-medium mb-2">
                    مدة التايم اوت
                  </label>
                  <select
                    value={timeoutDuration}
                    onChange={(e) => setTimeoutDuration(Number(e.target.value))}
                    className="w-full bg-[#202225] text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                  >
                    <option value={1}>1 دقيقة</option>
                    <option value={5}>5 دقائق</option>
                    <option value={10}>10 دقائق</option>
                    <option value={30}>30 دقيقة</option>
                    <option value={60}>ساعة</option>
                    <option value={1440}>يوم</option>
                    <option value={10080}>أسبوع</option>
                  </select>
                </div>
              )}

              <div className={cn(
                "p-4 rounded-lg",
                actionModal.action === 'ban' ? "bg-[#ed4245]/10" : "bg-[#faa61a]/10"
              )}>
                <p className={cn(
                  "text-sm",
                  actionModal.action === 'ban' ? "text-[#ed4245]" : "text-[#faa61a]"
                )}>
                  {actionModal.action === 'kick' && 'سيتم طرد العضو من السيرفر. يمكنه الانضمام مرة أخرى عبر رابط دعوة.'}
                  {actionModal.action === 'ban' && 'سيتم حظر العضو نهائياً. لن يتمكن من الانضمام للسيرفر مرة أخرى.'}
                  {actionModal.action === 'timeout' && 'سيتم إسكات العضو لفترة محددة. لن يتمكن من إرسال رسائل أو الانضمام للمحادثات الصوتية.'}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-[#202225] flex justify-end gap-3">
              <button
                onClick={() => setActionModal(null)}
                disabled={isProcessing}
                className="px-4 py-2 text-white hover:underline disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleAction}
                disabled={isProcessing}
                className={cn(
                  "px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 disabled:opacity-50",
                  actionModal.action === 'ban'
                    ? "bg-[#ed4245] text-white hover:bg-[#c73e41]"
                    : actionModal.action === 'kick'
                    ? "bg-[#f04747] text-white hover:bg-[#d84040]"
                    : "bg-[#faa61a] text-white hover:bg-[#e09515]"
                )}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>جاري التنفيذ...</span>
                  </>
                ) : (
                  <span>تأكيد</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
