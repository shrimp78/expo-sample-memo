import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { type Group } from '@models/Group';
import { getAllGroupsByUserId } from '@services/groupService';
import { useAuthenticatedUser } from './AuthContext';
import { getCachedGroups, setCachedGroups } from '@services/cache';

interface GroupContextType {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  loadGroups: () => Promise<void>;
  isHydratedFromCache: boolean;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

interface GroupProviderProps {
  children: ReactNode;
}

export const GroupProvider: React.FC<GroupProviderProps> = ({ children }) => {
  const [groups, setGroupsState] = useState<Group[]>([]);
  const [isHydratedFromCache, setIsHydratedFromCache] = useState<boolean>(false);
  const user = useAuthenticatedUser();

  // Firestoreからデータを取得するやつ
  const loadGroups = React.useCallback(async () => {
    try {
      const allGroups = await getAllGroupsByUserId(user.id);
      console.log('\n\n\nFirestoreからデータを取得しました');
      console.log(allGroups);
      setGroupsState(allGroups);
      await setCachedGroups(user.id, allGroups);
    } catch (error) {
      console.error('Error loading groups from Firestore:', error);
    }
  }, [user]);

  const setGroups = React.useCallback(
    async (nextGroups: Group[]) => {
      setGroupsState(nextGroups);
      await setCachedGroups(user.id, nextGroups);
    },
    [user.id]
  );

  // 初期ハイドレーション（Providerマウント時に一度だけ）
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cached = await getCachedGroups(user.id);
        if (mounted && cached) {
          setGroupsState(cached);
        }
      } catch (e) {
        // noop
      } finally {
        if (mounted) setIsHydratedFromCache(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user.id]);

  const value: GroupContextType = {
    groups,
    setGroups,
    loadGroups,
    isHydratedFromCache
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};

export const useGroups = (): GroupContextType => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
};
