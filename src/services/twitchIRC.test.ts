import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { EventEmitter } from 'events';

class MockTmiClient extends EventEmitter {
  static latest: MockTmiClient | null = null;
  channels: string[] = [];
  wsState: 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' = 'CLOSED';
  reconnect = true;
  reconnecting = false;
  sentCommands: string[] = [];

  constructor(_opts?: unknown) {
    super();
    MockTmiClient.latest = this;
  }

  async connect(): Promise<[string, number]> {
    this.wsState = 'OPEN';
    setTimeout(() => {
      this.emit('connected', 'irc-ws.chat.twitch.tv', 443);
    }, 0);
    return ['irc-ws.chat.twitch.tv', 443];
  }

  async disconnect(): Promise<[string, number]> {
    this.wsState = 'CLOSED';
    this.emit('disconnected', 'Connection closed.');
    return ['irc-ws.chat.twitch.tv', 443];
  }

  readyState(): string {
    return this.wsState;
  }

  getChannels(): string[] {
    return this.channels;
  }

  _sendCommand(_delay: unknown, _channel: unknown, command: string): void {
    this.sentCommands.push(command);
  }
}

jest.mock('tmi.js', () => ({
  __esModule: true,
  default: {
    get Client() {
      return MockTmiClient;
    }
  }
}));

import { twitchIRC } from './twitchIRC';
import type { TwitchConnectionStatus } from './twitchIRC';

describe('TwitchIRCService status checks', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    MockTmiClient.latest = null;
  });

  afterEach(async () => {
    await twitchIRC.disconnect();
    jest.useRealTimers();
  });

  test('reaches connected only after channel join is confirmed', async () => {
    const statuses: TwitchConnectionStatus[] = [];
    const connectPromise = twitchIRC.connect({
      channelName: 'testchannel',
      onStatusChange: s => statuses.push(s)
    });

    await Promise.resolve();
    jest.advanceTimersByTime(5);
    const client = MockTmiClient.latest!;
    expect(client.sentCommands).toContain('JOIN #testchannel');
    expect(twitchIRC.getStatus()).toBe('connecting');
    expect(twitchIRC.isConnected()).toBe(false);

    client.emit('join', '#testchannel', 'justinfan123', true);
    const ok = await connectPromise;

    expect(ok).toBe(true);
    expect(twitchIRC.getStatus()).toBe('connected');
    expect(twitchIRC.isConnected()).toBe(true);
    expect(statuses).toEqual(['connecting', 'connected']);
  });

  test('marks status as error when Twitch does not respond to channel join', async () => {
    const statuses: Array<[TwitchConnectionStatus, string | undefined]> = [];
    const connectPromise = twitchIRC.connect({
      channelName: 'ghostchannel',
      onStatusChange: (s, err) => statuses.push([s, err])
    });

    await Promise.resolve();
    jest.advanceTimersByTime(8500);
    const ok = await connectPromise;

    expect(ok).toBe(false);
    expect(twitchIRC.getStatus()).toBe('error');
    expect(twitchIRC.getErrorMessage()).toContain('No response from Twitch');
    expect(twitchIRC.isConnected()).toBe(false);
    expect(statuses[statuses.length - 1]?.[0]).toBe('error');
  });

  test('checkStatus flips to error when PING gets no PONG from Twitch', async () => {
    const connectPromise = twitchIRC.connect({ channelName: 'livechannel' });
    await Promise.resolve();
    jest.advanceTimersByTime(5);
    const client = MockTmiClient.latest!;
    client.emit('roomstate', '#livechannel', {});
    await connectPromise;
    expect(twitchIRC.isConnected()).toBe(true);

    // Healthy PING/PONG
    const okCheck = twitchIRC.checkStatus();
    expect(client.sentCommands).toContain('PING');
    client.emit('pong', 0.12);
    expect(await okCheck).toBe(true);
    expect(twitchIRC.getStatus()).toBe('connected');

    // Broken connection: no PONG arrives
    const failCheck = twitchIRC.checkStatus();
    await Promise.resolve();
    jest.advanceTimersByTime(5500);
    expect(await failCheck).toBe(false);
    expect(twitchIRC.getStatus()).toBe('error');
    expect(twitchIRC.getErrorMessage()).toBe('No response from Twitch.');
    expect(twitchIRC.isConnected()).toBe(false);
  });
});
