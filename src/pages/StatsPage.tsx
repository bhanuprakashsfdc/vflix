import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../stores/appStore';
import { db } from '../utils/indexedDb';
import type { MediaFile } from '../types';

interface WatchStat {
  mediaId: string;
  position: number;
  timestamp: number;
}

export const StatsPage: React.FC = () => {
  const { mediaLibrary, currentProfile } = useAppStore();
  const [watchHistory, setWatchHistory] = useState<WatchStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const history = await db.getRecentlyPlayed(1000);
        setWatchHistory(history);
      } catch (error) {
        console.error('Error loading watch history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    // Get unique items watched
    const uniqueItems = new Set(watchHistory.map(w => w.mediaId));
    const totalItemsWatched = uniqueItems.size;

    // Calculate total watch time (estimate based on positions)
    let totalWatchTime = 0;
    const mediaWatchTime: Record<string, number> = {};
    
    watchHistory.forEach(w => {
      const media = mediaLibrary.find(m => m.id === w.mediaId);
      if (media) {
        // Estimate actual watch time from position changes
        const duration = media.duration || 0;
        const watched = Math.min(w.position, duration);
        totalWatchTime += watched;
        
        if (!mediaWatchTime[w.mediaId]) {
          mediaWatchTime[w.mediaId] = 0;
        }
        mediaWatchTime[w.mediaId] += watched;
      }
    });

    // Find most watched
    let mostWatched: { media: MediaFile | null; time: number } = { media: null, time: 0 };
    Object.entries(mediaWatchTime).forEach(([id, time]) => {
      if (time > mostWatched.time) {
        const media = mediaLibrary.find(m => m.id === id);
        if (media) {
          mostWatched = { media, time };
        }
      }
    });

    // Calculate watch streak (consecutive days)
    const watchDates = new Set(
      watchHistory.map(w => new Date(w.timestamp).toDateString())
    );
    
    // Simple streak calculation - count unique days
    const uniqueDays = Array.from(watchDates).sort().reverse();
    let streak = 0;
    const today = new Date().toDateString();
    
    // Check if watched today or yesterday to start counting
    if (uniqueDays[0] === today || uniqueDays[0] === new Date(Date.now() - 86400000).toDateString()) {
      streak = 1;
      for (let i = 1; i < uniqueDays.length; i++) {
        const prevDate = new Date(uniqueDays[i - 1]);
        const currDate = new Date(uniqueDays[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    // Recent activity (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentWatchCount = watchHistory.filter(w => w.timestamp > sevenDaysAgo).length;

    return {
      totalItemsWatched,
      totalWatchTime,
      mostWatched,
      streak,
      recentWatchCount,
    };
  }, [watchHistory, mediaLibrary]);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-background pt-20 flex items-center justify-center">
        <div className="text-white">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-background pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="font-heading text-3xl text-white mb-2">Your Stats</h1>
        {currentProfile && (
          <p className="text-netflix-gray mb-8">
            Viewing stats for <span className="text-white">{currentProfile.name}</span>
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Watch Time"
            value={formatDuration(stats.totalWatchTime)}
            icon="⏱️"
          />
          <StatCard
            label="Items Watched"
            value={stats.totalItemsWatched.toString()}
            icon="🎬"
          />
          <StatCard
            label="Watch Streak"
            value={`${stats.streak} days`}
            icon="🔥"
          />
          <StatCard
            label="This Week"
            value={stats.recentWatchCount.toString()}
            icon="📅"
          />
        </div>

        {/* Most Watched */}
        {stats.mostWatched.media && (
          <div className="bg-netflix-dark rounded-lg p-6">
            <h2 className="text-xl text-white mb-4 font-medium">Most Watched</h2>
            <div className="flex items-center gap-4">
              <div className="w-24 h-36 bg-netflix-gray/20 rounded-lg overflow-hidden flex-shrink-0">
                {stats.mostWatched.media.thumbnail ? (
                  <img 
                    src={stats.mostWatched.media.thumbnail} 
                    alt={stats.mostWatched.media.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🎬
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-white font-medium text-lg">
                  {stats.mostWatched.media.title}
                </h3>
                <p className="text-netflix-gray">
                  {formatDuration(stats.mostWatched.time)} watched
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-netflix-dark rounded-lg p-6 mt-6">
          <h2 className="text-xl text-white mb-4 font-medium">Recent Activity</h2>
          
          {watchHistory.length === 0 ? (
            <p className="text-netflix-gray">No watch history yet. Start watching to see your activity!</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {watchHistory.slice(0, 10).map((watch, index) => {
                const media = mediaLibrary.find(m => m.id === watch.mediaId);
                if (!media) return null;
                
                return (
                  <div 
                    key={`${watch.mediaId}-${watch.timestamp}-${index}`}
                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded"
                  >
                    <div className="w-12 h-16 bg-netflix-gray/20 rounded overflow-hidden flex-shrink-0">
                      {media.thumbnail ? (
                        <img 
                          src={media.thumbnail} 
                          alt={media.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          🎬
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white truncate">{media.title}</p>
                      <p className="text-netflix-gray text-sm">
                        {formatDuration(watch.position)} watched • {new Date(watch.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Empty State */}
        {watchHistory.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">📊</p>
            <p className="text-white text-lg mb-2">No stats yet</p>
            <p className="text-netflix-gray">
              Start watching movies and shows to see your statistics here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => (
  <div className="bg-netflix-dark rounded-lg p-4 text-center">
    <div className="text-2xl mb-2">{icon}</div>
    <p className="text-white text-2xl font-bold">{value}</p>
    <p className="text-netflix-gray text-sm">{label}</p>
  </div>
);

export default StatsPage;
