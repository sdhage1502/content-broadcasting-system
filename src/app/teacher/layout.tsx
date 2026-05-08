"use client";
import { LayoutDashboard, Upload, FileText } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Sidebar, MobileNav, type SidebarItem } from "@/components/common/Sidebar";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

const items: SidebarItem[] = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/upload", label: "Upload Content", icon: Upload },
  { href: "/teacher/my-content", label: "My Content", icon: FileText },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="teacher">
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <MobileNav items={items} />
        <div className="flex flex-1">
          <Sidebar items={items} title="Teacher" />
          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
