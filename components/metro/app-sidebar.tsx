"use client";

import { CalendarDays, ChevronRight, ClipboardList, House, type LucideIcon, NotebookText, Plus, Presentation, Settings, SquarePen, UserRound, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Whether this item is the active one for the given pathname. */
  active: (pathname: string) => boolean;
}

interface AppSidebarProps {
  clients: Array<{ id: string; name: string }>;
}

const NavList = ({ items, pathname }: { items: NavItem[]; pathname: string }) => (
  <SidebarMenu>
    {items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton asChild isActive={item.active(pathname)} tooltip={item.label} className="h-12 gap-3 px-3 text-body [&>svg]:size-5 data-[active=true]:text-accent-strong [&[data-active=true]>svg]:text-accent">
          <Link href={item.href}>
            <item.icon strokeWidth={1.6} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))}
  </SidebarMenu>
);

/** The client the pathname is inside, if any. */
const clientIdOf = (pathname: string): string | null => /^\/clients\/([^/]+)/.exec(pathname)?.[1] ?? null;

/*
 * The app sidebar at 1024 and above: the practice's pages, then every client as a
 * tree. One client is expanded at a time: the one whose screens are open, or the one
 * last opened on its chevron. Presentation mode renders outside the sidebar.
 */
export const AppSidebar = ({ clients }: AppSidebarProps) => {
  const t = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const pathname = usePathname();
  const currentId = clientIdOf(pathname);
  // One client open at a time. Navigating into a client opens that one and closes the rest.
  const [openId, setOpenId] = useState<string | null>(currentId);
  const [seenId, setSeenId] = useState<string | null>(currentId);
  if (currentId !== seenId) {
    setSeenId(currentId);
    if (currentId) setOpenId(currentId);
  }

  const appItems: NavItem[] = [
    { href: "/", label: t("home"), icon: House, active: (p) => p === "/" },
    { href: "/visits", label: t("visits"), icon: ClipboardList, active: (p) => p.startsWith("/visits") },
    { href: "/appointments", label: t("appointments"), icon: CalendarDays, active: (p) => p.startsWith("/appointments") },
  ];

  const clientItems = (id: string): NavItem[] => [
    { href: `/clients/${id}`, label: t("clientCard"), icon: UserRound, active: (p) => p === `/clients/${id}` },
    { href: `/clients/${id}/measure`, label: t("newMeasurement"), icon: Plus, active: (p) => p === `/clients/${id}/measure` },
    { href: `/clients/${id}/edit`, label: t("clientDetails"), icon: SquarePen, active: (p) => p === `/clients/${id}/edit` },
    { href: `/clients/${id}/history`, label: t("clientHistory"), icon: NotebookText, active: (p) => p === `/clients/${id}/history` },
    { href: `/clients/${id}/present`, label: t("presentation"), icon: Presentation, active: () => false },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex-row items-center justify-between px-3 pt-4 pb-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pb-3">
        <span className="pl-1 text-title-l group-data-[collapsible=icon]:hidden">{tCommon("appName")}</span>
        <SidebarTrigger className="size-8 text-ink-muted" />
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        <ScrollArea className="h-0 flex-1" viewportClassName="!overflow-y-scroll group-data-[collapsible=icon]:!overflow-hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            <NavList items={appItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel asChild className="h-9 text-label text-ink-muted">
            <Link href="/clients">
              <Users className="mr-2 size-4" strokeWidth={1.6} aria-hidden="true" />
              {t("clients")}
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupAction asChild title={t("newClient")}>
            <Link href="/clients/new">
              <Plus strokeWidth={1.6} aria-hidden="true" />
              <span className="sr-only">{t("newClient")}</span>
            </Link>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {clients.map((client) => {
                const isCurrent = client.id === currentId;
                const open = openId === client.id;
                return (
                  <Collapsible key={client.id} asChild open={open} onOpenChange={(o) => setOpenId(o ? client.id : null)}>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isCurrent} tooltip={client.name} className="h-12 gap-0 px-3 text-body group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1!">
                        <div>
                          <Link href={`/clients/${client.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                            <UserAvatar name={client.name} size="md" className="size-8 text-caption group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:text-[11px]" />
                            <span className="truncate">{client.name}</span>
                          </Link>
                          {/* The chevron sits at the right edge of the row, always visible, and turns down when the tree is open. */}
                          <CollapsibleTrigger asChild>
                            <button
                              type="button"
                              aria-label={client.name}
                              aria-expanded={open}
                              className="ml-auto flex size-7 shrink-0 cursor-pointer items-center justify-center text-ink-muted group-data-[collapsible=icon]:hidden"
                            >
                              <ChevronRight className={cn("size-5 transition-transform duration-300", open && "rotate-90")} strokeWidth={1.6} aria-hidden="true" />
                            </button>
                          </CollapsibleTrigger>
                        </div>
                      </SidebarMenuButton>
                      <CollapsibleContent>
                        <SidebarMenuSub className="mx-5 mt-1 mb-2 gap-1.5 border-hairline py-1 pl-4">
                          {clientItems(client.id).map((item) => (
                            <SidebarMenuSubItem key={item.href}>
                              <SidebarMenuSubButton asChild isActive={item.active(pathname)} className="h-10 gap-3 px-3 text-body [&>svg]:size-[18px] data-[active=true]:bg-accent-soft data-[active=true]:text-accent-strong [&[data-active=true]>svg]:text-accent">
                                <Link href={item.href}>
                                  <item.icon strokeWidth={1.6} aria-hidden="true" />
                                  <span>{item.label}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="pb-4">
        <NavList items={[{ href: "/settings", label: t("settings"), icon: Settings, active: (p) => p.startsWith("/settings") }]} pathname={pathname} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
