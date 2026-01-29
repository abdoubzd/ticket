import { useState, useCallback } from 'react';
import { BotConfig, Role, Category, Member } from '../types/discord';
import { Sidebar } from './Sidebar';
import { TicketSettings } from './TicketSettings';
import { MembersManagement } from './MembersManagement';

interface DashboardProps {
  botConfig: BotConfig;
  roles: Role[];
  categories: Category[];
  members: Member[];
  onLogout: () => void;
  onMembersChange: (members: Member[]) => void;
  onKickMember: (memberId: string) => Promise<boolean>;
  onBanMember: (memberId: string) => Promise<boolean>;
  onTimeoutMember: (memberId: string, durationMinutes: number) => Promise<boolean>;
}

export function Dashboard({ 
  botConfig, 
  roles, 
  categories, 
  members, 
  onLogout, 
  onMembersChange,
  onKickMember,
  onBanMember,
  onTimeoutMember,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'members'>('settings');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMemberAction = useCallback(async (memberId: string, action: 'kick' | 'ban' | 'timeout', duration?: number) => {
    const member = members.find(m => m.id === memberId);
    if (!member || isProcessing) return;

    setIsProcessing(true);
    let success = false;
    let actionText = '';

    try {
      switch (action) {
        case 'kick':
          success = await onKickMember(memberId);
          actionText = 'طرد';
          break;
        case 'ban':
          success = await onBanMember(memberId);
          actionText = 'حظر';
          break;
        case 'timeout':
          success = await onTimeoutMember(memberId, duration || 60);
          actionText = `تايم اوت ${duration} دقيقة على`;
          break;
      }

      if (success) {
        showNotification(`تم ${actionText} ${member.nickname || member.username} بنجاح`, 'success');
        if (action === 'kick' || action === 'ban') {
          onMembersChange(members.filter(m => m.id !== memberId));
        }
      } else {
        showNotification(`فشل ${actionText} ${member.nickname || member.username}. تأكد من صلاحيات البوت`, 'error');
      }
    } catch (err) {
      console.error('Action failed:', err);
      showNotification('حدث خطأ أثناء تنفيذ العملية', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [members, onMembersChange, onKickMember, onBanMember, onTimeoutMember, isProcessing]);

  return (
    <div className="flex h-screen bg-[#36393f]" style={{ fontFamily: 'Tajawal, sans-serif' }}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        guildName={botConfig.guildName}
        guildIcon={botConfig.guildIcon}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-[#36393f] border-b border-[#202225] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {botConfig.botAvatar ? (
              <img 
                src={botConfig.botAvatar} 
                alt={botConfig.botName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-[#5865f2] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
            )}
            <div>
              <h1 className="text-white font-semibold">{botConfig.botName}</h1>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#3ba55c] rounded-full"></div>
                <span className="text-[#3ba55c] text-xs">متصل</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {botConfig.guildIcon && (
              <img 
                src={botConfig.guildIcon} 
                alt={botConfig.guildName}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="text-left">
              <p className="text-[#b9bbbe] text-sm">السيرفر</p>
              <p className="text-white font-medium">{botConfig.guildName}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'settings' ? (
          <TicketSettings roles={roles} categories={categories} />
        ) : (
          <MembersManagement
            members={members}
            roles={roles}
            onMemberAction={handleMemberAction}
            isProcessing={isProcessing}
          />
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-6 left-6 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up z-50 ${
          notification.type === 'success' ? 'bg-[#3ba55c]' : 'bg-[#ed4245]'
        }`}>
          {notification.type === 'success' ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-white font-medium">{notification.message}</span>
        </div>
      )}
    </div>
  );
}
