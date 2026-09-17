import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Tags,
  Users,
  Star,
  Mail,
  BarChart3,
  Settings,
  Store,
  LogOut,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { label: 'Inventory', path: '/admin/inventory', icon: Warehouse },
  { label: 'Categories', path: '/admin/categories', icon: Tags },
  { label: 'Customers', path: '/admin/customers', icon: Users },
  { label: 'Reviews', path: '/admin/reviews', icon: Star },
  { label: 'Enquiries', path: '/admin/enquiries', icon: Mail },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-background">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground font-serif font-bold rounded-sm">
            S
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="font-serif text-lg tracking-widest text-foreground">SILVAINE</div>
            <div className="font-sans text-[0.5rem] uppercase tracking-[0.25em] text-primary">Admin Panel</div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarSeparator className="bg-white/5" />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden font-sans text-xs uppercase tracking-wider text-muted-foreground">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.path)}
                    tooltip={item.label}
                    className="hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-all duration-200"
                  >
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="View Store" className="text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200">
                  <Link to="/">
                    <Store className="h-4 w-4" />
                    <span>View Store</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="bg-white/5" />

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar className="h-8 w-8 bg-primary/20 text-primary rounded-md group-data-[collapsible=icon]:mx-auto">
            <AvatarFallback className="bg-transparent font-sans text-xs">
              {user?.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate font-sans text-xs text-foreground">{user?.email}</span>
            <span className="font-sans text-[0.6rem] text-primary uppercase tracking-wider">Administrator</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => signOut()}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
