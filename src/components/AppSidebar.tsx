import { BedDouble, Settings, LayoutDashboard, Users, Package } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const sections = [
  { title: "Dashboard", id: "dashboard", icon: LayoutDashboard },
  { title: "Cuartos", id: "rooms", icon: BedDouble },
  { title: "Clientes", id: "clients", icon: Users },
  { title: "Inventario", id: "inventory", icon: Package },
  { title: "Configuración", id: "config", icon: Settings },
];

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                    tooltip={item.title}
                    className={cn(
                      "relative",
                      activeSection === item.id && "bg-sidebar-accent/80 text-sidebar-accent-foreground font-medium"
                    )}
                  >
                    {activeSection === item.id && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-sidebar-primary" />
                    )}
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
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
