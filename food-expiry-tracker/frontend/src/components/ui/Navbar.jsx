import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Package, Plus, ChefHat, Bell, Settings, LogOut, Menu, X, Calendar, TrendingUp, Trophy, Users, Target, Trash2, MoreVertical } from 'lucide-react';
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
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  // Core navigation items - always visible
  const coreNavItems = [
    { path: '/dashboard', icon: Home, label: t('nav.dashboard') },
    { path: '/waste-management', icon: Trash2, label: 'Waste' },
    { path: '/items', icon: Package, label: t('nav.items') },
    { path: '/add', icon: Plus, label: 'Add' },
  ];

  // Secondary navigation items - in dropdown
  const secondaryNavItems = [
    { path: '/recipes', icon: ChefHat, label: t('nav.recipes') },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/achievements', icon: Trophy, label: 'Achievements' },
    { path: '/leaderboard', icon: Users, label: 'Leaderboard' },
    { path: '/challenges', icon: Target, label: 'Challenges' },
    { path: '/meal-plan', icon: Calendar, label: t('nav.mealPlan') },
    { path: '/alerts', icon: Bell, label: t('nav.alerts') },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-neutral-dark-surface border-b border-neutral-200 dark:border-neutral-dark-border sticky top-0 z-50 w-full backdrop-blur-sm dark:backdrop-blur-sm bg-white/95 dark:bg-neutral-dark-surface/95 transition-colors duration-300">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
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

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-4xl mx-4">
            {/* Core navigation items */}
            {coreNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 flex-shrink-0
                    ${isActive(item.path)
                      ? 'bg-primary text-white dark:bg-primary-600'
                      : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200
                  ${moreMenuOpen
                    ? 'bg-primary text-white dark:bg-primary-600'
                    : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                  }
                `}
              >
                <MoreVertical className="w-5 h-5" />
                <span className="text-sm font-medium">More</span>
              </button>

              <AnimatePresence>
                {moreMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMoreMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-neutral-dark-surface rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-dark-border py-2 z-20"
                    >
                      {secondaryNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMoreMenuOpen(false)}
                            className={`
                              flex items-center gap-3 px-4 py-2 transition-colors duration-200
                              ${isActive(item.path)
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary dark:text-primary-400'
                                : 'text-neutral-700 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                              }
                            `}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Settings */}
            <Link
              to="/settings"
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 flex-shrink-0
                ${isActive('/settings')
                  ? 'bg-primary text-white dark:bg-primary-600'
                  : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                }
              `}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap">{t('nav.settings')}</span>
            </Link>
          </div>

          {/* Tablet Navigation - Icons only */}
          <div className="hidden md:flex lg:hidden items-center gap-1 flex-1 justify-center">
            {coreNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    p-2 rounded-lg transition-colors duration-200
                    ${isActive(item.path)
                      ? 'bg-primary text-white dark:bg-primary-600'
                      : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                    }
                  `}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`
                  p-2 rounded-lg transition-colors duration-200
                  ${moreMenuOpen
                    ? 'bg-primary text-white dark:bg-primary-600'
                    : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                  }
                `}
                title="More"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {moreMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMoreMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-neutral-dark-surface rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-dark-border py-2 z-20"
                    >
                      {secondaryNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMoreMenuOpen(false)}
                            className={`
                              flex items-center gap-3 px-4 py-2 transition-colors duration-200
                              ${isActive(item.path)
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary dark:text-primary-400'
                                : 'text-neutral-700 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                              }
                            `}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                      <Link
                        to="/settings"
                        onClick={() => setMoreMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-2 transition-colors duration-200
                          ${isActive('/settings')
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary dark:text-primary-400'
                            : 'text-neutral-700 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                          }
                        `}
                      >
                        <Settings className="w-5 h-5" />
                        <span className="text-sm font-medium">{t('nav.settings')}</span>
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <Link
              to="/settings"
              className={`
                p-2 rounded-lg transition-colors duration-200
                ${isActive('/settings')
                  ? 'bg-primary text-white dark:bg-primary-600'
                  : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                }
              `}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <ThemeToggle />
            <LanguageSwitcher />
            <div className="text-right hidden xl:block">
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
          <div className="md:hidden flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-neutral-200 dark:border-neutral-dark-border overflow-hidden"
            >
              <div className="py-4 space-y-1">
                {[...coreNavItems, ...secondaryNavItems].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 mx-2
                        ${isActive(item.path)
                          ? 'bg-primary text-white dark:bg-primary-600'
                          : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 mx-2
                    ${isActive('/settings')
                      ? 'bg-primary text-white dark:bg-primary-600'
                      : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                    }
                  `}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{t('nav.settings')}</span>
                </Link>
                <div className="px-4 py-2 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-dark-border mt-2 pt-2 mx-2">
                  <LanguageSwitcher />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-danger dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
