import { api } from "./http";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const UsersAPI = {
  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem("kaba.token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Decodificar el JWT para obtener el ID del usuario
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;

    const response = await api.get(`/users/${userId}`);
    return response.data?.data;
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data?.data;
  },

  async updateUser(id: string, updateData: UpdateUserRequest): Promise<User> {
    const response = await api.patch(`/users/${id}`, updateData);
    return response.data?.data;
  },

  async updateCurrentUser(updateData: UpdateUserRequest): Promise<User> {
    const token = localStorage.getItem("kaba.token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Decodificar el JWT para obtener el ID del usuario
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;

    return this.updateUser(userId, updateData);
  },

  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    const token = localStorage.getItem("kaba.token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Decodificar el JWT para obtener el ID del usuario
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;

    // Por ahora usamos el endpoint de actualización regular
    // En el futuro se podría crear un endpoint específico para cambiar contraseña
    await this.updateUser(userId, { password: passwordData.newPassword });
  },

  async uploadAvatar(file: File): Promise<User> {
    const token = localStorage.getItem("kaba.token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Decodificar el JWT para obtener el ID del usuario
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;

    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`/users/${userId}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.data;
  },
}; 