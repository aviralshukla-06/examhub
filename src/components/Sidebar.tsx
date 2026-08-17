"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Upload,
  ShoppingBag,
  LayoutDashboard,
  Bookmark,
  Users,
  Library,
  Crown,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Browse", href: "/browse", icon: Search },
  { label: "Upload", href: "/upload", icon: Upload },
  { label: "My Purchases", href: "/my-purchases", icon: ShoppingBag },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { label: "Following", href: "/following", icon: Users },
];

const collections = [
  { label: "My Library", href: "/library" },
  { label: "Data Structures", href: "/browse?topic=data-structures" },
  { label: "Operating Systems", href: "/browse?topic=os" },
  { label: "DBMS", href: "/browse?topic=dbms" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen border-r border-gray-200 bg-white flex flex-col justify-between py-4 px-3 fixed left-0 top-0 z-20">
      {/* Logo */}
      <div>
        <Link href="/" className="flex items-center gap-2 px-2 mb-6">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="font-semibold text-gray-900 text-lg tracking-tight">
            Exam<span className="text-indigo-600">Hub</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="space-y-0.5 mb-6">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Collections */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Collections
          </p>
          <div className="space-y-0.5">
            {collections.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
              >
                <Library size={16} />
                {label}
              </Link>
            ))}
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-indigo-500 hover:bg-gray-100 w-full">
              + View all collections
            </button>
          </div>
        </div>
      </div>

      {/* Go Premium */}
      <div className="bg-indigo-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Crown size={16} className="text-yellow-300" />
          <span className="font-semibold text-sm">Go Premium</span>
        </div>
        <p className="text-xs text-indigo-200 mb-3">
          Unlock premium content and exclusive features.
        </p>
        <button className="w-full bg-white text-indigo-600 text-sm font-medium py-1.5 rounded-lg">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}
