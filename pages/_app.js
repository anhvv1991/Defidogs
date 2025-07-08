import AOS from "aos";
import { useEffect } from "react";

import { useRouter } from 'next/router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '../wagmi';
import { base } from 'wagmi/chains';

// Import global styles
import "aos/dist/aos.css";
import "../styles/globals.css";
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
   // Setup AOS
   useEffect(() => {
    AOS.init({
      duration: 200,
      once: true,
      offset: 50,
    });
  }, []);
  const { locale } = useRouter();
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" locale={locale} initialChains={[base]}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;

