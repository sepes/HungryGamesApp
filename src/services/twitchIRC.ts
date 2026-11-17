import tmi from 'tmi.js';

export type TwitchConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface TwitchIRCConfig {
  channelName: string;
  onMessage?: (username: string, message: string) => void;
  onStatusChange?: (status: TwitchConnectionStatus, errorMessage?: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const JOIN_TIMEOUT_MS = 8000;
const PING_INTERVAL_MS = 15000;
const PING_TIMEOUT_MS = 5000;

const FATAL_CHANNEL_NOTICES = new Set([
  'msg_room_not_found',
  'msg_channel_suspended',
  'msg_channel_blocked',
  'msg_banned',
  'tos_ban',
  'invalid_user'
]);

class TwitchIRCService {
  private client: tmi.Client | null = null;
  private config: TwitchIRCConfig | null = null;
  private status: TwitchConnectionStatus = 'disconnected';
  private errorMessage: string = '';
  private channelJoined: boolean = false;
  private connectionId: number = 0;
  private joinTimer: ReturnType<typeof setTimeout> | null = null;
  private healthInterval: ReturnType<typeof setInterval> | null = null;
  private inFlightCheck: Promise<boolean> | null = null;
  private cleanupBrowserListeners: (() => void) | null = null;

  private normalizeChannel(channelName: string): string {
    return channelName.trim().toLowerCase().replace(/^[@#]+/, '');
  }

  private setStatus(status: TwitchConnectionStatus, errorMessage: string = ''): void {
    const changed = this.status !== status || this.errorMessage !== errorMessage;
    this.status = status;
    this.errorMessage = errorMessage;
    if (changed) {
      this.config?.onStatusChange?.(status, errorMessage || undefined);
    }
  }

  private clearTimers(): void {
    if (this.joinTimer) {
      clearTimeout(this.joinTimer);
      this.joinTimer = null;
    }
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
      this.healthInterval = null;
    }
  }

  private detachBrowserListeners(): void {
    if (this.cleanupBrowserListeners) {
      this.cleanupBrowserListeners();
      this.cleanupBrowserListeners = null;
    }
  }

  private attachBrowserListeners(connId: number): void {
    this.detachBrowserListeners();
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const handleOffline = (): void => {
      if (connId !== this.connectionId) return;
      this.failConnection(connId, 'Network connection lost.');
    };

    const handleVisibility = (): void => {
      if (connId !== this.connectionId) return;
      if (document.visibilityState === 'visible' && this.status === 'connected') {
        void this.checkStatus();
      }
    };

    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibility);

    this.cleanupBrowserListeners = () => {
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }

  private startHealthMonitor(connId: number): void {
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
    }
    this.healthInterval = setInterval(() => {
      if (connId !== this.connectionId) return;
      void this.checkStatus();
    }, PING_INTERVAL_MS);
  }

  private shutdownClientQuietly(client: tmi.Client | null): void {
    if (!client) return;
    (client as any).reconnect = false;
    client.removeAllListeners();
    const state = client.readyState();
    if (state === 'OPEN' || state === 'CONNECTING') {
      void client.disconnect().catch(() => {});
    }
  }

  private failConnection(connId: number, reason: string): void {
    if (connId !== this.connectionId) return;
    this.clearTimers();
    this.detachBrowserListeners();
    this.channelJoined = false;
    const oldClient = this.client;
    this.client = null;
    this.shutdownClientQuietly(oldClient);
    this.setStatus('error', reason);
    this.config?.onDisconnect?.();
  }

  /**
   * Connect to Twitch IRC and verify channel join.
   */
  async connect(config: TwitchIRCConfig): Promise<boolean> {
    const cleanChannel = this.normalizeChannel(config.channelName);
    const targetChannel = `#${cleanChannel}`;

    await this.disconnect(true);

    const connId = ++this.connectionId;
    this.config = { ...config, channelName: cleanChannel };
    this.channelJoined = false;
    this.setStatus('connecting');

    if (!cleanChannel) {
      this.failConnection(connId, 'Channel name cannot be empty.');
      return false;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.failConnection(connId, 'Browser is offline.');
      return false;
    }

    const client = new tmi.Client({
      channels: [],
      connection: {
        secure: true,
        reconnect: true,
        maxReconnectAttempts: 3,
        reconnectInterval: 2000
      },
      options: {
        skipUpdatingEmotesets: true
      }
    });

    // tmi.js 1.8.5 compares latency in seconds against 600ms, causing premature 600ms timeouts
    (client as any)._getPromiseDelay = () => JOIN_TIMEOUT_MS;

    this.client = client;
    this.attachBrowserListeners(connId);

    return new Promise<boolean>((resolve) => {
      let settledInitial = false;
      const finishInitial = (ok: boolean): void => {
        if (!settledInitial) {
          settledInitial = true;
          resolve(ok);
        }
      };

      const markChannelJoined = (): void => {
        if (connId !== this.connectionId || this.channelJoined) return;
        this.channelJoined = true;
        if (this.joinTimer) {
          clearTimeout(this.joinTimer);
          this.joinTimer = null;
        }
        const channels = client.getChannels();
        if (!channels.includes(targetChannel)) {
          channels.push(targetChannel);
        }
        this.setStatus('connected');
        this.startHealthMonitor(connId);
        this.config?.onConnect?.();
        finishInitial(true);
      };

      const requestChannelJoin = (): void => {
        if (connId !== this.connectionId) return;
        this.channelJoined = false;
        if (this.joinTimer) {
          clearTimeout(this.joinTimer);
        }

        try {
          (client as any)._sendCommand(undefined, null, `JOIN ${targetChannel}`);
        } catch {
          this.failConnection(connId, 'Failed to join Twitch channel.');
          finishInitial(false);
          return;
        }

        this.joinTimer = setTimeout(() => {
          if (connId !== this.connectionId || this.channelJoined) return;
          this.failConnection(
            connId,
            'No response from Twitch. Check the channel name and connection.'
          );
          finishInitial(false);
        }, JOIN_TIMEOUT_MS);
      };

      client.on('message', (_channel: string, tags: any, message: string, self: boolean) => {
        if (self || connId !== this.connectionId) return;
        const username = tags['display-name'] || tags.username || 'unknown';
        this.config?.onMessage?.(username, message);
      });

      client.on('connected', () => {
        if (connId !== this.connectionId) return;
        this.setStatus('connecting');
        requestChannelJoin();
      });

      client.on('join', (channel: string, _username: string, self: boolean) => {
        if (connId !== this.connectionId) return;
        if (self && channel.toLowerCase() === targetChannel) {
          markChannelJoined();
        }
      });

      client.on('roomstate', (channel: string) => {
        if (connId !== this.connectionId) return;
        if (channel.toLowerCase() === targetChannel) {
          markChannelJoined();
        }
      });

      client.on('notice', (_channel: string, msgid: string, msg: string) => {
        if (connId !== this.connectionId) return;
        if (FATAL_CHANNEL_NOTICES.has(msgid)) {
          this.failConnection(connId, msg || 'Twitch channel unavailable.');
          finishInitial(false);
        }
      });

      client.on('reconnect', () => {
        if (connId !== this.connectionId) return;
        this.clearTimers();
        this.channelJoined = false;
        this.setStatus('connecting', 'Connection interrupted. Reconnecting...');
      });

      (client as any).on('maxreconnect', () => {
        if (connId !== this.connectionId) return;
        this.failConnection(connId, 'Connection lost. No response from Twitch.');
        finishInitial(false);
      });

      client.on('disconnected', (reason: string) => {
        if (connId !== this.connectionId) return;
        this.clearTimers();
        this.channelJoined = false;

        // If tmi.js is no longer reconnecting or initial connect failed, surface the error
        if (!(client as any).reconnecting && !(client as any).reconnect) {
          this.failConnection(connId, reason || 'Disconnected from Twitch.');
          finishInitial(false);
        } else if (!settledInitial) {
          this.failConnection(
            connId,
            reason || 'No response from Twitch. Check your connection.'
          );
          finishInitial(false);
        } else {
          // Dropped mid-session: immediately reflect broken state until reconnect succeeds
          this.setStatus('error', reason || 'Connection interrupted. Reconnecting...');
          this.config?.onDisconnect?.();
        }
      });

      client.connect().catch((err: unknown) => {
        if (connId !== this.connectionId) return;
        const msg = typeof err === 'string' && err
          ? err
          : err instanceof Error && err.message
            ? err.message
            : 'No response from Twitch.';
        this.failConnection(connId, msg);
        finishInitial(false);
      });
    });
  }

  /**
   * Active health check: verifies WebSocket state, channel membership, and live PING/PONG response.
   */
  async checkStatus(): Promise<boolean> {
    if (this.inFlightCheck) {
      return this.inFlightCheck;
    }

    this.inFlightCheck = this.performStatusCheck().finally(() => {
      this.inFlightCheck = null;
    });

    return this.inFlightCheck;
  }

  private async performStatusCheck(): Promise<boolean> {
    const connId = this.connectionId;
    const client = this.client;

    if (!this.config) {
      this.setStatus('disconnected');
      return false;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.failConnection(connId, 'Browser is offline.');
      return false;
    }

    if (!client || client.readyState() !== 'OPEN' || !this.channelJoined) {
      this.failConnection(connId, 'Connection to Twitch chat is broken.');
      return false;
    }

    return new Promise<boolean>((resolve) => {
      let done = false;
      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        client.removeListener('pong', onPong);
        this.failConnection(connId, 'No response from Twitch.');
        resolve(false);
      }, PING_TIMEOUT_MS);

      const onPong = (): void => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (connId === this.connectionId && this.channelJoined && client.readyState() === 'OPEN') {
          this.setStatus('connected');
          resolve(true);
        } else {
          resolve(false);
        }
      };

      client.once('pong', onPong);

      try {
        (client as any).latency = new Date();
        (client as any)._sendCommand(undefined, null, 'PING');
      } catch {
        clearTimeout(timer);
        client.removeListener('pong', onPong);
        this.failConnection(connId, 'Failed to reach Twitch chat.');
        resolve(false);
      }
    });
  }

  /**
   * Disconnect from Twitch IRC
   */
  async disconnect(silent: boolean = false): Promise<void> {
    this.connectionId++;
    this.clearTimers();
    this.detachBrowserListeners();
    this.channelJoined = false;

    const oldClient = this.client;
    const oldConfig = this.config;
    this.client = null;
    if (!silent) {
      this.config = null;
    }

    this.shutdownClientQuietly(oldClient);

    if (!silent) {
      this.status = 'disconnected';
      this.errorMessage = '';
      oldConfig?.onStatusChange?.('disconnected');
      oldConfig?.onDisconnect?.();
    }
  }

  /**
   * Send a message to chat
   */
  async sendMessage(message: string): Promise<void> {
    if (!this.client || !this.config?.channelName || !this.isConnected()) {
      throw new Error('Not connected to Twitch IRC');
    }
    await this.client.say(this.config.channelName, message);
  }

  getStatus(): TwitchConnectionStatus {
    return this.status;
  }

  getErrorMessage(): string {
    return this.errorMessage;
  }

  /**
   * Check if socket is open and channel join is confirmed
   */
  isConnected(): boolean {
    if (!this.client || !this.channelJoined || this.status !== 'connected') {
      return false;
    }
    return this.client.readyState() === 'OPEN';
  }
}

export const twitchIRC = new TwitchIRCService();
