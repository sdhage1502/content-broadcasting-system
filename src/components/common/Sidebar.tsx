"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function Sidebar({ items, title }: { items: SidebarItem[]; title?: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-56 shrink-0 border-r bg-card/40 md:block">
      <nav className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col gap-1 p-3">
        {title && (
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        )}
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b bg-card/40 px-3 py-2 md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname?.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
