import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Package, Plus, ChefHat, Bell, Settings, LogOut, Menu, X, Calendar, TrendingUp, Trophy, Users, Target, Trash2 } from 'lucide-react';
import { clearAuthData, getUser } from '../../utils/auth';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeToggle from '../ThemeToggle';
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
    { path: '/waste-management', icon: Trash2, label: 'Waste Management' },
    { path: '/items', icon: Package, label: t('nav.items') },
    { path: '/add', icon: Plus, label: t('nav.addItem') },
    { path: '/recipes', icon: ChefHat, label: t('nav.recipes') },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/achievements', icon: Trophy, label: 'Achievements' },
    { path: '/leaderboard', icon: Users, label: 'Leaderboard' },
    { path: '/challenges', icon: Target, label: 'Challenges' },
    { path: '/meal-plan', icon: Calendar, label: t('nav.mealPlan') },
    { path: '/alerts', icon: Bell, label: t('nav.alerts') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-neutral-dark-surface border-b border-neutral-200 dark:border-neutral-dark-border sticky top-0 z-40 w-full backdrop-blur-sm dark:backdrop-blur-sm bg-white/95 dark:bg-neutral-dark-surface/95 transition-colors duration-300">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4 overflow-hidden">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center"
            >
              <Package className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-display font-bold text-neutral-900 dark:text-neutral-dark-text hidden sm:block">
              FreshTrack
            </span>
          </Link>

          {/* Desktop Navigation - Priority items first */}
          <div className="hidden lg:flex items-center space-x-1 overflow-x-auto">
            {/* Core features - always visible */}
            {navItems.filter(item => 
              ['/dashboard', '/waste-management', '/items', '/add', '/recipes', '/analytics'].includes(item.path)
            ).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap
                    ${isActive(item.path)
                      ? 'bg-primary text-white dark:bg-primary-600 dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
            {/* Secondary features - icons only if space is limited */}
            {navItems.filter(item => 
              !['/dashboard', '/waste-management', '/items', '/add', '/recipes', '/analytics', '/settings'].includes(item.path)
            ).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-2 px-2 py-2 rounded-lg transition-colors duration-200
                    ${isActive(item.path)
                      ? 'bg-primary text-white dark:bg-primary-600 dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                    }
                  `}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
            {/* Settings - always visible */}
            <Link
              to="/settings"
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200
                ${isActive('/settings')
                  ? 'bg-primary text-white dark:bg-primary-600 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                }
              `}
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">{t('nav.settings')}</span>
            </Link>
          </div>
          
          {/* Medium screens - icons only */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            {navItems.filter(item => item.path !== '/settings').slice(0, 8).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-2 px-2 py-2 rounded-lg transition-colors duration-200
                    ${isActive(item.path)
                      ? 'bg-primary text-white dark:bg-primary-600 dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                    }
                  `}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
            <Link
              to="/settings"
              className={`
                flex items-center space-x-2 px-2 py-2 rounded-lg transition-colors duration-200
                ${isActive('/settings')
                  ? 'bg-primary text-white dark:bg-primary-600 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                }
              `}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <LanguageSwitcher />
            <div className="text-right hidden lg:block">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-dark-text">{user?.name}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-dark-text-muted">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-neutral-600 dark:text-neutral-dark-text-secondary hover:text-danger dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors duration-200"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-neutral-200 dark:border-neutral-dark-border py-4"
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
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                      ${isActive(item.path)
                        ? 'bg-primary text-white dark:bg-primary-600'
                        : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <div className="px-4 py-2 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 mt-2 pt-2">
                <LanguageSwitcher />
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-2 text-danger dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;