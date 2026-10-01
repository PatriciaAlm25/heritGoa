import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  const navLinks = [
    { label: 'About',          href: '/#about'         },
    { label: 'Features',       href: '/#features'      },
    { label: 'Heritage Sites', href: '/#heritage-sites'},
    { label: 'Impact',         href: '/#stats'         },
    { label: 'Community',      href: '/#community'     },
    { label: 'Taxi Fares',     href: '/taxi-fares'     },
    { label: 'Heritage Map',   href: '/heritage-map', highlight: true },
  ];

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-navy/95 backdrop-blur-xl shadow-heritage border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
          <span className="nav-logo-icon">🏛️</span>
          <span className="font-playfair text-xl font-bold text-white">
            Herit<span className="logo-accent">Goa</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <li key={link.label}>
              {link.href.startsWith('/') && !link.href.includes('#') ? (
                <Link
                  to={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    link.highlight
                      ? 'text-gold-DEFAULT bg-gold-muted border border-gold-DEFAULT/30 hover:bg-gold-DEFAULT/20'
                      : 'text-white/70 hover:text-white hover:bg-white/8'
                  }`}
                  style={link.highlight ? { color: '#d4af37', background: 'rgba(212,175,55,0.12)', borderColor: 'rgba(212,175,55,0.3)' } : {}}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-all duration-200"
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <a href="#" className="btn-ghost" id="btn-report">Report Issue</a>
          <Link to="/heritage-map" className="btn-primary" id="btn-explore">Explore Map</Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
          id="nav-toggle"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-200 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-opacity duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-200 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-navy/96 backdrop-blur-xl border-b border-white/10 px-4 pb-4">
          <ul className="flex flex-col gap-1 pt-2">
            {navLinks.map(link => (
              <li key={link.label}>
                {link.href.startsWith('/') && !link.href.includes('#') ? (
                  <Link
                    to={link.href}
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/8 transition-all"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/8 transition-all"
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 mt-4">
            <a href="#" className="btn-ghost text-center">Report Issue</a>
            <Link to="/heritage-map" className="btn-primary text-center">Explore Map</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
