import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

const navItems = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Products', path: '/admin/products' },
  { label: 'Orders', path: '/admin/orders' },
  { label: 'Inventory', path: '/admin/inventory' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Customers', path: '/admin/customers' },
  { label: 'Reviews', path: '/admin/reviews' },
  { label: 'Analytics', path: '/admin/analytics' },
  { label: 'Settings', path: '/admin/settings' },
];

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const currentLabel = navItems.find((n) => isActive(n.path))?.label || 'Admin';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#0A0A0A] font-sans">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/5 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
                {currentLabel}
              </h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
