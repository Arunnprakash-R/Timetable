"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, GraduationCap, LogOut, Settings, Upload, LineChart, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/useUser";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: CalendarDays },
  { href: "/timetable", label: "Timetable", icon: GraduationCap },
  { href: "/upload", label: "Upload", icon: Upload, adminOnly: true },
  { href: "/analytics", label: "Analytics", icon: LineChart, adminOnly: true },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navbar({ role }: { role: string }) {
  const router = useRouter();
  const { user } = useUser();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CC";

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">ChronoClass</p>
            <p className="text-xs text-muted-foreground">Intelligent timetable management</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems
            .filter((item) => !item.adminOnly || role === "admin")
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          <NotificationBell userId={user?.id} />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="h-11 gap-3 rounded-full px-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:inline">{user?.name ?? "ChronoClass User"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => router.push("/settings")}>Profile settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/notifications")}>Notifications</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/login")}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
