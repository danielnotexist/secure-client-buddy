import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CrmSidebar } from "@/components/CrmSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Outlet } from "react-router-dom";

export function CrmLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CrmSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="me-2" />
            <span className="text-sm text-muted-foreground">SecureOps CRM</span>
            <div className="ms-auto">
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
