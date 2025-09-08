import React, { createContext, useContext, useState, ReactNode } from 'react';
import { type Group } from '@models/Group';
import { getAllGroupsByUserId } from '@services/groupService';
import { useAuthenticatedUser } from './AuthContext';

interface GroupContextType {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  loadGroups: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

interface GroupProviderProps {
  children: ReactNode;
}

export const GroupProvider: React.FC<GroupProviderProps> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const user = useAuthenticatedUser();

  // Firestoreからデータを取得するやつ
  const loadGroups = React.useCallback(async () => {
    try {
      const allGroups = await getAllGroupsByUserId(user.id);
      console.log('\n\n\nFirestoreからデータを取得しました');
      console.log(allGroups);
      setGroups(allGroups);
    } catch (error) {
      console.error('Error loading groups from Firestore:', error);
    }
  }, [user]);

  const value: GroupContextType = {
    groups,
    setGroups,
    loadGroups
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
