import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  TrendingUp,
  Share2,
  Download,
  Sparkles,
  Lock
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import { achievementsAPI } from '../services/api';
import { useToast } from '../components/ui/Toast';

const Achievements = () => {
  const { addToast } = useToast();
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);

  useEffect(() => {
    fetchAchievements();
    checkAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const [achievementsRes, statsRes] = await Promise.all([
        achievementsAPI.getAll(),
        achievementsAPI.getStats()
      ]);
      setAchievements(achievementsRes.data.achievements || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      addToast('Failed to load achievements', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAchievements = async () => {
    try {
      const res = await achievementsAPI.check();
      if (res.data.newlyUnlocked && res.data.newlyUnlocked.length > 0) {
        setNewlyUnlocked(res.data.newlyUnlocked);
        res.data.newlyUnlocked.forEach(achievement => {
          addToast(`🎉 Achievement Unlocked: ${achievement.name}!`, 'success');
        });
        fetchAchievements(); // Refresh list
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const handleShare = async (achievement) => {
    const shareText = `🏆 I just unlocked "${achievement.name}" achievement in FoodWaste Tracker! ${achievement.icon}\n\n${achievement.description}\n\nJoin me in reducing food waste! #FoodWasteReduction #Achievement`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Achievement: ${achievement.name}`,
          text: shareText
        });
        addToast('Shared successfully!', 'success');
      } catch (error) {
        if (error.name !== 'AbortError') {
          navigator.clipboard.writeText(shareText);
          addToast('Copied to clipboard!', 'success');
        }
      }
    } else {
      navigator.clipboard.writeText(shareText);
      addToast('Copied to clipboard!', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="container-custom py-20">
          <Loader size="lg" text="Loading achievements..." />
        </div>
      </div>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-dark-bg transition-colors duration-300">
      <Navbar />

      <div className="container-custom py-8">
        {/* Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
            <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-neutral-dark-text mb-2">
              Achievements
            </h1>
            <p className="text-neutral-600 dark:text-neutral-dark-text-secondary mb-6">
              Track your progress and unlock rewards for reducing food waste
            </p>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700 mb-1">Level</p>
                    <p className="text-3xl font-bold text-yellow-900">{stats.level}</p>
                  </div>
                  <Star className="w-10 h-10 text-yellow-600" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">Points</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.totalPoints}</p>
                  </div>
                  <Trophy className="w-10 h-10 text-purple-600" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700 mb-1">Current Streak</p>
                    <p className="text-3xl font-bold text-orange-900">{stats.currentStreak}</p>
                    <p className="text-xs text-orange-600 mt-1">days</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-orange-600" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">Progress</p>
                    <p className="text-3xl font-bold text-green-900">{stats.progress}%</p>
                    <p className="text-xs text-green-600 mt-1">
                      {stats.totalAchievements}/{stats.totalPossible}
                    </p>
                  </div>
                  <Award className="w-10 h-10 text-green-600" />
                </div>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Newly Unlocked Animation */}
        <AnimatePresence>
          {newlyUnlocked.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 border-yellow-300 border-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl animate-bounce">
                      {newlyUnlocked[0].icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-yellow-900 mb-1">
                        🎉 Achievement Unlocked!
                      </h3>
                      <p className="text-yellow-800 font-semibold">
                        {newlyUnlocked[0].name}
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        {newlyUnlocked[0].description}
                      </p>
                      <p className="text-xs text-yellow-600 mt-2">
                        +{newlyUnlocked[0].points} points
                      </p>
                    </div>
                  </div>
                  <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-dark-text mb-4">
              Unlocked ({unlockedAchievements.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200 hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{achievement.icon}</div>
                      <button
                        onClick={() => handleShare(achievement)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-success-200 rounded-lg"
                      >
                        <Share2 className="w-4 h-4 text-success-700" />
                      </button>
                    </div>
                    <h3 className="font-bold text-neutral-900 mb-1">
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-3">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-success-700 font-medium">
                        +{achievement.points} points
                      </span>
                      {achievement.unlockedAt && (
                        <span className="text-xs text-neutral-500">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-dark-text mb-4">
              Locked ({lockedAchievements.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-neutral-100 dark:bg-neutral-dark-surface border-neutral-200 dark:border-neutral-dark-border opacity-75 relative overflow-hidden">
                    <div className="absolute top-2 right-2">
                      <Lock className="w-5 h-5 text-neutral-400 dark:text-neutral-dark-text-muted" />
                    </div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl grayscale opacity-50">
                        {achievement.icon}
                      </div>
                    </div>
                    <h3 className="font-bold text-neutral-600 dark:text-neutral-dark-text-secondary mb-1">
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-dark-text-muted mb-3">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400 dark:text-neutral-dark-text-muted font-medium">
                        +{achievement.points} points
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Achievements;

