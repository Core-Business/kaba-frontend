
"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, LifeBuoy } from "lucide-react";
import { useRouter } from "next/navigation";
import { UsersAPI } from "@/api/users";
import { AuthAPI } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";

interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export function UserNav() {
  const router = useRouter();
  const { user, clearAuth } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (user) {
      // Si tenemos user del contexto, usarlo directamente
      setUserInfo({
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: 'user'
      });
    } else {
      loadUserInfo();
    }
  }, [user]);

  const loadUserInfo = async () => {
    try {
      const userData = await UsersAPI.getCurrentUser();
      setUserInfo(userData);
    } catch (error) {
      console.error('Error loading user info:', error);
      // Si no se puede cargar la info del usuario, mantener null
    }
  };

  const handleLogout = async () => {
    try {
      await AuthAPI.logoutFromServer();
    } catch (error) {
      console.error('Error during logout:', error);
      // En caso de error, usar clearAuth del contexto
      clearAuth();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="User avatar" data-ai-hint="user avatar" />
            <AvatarFallback>
              {userInfo ? `${userInfo.firstName.charAt(0)}${userInfo.lastName.charAt(0)}` : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : "Nombre de Usuario"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userInfo?.email || "usuario@ejemplo.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
