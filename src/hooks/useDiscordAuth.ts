import { useState, useCallback } from 'react';
import { discordAPI, DiscordUser, DiscordGuild, DiscordRole, DiscordChannel, DiscordMember } from '../api/discord';
import { BotConfig, Role, Category, Member } from '../types/discord';

// Convert Discord color (integer) to hex
function intToHex(color: number): string {
  if (color === 0) return '#99aab5'; // Default gray for @everyone
  return '#' + color.toString(16).padStart(6, '0');
}

// Check if member has admin permissions
function hasAdminPermission(permissions: string | undefined, roles: DiscordRole[], memberRoles: string[]): boolean {
  // Check member's direct permissions
  if (permissions) {
    const perms = BigInt(permissions);
    const ADMINISTRATOR = BigInt(0x8);
    if ((perms & ADMINISTRATOR) === ADMINISTRATOR) return true;
  }
  
  // Check roles for admin permission
  for (const roleId of memberRoles) {
    const role = roles.find(r => r.id === roleId);
    if (role) {
      const perms = BigInt(role.permissions);
      const ADMINISTRATOR = BigInt(0x8);
      if ((perms & ADMINISTRATOR) === ADMINISTRATOR) return true;
    }
  }
  
  return false;
}

export function useDiscordAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botConfig, setBotConfig] = useState<BotConfig | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [guildId, setGuildId] = useState<string>('');

  const validateToken = useCallback(async (token: string, inputGuildId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // Validate guild ID format first
    const guildIdRegex = /^\d{17,19}$/;
    if (!guildIdRegex.test(inputGuildId)) {
      setError('آيدي السيرفر غير صالح. يجب أن يكون رقماً من 17-19 خانة');
      setIsLoading(false);
      return false;
    }

    // Basic token format validation
    if (!token || token.length < 50) {
      setError('توكن البوت غير صالح. التوكن قصير جداً');
      setIsLoading(false);
      return false;
    }

    try {
      // Set token in API
      discordAPI.setToken(token);

      // Step 1: Validate token and get bot info
      let botUser: DiscordUser;
      try {
        botUser = await discordAPI.validateToken();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل التحقق من التوكن');
        setIsLoading(false);
        return false;
      }

      // Step 2: Get guild info (this will fail if bot is not in the guild)
      let guild: DiscordGuild;
      try {
        guild = await discordAPI.getGuild(inputGuildId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل الاتصال بالسيرفر');
        setIsLoading(false);
        return false;
      }

      // Step 3: Get guild channels
      let channels: DiscordChannel[] = [];
      try {
        channels = await discordAPI.getGuildChannels(inputGuildId);
      } catch (err) {
        console.error('Failed to fetch channels:', err);
      }

      // Step 4: Get guild members
      let guildMembers: DiscordMember[] = [];
      try {
        guildMembers = await discordAPI.getGuildMembers(inputGuildId, 100);
      } catch (err) {
        console.error('Failed to fetch members:', err);
        // This might fail due to missing GUILD_MEMBERS intent
      }

      // Store guild ID for later use
      setGuildId(inputGuildId);

      // Transform data to our format
      const transformedRoles: Role[] = guild.roles
        .filter(r => r.name !== '@everyone')
        .sort((a, b) => b.position - a.position)
        .map(r => ({
          id: r.id,
          name: r.name,
          color: intToHex(r.color),
          position: r.position,
        }));

      const transformedCategories: Category[] = channels
        .filter(c => c.type === 4) // Type 4 = Category
        .sort((a, b) => a.position - b.position)
        .map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
        }));

      const transformedMembers: Member[] = guildMembers
        .filter(m => m.user && !m.user.bot)
        .map(m => ({
          id: m.user.id,
          username: m.user.username,
          discriminator: m.user.discriminator || '0',
          avatar: m.user.avatar,
          nickname: m.nick,
          roles: m.roles,
          joinedAt: m.joined_at,
          isAdmin: hasAdminPermission(m.permissions, guild.roles, m.roles),
          status: 'offline' as const, // We can't get presence without special intent
        }));

      // Set bot config
      setBotConfig({
        token,
        guildId: inputGuildId,
        botName: botUser.username,
        botAvatar: botUser.avatar 
          ? `https://cdn.discordapp.com/avatars/${botUser.id}/${botUser.avatar}.png`
          : '',
        guildName: guild.name,
        guildIcon: guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
          : '',
      });

      setRoles(transformedRoles);
      setCategories(transformedCategories);
      setMembers(transformedMembers);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('حدث خطأ غير متوقع. تأكد من اتصالك بالإنترنت');
      setIsLoading(false);
      return false;
    }
  }, []);

  const kickMember = useCallback(async (memberId: string): Promise<boolean> => {
    if (!guildId) return false;
    try {
      await discordAPI.kickMember(guildId, memberId, 'تم الطرد من لوحة التحكم');
      setMembers(prev => prev.filter(m => m.id !== memberId));
      return true;
    } catch (err) {
      console.error('Failed to kick member:', err);
      return false;
    }
  }, [guildId]);

  const banMember = useCallback(async (memberId: string): Promise<boolean> => {
    if (!guildId) return false;
    try {
      await discordAPI.banMember(guildId, memberId, 'تم الحظر من لوحة التحكم');
      setMembers(prev => prev.filter(m => m.id !== memberId));
      return true;
    } catch (err) {
      console.error('Failed to ban member:', err);
      return false;
    }
  }, [guildId]);

  const timeoutMember = useCallback(async (memberId: string, durationMinutes: number): Promise<boolean> => {
    if (!guildId) return false;
    try {
      await discordAPI.timeoutMember(guildId, memberId, durationMinutes);
      return true;
    } catch (err) {
      console.error('Failed to timeout member:', err);
      return false;
    }
  }, [guildId]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setBotConfig(null);
    setRoles([]);
    setCategories([]);
    setMembers([]);
    setGuildId('');
    discordAPI.setToken('');
  }, []);

  return {
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
  };
}
