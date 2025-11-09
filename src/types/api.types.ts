// StreamElements API Types
export interface StreamElementsChannelInfo {
  _id: string;
  displayName: string;
  provider: string;
  providerId: string;
}

// Registration Request/Response Types
export interface RegisterRequest {
  userId: string;
  jwtToken: string;
}

export interface RegisterResponse {
  success: boolean;
  userId: string;
  channelName: string;
}

export interface RegisterErrorResponse {
  error: string;
  errorCode: string;
  details?: string;
}

// Revoke Request/Response Types
export interface RevokeRequest {
  userId: string;
}

export interface RevokeResponse {
  success: boolean;
  message: string;
}

export interface RevokeErrorResponse {
  error: string;
}

// MongoDB Credential Types
export interface UserCredential {
  user_id: string;
  jwt_token_encrypted: string;
  auth_tag: string;
  iv: string;
  channel_id: string;
  channel_name: string;
  registered_at: Date;
}

// Encryption Types
export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

// Vercel Handler Types (for Node.js serverless functions)
export interface VercelRequest {
  method: string;
  body: any;
  headers: { [key: string]: string };
}

export interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  setHeader: (key: string, value: string) => void;
  end: () => void;
}

// Twitch OAuth Types
export interface TwitchOAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
  token_type: string;
}

export interface TwitchUserInfo {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
}

export interface TwitchConnection {
  user_id: string;
  connection_type: 'irc' | 'oauth';
  channel_name: string;
  twitch_user_id?: string;
  access_token_encrypted?: string;
  refresh_token_encrypted?: string;
  auth_tag?: string;
  iv?: string;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TwitchIRCConnectRequest {
  userId: string;
  channelName: string;
  oauthToken?: string;
}

export interface TwitchIRCConnectResponse {
  success: boolean;
  connectionType: 'anonymous' | 'authenticated';
  channelName: string;
}

export interface TwitchOAuthStartResponse {
  authUrl: string;
}

export interface TwitchOAuthCallbackRequest {
  code: string;
  state: string;
}

export interface TwitchOAuthCallbackResponse {
  success: boolean;
  userId: string;
  channelName: string;
  displayName: string;
}

