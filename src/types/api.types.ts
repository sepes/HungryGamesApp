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

