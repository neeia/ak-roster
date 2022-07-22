import React from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import createEmotionCache from '../util/createEmotionCache';
import appTheme from '../styles/theme/appTheme';
import '../styles/globals.css';
import { AppProps } from 'next/app';


const clientSideEmotionCache = createEmotionCache();

const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;

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