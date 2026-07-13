'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Menu, X, ChevronDown, Building2 } from 'lucide-react';

interface HeaderProps {
  callNumber: string;
}

export default function Header({ callNumber }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProjectsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProjectsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/contact', label: 'Contact Us' },
  ];

  const projectCategories = [
    { href: '/projects/running', label: 'Running Projects', icon: '🏗️' },
    { href: '/projects/upcoming', label: 'Upcoming Projects', icon: '🔮' },
    { href: '/projects/completed', label: 'Completed Projects', icon: '✅' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-slate-900/98 shadow-lg backdrop-blur-md' : 'bg-slate-900'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-amber-500 p-1.5 rounded-lg group-hover:bg-amber-400 transition-colors">
                <Building2 className="h-5 w-5 text-slate-900" />
              </div>
              <div>
                <span className="text-white font-bold text-lg leading-tight">Creative</span>
                <span className="text-amber-500 font-bold text-lg leading-tight"> Group</span>
                <div className="text-gray-400 text-xs leading-none">Gwalior, MP</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Projects Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProjectsOpen(!projectsOpen)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith('/projects')
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Projects
                  <ChevronDown className={`h-4 w-4 transition-transform ${projectsOpen ? 'rotate-180' : ''}`} />
                </button>
                {projectsOpen && (
                  <div className="absolute top-full mt-1 left-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl min-w-48 py-1 z-50">
                    {projectCategories.map((cat) => (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        <span>{cat.icon}</span>
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Broker Portal
              </Link>
            </nav>

            {/* Call Now Button */}
            <a
              href={`tel:${callNumber}`}
              className="hidden md:flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 text-sm"
            >
              <Phone className="h-4 w-4" />
              Call Now
            </a>

            {/* Mobile: Call + Hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <a
                href={`tel:${callNumber}`}
                className="flex items-center gap-1 bg-amber-500 text-slate-900 font-semibold px-3 py-1.5 rounded-lg text-sm"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </a>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="text-gray-300 hover:text-white p-1.5"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(link.href)
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-slate-700 pt-2 mt-2">
                <p className="px-4 py-1 text-xs text-gray-500 uppercase tracking-wider">Projects</p>
                {projectCategories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-slate-700"
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-slate-700 pt-2 mt-2">
                <Link
                  href="/login"
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-amber-400 hover:text-amber-300"
                >
                  Broker Portal
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
      {/* Sticky mobile Call Now */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <a
          href={`tel:${callNumber}`}
          className="flex items-center gap-2 bg-amber-500 text-slate-900 font-bold px-4 py-3 rounded-full shadow-2xl hover:bg-amber-400 transition-all"
        >
          <Phone className="h-5 w-5" />
          <span className="text-sm">Call Now</span>
        </a>
      </div>
    </>
  );
}
