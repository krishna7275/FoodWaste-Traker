import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Users, Leaf, DollarSign, Flame } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import { leaderboardAPI } from '../services/api';
import { useToast } from '../components/ui/Toast';

const Leaderboard = () => {
  const { addToast } = useToast();
  const [leaderboard, setLeaderboard] = useState([]);
  const [communityStats, setCommunityStats] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [sortType, setSortType] = useState('points');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [sortType]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [leaderboardRes, statsRes, rankRes] = await Promise.all([
        leaderboardAPI.getLeaderboard(sortType, 100),
        leaderboardAPI.getCommunityStats(),
        leaderboardAPI.getUserRank()
      ]);
      setLeaderboard(leaderboardRes.data.leaderboard || []);
      setCommunityStats(statsRes.data);
      setUserRank(rankRes.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      addToast('Failed to load leaderboard', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-500" />;
    return <span className="text-neutral-500 dark:text-neutral-dark-text-muted font-bold">#{rank}</span>;
  };

  const sortOptions = [
    { value: 'points', label: 'Points', icon: Trophy },
    { value: 'itemsSaved', label: 'Items Saved', icon: Leaf },
    { value: 'streak', label: 'Longest Streak', icon: Flame },
    { value: 'co2', label: 'CO₂ Saved', icon: TrendingUp }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-dark-bg transition-colors duration-300">
        <Navbar />
        <div className="container-custom py-20">
          <Loader size="lg" text="Loading leaderboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-dark-bg transition-colors duration-300">
      <Navbar />

      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-neutral-dark-text mb-2">
            Global Leaderboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-dark-text-secondary">
            See how you rank against other food waste warriors!
          </p>
        </motion.div>

        {/* Community Stats */}
        {communityStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-primary-50 to-success-50 dark:from-primary-900/20 dark:to-success-900/20 border-primary-200 dark:border-primary-800">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-dark-text">
                    {communityStats.totalUsers}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">Users</p>
                </div>
                <div className="text-center">
                  <Leaf className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-dark-text">
                    {communityStats.totalItemsSaved.toLocaleString()}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">Items Saved</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-warning mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-dark-text">
                    {communityStats.totalCo2Saved.toLocaleString()} kg
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">CO₂ Saved</p>
                </div>
                <div className="text-center">
                  <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-dark-text">
                    ₹{communityStats.totalMoneySaved.toLocaleString()}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">Money Saved</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* User Rank */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-dark-text mb-1">
                    Your Rankings
                  </h3>
                  <div className="flex gap-6">
                    <div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">Points Rank: </span>
                      <span className="font-bold text-primary">#{userRank.pointsRank}</span>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">Items Saved Rank: </span>
                      <span className="font-bold text-success">#{userRank.itemsSavedRank}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">Out of</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-dark-text">
                    {userRank.totalUsers}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">users</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Sort Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-3">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setSortType(option.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors duration-200 ${
                    sortType === option.value
                      ? 'border-primary bg-primary-50 dark:bg-primary-900/20 text-primary dark:text-primary-400'
                      : 'border-neutral-300 dark:border-neutral-dark-border hover:border-neutral-400 dark:hover:border-neutral-dark-text-secondary text-neutral-700 dark:text-neutral-dark-text-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-dark-text mb-6">
              Top Performers
            </h2>
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    user.rank <= 3
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800'
                      : 'bg-neutral-50 dark:bg-neutral-dark-surface border-neutral-200 dark:border-neutral-dark-border hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 flex justify-center">
                      {getRankIcon(user.rank)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-dark-text">
                        {user.name}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">
                        Level {user.level} • {user.currentStreak} day streak
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {sortType === 'points' && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-neutral-900 dark:text-neutral-dark-text">
                          {user.points.toLocaleString()}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-dark-text-muted">points</p>
                      </div>
                    )}
                    {sortType === 'itemsSaved' && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-success">
                          {user.itemsSaved.toLocaleString()}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-dark-text-muted">items saved</p>
                      </div>
                    )}
                    {sortType === 'streak' && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-warning">
                          {user.longestStreak}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-dark-text-muted">day streak</p>
                      </div>
                    )}
                    {sortType === 'co2' && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-success">
                          {user.co2Saved} kg
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-dark-text-muted">CO₂ saved</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;

