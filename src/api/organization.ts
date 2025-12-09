import { api } from "./http";

export interface Organization {
  id: string;
  name: string;
  type: 'COMPANY' | 'CONSULTANCY';
  branding?: {
    logoUrl?: string;
    colors?: {
      primary?: string;
      secondary?: string;
    };
  };
  createdAt: string;
}

export const OrganizationAPI = {
  async getCurrent(): Promise<Organization> {
    const response = await api.get("/organizations/current");
    return response.data;
  },

  async updateCurrent(data: Partial<Organization>): Promise<Organization> {
    const response = await api.patch("/organizations/current", data);
    return response.data;
  },

  async uploadLogo(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/organizations/current/logo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
