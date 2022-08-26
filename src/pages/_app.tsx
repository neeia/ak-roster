import React from 'react';
import '../styles/globals.css';
import { AppProps } from 'next/app';



const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;

  return (
    <Component {...pageProps} />
  );
};

export default MyApp;