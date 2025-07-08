// components/popup/mint-success.js
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { base } from "viem/chains";
import { WEB3_CONFIG } from "../../public/constant/web3";

export default function MintSuccessPopup({ isOpen, onClose, txHash, tokenIds = [] }) {
  const explorerUrl = `${base.blockExplorers.default.url}/tx/${txHash}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md rounded-2xl p-8 shadow-xl"
            style={{
              background: 'linear-gradient(to right, #003fdd, #000d9f)',
              boxShadow: '0 10px 32px 0 rgba(80, 80, 180, 0.15)',
            }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
               
              </div>
              <h3 className="mt-4 text-2xl font-bold text-white">
                Mint successfully!
              </h3>

              <div className="flex flex-col gap-3 mt-4">
                {tokenIds.map((id) => (
                  <a
                    key={id}
                    href={`https://opensea.io/assets/base/${WEB3_CONFIG.CONTRACT_ADDRESS}/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-4 py-3 text-base font-semibold text-white shadow-md hover:from-blue-700 hover:to-pink-700 transition-colors border-2 border-white"
                    style={{ minWidth: 0 }}
                  >
                    {/* Official Opensea sailboat logo SVG */}
                    <svg className="mr-2" aria-label="OpenSea" fill="none" height="30" viewBox="0 0 30 30" width="30" xmlns="http://www.w3.org/2000/svg"><g><path d="M15.131 0C6.743-.067-.069 6.744.001 15.132.07 23.276 6.725 29.931 14.869 30c8.388.072 15.202-6.742 15.13-15.13C29.932 6.727 23.276.07 15.131 0Z" fill="#0086FF"></path><path d="M14.978 4.634c.537 0 .972.435.972.972v1.248c2.982 1.392 4.935 3.702 4.935 6.315 0 1.533-.67 2.96-1.827 4.16-.222.23-.53.36-.852.36h-2.254v1.857h2.83c.61 0 1.706-1.158 2.225-1.856 0 0 .022-.034.082-.052.06-.018 5.198-1.197 5.198-1.197a.17.17 0 0 1 .214.162v1.081c0 .07-.037.13-.102.158-.352.15-1.515.69-2 1.362-1.247 1.737-2.2 4.467-4.33 4.467h-8.887c-3.147 0-5.78-2.498-5.778-5.825 0-.082.07-.15.153-.15h4.212c.145 0 .26.117.26.26v.813c0 .432.349.783.782.783h3.195v-1.86h-2.182a9.293 9.293 0 0 0 2.002-5.783c0-2.437-.934-4.66-2.464-6.322.925.108 1.81.292 2.644.537v-.518c0-.537.435-.972.972-.972Zm-4.333 2.83a7.154 7.154 0 0 1 1.536 4.44c0 1.45-.43 2.8-1.17 3.926h-5.2l4.834-8.365Z" fill="#FFF"></path></g></svg>
                    <span className="truncate">View on Opensea NFT # {id}</span>
                    <svg
                      className="ml-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  href={explorerUrl}
                  className="inline-flex items-center justify-center rounded-lg bg-[#2F2F2F] px-4 py-2 text-sm font-medium text-white hover:bg-[#3F3F3F] transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Explorer on scan</span>
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}