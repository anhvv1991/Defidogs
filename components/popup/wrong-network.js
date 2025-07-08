import React, { Fragment, useRef } from "react";
import useOutsideClick from "../../common/outside-click";
import Image from "next/image";
import Web3 from "web3";

const WrongNetworkPopup = (props) => {
  const RPC_URL = "https://mainnet.infura.io/v3/";
  // const RPC_URL = "https://ropsten.infura.io/v3/";

  const CHAIN_ID = 1;
  // const CHAIN_ID = 3;

  // Handle click outside popup
  const wrapperRef = useRef(null);
  useOutsideClick(wrapperRef, () => {
    props.triggerParentUpdate(false);
  });

  const switchNetwork = () => {
    const web3 = new Web3(Web3.givenProvider || RPC_URL);
    web3.eth.getChainId().then((res) => {
      if (res !== CHAIN_ID) {
        try {
          window.ethereum
            .request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: web3.utils.toHex(CHAIN_ID) }],
            })
            .then(async () => {
              // Success switch network
              setTimeout(async () => {
                await detectNetwork();
              }, 1000);

              props.triggerSecondParentUpdate(true);
              props.triggerParentUpdate(false);
            });
        } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
          if (err.code === 4902) {
            window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainName: "Ethereum Mainnet",
                  chainId: web3.utils.toHex(CHAIN_ID),
                  nativeCurrency: {
                    name: "Ethereum",
                    decimals: 18,
                    symbol: "ETH",
                  },
                  rpcUrls: [RPC_URL],
                },
              ],
            });
          }
        }
      }
    });
  };

  const detectNetwork = async () => {
    const web3 = new Web3(Web3.givenProvider || RPC_URL);
    const { ethereum } = window;
    let checkNetwork = true;

    if (ethereum) {
      await web3.eth.getChainId().then((res) => {
        if (res !== CHAIN_ID) {
          props.triggerParentUpdate(true);
          checkNetwork = false;
        } else {
          // Network is correct
        }
      });
    }

    return checkNetwork;
  };

  return (
    <Fragment>
      <div
        className="absolute w-[calc(100%-16px)] lg:w-[460px] h-[360px] lg:h-[460px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        ref={wrapperRef}
      >
        <div className="relative w-full h-full">
          <Image
            src="/images/bg-popup.png"
            layout="fill"
            objectFit="contain"
            alt="BG Popup"
            priority
          />
        </div>
        <div className="absolute z-10 top-0 left-0 w-full h-full">
          <div className="absolute top-[54%] lg:top-1/2 left-1/2 w-[320px] h-auto -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="mb-[8px] p-[6px] lg:p-[12px]">
              <div className="relative w-[58px] lg:w-[64px] h-[58px] lg:h-[64px] mx-auto">
                <Image
                  src="/images/icon/wrong-network.png"
                  layout="fill"
                  objectFit="contain"
                  alt="Icon Popup"
                  priority
                />
              </div>
            </div>
            <div className="mb-[8px] lg:mb-[24px]">
              <div className="mb-[4px]">
                <span className="text-[#DFC889] text-[16px] lg:text-[20px] leading-[110%] lg:-tracking-[0.03em] font-tertiary uppercase">
                  Wrong Network
                </span>
              </div>
              <div>
                <span className="text-[#9A9A9A] text-[12px] lg:text-[14px] leading-[20px]">
                  You need to connect to supported network
                </span>
              </div>
            </div>
            <div>
              <button
                className="relative border border-[#D7CABB]/90 rounded-[3px] transition-all duration-300 bg-[url('~/public/images/bg-button.png')] bg-center before:absolute before:z-10 before:top-0 before:left-0 before:w-full before:h-full before:bg-black before:transition-opacity before:duration-300 before:opacity-70 hover:before:opacity-30"
                onClick={() => switchNetwork()}
              >
                <span className="relative z-20 block text-[16px] h-[16px] leading-[16px] font-secondary font-bold uppercase bg-[url('~/public/images/bg-button-text.png')] bg-repeat [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] [-webkit-font-smoothing:antialiased] mx-[32px] mt-[15px] mb-[15px]">
                  Switch Network
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default WrongNetworkPopup;
