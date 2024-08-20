import React from 'react';
import 'styles/globals.css';
import { AppProps } from 'next/app';
import appTheme from "styles/theme/appTheme";
import createEmotionCache from 'util/createEmotionCache';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import { getApps, initializeApp } from 'firebase/app';
import { Analytics } from '@vercel/analytics/react';
import { Provider as ReduxProvider } from "react-redux";
import { persistor, store } from 'store/store';
import { PersistGate } from 'redux-persist/integration/react';
import DatadogInit from 'components/Datadog';

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

const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;

  if (!getApps().length) initializeApp(firebaseConfig);

  const clientSideEmotionCache = createEmotionCache();
  return (
    <ReduxProvider store={store}>
      <CacheProvider value={clientSideEmotionCache}>
        <ThemeProvider theme={appTheme}>
          <CssBaseline />
          <Analytics />
          <DatadogInit />
          <PersistGate loading={null} persistor={persistor}>
            {() => <Component {...pageProps} />}
          </PersistGate>
        </ThemeProvider>
      </CacheProvider>
    </ReduxProvider>
  );
};

export default MyApp;