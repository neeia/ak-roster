import React from 'react';
import 'styles/globals.css';
import { AppProps } from 'next/app';
import createTheme, { brand } from "styles/theme/appTheme";
import createEmotionCache from 'util/createEmotionCache';
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import { getApps, initializeApp } from 'firebase/app';
import { Analytics } from '@vercel/analytics/react';
import { Lato } from "next/font/google";
import supabase from 'supabase/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Provider as ReduxProvider } from "react-redux";
import { store } from 'store/store';

const firebaseConfig = {
  apiKey: "AIzaSyDjpt2G4GFQjYbPT5Mrj6L2meeWEnsCEgU",
  authDomain: "ak-roster.firebaseapp.com",
  projectId: "ak-roster",
  storageBucket: "ak-roster.appspot.com",
  messagingSenderId: "1076086810652",
  appId: "1:1076086810652:web:ed1da74b87a08bf4b657d9",
  measurementId: "G-VZXJ8MY6D1",
  databaseURL: "https://ak-roster-default-rtdb.firebaseio.com/",
};

const lato = Lato({
  subsets: ["latin"],
  weight: ['100', '300', '400', '700', '900']
});

export const SessionContext = React.createContext<Session | null>(null);

const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;

  if (!getApps().length) initializeApp(firebaseConfig);

  const [session, setSession] = React.useState<Session | null>(null)

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setSession(null)
        } else if (session) {
          setSession(session)
        }
      })

    return () => subscription.unsubscribe()
  }, [])

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () => createTheme(brand.DEFAULT),
    [prefersDarkMode],
  );

  const clientSideEmotionCache = createEmotionCache();
  return (
    <ReduxProvider store={store}>
      <SessionContext.Provider value={session}>
        <CacheProvider value={clientSideEmotionCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Analytics />
            <div className={lato.className}>
              <Component {...pageProps} />
            </div>
          </ThemeProvider>
        </CacheProvider>
      </SessionContext.Provider>
    </ReduxProvider>
  );
};

export default MyApp;