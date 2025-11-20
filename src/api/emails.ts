import { api } from './http';

type TemplateDynamicValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | TemplateDynamicValue[]
  | { [key: string]: TemplateDynamicValue };

export interface SendTemplateRequest {
  to: string;
  templateId: string;
  dynamicTemplateData?: Record<string, TemplateDynamicValue>;
  cc?: string[];
  bcc?: string[];
}

export interface EmailResponse {
  statusCode: number;
  message: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export const EmailsAPI = {
  // Envío directo de templates (principalmente para uso interno/admin)
  async sendTemplate(payload: SendTemplateRequest): Promise<EmailResponse> {
    const { data } = await api.post('/notifications/email/send-template', payload);
    return data;
  },

  // Verificar email después del registro
  async verifyEmail(payload: VerifyEmailRequest): Promise<{ message: string }> {
    const { data } = await api.post('/auth/verify-email', payload);
    return data;
  },

  // Solicitar reset de contraseña
  async forgotPassword(payload: ForgotPasswordRequest): Promise<{ message: string }> {
    const { data } = await api.post('/auth/forgot-password', payload);
    return data;
  },

  // Restablecer contraseña con token
  async resetPassword(payload: ResetPasswordRequest): Promise<{ message: string }> {
    const { data } = await api.post('/auth/reset-password', payload);
    return data;
  },
};
