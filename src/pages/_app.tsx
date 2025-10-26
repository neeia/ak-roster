import React from "react";
import "styles/globals.css";
import { AppProps } from "next/app";
import createTheme, { brand } from "styles/theme/appTheme";
import createEmotionCache from "util/createEmotionCache";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import { Analytics } from "@vercel/analytics/react";
import { Lato } from "next/font/google";
import supabase from "supabase/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "legacyStore/store";
import { SnackbarProvider } from "notistack";
import OneTimeV3Popup from "components/app/OneTimeV3Popup";
import useLocalStorage from "util/hooks/useLocalStorage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

export const UserContext = React.createContext<User | null>(null);
export const LightContext = React.createContext<[boolean, (theme: boolean) => void] | null>(null);

const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;

  const [user, setUser] = React.useState<User | null>(null);
  const [queryClient] = React.useState(new QueryClient());

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!newSession) {
        setUser(null);
        sessionStorage.removeItem('emailVerificationHandled');
      }
      else if (!user) {
        setUser(newSession.user);
        //verification link redirect: no-user context and dead links
        //force one page reload on SIGNED_IN for <10min new user to fix.
        if (event === 'SIGNED_IN') {
          const alreadyHandled = sessionStorage.getItem('emailVerificationHandled') === 'true';
          if (!alreadyHandled) {
            const userCreatedAt = new Date(newSession.user.created_at);
            const now = new Date();
            const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
            const isNewUser = userCreatedAt > tenMinutesAgo;
            if (isNewUser) {
              sessionStorage.setItem('emailVerificationHandled', 'true');
              window.location.reload();
            }
          }
        }
      }
      else if (newSession.user.id !== user.id) {
        setUser(newSession.user);
      }
    });

    return subscription.unsubscribe;
  }, [user]);

  const [_light, _setLight] = useLocalStorage("light_theme", false);
  const [light, setLight] = React.useState(false);
  const updateTheme = (value: boolean) => {
    _setLight(value);
    setLight(value);
  };

  const theme = React.useMemo(() => createTheme(brand.DEFAULT, light), [light]);

  React.useEffect(() => {
    setLight(_light);
  }, [_light]);

  const clientSideEmotionCache = createEmotionCache();
  return (
    <ReduxProvider store={store}>
      <UserContext.Provider value={user}>
        <LightContext.Provider value={[light, updateTheme]}>
          <QueryClientProvider client={queryClient}>
            <CacheProvider value={clientSideEmotionCache}>
              <ThemeProvider theme={theme}>
                <SnackbarProvider maxSnack={3} preventDuplicate>
                  <CssBaseline />
                  <Analytics />
                  <div className={lato.className}>
                    <Component {...pageProps} />
                    <OneTimeV3Popup />
                  </div>
                </SnackbarProvider>
              </ThemeProvider>
            </CacheProvider>
          </QueryClientProvider>
        </LightContext.Provider>
      </UserContext.Provider>
    </ReduxProvider>
  );
};

export default MyApp;
