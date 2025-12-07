import { useEffect, useState } from 'react';
import { itemsAPI } from '../services/api';
import StatsCard from './StatsCard';
import { Leaf, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalItems: 0,
    expiringCount: 0,
    consumedCount: 0,
    wasteReductionScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [allItems, expiringItems] = await Promise.all([
          itemsAPI.getAll({ limit: 100 }),
          itemsAPI.getExpiring(3),
        ]);

        const consumedItems = allItems.data?.filter(item => item.status === 'consumed') || [];
        
        setStats({
          totalItems: allItems.data?.length || 0,
          expiringCount: expiringItems.data?.length || 0,
          consumedCount: consumedItems.length,
          wasteReductionScore: consumedItems.length * 10, // Simple scoring
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatsCard
        icon={<Leaf className="w-6 h-6 text-green-500" />}
        title="Items Tracked"
        value={stats.totalItems}
        subtext="Total food items"
      />
      <StatsCard
        icon={<AlertCircle className="w-6 h-6 text-orange-500" />}
        title="Expiring Soon"
        value={stats.expiringCount}
        subtext="Next 3 days"
      />
      <StatsCard
        icon={<CheckCircle2 className="w-6 h-6 text-blue-500" />}
        title="Items Consumed"
        value={stats.consumedCount}
        subtext="Food used wisely"
      />
      <StatsCard
        icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
        title="Waste Score"
        value={stats.wasteReductionScore}
        subtext="Points earned"
      />
    </div>
  );
}
