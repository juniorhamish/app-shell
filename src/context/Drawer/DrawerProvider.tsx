import { ReactNode, useMemo, useState } from 'react';
import DrawerContext from './DrawerContext';

export default function DrawerProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const value = useMemo(() => ({ drawerOpen, toggleDrawer: () => setDrawerOpen(!drawerOpen) }), [drawerOpen]);
  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}
