import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { type Item } from '@models/Item';
import { getAllItemsByUserId } from '@services/itemService';
import { useAuthenticatedUser } from './AuthContext';

interface ItemContextType {
  items: Item[];
  setItems: (items: Item[]) => void;
  loadItems: () => Promise<void>;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

interface ItemProviderProps {
  children: ReactNode;
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const user = useAuthenticatedUser();

  const loadItems = useCallback(async () => {
    try {
      const allItems = await getAllItemsByUserId(user.id);
      console.log('\n\n\nFirestoreからデータを取得しました');
      setItems(allItems);
    } catch (error) {
      console.error('Error loading items from Firestore:', error);
    }
  }, [user]);

  const value: ItemContextType = {
    items,
    setItems,
    loadItems
  };

  return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
};

export const useItems = (): ItemContextType => {
  const context = useContext(ItemContext);
  if (context === undefined) {
    throw new Error('useItems must be used within a ItemProvider');
  }
  return context;
};
