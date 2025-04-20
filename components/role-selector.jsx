"use client"

import { useUserRole } from "./user-role-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Shield, ShieldCheck, ShieldAlert, ChevronDown } from "lucide-react"

export default function RoleSelector() {
  const { role, setRole } = useUserRole()

  const roleIcons = {
    ADMIN: <ShieldAlert className="h-4 w-4 mr-2" />,
    EDITOR: <ShieldCheck className="h-4 w-4 mr-2" />,
    VIEWER: <Shield className="h-4 w-4 mr-2" />,
  }

  const roleColors = {
    ADMIN: "text-red-500",
    EDITOR: "text-blue-500",
    VIEWER: "text-green-500",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          {roleIcons[role]}
          <span className={roleColors[role]}>{role}</span>
          <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setRole("ADMIN")} className="cursor-pointer">
          <ShieldAlert className="h-4 w-4 mr-2 text-red-500" />
          <span className={role === "ADMIN" ? "font-bold" : ""}>Admin</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setRole("EDITOR")} className="cursor-pointer">
          <ShieldCheck className="h-4 w-4 mr-2 text-blue-500" />
          <span className={role === "EDITOR" ? "font-bold" : ""}>Editor</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setRole("VIEWER")} className="cursor-pointer">
          <Shield className="h-4 w-4 mr-2 text-green-500" />
          <span className={role === "VIEWER" ? "font-bold" : ""}>Viewer</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
