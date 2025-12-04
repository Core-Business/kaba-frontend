"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, User, Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { UsersAPI } from "@/api/users";
import { UserNav } from "@/components/layout/user-nav";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { OrganizationSettings } from "@/components/settings/organization-settings";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
}

// Componente de la barra superior para Settings
function SettingsTopBar() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold" style={{ color: '#10367D' }}>
          Configuración
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <UserNav />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      
      const token = localStorage.getItem("kaba.token"); // Updated token key based on AuthContext
      if (!token) {
        router.push("/login");
        return;
      }

      const userProfile = await UsersAPI.getCurrentUser();
      setProfile(userProfile);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil del usuario.",
        variant: "destructive",
      });
      
      // Si hay error de autenticación, redirigir al login
      if (error instanceof Error && error.message.includes("authentication")) {
        router.push("/login");
      }
    } finally {
      setIsLoadingProfile(false);
    }
  }, [router, toast]);

  // Cargar perfil del usuario
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  if (isLoadingProfile) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AppSidebar />
        <div className="flex-1 ml-64">
          <div className="p-8">
            <SettingsTopBar />
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Settings className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Cargando configuración...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <SettingsTopBar />
          <div className="max-w-4xl">
            <div className="mb-8">
              <p className="text-muted-foreground">
                Administra tu perfil y configuración de la organización.
              </p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="organization" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Organización
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <ProfileSettings 
                  initialProfile={profile} 
                  onProfileUpdate={handleProfileUpdate} 
                />
              </TabsContent>
              
              <TabsContent value="organization">
                <OrganizationSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}