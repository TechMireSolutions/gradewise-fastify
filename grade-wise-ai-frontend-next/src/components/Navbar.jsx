"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/features/auth/store.js";
import {
  FaHome,
  FaUser,
  FaChartBar,
  FaClipboardList,
  FaPlus,
  FaUserGraduate,
  FaBook,
  FaTachometerAlt,
  FaUserShield,
  FaChalkboardTeacher,
  FaCrown,
  FaGraduationCap,
  FaSignOutAlt,
} from "react-icons/fa";

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin:       "Admin",
  instructor:  "Instructor",
  student:     "Student",
};

const ROLE_ICON_MAP = {
  super_admin: FaCrown,
  admin:       FaUserShield,
  instructor:  FaChalkboardTeacher,
  student:     FaGraduationCap,
};

function Navbar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const UserRoleIcon = user ? (ROLE_ICON_MAP[user.role] ?? FaUser) : FaUser;

  const getNavLinks = () => {
    if (!user) {
      return [
        { name: "Home",    href: "/",       icon: <FaHome className="w-4 h-4" /> },
        { name: "Login",   href: "/login",  icon: <FaUser className="w-4 h-4" /> },
        { name: "Sign Up", href: "/signup", icon: <FaUserGraduate className="w-4 h-4" /> },
      ];
    }

    const profileLink = { name: "Profile", href: "/profile", icon: <FaUser className="w-4 h-4" /> };

    switch (user.role) {
      case "super_admin":
        return [
          { name: "Dashboard", href: "/super-admin/dashboard", icon: <FaTachometerAlt className="w-4 h-4" /> },
          profileLink,
        ];
      case "admin":
        return [
          { name: "Dashboard", href: "/admin/dashboard", icon: <FaTachometerAlt className="w-4 h-4" /> },
          profileLink,
        ];
      case "instructor":
        return [
          { name: "Dashboard",         href: "/instructor/dashboard",            icon: <FaTachometerAlt className="w-4 h-4" /> },
          { name: "My Assessments",    href: "/instructor/assessments",          icon: <FaClipboardList className="w-4 h-4" /> },
          { name: "Create Assessment", href: "/instructor/assessments/create",   icon: <FaPlus className="w-4 h-4" /> },
          { name: "Manage Students",   href: "/instructor/students",             icon: <FaUserGraduate className="w-4 h-4" /> },
          { name: "Resources",         href: "/instructor/resources",            icon: <FaBook className="w-4 h-4" /> },
          profileLink,
        ];
      case "student":
        return [
          { name: "Dashboard", href: "/student/dashboard", icon: <FaTachometerAlt className="w-4 h-4" /> },
          { name: "Analytics", href: "/student/analytics", icon: <FaChartBar className="w-4 h-4" /> },
          profileLink,
        ];
      default:
        return [profileLink];
    }
  };

  const navLinks = getNavLinks();

  const isActiveLink = (href) => {
    const currentPath = pathname;
    if (currentPath === href) return true;
    if (href === "/instructor/assessments" && currentPath === "/instructor/assessments/create") return false;
    return currentPath.startsWith(href + "/");
  };

  const handleMobileMenuToggle = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60 transition-colors duration-200">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link
              href="/"
              className="flex items-center space-x-2.5 group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900"
              onClick={closeMobileMenu}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/25">
                <FaBook className="text-white text-sm" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent whitespace-nowrap tracking-tight">
                Gradewise AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-end">
            <div className="flex items-center space-x-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={isActiveLink(link.href) ? "page" : undefined}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900 ${
                    isActiveLink(link.href)
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  {link.icon}
                  <span className="hidden xl:inline">{link.name}</span>
                </Link>
              ))}
            </div>

            {/* User info + Logout */}
            {user && (
              <div className="flex items-center space-x-2 pl-3 ml-1 border-l border-slate-700/50">
                <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 px-3 py-1.5 rounded-xl">
                  <div className="text-indigo-400 text-sm">
                    <UserRoleIcon />
                  </div>
                  <div className="hidden xl:block">
                    <div className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</div>
                    <div className="text-xs text-slate-500 leading-tight">
                      {ROLE_LABELS[user.role] ?? user.role}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 whitespace-nowrap min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900 cursor-pointer"
                >
                  <FaSignOutAlt />
                  <span className="hidden xl:inline">Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile: hamburger */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={handleMobileMenuToggle}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <span className="sr-only">Open menu</span>
              {isMobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800/60 bg-slate-900/95 backdrop-blur-md">
            <div className="px-2 pt-3 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMobileMenu}
                  aria-current={isActiveLink(link.href) ? "page" : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActiveLink(link.href)
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span className={isActiveLink(link.href) ? "text-white" : "text-indigo-400"}>
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                </Link>
              ))}

              {user && (
                <>
                  <div className="border-t border-slate-700/50 my-2" />
                  <div className="px-1 space-y-2 pt-1">
                    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 text-white text-base flex-shrink-0">
                          <UserRoleIcon />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white text-sm leading-tight truncate">{user.name}</div>
                          <div className="text-xs text-slate-400 truncate mt-0.5">{user.email}</div>
                          <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                            {ROLE_LABELS[user.role] ?? user.role}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900 cursor-pointer"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
