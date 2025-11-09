import tmi from 'tmi.js';

export interface TwitchIRCConfig {
  channelName: string;
  oauthToken?: string;
  onMessage?: (username: string, message: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

class TwitchIRCService {
  private client: tmi.Client | null = null;
  private config: TwitchIRCConfig | null = null;

  /**
   * Connect to Twitch IRC
   */
  async connect(config: TwitchIRCConfig): Promise<void> {
    this.config = config;

    const clientConfig: tmi.Options = {
      channels: [config.channelName]
    };

    // Use OAuth if provided, otherwise connect anonymously
    if (config.oauthToken) {
      clientConfig.identity = {
        username: config.channelName,
        password: `oauth:${config.oauthToken.replace('oauth:', '')}`
      };
    }

    this.client = new tmi.Client(clientConfig);

    // Set up event handlers
    this.client.on('message', (_channel: string, tags: any, message: string, self: boolean) => {
      if (self) return;
      // Use display-name for proper capitalization, fallback to username (lowercase) if not available
      const username = tags['display-name'] || tags.username || 'unknown';
      if (this.config?.onMessage) {
        this.config.onMessage(username, message);
      }
    });

    this.client.on('connected', () => {
      if (this.config?.onConnect) {
        this.config.onConnect();
      }
    });

    this.client.on('disconnected', () => {
      if (this.config?.onDisconnect) {
        this.config.onDisconnect();
      }
    });

    await this.client.connect();
  }

  /**
   * Disconnect from Twitch IRC
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      console.log('[TwitchIRC] Disconnecting client');
      await this.client.disconnect();
      this.client = null;
      this.config = null;
    }
  }

  /**
   * Send a message to chat
   */
  async sendMessage(message: string): Promise<void> {
    if (!this.client || !this.config?.channelName) {
      throw new Error('Not connected to Twitch IRC');
    }
    await this.client.say(this.config.channelName, message);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.client !== null;
  }
}

export const twitchIRC = new TwitchIRCService();


