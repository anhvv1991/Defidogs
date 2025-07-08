import React, { Fragment, useRef } from "react";
import useOutsideClick from "../../common/outside-click";
import Image from "next/image";
import Link from "next/link";

const MetaMaskNotFoundPopup = (props) => {
  // Handle click outside popup
  const wrapperRef = useRef(null);
  useOutsideClick(wrapperRef, () => {
    props.triggerParentUpdate(false);
  });

  return (
    <Fragment>
      <div
        className="absolute w-[calc(100%-16px)] lg:w-[460px] h-[360px] lg:h-[460px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
        ref={wrapperRef}
      >
        <div className="relative row-span-3 lg:row-span-2 bg-[#2b252b] h-full rounded-xl lg:rounded-3xl overflow-hidden"
        >
          {/* <Image
            src="/images/bg-popup.png"
            layout="fill"
            objectFit="contain"
            alt="BG Popup"
            priority
          /> */}
        </div>
        <div className="absolute z-10 top-0 left-0 w-full h-full">
          <div className="absolute top-[52%] lg:top-1/2 left-1/2 w-[320px] h-auto -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="mb-[8px]">
              <div className="relative w-[90px] lg:w-[120px] h-[90px] lg:h-[120px] mx-auto">
                <Image
                  src="/images/icon/metamask.png"
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
                  Metamask Not Found
                </span>
              </div>
              <div>
                <span className="text-[#9A9A9A] text-[12px] lg:text-[14px] leading-[20px]">
                  You need to install Metamask to continue
                </span>
              </div>
            </div>
            <div className="hidden lg:block">
              <Link
                href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en-US"
                className="inline-block relative border border-[#D7CABB]/90 rounded-[3px] transition-all duration-300 bg-[url('~/public/images/bg-button.png')] bg-center before:absolute before:z-10 before:top-0 before:left-0 before:w-full before:h-full before:bg-black before:transition-opacity before:duration-300 before:opacity-70 hover:before:opacity-30"
                title="Install Metamask"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => props.triggerParentUpdate(false)}
              >
                <span className="relative z-20 block text-[16px] h-[16px] leading-[16px] font-secondary font-bold uppercase bg-[url('~/public/images/bg-button-text.png')] bg-repeat [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] [-webkit-font-smoothing:antialiased] mx-[32px] mt-[15px] mb-[15px]">
                  Install Metamask
                </span>
              </Link>            </div>
            <div className="block lg:hidden">
              <Link
                href="https://metamask.app.link/dapp/mintmount.roemmorpg.com/"
                target="_blank"
                rel="noopener noreferrer"
                  onClick={() => props.triggerParentUpdate(false)}
                >
                  <span className="relative z-20 block text-[16px] h-[16px] leading-[16px] font-secondary font-bold uppercase bg-[url('~/public/images/bg-button-text.png')] bg-repeat [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] [-webkit-font-smoothing:antialiased] mx-[32px] mt-[15px] mb-[15px]">
                    Install Metamask
                  </span>
                </Link>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default MetaMaskNotFoundPopup;
