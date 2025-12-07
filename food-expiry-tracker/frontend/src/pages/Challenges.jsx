import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Trophy, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import { challengesAPI } from '../services/api';
import { useToast } from '../components/ui/Toast';

const Challenges = () => {
  const { addToast } = useToast();
  const [challenges, setChallenges] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const [allRes, activeRes] = await Promise.all([
        challengesAPI.getAll(),
        challengesAPI.getActive()
      ]);
      setChallenges(allRes.data.challenges || []);
      setActiveChallenges(activeRes.data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      addToast('Failed to load challenges', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const displayChallenges = activeTab === 'active' ? activeChallenges : challenges;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-dark-bg transition-colors duration-300">
        <Navbar />
        <div className="container-custom py-20">
          <Loader size="lg" text="Loading challenges..." />
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
            Challenges
          </h1>
          <p className="text-neutral-600 dark:text-neutral-dark-text-secondary">
            Complete challenges to earn bonus points and unlock rewards!
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-3"
        >
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'all'
                ? 'bg-primary text-white dark:bg-primary-600'
                : 'bg-neutral-100 dark:bg-neutral-dark-surface text-neutral-700 dark:text-neutral-dark-text-secondary hover:bg-neutral-200 dark:hover:bg-neutral-dark-surface-hover'
            }`}
          >
            All Challenges
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'active'
                ? 'bg-primary text-white dark:bg-primary-600'
                : 'bg-neutral-100 dark:bg-neutral-dark-surface text-neutral-700 dark:text-neutral-dark-text-secondary hover:bg-neutral-200 dark:hover:bg-neutral-dark-surface-hover'
            }`}
          >
            Active ({activeChallenges.length})
          </button>
        </motion.div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full ${challenge.completed ? 'bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-900/30 border-success-200 dark:border-success-800' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{challenge.icon}</div>
                  {challenge.completed && (
                    <CheckCircle className="w-6 h-6 text-success" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-dark-text mb-2">
                  {challenge.name}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary mb-4">
                  {challenge.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600 dark:text-neutral-dark-text-secondary">
                      {challenge.target ? `${challenge.currentValue}/${challenge.target}` : `${challenge.currentValue} days`}
                    </span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-dark-text">
                      {Math.round(challenge.progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-dark-border rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${challenge.progress}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`h-2 rounded-full ${
                        challenge.completed
                          ? 'bg-success'
                          : 'bg-primary'
                      }`}
                    />
                  </div>
                </div>

                {/* Reward */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-dark-border">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-warning" />
                    <span className="font-semibold text-neutral-900 dark:text-neutral-dark-text">
                      +{challenge.reward} points
                    </span>
                  </div>
                  {challenge.completed ? (
                    <span className="text-xs font-medium text-success">Completed!</span>
                  ) : (
                    <Clock className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {displayChallenges.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-dark-text-secondary">
                No {activeTab === 'active' ? 'active' : ''} challenges available.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Challenges;

