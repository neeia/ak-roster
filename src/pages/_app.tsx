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

// const firebaseConfig = {
//   apiKey: "AIzaSyDjpt2G4GFQjYbPT5Mrj6L2meeWEnsCEgU",
//   authDomain: "ak-roster.firebaseapp.com",
//   projectId: "ak-roster",
//   storageBucket: "ak-roster.appspot.com",
//   messagingSenderId: "1076086810652",
//   appId: "1:1076086810652:web:ed1da74b87a08bf4b657d9",
//   measurementId: "G-VZXJ8MY6D1",
//   databaseURL: "https://ak-roster-default-rtdb.firebaseio.com/",
// };

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

export const UserContext = React.createContext<User | null>(null);
export const LightContext = React.createContext<[boolean, (theme: boolean) => void] | null>(null);

const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;

  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!newSession) setUser(null);
      else if (!user) setUser(newSession.user);
      else if (newSession.user.id !== user.id) {
        setUser(newSession.user);
      }
    });

    return subscription.unsubscribe;
  }, [user]);

  const [_light, _setLight] = useLocalStorage("light_theme", false);
  const [light, setLight] = React.useState(false);

  const theme = React.useMemo(() => createTheme(brand.DEFAULT, light), [light]);

  React.useEffect(() => {
    setLight(_light);
  }, [_light]);

  const clientSideEmotionCache = createEmotionCache();
  return (
    <ReduxProvider store={store}>
      <UserContext.Provider value={user}>
        <LightContext.Provider value={[light, setLight]}>
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
        </LightContext.Provider>
      </UserContext.Provider>
    </ReduxProvider>
  );
};

export default MyApp;
