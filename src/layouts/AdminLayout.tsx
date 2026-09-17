import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const navItems = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Products', path: '/admin/products' },
  { label: 'Orders', path: '/admin/orders' },
  { label: 'Inventory', path: '/admin/inventory' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Customers', path: '/admin/customers' },
  { label: 'Reviews', path: '/admin/reviews' },
  { label: 'Enquiries', path: '/admin/enquiries' },
  { label: 'Analytics', path: '/admin/analytics' },
  { label: 'Settings', path: '/admin/settings' },
];

/**
 * The back office shell: sidebar, top bar, breadcrumb, content.
 *
 * Deliberately a different design system from the storefront — shadcn/Tailwind
 * here, MUI there. An admin is reading dense tables and changing state; a
 * customer is being sold a €485 sneaker. Making the two look alike would serve
 * neither.
 */
const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const current = navItems.find((n) => isActive(n.path));
  const isDashboard = current?.path === '/admin';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#0A0A0A] font-sans">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/5 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

            <Breadcrumb>
              <BreadcrumbList className="text-xs">
                <BreadcrumbItem>
                  {isDashboard ? (
                    <BreadcrumbPage className="uppercase tracking-widest text-muted-foreground">
                      Admin
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to="/admin"
                        className="uppercase tracking-widest text-muted-foreground hover:text-primary"
                      >
                        Admin
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {!isDashboard && current && (
                  <>
                    <BreadcrumbSeparator className="text-muted-foreground/40" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="uppercase tracking-widest text-foreground">
                        {current.label}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-8">
            {/* Each admin page is its own lazy chunk; this keeps the sidebar
                and breadcrumb on screen while the next one arrives. */}
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
