import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Cloud, Check, ArrowDown, ShieldCheck, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const PULL_THRESHOLD = 70; // px threshold to trigger sync
const MAX_PULL_DISTANCE = 110; // max px pull visual distance

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  isRefreshing = false,
  children,
  disabled = false,
  className = '',
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPastThreshold, setIsPastThreshold] = useState(false);
  const [localRefreshing, setLocalRefreshing] = useState(false);
  const [syncCompleted, setSyncCompleted] = useState(false);

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const thresholdPassedHapticRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const refreshing = isRefreshing || localRefreshing;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || refreshing) return;

    // Only allow pull to refresh if the user is at the top of the scroll container / window
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop <= 5) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
      thresholdPassedHapticRef.current = false;
    } else {
      isPullingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current || disabled || refreshing) return;

    const currentY = e.touches[0].clientY;
    const rawDelta = currentY - startYRef.current;

    if (rawDelta > 0) {
      // Calculate pull with resistance curve
      const dampened = Math.min(
        MAX_PULL_DISTANCE,
        Math.pow(rawDelta, 0.85) * 1.5
      );
      setPullDistance(dampened);

      const pastThreshold = dampened >= PULL_THRESHOLD;
      if (pastThreshold !== isPastThreshold) {
        setIsPastThreshold(pastThreshold);
        if (pastThreshold && !thresholdPassedHapticRef.current) {
          triggerHaptic('pull');
          thresholdPassedHapticRef.current = true;
        } else if (!pastThreshold) {
          thresholdPassedHapticRef.current = false;
        }
      }
    } else {
      setPullDistance(0);
      setIsPastThreshold(false);
    }
  };

  const executeRefresh = useCallback(async () => {
    setLocalRefreshing(true);
    triggerHaptic('medium');
    try {
      await onRefresh();
      setSyncCompleted(true);
      triggerHaptic('success');
      setTimeout(() => {
        setSyncCompleted(false);
        setLocalRefreshing(false);
        setPullDistance(0);
        setIsPastThreshold(false);
      }, 650);
    } catch {
      triggerHaptic('error');
      setLocalRefreshing(false);
      setPullDistance(0);
      setIsPastThreshold(false);
    }
  }, [onRefresh]);

  const handleTouchEnd = () => {
    if (!isPullingRef.current || disabled || refreshing) return;
    isPullingRef.current = false;

    if (isPastThreshold) {
      executeRefresh();
    } else {
      // Animate back to 0
      setPullDistance(0);
      setIsPastThreshold(false);
    }
  };

  // Calculate visual progress percentage
  const progressPercent = Math.min(100, Math.round((pullDistance / PULL_THRESHOLD) * 100));

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`relative w-full ${className}`}
    >
      {/* Pull Indicator Area */}
      <AnimatePresence>
        {(pullDistance > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: refreshing ? 64 : Math.min(pullDistance, MAX_PULL_DISTANCE),
            }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="w-full flex items-center justify-center overflow-hidden pointer-events-none select-none z-30"
          >
            <div className="flex items-center gap-2.5 px-4 py-2 bg-[#0D1425]/90 backdrop-blur-md border border-white/15 rounded-2xl shadow-xl">
              {refreshing ? (
                syncCompleted ? (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Firestore Synced & Up to Date
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sky-400">
                    <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                    <span className="text-xs font-black uppercase tracking-wider animate-pulse">
                      Syncing with Cloud Firestore...
                    </span>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2.5">
                  {/* Progress Circle & Icon */}
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <svg className="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-white/10"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={isPastThreshold ? 'text-emerald-400' : 'text-sky-400'}
                        strokeDasharray={`${progressPercent}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isPastThreshold ? (
                        <Cloud className="w-3 h-3 text-emerald-400 animate-bounce" />
                      ) : (
                        <ArrowDown
                          className="w-3 h-3 text-sky-400 transition-transform duration-200"
                          style={{ transform: `rotate(${Math.min(180, (progressPercent / 100) * 180)}deg)` }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Status label */}
                  <span className={`text-[11px] font-black uppercase tracking-wider ${
                    isPastThreshold ? 'text-emerald-300' : 'text-white/70'
                  }`}>
                    {isPastThreshold ? 'Release to Sync Firestore' : 'Pull down to Sync Cloud'}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        animate={{
          y: refreshing ? 0 : pullDistance > 0 ? Math.min(pullDistance * 0.4, 25) : 0,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
};
