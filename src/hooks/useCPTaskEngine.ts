import { useState, useEffect, useCallback } from 'react';
import { CPQuestItem } from '../types';
import {
  getStoredCPQuests,
  updateCPQuestProgress,
  claimCPQuestReward
} from '../utils/storage';

export const useCPTaskEngine = () => {
  const [quests, setQuests] = useState<CPQuestItem[]>(() => getStoredCPQuests());

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CPQuestItem[]>;
      if (customEvent.detail) {
        setQuests(customEvent.detail);
      } else {
        setQuests(getStoredCPQuests());
      }
    };

    window.addEventListener('amorex_cp_quests_updated', handleUpdate);
    return () => {
      window.removeEventListener('amorex_cp_quests_updated', handleUpdate);
    };
  }, []);

  // Track task progress for an action
  const trackAction = useCallback((actionType: string, increment: number = 1) => {
    const updated = updateCPQuestProgress(actionType, increment);
    setQuests(updated);
    return updated;
  }, []);

  // Claim reward
  const claimReward = useCallback((questId: string) => {
    const result = claimCPQuestReward(questId);
    setQuests(getStoredCPQuests());
    return result;
  }, []);

  const dailyQuests = quests.filter((q) => q.scope === 'daily');
  const weeklyQuests = quests.filter((q) => q.scope === 'weekly');

  return {
    quests,
    dailyQuests,
    weeklyQuests,
    trackAction,
    claimReward
  };
};
