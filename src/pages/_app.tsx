import React from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, CssBaseline } from '@mui/material';

import createEmotionCache from '../util/createEmotionCache';
import lightTheme from '../styles/theme/lightTheme';
import '../styles/globals.css';
import { AppProps } from 'next/app';
import operatorJson from "../data/operators.json";
import { defaultOperatorObject, Operator } from '../types/operator';
import useLocalStorage from '../util/useLocalStorage';
import changeOperator from '../util/changeOperator';
import { AppProvider } from '../contexts/appContext';


const clientSideEmotionCache = createEmotionCache();

const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;

  const [operators, setOperators] = useLocalStorage<Record<string, Operator>>(
    "operators", Object.fromEntries(Object.entries(operatorJson).map(defaultOperatorObject))
  );
  // Iterate through opJson and add any missing to operators
  Object.entries(operatorJson).forEach((op) => {
    if (!(op[0] in operators)) {
      operators[op[0]] = defaultOperatorObject(op)[1];
    }
  })

  const changePropertyOfOperator = React.useCallback(
    (operatorID: string, property: string, value: number | boolean, index?: number) => {
      if (isNaN(value as any)) {
        return;
      }
      setOperators(
        (oldOperators: Record<string, Operator>): Record<string, Operator> => {
          const copyOperators = { ...oldOperators };
          const copyOperatorData = { ...copyOperators[operatorID] };
          copyOperators[operatorID] = changeOperator(copyOperatorData, property, value, index);
          //setDirty(true);
          return copyOperators;
        }
      );
    },
    [setOperators]
  );

  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={lightTheme}>
        <AppProvider value={operators}>
          <CssBaseline />
          <Component {...pageProps} />
        </AppProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default MyApp;