import { Web3Wallet } from '@walletconnect/web3wallet';
import { Core } from '@walletconnect/core';

export let web3wallet;

export const initWalletConnect = async () => {
  const core = new Core({
    projectId: 'YOUR_WALLETCONNECT_PROJECT_ID' // Lấy từ https://cloud.walletconnect.com
  });

  web3wallet = await Web3Wallet.init({
    core,
    metadata: {
      name: 'My NFT DApp',
      description: 'Mint NFT with WalletConnect',
      url: 'https://yourdapp.com',
      icons: ['https://yourdapp.com/logo.png']
    }
  });
};