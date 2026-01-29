export interface BotConfig {
  token: string;
  guildId: string;
  botName: string;
  botAvatar: string;
  guildName: string;
  guildIcon: string;
}

export interface Role {
  id: string;
  name: string;
  color: string;
  position: number;
}

export interface Category {
  id: string;
  name: string;
  type: number;
}

export interface Member {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  nickname: string | null;
  roles: string[];
  joinedAt: string;
  isAdmin: boolean;
  status: 'online' | 'idle' | 'dnd' | 'offline';
}

export interface TicketCategory {
  id: string;
  name: string;
  categoryId: string;
  mentionRoles: string[];
  description: string;
  emoji: string;
}

export interface TicketSettings {
  welcomeMessage: string;
  closeMessage: string;
  transcriptChannel: string;
  logChannel: string;
  ticketCategories: TicketCategory[];
}
