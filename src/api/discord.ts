// Discord API Service using Netlify Functions

// Determine the API endpoint based on environment
const getApiEndpoint = () => {
  // In production (Netlify), use relative path
  // In development, you can use localhost:8888 if running netlify dev
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // For local development with netlify dev
      return '/.netlify/functions/discord';
    }
  }
  return '/.netlify/functions/discord';
};

const API_ENDPOINT = getApiEndpoint();

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot?: boolean;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner_id: string;
  roles: DiscordRole[];
  channels?: DiscordChannel[];
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
  permissions: string;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  parent_id: string | null;
  position: number;
}

export interface DiscordMember {
  user: DiscordUser;
  nick: string | null;
  roles: string[];
  joined_at: string;
  permissions?: string;
}

export interface APIError {
  error: boolean;
  message: string;
  status?: number;
}

class DiscordAPI {
  private token: string = '';

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(action: string, data: Record<string, unknown> = {}): Promise<T> {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        token: this.token,
        ...data,
      }),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.message || 'Unknown error');
    }

    return result as T;
  }

  // Validate bot token by getting current user
  async validateToken(): Promise<DiscordUser> {
    return this.request<DiscordUser>('validate-token');
  }

  // Get guild information
  async getGuild(guildId: string): Promise<DiscordGuild> {
    return this.request<DiscordGuild>('get-guild', { guildId });
  }

  // Get guild channels
  async getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
    return this.request<DiscordChannel[]>('get-channels', { guildId });
  }

  // Get guild members (limited to 1000 without pagination)
  async getGuildMembers(guildId: string, limit: number = 100): Promise<DiscordMember[]> {
    return this.request<DiscordMember[]>('get-members', { guildId, limit });
  }

  // Kick a member
  async kickMember(guildId: string, userId: string, reason?: string): Promise<void> {
    await this.request('kick-member', { guildId, userId, reason });
  }

  // Ban a member
  async banMember(guildId: string, userId: string, reason?: string): Promise<void> {
    await this.request('ban-member', { guildId, userId, reason });
  }

  // Timeout a member
  async timeoutMember(guildId: string, userId: string, durationMinutes: number): Promise<void> {
    await this.request('timeout-member', { guildId, userId, duration: durationMinutes });
  }
}

export const discordAPI = new DiscordAPI();
