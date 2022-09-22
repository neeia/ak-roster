import React from 'react';
import '../styles/globals.css';
import { AppProps } from 'next/app';
import appTheme from "../styles/theme/appTheme";
import createEmotionCache from '../util/createEmotionCache';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { CacheProvider } from '@emotion/react';


const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;

  const clientSideEmotionCache = createEmotionCache();
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
};

export default MyApp;