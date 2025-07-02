import React from 'react';
import Link from 'next/link';
import { 
  Home, 
  Briefcase, 
  Building, 
  UserSearch, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import { AppRoutes } from '../lib/routes';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: Home, current: true },
  { name: 'Ofertas', href: AppRoutes.Listings, icon: Briefcase },
  { name: 'Centros Médicos', href: AppRoutes.Companies, icon: Building },
  { name: 'Buscar Médicos', href: AppRoutes.SearchDoctors, icon: UserSearch },
  { name: 'Publicar Oferta', href: AppRoutes.PostJob, icon: PlusCircle },
  { name: 'Métricas', href: AppRoutes.Metrics, icon: BarChart3 },
];

const secondaryNavigation = [
  { name: 'Configuración', href: '/settings', icon: Settings },
];

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <div className={`relative z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-slate-900/80" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 ring-1 ring-slate-900/10">
              <div className="flex h-16 shrink-0 items-center">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                    <span className="text-sm font-semibold text-white">A</span>
                  </div>
                  <span className="ml-3 text-lg font-semibold text-slate-900">Altamédica</span>
                </div>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={`group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium ${
                              item.current
                                ? 'bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-900/10'
                                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            <item.icon
                              className={`h-5 w-5 shrink-0 ${
                                item.current ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                              }`}
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li>
                    <div className="text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wide">Configuración</div>
                    <ul role="list" className="-mx-2 mt-2 space-y-1">
                      {secondaryNavigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className="text-slate-700 hover:text-slate-900 hover:bg-slate-50 group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium"
                          >
                            <item.icon
                              className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-600"
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200 bg-white px-6 ring-1 ring-slate-900/5">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                <span className="text-sm font-semibold text-white">A</span>
              </div>
              <span className="ml-3 text-lg font-semibold text-slate-900">Altamédica</span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium ${
                          item.current
                            ? 'bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-900/10'
                            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 shrink-0 ${
                            item.current ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <div className="text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wide">Configuración</div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {secondaryNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-slate-700 hover:text-slate-900 hover:bg-slate-50 group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium"
                      >
                        <item.icon
                          className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-600"
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-72">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-200 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Buscar
              </label>
              <Search
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm"
                placeholder="Buscar ofertas, médicos, centros..."
                type="search"
                name="search"
              />
            </form>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button type="button" className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Separator */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="-m-1.5 flex items-center p-1.5"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">U</span>
                  </div>
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-4 text-sm font-semibold leading-6 text-slate-900" aria-hidden="true">
                      Usuario
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
