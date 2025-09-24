import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Video,
  FileSearch,
  CheckSquare,
  Building2,
  Store,
  Users,
  Menu,
  LogOut,
  User,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Videos', href: '/videos', icon: Video },
  { name: 'Inspections', href: '/inspections', icon: FileSearch },
  { name: 'Inspector Queue', href: '/inspector-queue', icon: CheckSquare, inspectorOnly: true },
  { name: 'Action Items', href: '/actions', icon: CheckSquare },
  { name: 'Brands', href: '/brands', icon: Building2, adminOnly: true },
  { name: 'Stores', href: '/stores', icon: Store },
  { name: 'Users', href: '/users', icon: Users, adminOnly: true },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredNavigation = navigation.filter(
    (item) => 
      (!item.adminOnly || user?.role === 'ADMIN') &&
      (!item.inspectorOnly || user?.role === 'INSPECTOR' || user?.role === 'ADMIN')
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 lg:hidden mr-2"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">VerityInspect</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="ml-3 hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex flex-col w-64 max-w-xs bg-white shadow-xl h-full">
              <nav className="flex-1 px-3 py-4 space-y-1">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location.pathname === item.href
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64 bg-white border-r border-gray-200">
            <nav className="flex-1 px-3 py-4 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}