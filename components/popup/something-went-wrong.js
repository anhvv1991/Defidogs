import React, { Fragment, useRef } from "react";
import useOutsideClick from "../../common/outside-click";
import Image from "next/image";

const SomethingWentWrongPopup = (props) => {
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
          <div className="absolute top-[52%] lg:top-1/2 left-1/2 w-[320px] h-auto -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="mb-[8px] p-[10px]">
              <div className="relative w-[68px] lg:w-[80px] h-[68px] lg:h-[80px] mx-auto">
                <Image
                  src="/images/icon/something-went-wrong.png"
                  layout="fill"
                  objectFit="contain"
                  alt="Icon Popup"
                  priority
                />
              </div>
            </div>
            <div className="mb-[8px] lg:mb-[24px]">
              <div className="mb-[4px]">
                <span className="text-[#DFC889] text-[16px] lg:text-[20px] leading-[110%] -tracking-[0.03em] lg:tracking-[0.02em] font-secondary font-medium uppercase">
                  Something Went Wrong
                </span>
              </div>
              <div>
                <span className="text-[#9A9A9A] text-[12px] lg:text-[14px] leading-[20px]">
                  An error occurred, please try again
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default SomethingWentWrongPopup;
