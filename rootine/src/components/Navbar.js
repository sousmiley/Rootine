'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Leaf,
  Search,
  Info,
  Mail,
  Heart,
  BellRing,
  Moon,
  Sun,
  Menu,
  X,
  ChevronLeft,
  Home,
  Shuffle,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import config from '@/config';

export default function Navbar({ showBack = false }) {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [router.pathname]);

  const handleSurprise = async () => {
    const randomId = Math.floor(Math.random() * 2999) + 1;
    router.push(`/plant-info/${randomId}`);
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: <Home size={16} /> },
    {
      href: `/plant-info/${config.PLANT_OF_DAY_ID}`,
      label: 'Plant of the Day',
      icon: <Leaf size={16} />,
    },
    { href: '/favourites', label: 'Favourites', icon: <Heart size={16} /> },
    { href: '/reminders', label: 'Reminders', icon: <BellRing size={16} /> },
    { href: '/about', label: 'About', icon: <Info size={16} /> },
    { href: '/contact', label: 'Contact', icon: <Mail size={16} /> },
  ];

  return (
    <nav className="navbar" ref={menuRef}>
      <div className="navbar-left">
        {showBack && (
          <button
            className="nav-icon-btn"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <Link href="/" className="navbar-brand">
          <Leaf size={22} className="brand-leaf" />
          <span>Rootine</span>
        </Link>
      </div>

      {/* Desktop links */}
      <div className="navbar-links">
        <Link
          href={`/plant-info/${config.PLANT_OF_DAY_ID}`}
          className={`nav-link ${router.asPath === `/plant-info/${config.PLANT_OF_DAY_ID}` ? 'active' : ''}`}
        >
          <Leaf size={15} />
          Plant of the Day
        </Link>
        <Link
          href="/favourites"
          className={`nav-link ${router.pathname === '/favourites' ? 'active' : ''}`}
        >
          <Heart size={15} />
          Favourites
        </Link>
        <Link
          href="/reminders"
          className={`nav-link ${router.pathname === '/reminders' ? 'active' : ''}`}
        >
          <BellRing size={15} />
          Reminders
        </Link>
        <Link
          href="/about"
          className={`nav-link ${router.pathname === '/about' ? 'active' : ''}`}
        >
          <Info size={15} />
          About
        </Link>
        <Link
          href="/contact"
          className={`nav-link ${router.pathname === '/contact' ? 'active' : ''}`}
        >
          <Mail size={15} />
          Contact
        </Link>
        <button
          className="nav-icon-btn surprise-btn"
          onClick={handleSurprise}
          title="Surprise me — random plant!"
          aria-label="Discover a random plant"
        >
          <Shuffle size={17} />
        </button>
        <button
          className="nav-icon-btn theme-btn"
          onClick={toggle}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Mobile right */}
      <div className="navbar-mobile-right">
        <button
          className="nav-icon-btn theme-btn"
          onClick={toggle}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="nav-icon-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="mobile-nav-link">
              {l.icon}
              {l.label}
            </Link>
          ))}
          <button className="mobile-nav-link surprise-mobile" onClick={handleSurprise}>
            <Shuffle size={16} />
            Surprise Me
          </button>
        </div>
      )}
    </nav>
  );
}
