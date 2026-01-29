import { useState } from 'react';
import { cn } from '../utils/cn';

interface LoginPageProps {
  onLogin: (token: string, guildId: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function LoginPage({ onLogin, isLoading, error }: LoginPageProps) {
  const [token, setToken] = useState('');
  const [guildId, setGuildId] = useState('');
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(token, guildId);
  };

  return (
    <div className="min-h-screen bg-[#36393f] flex items-center justify-center p-4" style={{ fontFamily: 'Tajawal, sans-serif' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#5865f2]/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#5865f2]/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#5865f2] rounded-2xl mb-4 shadow-lg shadow-[#5865f2]/30">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">لوحة تحكم بوت التيكت</h1>
          <p className="text-[#b9bbbe]">قم بتسجيل الدخول للتحكم في البوت</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#2f3136] rounded-lg p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bot Token Field */}
            <div>
              <label className="block text-[#b9bbbe] text-sm font-medium mb-2">
                توكن البوت <span className="text-[#ed4245]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="أدخل توكن البوت هنا..."
                  className="w-full bg-[#202225] text-white placeholder-[#72767d] rounded-md px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#5865f2] transition-shadow"
                  dir="ltr"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#72767d] hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showToken ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[#72767d] text-xs mt-2">
                يمكنك الحصول على التوكن من{' '}
                <a 
                  href="https://discord.com/developers/applications" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#5865f2] hover:underline"
                >
                  Discord Developer Portal
                </a>
              </p>
            </div>

            {/* Guild ID Field */}
            <div>
              <label className="block text-[#b9bbbe] text-sm font-medium mb-2">
                آيدي السيرفر (Guild ID) <span className="text-[#ed4245]">*</span>
              </label>
              <input
                type="text"
                value={guildId}
                onChange={(e) => setGuildId(e.target.value.replace(/\D/g, ''))}
                placeholder="مثال: 123456789012345678"
                className="w-full bg-[#202225] text-white placeholder-[#72767d] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5865f2] transition-shadow"
                dir="ltr"
                required
                disabled={isLoading}
                maxLength={19}
              />
              <p className="text-[#72767d] text-xs mt-2">
                فعّل وضع المطور في إعدادات Discord ثم اضغط يمين على السيرفر واختر "Copy Server ID"
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-[#f04747]/20 border border-[#f04747] rounded-md p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-[#f04747] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[#f04747] text-sm">{error}</span>
              </div>
            )}

            {/* Loading indicator with status */}
            {isLoading && (
              <div className="bg-[#5865f2]/20 border border-[#5865f2] rounded-md p-4 flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-[#5865f2]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-[#5865f2] text-sm">جاري التحقق من البوت والسيرفر...</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !token || !guildId}
              className={cn(
                "w-full py-3 rounded-md font-medium transition-all flex items-center justify-center gap-2",
                isLoading || !token || !guildId
                  ? "bg-[#5865f2]/50 text-white/50 cursor-not-allowed"
                  : "bg-[#5865f2] text-white hover:bg-[#4752c4] active:scale-[0.98]"
              )}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="mt-6 space-y-3">
          <div className="bg-[#2f3136]/80 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-[#5865f2] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-white text-sm font-medium">متطلبات البوت</p>
              <p className="text-[#72767d] text-xs mt-1">
                تأكد من تفعيل "Server Members Intent" و "Message Content Intent" في إعدادات البوت
              </p>
            </div>
          </div>
          
          <div className="bg-[#2f3136]/80 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-[#faa61a] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="text-white text-sm font-medium">الأمان</p>
              <p className="text-[#72767d] text-xs mt-1">
                لا تشارك توكن البوت مع أي شخص. التوكن لا يتم حفظه ويستخدم فقط للاتصال بـ Discord API
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
