import { setRequestLocale } from "next-intl/server";

import { AppSidebar } from "@/components/metro/app-sidebar";
import { BottomTabBar } from "@/components/metro/bottom-tab-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { listClientNames } from "@/lib/metro/queries";
import { BaseLayoutProps } from "@/types/page-props";

// Every screen except presentation mode: the sidebar at 1024 and above, the tab bar below.
const AppLayout = async ({ children, params }: BaseLayoutProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const clients = await listClientNames();

  return (
    <SidebarProvider>
      <AppSidebar clients={clients} />
      <SidebarInset className="h-svh max-h-svh min-w-0 overflow-hidden bg-surface-page">
        <ScrollArea className="h-0 flex-1" viewportClassName="!overflow-y-scroll">
          {children}
          <BottomTabBar />
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
