import React, { createContext, useContext, useState, ReactNode } from 'react';
import { type Group } from '@models/Group';
import * as GroupService from '../services/groupService';

interface GroupContextType {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  loadGroups: () => Promise<void>;
  updateGroupsOrder: (newGroups: Group[]) => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

interface GroupProviderProps {
  children: ReactNode;
}

export const GroupProvider: React.FC<GroupProviderProps> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);

  const loadGroups = React.useCallback(async () => {
    try {
      const allGroups = await GroupService.getAllGroups();
      const sortedGroups = allGroups.sort((a, b) => a.position - b.position);
      setGroups(sortedGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  }, []);

  const updateGroupsOrder = React.useCallback((newGroups: Group[]) => {
    setGroups(newGroups);
  }, []);

  const value: GroupContextType = {
    groups,
    setGroups,
    loadGroups,
    updateGroupsOrder
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
