import { createContext } from 'react';

interface DrawerContextProps {
  drawerOpen: boolean;
  toggleDrawer: () => void;
}

export default createContext<DrawerContextProps>({ drawerOpen: false, toggleDrawer: () => {} });
