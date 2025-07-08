import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    base,
    mainnet,
} from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { createConfig } from 'wagmi';
import {
    metaMaskWallet,
    coinbaseWallet,
    trustWallet
} from '@rainbow-me/rainbowkit/wallets';

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [metaMaskWallet, coinbaseWallet, trustWallet],
        },
    ],
    {
        appName: 'RainbowKit demo',
        projectId: '81089a981dbba84f572aaad6d5c44a62',
    }
);

export const config = createConfig({
    connectors,
    chains: [
        // mainnet,
        base
        // ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia, baseSepolia] : []),
    ],
    ssr: true,
});