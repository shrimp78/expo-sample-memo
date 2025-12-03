import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { type Item } from '@models/Item';
import { getAllItemsByUserId } from '@services/itemService';
import { useAuthenticatedUser } from './AuthContext';
import { getCachedItems, setCachedItems } from '@services/cache';

interface ItemContextType {
  items: Item[];
  setItems: (items: Item[]) => void;
  loadItems: () => Promise<void>;
  isHydratedFromCache: boolean;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

interface ItemProviderProps {
  children: ReactNode;
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ children }) => {
  const [items, setItemsState] = useState<Item[]>([]);
  const [isHydratedFromCache, setIsHydratedFromCache] = useState<boolean>(false);
  const user = useAuthenticatedUser();

  const loadItems = useCallback(async () => {
    try {
      const allItems = await getAllItemsByUserId(user.id);
      console.log('\n\n\nItemContext: Firestoreからデータを取得しました');
      console.log(allItems);
      setItemsState(allItems);
      // リモート取得後はキャッシュを更新
      await setCachedItems(user.id, allItems);
    } catch (error) {
      console.error('Error loading items from Firestore:', error);
    }
  }, [user]);

  // setItems: State更新 + キャッシュ更新
  const setItems = useCallback(
    async (nextItems: Item[]) => {
      setItemsState(nextItems);
      await setCachedItems(user.id, nextItems);
    },
    [user.id]
  );

  // 初期ハイドレーション（Providerマウント時に一度だけ。 user.idが変わると再度実施。）
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cached = await getCachedItems(user.id);
        if (mounted && cached) {
          setItemsState(cached);
        }
      } catch (e) {
        // noop（ログはcache.ts側）
      } finally {
        if (mounted) setIsHydratedFromCache(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user.id]);

  const value: ItemContextType = {
    items,
    setItems,
    loadItems,
    isHydratedFromCache
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
