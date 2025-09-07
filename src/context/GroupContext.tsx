import React, { createContext, useContext, useState, ReactNode } from 'react';
import { type Group } from '@models/Group';
import { getAllUserGroupsFromFirestore } from '@services/firestoreService';
import { useAuthenticatedUser } from './AuthContext';

interface GroupContextType {
  firestoreGroups: Group[];
  setFirestoreGroups: (groups: Group[]) => void;
  loadGroupsFromFirestore: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

interface GroupProviderProps {
  children: ReactNode;
}

export const GroupProvider: React.FC<GroupProviderProps> = ({ children }) => {
  const [firestoreGroups, setFirestoreGroups] = useState<Group[]>([]);
  const user = useAuthenticatedUser();

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
    firestoreGroups,
    setFirestoreGroups,
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
