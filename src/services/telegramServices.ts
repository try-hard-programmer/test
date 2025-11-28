import { apiClient } from "@/lib/apiClient";

/**
 * Telegram Integration Service
 * Handles Telegram MTProto session management via backend API
 */

export type TelegramConnectionStatus =
  | "disconnected"
  | "configured"
  | "authenticating"
  | "connected"
  | "error";

export interface TelegramStatusResponse {
  status: TelegramConnectionStatus;
  agent_id: string;
  user?: {
    id: string;
    username?: string;
    first_name?: string;
    phone_number?: string;
  };
  config_configured: boolean; // Indicates if api_id/hash are saved
  connected_at?: string;
}

export interface TelegramConfigPayload {
  agent_id: string;
  api_id: string;
  api_hash: string;
}

export interface TelegramAuthResponse {
  success: boolean;
  message: string;
  phone_code_hash?: string; // Required for the next step (verify code)
  requires_2fa?: boolean; // Indicates if password step is needed
}

/**
 * Check if Telegram session exists or is configured for an agent
 */
export const checkTelegramStatus = async (
  agentId: string
): Promise<TelegramStatusResponse> => {
  return apiClient.get<TelegramStatusResponse>(`/telegram/status/${agentId}`);
};

/**
 * Update/Save API Configuration (api_id, api_hash)
 */
export const updateTelegramConfig = async (
  payload: TelegramConfigPayload
): Promise<TelegramStatusResponse> => {
  return apiClient.post<TelegramStatusResponse>("/telegram/config", payload);
};

/**
 * Step 1: Send Authentication Code to Phone Number
 */
export const sendAuthCode = async (
  agentId: string,
  phoneNumber: string
): Promise<TelegramAuthResponse> => {
  return apiClient.post<TelegramAuthResponse>("/telegram/auth/send-code", {
    agent_id: agentId,
    phone_number: phoneNumber,
  });
};

/**
 * Step 2: Verify the OTP Code received
 */
export const verifyAuthCode = async (
  agentId: string,
  phoneNumber: string,
  phoneCode: string,
  phoneCodeHash: string
): Promise<TelegramAuthResponse> => {
  return apiClient.post<TelegramAuthResponse>("/telegram/auth/sign-in", {
    agent_id: agentId,
    phone_number: phoneNumber,
    phone_code: phoneCode,
    phone_code_hash: phoneCodeHash,
  });
};

/**
 * Step 3 (Optional): Verify 2FA Cloud Password
 */
export const verify2FAPassword = async (
  agentId: string,
  password: string
): Promise<TelegramAuthResponse> => {
  return apiClient.post<TelegramAuthResponse>("/telegram/auth/2fa", {
    agent_id: agentId,
    password: password,
  });
};

/**
 * Terminate Telegram session (Log out)
 */
export const terminateTelegramSession = async (
  agentId: string
): Promise<void> => {
  return apiClient.delete<void>(`/telegram/terminate/${agentId}`);
};
