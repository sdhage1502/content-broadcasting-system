"use client";
import { LayoutDashboard, ClipboardCheck, Library, Users } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Sidebar, MobileNav, type SidebarItem } from "@/components/common/Sidebar";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

const items: SidebarItem[] = [
  { href: "/principal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/principal/teachers", label: "Teachers", icon: Users },
  { href: "/principal/pending", label: "Pending Approval", icon: ClipboardCheck },
  { href: "/principal/all-content", label: "All Content", icon: Library },
];

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="principal">
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <MobileNav items={items} />
        <div className="flex flex-1">
          <Sidebar items={items} title="Principal" />
          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
