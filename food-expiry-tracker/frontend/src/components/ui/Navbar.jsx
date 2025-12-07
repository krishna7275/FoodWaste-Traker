import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Package, Plus, ChefHat, Bell, Settings, LogOut, Menu, X, Calendar } from 'lucide-react';
import { clearAuthData, getUser } from '../../utils/auth';
import LanguageSwitcher from '../LanguageSwitcher';
import { useI18n } from '../../context/I18nContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: t('nav.dashboard') },
    { path: '/items', icon: Package, label: t('nav.items') },
    { path: '/add', icon: Plus, label: t('nav.addItem') },
    { path: '/recipes', icon: ChefHat, label: t('nav.recipes') },
    { path: '/meal-plan', icon: Calendar, label: t('nav.mealPlan') },
    { path: '/alerts', icon: Bell, label: t('nav.alerts') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-40 w-full">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 gap-4 overflow-hidden">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center"
            >
              <Package className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-display font-bold text-neutral-900 hidden sm:block">
              FreshTrack
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                    ${isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
              <p className="text-xs text-neutral-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-neutral-600 hover:text-danger hover:bg-danger-50 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-neutral-200 py-4"
          >
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive(item.path)
                        ? 'bg-primary text-white'
                        : 'text-neutral-600 hover:bg-neutral-100'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-danger hover:bg-danger-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;