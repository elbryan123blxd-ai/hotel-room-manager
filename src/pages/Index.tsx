import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { HotelProvider } from '@/contexts/HotelContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSection } from '@/sections/DashboardSection';
import { RoomsSection } from '@/sections/RoomsSection';
import { ClientsSection } from '@/sections/ClientsSection';
import { InventorySection } from '@/sections/InventorySection';
import { ConfigSection } from '@/sections/ConfigSection';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';

const sections = [
  { id: 'dashboard', label: 'Dashboard', Comp: DashboardSection },
  { id: 'rooms', label: 'Cuartos', Comp: RoomsSection },
  { id: 'clients', label: 'Clientes', Comp: ClientsSection },
  { id: 'inventory', label: 'Inventario', Comp: InventorySection },
  { id: 'config', label: 'Configuración', Comp: ConfigSection },
] as const;

function IndexContent() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { theme, setTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      const navMap: Record<string, string> = { '1': 'dashboard', '2': 'rooms', '3': 'clients', '4': 'inventory', '5': 'config' };
      if ((e.ctrlKey || e.metaKey) && navMap[e.key]) {
        e.preventDefault();
        setActiveSection(navMap[e.key]);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('[data-search]')?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const sectionLabel = sections.find((s) => s.id === activeSection)?.label ?? '';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border px-4">
            <SidebarTrigger />
            <span className="ml-3 text-sm font-medium text-muted-foreground capitalize">{sectionLabel}</span>
            <div className="ml-auto flex items-center gap-2">
              <kbd className="hidden lg:inline-flex text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded gap-1">
                <span className="font-semibold">Ctrl+1-5</span> navegar
              </kbd>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-8 w-8 rounded-full">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="hidden sm:inline">{user?.email}</span>
                <Button variant="ghost" size="icon" onClick={() => { logout(); navigate('/login'); }} className="h-8 w-8 rounded-full" title="Cerrar sesión">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {sections.map(({ id, Comp }) => (
                <div key={id} style={{ display: activeSection === id ? '' : 'none' }}>
                  {activeSection === id && <Comp />}
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const Index = () => (
  <HotelProvider>
    <IndexContent />
  </HotelProvider>
);

export default Index;
