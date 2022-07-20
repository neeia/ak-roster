import React from 'react';
import { Operator } from '../types/operator';
const AppContext = React.createContext<Record<string, Operator>>({});
export const AppProvider = AppContext.Provider;
export const AppConsumer = AppContext.Consumer;
export default AppContext;