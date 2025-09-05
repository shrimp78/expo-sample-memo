import React, { createContext, useContext, useState, ReactNode } from 'react';
import { type Group } from '@models/Group';
import { getAllUserGroupsFromFirestore } from '@services/firestoreService';
import { useAuthenticatedUser } from './AuthContext';

interface GroupContextType {
  groups: Group[];
  firestoreGroups: Group[];
  setGroups: (groups: Group[]) => void;
  loadGroups: () => Promise<void>;
  loadGroupsFromFirestore: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

interface GroupProviderProps {
  children: ReactNode;
}

export const GroupProvider: React.FC<GroupProviderProps> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [firestoreGroups, setFirestoreGroups] = useState<Group[]>([]);
  const user = useAuthenticatedUser();

  // SQLiteからデータを取得するやつ
  const loadGroups = React.useCallback(async () => {
    try {
      const allGroups = await getAllUserGroupsFromFirestore(user.id);
      const sortedGroups = allGroups.sort((a, b) => a.position - b.position);
      setGroups(sortedGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  }, []);

  // Firestoreからデータを取得するやつ
  const loadGroupsFromFirestore = React.useCallback(async () => {
    try {
      const allGroups = await getAllUserGroupsFromFirestore(user.id);
      console.log('\n\n\nFirestoreからデータを取得しました');
      console.log(allGroups);
      setFirestoreGroups(allGroups);
    } catch (error) {
      console.error('Error loading groups from Firestore:', error);
    }
  }, [user]);

  const value: GroupContextType = {
    groups,
    firestoreGroups,
    setGroups,
    loadGroups,
    loadGroupsFromFirestore
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
