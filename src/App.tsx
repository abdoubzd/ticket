import { useDiscordAuth } from './hooks/useDiscordAuth';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';

export function App() {
  const {
    isAuthenticated,
    isLoading,
    error,
    botConfig,
    roles,
    categories,
    members,
    validateToken,
    logout,
    setMembers,
    kickMember,
    banMember,
    timeoutMember,
  } = useDiscordAuth();

  if (!isAuthenticated || !botConfig) {
    return (
      <LoginPage
        onLogin={validateToken}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <Dashboard
      botConfig={botConfig}
      roles={roles}
      categories={categories}
      members={members}
      onLogout={logout}
      onMembersChange={setMembers}
      onKickMember={kickMember}
      onBanMember={banMember}
      onTimeoutMember={timeoutMember}
    />
  );
}
