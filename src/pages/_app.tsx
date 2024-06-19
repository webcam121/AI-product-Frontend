import '@/styles/globals.css';
import '@/styles/nprogress.css';
import type { AppProps } from 'next/app';
import Router from "next/router";
import NProgress from "nprogress";

Router.events.on("routeChangeStart", NProgress.start);
Router.events.on("routeChangeError", NProgress.done);
Router.events.on("routeChangeComplete", NProgress.done);

const MyApp = ({ Component, pageProps }: AppProps) => (
    <Component {...pageProps} />
);

export default MyApp;