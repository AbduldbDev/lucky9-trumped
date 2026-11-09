import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getIntroState, stampVisit } from "../utils/introState.js";

const IntroContext = createContext(null);

export function IntroProvider({ children }) {
  const [intro] = useState(getIntroState);
  const [splashDone, setSplashDone] = useState(!intro.showIntro);
  const [welcomePending, setWelcomePending] = useState(false);

  useEffect(() => {
    stampVisit();
  }, []);

  const completeSplash = useCallback(() => {
    setSplashDone(true);
    setWelcomePending(true);
  }, []);

  const dismissWelcome = useCallback(() => setWelcomePending(false), []);

  const value = useMemo(
    () => ({
      isFirstVisit: intro.isFirstVisit,
      splashDone,
      welcomePending,
      completeSplash,
      dismissWelcome,
    }),
    [
      intro.isFirstVisit,
      splashDone,
      welcomePending,
      completeSplash,
      dismissWelcome,
    ],
  );

  return (
    <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
  );
}

export function useIntro() {
  const ctx = useContext(IntroContext);
  if (!ctx) throw new Error("useIntro must be used inside <IntroProvider>");
  return ctx;
}
