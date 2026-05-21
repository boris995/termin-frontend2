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
  const [siteDesignState, setSiteDesignState] = useState<SiteDesign>(() => {
    const saved = localStorage.getItem('siteDesign');
    return saved === 'premium' || saved === 'classic' ? saved : 'classic';
  });

  const setSiteDesign = (design: SiteDesign) => {
    localStorage.setItem('siteDesign', design);
    setSiteDesignState(design);
  };

  const refreshCardDesign = async () => {
    const settings = unwrap<AppSettings>(await api.get('/cms/settings'));
    setCardDesign(settings.cardDesign || 'standard');
    if (!localStorage.getItem('siteDesign')) setSiteDesignState(settings.siteDesign || 'classic');
  };

  useEffect(() => {
    refreshCardDesign().catch(() => undefined);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('theme-premium', siteDesignState === 'premium');
    document.body.classList.toggle('theme-classic', siteDesignState === 'classic');
  }, [siteDesignState]);

  return (
    <CardDesignContext.Provider value={{ cardDesign, siteDesign: siteDesignState, setCardDesign, setSiteDesign, refreshCardDesign }}>
      {children}
    </CardDesignContext.Provider>
  );
};

export const useCardDesign = () => useContext(CardDesignContext);
