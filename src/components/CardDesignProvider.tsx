import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { api, unwrap } from '../api/client';
import { AppSettings, CardDesign, SiteDesign } from '../types';

interface CardDesignContextValue {
  cardDesign: CardDesign;
  siteDesign: SiteDesign;
  setCardDesign: (design: CardDesign) => void;
  setSiteDesign: (design: SiteDesign) => void;
  refreshCardDesign: () => Promise<void>;
}

const CardDesignContext = createContext<CardDesignContextValue>({
  cardDesign: 'standard',
  siteDesign: 'classic',
  setCardDesign: () => undefined,
  setSiteDesign: () => undefined,
  refreshCardDesign: async () => undefined
});

export const CardDesignProvider = ({ children }: { children: ReactNode }) => {
  const [cardDesign, setCardDesign] = useState<CardDesign>('standard');
  const [siteDesign, setSiteDesign] = useState<SiteDesign>('classic');

  const refreshCardDesign = async () => {
    const settings = unwrap<AppSettings>(await api.get('/cms/settings'));
    setCardDesign(settings.cardDesign || 'standard');
    setSiteDesign(settings.siteDesign || 'classic');
  };

  useEffect(() => {
    refreshCardDesign().catch(() => undefined);
  }, []);

  return (
    <CardDesignContext.Provider value={{ cardDesign, siteDesign, setCardDesign, setSiteDesign, refreshCardDesign }}>
      {children}
    </CardDesignContext.Provider>
  );
};

export const useCardDesign = () => useContext(CardDesignContext);
