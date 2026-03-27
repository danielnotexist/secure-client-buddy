import { LayoutDashboard, Users, Shield, FolderKanban, TicketCheck } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "לוח בקרה", url: "/", icon: LayoutDashboard },
  { title: "לקוחות", url: "/customers", icon: Users },
  { title: "פרויקטים", url: "/projects", icon: FolderKanban },
];

export function CrmSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarContent>
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <Shield className="h-8 w-8 text-primary shrink-0" />
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg text-foreground">SecureOps</h1>
              <p className="text-xs text-muted-foreground">מערכת ניהול לקוחות</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-muted/50 flex items-center gap-3"
                      activeClassName="bg-primary/10 text-primary font-medium border-glow"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
