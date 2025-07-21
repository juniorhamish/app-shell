import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

interface DrawerContextProps {
  drawerOpen: boolean;
  toggleDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextProps>({ drawerOpen: false, toggleDrawer: () => {} });

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const value = useMemo(() => ({ drawerOpen, toggleDrawer: () => setDrawerOpen(!drawerOpen) }), [drawerOpen]);
  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

export const useDrawer = () => useContext(DrawerContext);
