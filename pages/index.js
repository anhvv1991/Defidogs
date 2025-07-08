import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Web3 from "web3";
import SomethingWentWrongPopup from "../components/popup/something-went-wrong";
import WelcomePopup from "../components/popup/webcome";
import MintSuccessPopup from "../components/popup/mint-success";
import MintLimitReachedPopup from "../components/popup/mint-limit-reached";
import InformationPopup from "../components/popup/information";
import MintAmountPopup from "../components/popup/mint-amount";
import ABI from "../public/abi.json";
import { Parallax } from "react-parallax";
import { Wallet, Menu, X, Star, Users, Clock, Shield } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { VARIANTS } from "../public/constant/animation";
import { useAnimations } from "../hooks/useAnimations";
import { WEB3_CONFIG, ZERO_ADDRESS } from "../public/constant/web3";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useSwitchChain, useChainId, useWatchContractEvent } from 'wagmi';
import { parseEther, ethers, BigNumber } from 'ethers';
import { useResize } from '../hooks/useResize';
import { base } from 'wagmi/chains';
import { UI_CONFIG } from "../public/constant/ui";

export default function Home() {
  const animations = useAnimations();
  const isMobile = useResize();
  // State
  const [isPopupSomethingWentWrong, setIsPopupSomethingWentWrong] =
    useState(false);
  const [isPopupWelcome, setIsPopupWelcome] = useState(false);
  const [isPopupMintLimitReached, setIsPopupMintLimitReached] = useState(false);

  const [isPopupNotInWhitelist, setIsPopupNotInWhitelist] = useState(false);
  const [isPopupMintHasNotStarted, setIsPopupMintHasNotStarted] = useState(false);

  const [loadingScreen, setLoadingScreen] = useState(false);
  const [loadingScreenMessage, setLoadingScreenMessage] = useState("Loading");
  const [isMintPopupOpen, setIsMintPopupOpen] = useState(false);

  const handleShowMintPopup = () => setIsMintPopupOpen(true);
  const handleCloseMintPopup = () => setIsMintPopupOpen(false);

  const [mintedTokenIds, setMintedTokenIds] = useState([]);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintTxHash, setMintTxHash] = useState(null);

  // Write contract
  const {
    data: hash,
    writeContract,
    error: writeError,
    isPending: isWritePending
  } = useWriteContract();

  // Overlay for minting process: show only when mint is pending
  const showMintingOverlay = loadingScreen || isWritePending;

  // Wagmi hooks
  const chainId = useChainId();
  const { isConnected, address } = useAccount();
  const { switchChain } = useSwitchChain();

  // Helper: Get minted tokenIds from transaction hash
  const getMintedTokenIdsFromTx = async (txHash, userAddress) => {
    try {
      const provider = new ethers.JsonRpcProvider(WEB3_CONFIG.RPC_URL);
      const receipt = await provider.waitForTransaction(txHash, 1, 60000); // 1 confirmation, timeout 60s
      if (!receipt) return [];
      const iface = new ethers.Interface(ABI);
      const mintedIds = [];
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (
            parsed.name === "Transfer" &&
            parsed.args.from === ZERO_ADDRESS &&
            parsed.args.to.toLowerCase() === userAddress.toLowerCase()
          ) {
            mintedIds.push(parsed.args.tokenId.toString());
          }
        } catch (e) { /* Not a Transfer event, ignore */ }
      }
      return mintedIds;
    } catch (e) {
      console.error("Error getting minted tokenIds from tx", e);
      return [];
    }
  };

  // Listen for mintTxHash and update mintedTokenIds
  useEffect(() => {
    // Chỉ chạy khi hash là string hợp lệ và address có giá trị
    if (typeof hash !== 'string' || hash.length !== 66 || !address) return;
    let cancelled = false;
    (async () => {
      setLoadingScreen(true);
      setLoadingScreenMessage("Fetching minted NFTs...");
      const ids = await getMintedTokenIdsFromTx(hash, address);
      if (!cancelled && ids.length > 0) {
        setMintedTokenIds(prev => [...new Set([...prev, ...ids])]);
        setMintSuccess(true);
      }
      setLoadingScreen(false);
      // Nếu bạn muốn reset hash sau khi xử lý xong, thêm dòng này:
      // setMintTxHash(null); // hoặc reset hash nếu bạn kiểm soát được
    })();
    return () => { cancelled = true; };
  }, [hash, address]);

  // Web3
  const handleSwitchChain = async () => {
    try {
      await switchChain({
        chainId: base.id,
      });
    } catch (error) {
      console.error('Failed to switch chain:', error);
    }
  };

  // Mint NFT with selected amount from popup
  const handleMintNFTWithAmount = async (amount) => {
    // Fix: Convert price per NFT to wei, then multiply by amount to avoid floating point errors
    const pricePerNftWei = parseEther(WEB3_CONFIG.MINT_PRICE.toString()); // bigint (ethers v6)
    const totalCostWei = pricePerNftWei * BigInt(amount);
    if (!isConnected) {
      alert("Please connect wallet first!");
      return;
    }
    if (chainId !== base.id) {
      alert("Please switch to Base!");
      return;
    }
    try {
      setIsMintPopupOpen(false)
      setLoadingScreen(true);
      setLoadingScreenMessage("Minting NFT...");
      const tx = await writeContract({
        address: WEB3_CONFIG.CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'mint',
        args: [amount],
        value: totalCostWei,
        chainId: base.id,
      });
      // If writeContract returns a hash or tx object, set it to state
      if (tx && tx.hash) {
        setMintTxHash(tx.hash);
      } else if (typeof tx === 'string') {
        setMintTxHash(tx);
      } else if (hash) {
        setMintTxHash(hash);
      }
    } catch (error) {
      console.error("Error mint:", error);
      setLoadingScreen(false);
    } finally {
      setLoadingScreen(false);
      setIsMintPopupOpen(false);
    }
  };

  return (
    <>
      {/* Minting overlay */}
      {showMintingOverlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div className="bg-white shadow-[0_10px_32px_0_rgba(80,80,180,0.15)] rounded-2xl px-10 py-10 text-center max-w-[90vw] min-w-[320px] flex flex-col items-center">
            {/* Spinner */}
            <div className="w-12 h-12 mb-6 flex items-center justify-center">
              <span className="block w-12 h-12 border-4 border-gray-400 border-t-[#003fdd] rounded-full animate-spin"></span>
            </div>
            {/* Dynamic message */}
            <div className="text-2xl font-extrabold bg-gradient-to-r from-[#003fdd] via-[#000d9f] to-[#003fdd] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(162,89,247,0.7)] mb-3 animate-gradient-move">
              {loadingScreenMessage}
            </div>
            <div className="text-base opacity-75 font-medium tracking-wide">
              Please do not reload the page.
            </div>
            <style>{`
              @keyframes gradient-move {
                0% { background-position: 0% 50%; }
                100% { background-position: 100% 50%; }
              }
              .animate-gradient-move {
                background-size: 200% 200%;
                animation: gradient-move 2s linear infinite;
              }
            `}</style>
          </div>
        </div>
      )}
      <div>
        <Head>
          <title>Mint Now - The Defi Dogs legend edition.</title>
          <meta
            property="og:title"
            content="Mint Now - The Defi Dogs legend edition."
          />
          <meta
            property="og:description"
            content="Born from a viral tweet at the height of the 2021 meme frenzy, DeFi Dogs is more than just a collection—it’s a community-driven movement
Same as our previous set, this collection, THE DEFI DOFS - LEGEND EDITION also consisted with 3,333 unique DeFi Dogs have found their forever home on Base, each representing a blend of culture, creativity, and decentralized spirit."
          />
          <meta property="og:image" content="/images/thumb-v2.jpeg" />
          <meta
            name="description"
            content="Born from a viral tweet at the height of the 2021 meme frenzy, DeFi Dogs is more than just a collection—it’s a community-driven movement
Same as our previous set, this collection, THE DEFI DOFS - LEGEND EDITION also consisted with 3,333 unique DeFi Dogs have found their forever home on Base, each representing a blend of culture, creativity, and decentralized spirit."
          />
          <link rel="icon" type="image/png" href="/images/defido-icon.webp" />
        </Head>

        <div className="relative min-h-screen bg-[url('/images/background.png')] bg-top bg-no-repeat bg-cover">
          {/* Header */}
          <header className="bg-black/20 w-screen backdrop-blur-md border-b border-purple-500/20">
            <div className="mx-auto pr-4 sm:pr-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="relative w-[200px] lg:w-[250px] h-[60px] lg:h-[100px]">
                  <Link href="/" className="relative block w-full h-full">
                    <Image
                      src="/images/defido-logo.png"
                      layout="fill"
                      objectFit="cover"
                      alt="Logo"
                    />
                  </Link>
                </div>

                {/* Wallet Connect */}
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center justify-end">
                    {/* <ConnectButton
                      showNetworkSwitch={false}
                      accountStatus={{
                        smallScreen: 'avatar',
                        largeScreen: 'full'
                      }}
                      chainStatus={{
                        smallScreen: 'none',
                        largeScreen: 'none'
                      }}
                    /> */}
                    <ConnectButton.Custom>
                      {({
                        account,
                        chain,
                        openAccountModal,
                        openChainModal,
                        openConnectModal,
                        authenticationStatus,
                        mounted,
                      }) => {
                        // Note: If your app doesn't use authentication, you
                        // can remove all 'authenticationStatus' checks
                        const ready = mounted && authenticationStatus !== 'loading';
                        const connected =
                          ready &&
                          account &&
                          chain &&
                          (!authenticationStatus ||
                            authenticationStatus === 'authenticated');

                        return (
                          <div
                            {...(!ready && {
                              'aria-hidden': true,
                              'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                              },
                            })}
                            className="flex items-center justify-end"
                          >
                            {(() => {
                              if (!connected) {
                                return (
                                  <button onClick={openConnectModal} type="button" className="min-w-[140px] h-[40px] lg:h-[56px] text-[14px] lg:text-2xl px-2 lg:px-4 bg-gradient-to-r from-[#003fdd] to-[#000d9f] rounded-lg lg:rounded-2xl text-white font-medium flex items-center justify-center">
                                    Connect Wallet
                                  </button>
                                );
                              }

                              if (chain.unsupported) {
                                return (
                                  <button onClick={openChainModal} type="button" className="min-w-[140px] h-[40px] lg:h-[56px] text-[14px] lg:text-2xl px-2 lg:px-4 bg-gradient-to-r from-red-500 to-red-500 rounded-lg font-medium flex items-center justify-center">
                                    Wrong network
                                  </button>
                                );
                              }

                              return (
                                <div style={{ display: 'flex' }}>

                                  <button onClick={openAccountModal} type="button" className="lg:min-w-[140px] h-[40px] lg:h-[56px] text-[14px] lg:text-2xl px-2 lg:px-4 bg-white rounded-lg lg:rounded-xl text-black font-medium flex items-center justify-center">
                                    {account.displayName}
                                    {account.displayBalance
                                      ? ` (${account.displayBalance})`
                                      : ''}
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        );
                      }}
                    </ConnectButton.Custom>
                  </div>
                  {isConnected && (
                    <button
                      onClick={handleShowMintPopup}
                      className="h-[40px] lg:h-[56px] px-2 lg:px-4 bg-gradient-to-r from-[#003fdd] to-[#000d9f] rounded-lg lg:rounded-xl text-white font-medium flex items-center justify-center"
                    >
                      <span className="lg:text-lg text-[12px] lg:text-2xl">Mint NFT</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          <MintAmountPopup
            isOpen={isMintPopupOpen}
            onClose={handleCloseMintPopup}
            onMint={handleMintNFTWithAmount}
          />
          <MintSuccessPopup
            isOpen={mintSuccess}
            onClose={() => {
              setMintSuccess(false);
              setMintedTokenIds([]);
              setMintTxHash(null);
            }}
            txHash={hash}
            tokenIds={mintedTokenIds || []}
          />
          <main className="relative max-w-full mx-auto w-full min-h-screen flex flex-col items-center">

            {/* Section 1 */}
            <div className="relative w-full h-[330px] md:h-[700px] lg:h-[880px] mb-10 lg:mb-40">
              {/* Defi dog Header - Background Image */}
              <div className="overflow-hidden w-full flex justify-center">
                <Image
                  src="/images/defiHeader.png"
                  alt="Defi Header"
                  width={1024}
                  height={480}
                  style={{ objectFit: "contain" }}
                />
              </div>

              <div className="w-full h-full flex flex-col items-center justify-center mt-[-100px] md:mt-[-200px] lg:mt-[-280px]">
                <div className="w-full flex flex-col items-center gap-2 lg:gap-4">
                  <motion.div
                    className="w-full flex flex-col items-center justify-center"
                    style={{
                      left: `${isMobile ? '22%' : '35%'}`,
                      transform: 'translateX(-50%)',
                      width: `${isMobile ? '58%' : '32%'}`,
                      y: animations.transforms.yDefiDog
                    }}
                  >
                    <Image
                      src="/images/defi-thumnail.png"
                      alt="Defi Thumbnail 1"
                      width={500}
                      height={150}
                      style={{ objectFit: "contain" }}
                      unoptimized={true}
                    />

                  </motion.div>
                  <motion.div
                    className="w-full flex flex-col items-center justify-center"
                    style={{
                      left: `${isMobile ? '32%' : '35%'}`,
                      transform: 'translateX(-50%)',
                      width: `${isMobile ? '35%' : '32%'}`,
                      y: animations.transforms.yDefiDog
                    }}
                  >
                    <Image
                      src="/images/defimini.png"
                      alt="Defi Thumbnail 2"
                      width={300}
                      height={50}
                      style={{ objectFit: "contain" }}
                      unoptimized={true}
                    />

                  </motion.div>

                </div>

                <div className="w-full h-full flex items-center justify-center">
                  {/* Ảnh 1 */}
                  <motion.div
                    className="absolute bottom-0 z-10"
                    style={{ left: isMobile ? '1%' : '5%', width: isMobile ? '18%' : '15%', y: animations.transforms.y1 }}
                    initial={{ y: 120, opacity: 0 }}
                    animate={animations.parallaxControls}
                    transition={{ delay: 0.1 }}
                  >
                    <Image
                      src="/images/dog/dogs-1.png"
                      alt="Defi dogs 1"
                      width={270}
                      height={270}
                      style={{ objectFit: "contain" }}
                      unoptimized={true}
                    />
                  </motion.div>

                  {/* Ảnh 2 */}
                  <motion.div
                    className="absolute bottom-0 z-20"
                    style={{ left: isMobile ? '10%' : '13%', width: isMobile ? '23%' : '25%', y: animations.transforms.y2 }}
                    initial={{ y: 120, opacity: 0 }}
                    animate={animations.parallaxControls}
                    transition={{ delay: 0.1 }}
                  >
                    <Image
                      src="/images/dog/dogs-2.png"
                      alt="Defi dogs 2"
                      width={320}
                      height={320}
                      style={{ objectFit: "contain" }}
                      unoptimized={true}
                    />
                  </motion.div>

                  {/* Ảnh 3 */}
                  <motion.div
                    className="absolute bottom-0 z-30"
                    style={{ left: isMobile ? '23%' : '25%', width: isMobile ? '26%' : '25%', y: animations.transforms.y3 }}
                    initial={{ y: 120, opacity: 0 }}
                    animate={animations.parallaxControls}
                    transition={{ delay: 0.1 }}
                  >
                    <Image
                      src="/images/dog/dogs-3.png"
                      alt="Defi dogs 3"
                      width={400}
                      height={400}
                      style={{ objectFit: "contain" }}
                      unoptimized={true}
                    />
                  </motion.div>

                  {/* Ảnh chính giữa */}
                  <motion.div
                    className="absolute bottom-0 z-40"
                    style={{
                      left: '36%',
                      transform: 'translateX(-50%)',
                      width: isMobile ? '35%' : '32%',
                      y: animations.transforms.yMain
                    }}
                    initial={{ y: 120, opacity: 0 }}
                    animate={animations.parallaxControls}
                    transition={{ delay: 0.1 }}
                  >
                    <Image
                      src="/images/dog/dogs-main.png"
                      alt="Main Defi dog"
                      width={510}
                      height={510}
                      style={{ objectFit: "contain" }}
                      unoptimized={true}
                    />
                  </motion.div>

                  {/* Ảnh 4 */}
                  <motion.div
                    className="absolute bottom-0 z-30"
                    style={{ right: isMobile ? '17%' : '22%', width: isMobile ? '26%' : '25%', y: animations.transforms.y3 }}
                    initial={{ y: 120, opacity: 0 }}
                    animate={animations.parallaxControls}
                    transition={{ delay: 0.1 }}
                  >
                    <Image
                      src="/images/dog/dogs-4.png"
                      alt="Defi dogs 4"
                      width={425}
                      height={425}
                      style={{ objectFit: "contain" }}
                      unoptimized={true}
                    />
                  </motion.div>

                  {/* Ảnh 5 */}
                  <motion.div
                    className="absolute bottom-0 z-20"
                    style={{ right: isMobile ? '7%' : '11%', width: isMobile ? '20%' : '20%', y: animations.transforms.y2 }}
                    initial={{ y: 120, opacity: 0 }}
                    animate={animations.parallaxControls}
                    transition={{ delay: 0.1 }}
                  >
                    <Image
                      src="/images/dog/dogs-5.png"
                      alt="Defi dogs 5"
                      width={280}
                      height={280}
                      style={{ objectFit: "contain" }}
                      unoptimized={true}
                    />
                  </motion.div>

                  {/* Ảnh 6 */}
                  <motion.div
                    className="absolute bottom-0 z-10"
                    style={{ right: isMobile ? '1%' : '5%', width: isMobile ? '18%' : '16%', y: animations.transforms.y1 }}
                    initial={{ y: 120, opacity: 0 }}
                    animate={animations.parallaxControls}
                    transition={{ delay: 0.1 }}
                  >
                    <Image
                      src="/images/dog/dogs-6.png"
                      alt="Defi dogs 6"
                      width={270}
                      height={270}
                      style={{ objectFit: "contain" }}
                      unoptimized={true}
                    />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="max-w-[80%] mx-auto grid grid-rows-[auto_auto] grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-4 rounded-xl lg:rounded-3xl w-full">
              {/* Cột 1 */}
              <motion.div
                ref={animations.refs.ref1}
                initial="hidden"
                animate={animations.jumpControls[1]}
                variants={VARIANTS.left}
                className="relative row-span-3 lg:row-span-2 bg-[#666aa5] h-full rounded-xl lg:rounded-3xl overflow-hidden"
                style={{
                  boxShadow: `${isMobile ? 'inset -6px 0 4px rgba(77, 80, 125, 0.5), inset 0 -6px 4px rgba(77, 80, 125, 0.5)' : 'inset -10px 0 4px rgba(77, 80, 125, 0.5), inset 0 -10px 4px rgba(77, 80, 125, 0.5)'}`
                }}
              >
                <div className="relative z-10 flex flex-col items-center h-full py-2">
                  <p className="uppercase text-white text-[18px] lg:text-[42px] font-secondary font-bold mb-6 lg:mb-10">PACK</p>
                  <p className="uppercase text-[16px] lg:text-[42px] font-secondary">{UI_CONFIG.MAX_SUPPLY}</p>
                  <p className="uppercase text-[16px] lg:text-[42px] font-secondary">NFT</p>
                </div>
                <div className="absolute overflow-hidden bottom-[-6px] right-[-68px]">
                  <Image
                    src="/images/dog/dogs-1.png"
                    alt="Defi dogs 1"
                    width={240}
                    height={240}
                    style={{ objectFit: "contain" }}
                    unoptimized={true}
                  />
                </div>
              </motion.div>

              {/* Hàng 1 */}
              {/* Khối 1 */}
              <motion.div
                ref={animations.refs.ref2}
                initial="hidden"
                animate={animations.jumpControls[1]}
                variants={VARIANTS.topRight}
                className="relative row-start-2 lg:row-start-1 col-start-2 col-span-2 bg-white h-[100px] lg:h-[200px] rounded-xl lg:rounded-3xl overflow-hidden"
                style={{
                  boxShadow: `${isMobile ? 'inset -6px 0 4px rgba(200, 200, 200, 0.4), inset 0 -6px 4px rgba(200, 200, 200, 0.4)' : 'inset -10px 0 4px rgba(200, 200, 200, 0.4), inset 0 -10px 4px rgba(200, 200, 200, 0.4)'}`
                }}
              >
                <div className="relative z-10 flex flex-col items-start h-full px-2 lg:px-4 py-2">
                  <p className="uppercase text-[18px] lg:text-[42px] font-secondary font-bold mb-2 lg:mb-6">BUYER LIMIT</p>
                  <p className="text-[14px] lg:text-[28px] text-[#003fdd] font-secondary">Max {UI_CONFIG.MAX_TRANSACTION} NFT/{isMobile ? "Txn" : "Transaction"}</p>
                  <p className="text-[14px] lg:text-[28px] text-[#003fdd] font-secondary">Max {UI_CONFIG.MAX_BUYER_LIMIT} NFT/Wallet</p>
                </div>
                <div className="absolute overflow-hidden bottom-0 right-0 lg:right-[10px]">
                  <Image
                    src="/images/section/sectionBlue.png"
                    alt="Section Blue"
                    width={isMobile ? 60 : 120}
                    height={isMobile ? 60 : 120}
                    style={{ objectFit: "contain" }}
                    unoptimized={true}
                  />
                </div>
              </motion.div>

              {/* Khối 2 */}
              <motion.div
                ref={animations.refs.ref3}
                initial="hidden"
                animate={animations.jumpControls[2]}
                variants={VARIANTS.right}
                className="relative lg:col-start-4 bg-[#2b2d33] h-[100px] lg:h-[200px] rounded-xl lg:rounded-3xl overflow-hidden"
                style={{
                  boxShadow: `${isMobile ? 'inset -6px 0 4px rgba(21, 22, 25, 0.5), inset 0 -6px 4px rgba(21, 22, 25, 0.5)' : 'inset -10px 0 4px rgba(21, 22, 25, 0.5), inset 0 -10px 4px rgba(21, 22, 25, 0.5)'}`
                }}
              >
                <div className="relative z-10 flex flex-col items-start h-full px-2 lg:px-4 py-2">
                  <p className="uppercase text-[18px] text-white lg:text-[42px] font-secondary font-bold mb-2 lg:mb-6">Wallet</p>
                  <ul className="flex flex-col">
                    {UI_CONFIG.LIST_WALLET.map((item, index) => (
                      <li key={index} className="text-[16px] lg:text-[28px] text-white font-secondary font-light leading-[18px] lg:leading-[28px] capitalize">{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="absolute overflow-hidden top-[-20px] lg:top-[-40px] right-[-10px] lg:right-[-25px]">
                  <Image
                    src="/images/section/sectionOrange.png"
                    alt="Section Orange"
                    width={isMobile ? 50 : 120}
                    height={isMobile ? 50 : 120}
                    style={{ objectFit: "contain" }}
                    unoptimized={true}
                  />
                </div>
              </motion.div>

              {/* Khối 3 */}
              <motion.div
                ref={animations.refs.ref4}
                initial="hidden"
                animate={animations.jumpControls[3]}
                variants={VARIANTS.bottomLeft}
                className="relative lg:col-start-5 bg-[#666aa5] h-[100px] lg:h-[200px] rounded-xl lg:rounded-3xl overflow-hidden"
                style={{
                  boxShadow: `${isMobile ? 'inset -6px 0 4px rgba(77, 80, 125, 0.5), inset 0 -6px 4px rgba(77, 80, 125, 0.5)' : 'inset -10px 0 4px rgba(77, 80, 125, 0.5), inset 0 -10px 4px rgba(77, 80, 125, 0.5)'}`
                }}

              >
                <div className="relative z-10 flex flex-col items-center h-full py-4 lg:py-2">
                  <p className="uppercase text-white text-[18px] lg:text-[42px] font-secondary lg:font-bold">DEFI DOGS</p>
                </div>
                <div className="absolute overflow-hidden bottom-[-10px] right-[20%] lg:right-0 left-0 mx-auto translate-x-[20%]">
                  <Image
                    src="/images/dog/dogs-2.png"
                    alt="Section Blue"
                    width={isMobile ? 60 : 130}
                    height={isMobile ? 60 : 130}
                    style={{ objectFit: "contain", transform: isMobile ? "scaleX(-1)" : "scaleX(-1)" }}
                    // className="w-full h-auto object-contain origin-bottom transform scale-x-[-1]"
                    unoptimized={true}
                  />
                </div>
              </motion.div>

              {/* Hàng 2 */}
              {/* Khối 4 */}
              <motion.div
                ref={animations.refs.ref5}
                initial="hidden"
                animate={animations.jumpControls[4]}
                variants={VARIANTS.bottom}

                className="relative row-start-4 lg:row-start-2 col-start-1 lg:col-start-2 bg-[#2b2d33] h-[100px] lg:h-[300px] rounded-xl lg:rounded-3xl overflow-hidden"
                style={{
                  boxShadow: `${isMobile ? 'inset -6px 0 4px rgba(21, 22, 25, 0.5), inset 0 -6px 4px rgba(21, 22, 25, 0.5)' : 'inset -10px 0 4px rgba(21, 22, 25, 0.5), inset 0 -10px 4px rgba(21, 22, 25, 0.5)'}`
                }}
              >
                <div className="relative z-10 flex flex-col items-center justify-start h-full px-4 pt-2 lg:pt-4 lg:gap-10">
                  <p className="uppercase text-white text-[20px] lg:text-[42px] font-secondary font-bold">ELEMENT</p>
                  <p className="text-[16px] lg:text-[42px] text-white font-secondary">{UI_CONFIG.ELEMENT_PROJECT}</p>
                </div>
                <div className="absolute overflow-hidden bottom-0 lg:bottom-[-6px] left-0 lg:left-[-6px]">
                  <Image
                    src="/images/section/sectionOriginal.png"
                    alt="Section Original"
                    width={isMobile ? 50 : 120}
                    height={isMobile ? 50 : 120}
                    style={{ objectFit: "contain", transform: isMobile ? "scaleY(-1)" : "scaleY(-1)" }}
                    unoptimized={true}
                  />
                </div>
              </motion.div>

              {/* Khối 5 */}
              <motion.div
                ref={animations.refs.ref6}
                initial="hidden"
                animate={animations.jumpControls[5]}
                variants={VARIANTS.right}
                className="relative col-start-2 lg:col-start-3 col-span-2 bg-[#3947eb] h-[100px] lg:h-[300px] rounded-xl lg:rounded-3xl overflow-hidden"
                style={{
                  boxShadow: `${isMobile ? 'inset -6px 0 4px rgba(28, 35, 180, 0.5), inset 0 -6px 4px rgba(28, 35, 180, 0.5)' : 'inset -10px 0 4px rgba(28, 35, 180, 0.5), inset 0 -10px 4px rgba(28, 35, 180, 0.5)'}`
                }}
              >
                <div className="relative h-full z-10 flex flex-col items-start justify-start lg:justify-start px-2 lg:px-4 py-2 lg:py-4 lg:gap-20">
                  <p className="text-white text-center text-[18px] lg:text-[42px] font-secondary font-bold">2nd COLLECTION</p>
                  <p className="text-[16px] text-center lg:text-[42px] text-yellow-300 font-secondary">Legends Edition</p>
                </div>
                <div className="absolute overflow-hidden bottom-0 right-[-20px] lg:right-[-40px]">
                  <Image
                    src="/images/dog/dogs-5.png"
                    alt="Section Blue"
                    width={isMobile ? 80 : 220}
                    height={isMobile ? 80 : 220}
                    style={{ objectFit: "contain", transform: isMobile ? "scaleX(-1)" : "scaleX(-1)" }}
                    unoptimized={true}
                  />
                </div>
              </motion.div>

              {/* Khối 6 */}
              <motion.div
                ref={animations.refs.ref6}
                initial="hidden"
                animate={animations.jumpControls[6]}
                variants={{
                  hidden: { y: -100, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      type: "spring",
                      stiffness: 80,
                      damping: 10,
                      mass: 0.5,
                      delay: 0.2 // Thêm độ trễ
                    }
                  }
                }}
                className="relative col-span-2 lg:col-span-1 lg:col-start-5 bg-white h-[100px] lg:h-[300px] rounded-xl lg:rounded-3xl overflow-hidden"
                style={{
                  boxShadow: `${isMobile ? 'inset -6px 0 4px rgba(200, 200, 200, 0.4), inset 0 -6px 4px rgba(200, 200, 200, 0.4)' : 'inset -10px 0 4px rgba(200, 200, 200, 0.4), inset 0 -10px 4px rgba(200, 200, 200, 0.4)'}`
                }}
              >
                <div className="relative h-full z-10 flex flex-col items-start justify-start px-2 lg:px-4 py-2 lg:py-4 gap-2 lg:gap-20">
                  <p className="text-center text-[18px] lg:text-[42px] font-secondary font-bold">PRICE</p>
                  <p className="text-[16px] lg:text-[32px] text-center font-secondary">
                    {WEB3_CONFIG.MINT_PRICE}
                    &nbsp;
                    {WEB3_CONFIG.CHAIN_SYMBOL}
                  </p>
                </div>
                <div className="absolute overflow-hidden top-[10px] lg:top-[20px] right-0 lg:right-[10px]">
                  <Image
                    src="/images/section/ethereum.png"
                    alt="Section Ethereum"
                    width={isMobile ? 50 : 80}
                    height={isMobile ? 50 : 80}
                    style={{ objectFit: "contain" }}
                    unoptimized={true}
                  />
                </div>
              </motion.div>
            </div>

            {/* Section 3 */}
            <div className="relative w-full h-[980px] bg-[url('/images/bg-mobile.webp')] lg:bg-[url('/images/bg-section.webp')] bg-center bg-no-repeat bg-cover mx-auto mt-[100px]">
              <div className="relative max-w-[80%] mx-auto translate-y-1/2 lg:translate-y-3/4 w-full overflow-hidden">
                <div className="max-w-full w-full flex lg:justify-left gap-2 lg:gap-3">

                  <div className="relative w-1/2 lg:w-auto lg:min-w-[300px] h-[200px] lg:h-[360px] mt-4 rounded-lg lg:rounded-2xl bg-[#2b252b] shadow-lg overflow-hidden border-t border-l border-r-2 border-b-2 lg:border-t-2 lg:border-l-2 lg:border-r-4 lg:border-b-4 border-black" data-aos="fade-up" data-aos-delay="400" data-aos-duration="1000"  >
                    <div className="relative z-10 flex flex-col items-center h-full p-2 lg:py-4 px-4 lh:px-8">
                      <p className="uppercase text-[20px] text-white lg:text-[32px] font-secondary font-bold mb-4 lg:mb-10">ELEMENTS</p>
                      <ul>
                        {UI_CONFIG.LIST_ELEMENTS.map((item, index) => (
                          <li key={index} className="text-[16px] lg:text-[28px] text-white font-secondary font-light leading-[20px] lg:leading-[28px] capitalize lg:mb-1">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="absolute overflow-hidden bottom-[-80px] right-[-40px] lg:right-[-80px]">
                      <Image
                        src="/images/section/sun.png"
                        alt="The Sun"
                        width={isMobile ? 160 : 240}
                        height={isMobile ? 160 : 240}
                        style={{ objectFit: "contain" }}
                        unoptimized={true}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 lg:gap-3 h-[200px] lg:h-[360px]">
                    <div className="flex flex-col gap-2 lg:gap-3 w-1/2 lg:w-[150px]">
                      <div className="relative w-full h-[200px] rounded-lg lg:rounded-2xl bg-[#2b252b] shadow-lg overflow-hidden border-t border-l border-r-2 border-b-2 lg:border-t-2 lg:border-l-2 lg:border-r-4 lg:border-b-4 border-black" data-aos="fade-up" data-aos-delay="400" data-aos-duration="1000"  >
                        <div className="relative z-10 flex flex-col items-center justify-start h-full p-2 lg:p-4 gap-2 lg:gap-4">
                          <p className="uppercase text-[18px] text-white lg:text-[32px] font-secondary font-bold">CHAIN</p>
                          <p className="text-[16px] text-center lg:text-[28px] text-white font-secondary font-light lg:leading-[28px] capitalize">
                            {UI_CONFIG.CHAIN_NAME}
                          </p>
                        </div>
                        <div className="absolute overflow-hidden top-[-24px] right-[-15px]">
                          <Image
                            src="/images/section/base.png"
                            alt="The Base"
                            width={isMobile ? 60 : 80}
                            height={isMobile ? 60 : 80}
                            style={{ objectFit: "contain" }}
                            unoptimized={true}
                          />
                        </div>
                      </div>

                      <div className="relative w-full h-[200px] rounded-lg lg:rounded-2xl bg-[#2b252b] shadow-lg overflow-hidden border-t border-l border-r-2 border-b-2 lg:border-t-2 lg:border-l-2 lg:border-r-4 lg:border-b-4 border-black" data-aos="fade-up" data-aos-delay="400" data-aos-duration="1000"  >
                        <div className="relative z-10 flex flex-col items-center h-full p-2 lg:p-4 gap-2 lg:gap-4">
                          <p className="uppercase text-[18px] text-white lg:text-[32px] font-secondary font-bold">SUPPLY</p>
                          <p className="text-[16px] text-center lg:text-[28px] text-white font-secondary font-light lg:leading-[28px] capitalize">
                            {UI_CONFIG.MAX_SUPPLY}
                          </p>
                        </div>
                        <div className="absolute overflow-hidden bottom-[-20px] lg:bottom-[-100px] lg:right-[-200px]">
                          <Image
                            src="/images/section/fire.png"
                            alt="The Fire"
                            width={isMobile ? 260 : 380}
                            height={isMobile ? 260 : 380}
                            style={{ objectFit: "contain" }}
                            unoptimized={true}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:gap-3 w-1/2 lg:w-[150px] -mb-4 mt-4">
                      <div className="relative w-full h-[200px] rounded-lg lg:rounded-2xl bg-[#2b252b] shadow-lg overflow-hidden border-t border-l border-r-2 border-b-2 lg:border-t-2 lg:border-l-2 lg:border-r-4 lg:border-b-4 border-black" data-aos="fade-up" data-aos-delay="400" data-aos-duration="1000"  >
                        <div className="relative z-10 flex flex-col items-center justify-start h-full p-2 lg:p-4 gap-2 lg:gap-4">
                          <p className="uppercase text-[18px] text-white lg:text-[32px] font-secondary font-bold">TRAITS</p>
                          <p className="text-[16px] text-center lg:text-[28px] text-white font-secondary font-light lg:leading-[28px] capitalize">
                            {UI_CONFIG.TRAITS}
                          </p>
                        </div>
                        <div className="absolute overflow-hidden bottom-[-20px] lg:bottom-[-40px] right-[-30px] lg:right-[-40px]">
                          <Image
                            src="/images/section/moon.png"
                            alt="The Moon"
                            width={isMobile ? 70 : 140}
                            height={isMobile ? 70 : 140}
                            style={{ objectFit: "contain" }}
                            unoptimized={true}
                          />
                        </div>
                        <div className="absolute overflow-hidden bottom-[-10px] lg:bottom-[-20px] left-[-20px]">
                          <Image
                            src="/images/section/cloud.png"
                            alt="The Moon"
                            width={isMobile ? 80 : 140}
                            height={isMobile ? 80 : 140}
                            style={{ objectFit: "contain" }}
                            unoptimized={true}
                          />
                        </div>
                      </div>

                      <div className="relative w-full h-[200px] rounded-lg lg:rounded-2xl bg-[#2b252b] shadow-lg overflow-hidden border-t border-l border-r-2 border-b-2 lg:border-t-2 lg:border-l-2 lg:border-r-4 lg:border-b-4 border-black" data-aos="fade-up" data-aos-delay="400" data-aos-duration="1000"  >
                        <div className="relative z-10 flex flex-col items-center h-full p-2 lg:p-4 gap-2">
                          <p className="uppercase text-[18px] text-white lg:text-[32px] font-secondary font-bold">UNIQUE</p>
                          <p className="text-[16px] text-center lg:text-[28px] text-white font-secondary font-light lg:leading-[28px] capitalize">
                            {UI_CONFIG.UNIQUE}
                          </p>
                        </div>
                        <div className="absolute overflow-hidden bottom-[-80px] lg:bottom-[-120px] left-[-180px] lg:left-[-200px]">
                          <Image
                            src="/images/section/fire.png"
                            alt="The Fire"
                            width={isMobile ? 300 : 380}
                            height={isMobile ? 300 : 380}
                            style={{ objectFit: "contain" }}
                            unoptimized={true}
                          />
                        </div>
                        <div className="absolute overflow-hidden bottom-0 lg:bottom-[0px] left-0 right-0 mx-auto translate-x-[20%]">
                          <Image
                            src="/images/section/safemoon.png"
                            alt="The Safe Moon"
                            width={isMobile ? 25 : 50}
                            height={isMobile ? 25 : 50}
                            style={{ objectFit: "contain" }}
                            unoptimized={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </main>

          {/* Footer */}
          {/* <footer className="bg-black/20 backdrop-blur-md border-t border-purple-500/20 mt-auto relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">DefidoNFT</span>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Discord</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">OpenSea</a>
              </div>
            </div>
            <div className="border-t border-purple-500/20 mt-6 pt-6 text-center">
              <p className="text-gray-400 text-sm">© 2025 DefidoNFT. All rights reserved.</p>
            </div>
          </div>
        </footer> */}
        </div >

        {/* Loading screen, waiting for something */}
        {/* < div
          className={`section-loading-screen fixed z-[10000] top-0 left-0 overflow-hidden transition-opacity ${loadingScreen === true
            ? "duration-300 w-full h-full opacity-100"
            : "duration-[0ms] w-0 h-0 opacity-0"
            }`
          }
        >
          <div className="relative w-full h-full bg-[#000000]/80 flex flex-col items-center justify-center">
            <div className="relative w-[32px] h-[32px] animate-spin select-none mb-[24px]">
              <Image
                src="/images/loading.png"
                layout="fill"
                objectFit="contain"
                alt="Icon Loading"
                priority
              /> 
            </div>
            <div className="text-center">
              <span className="text-white">{loadingScreenMessage}</span>
            </div>
          </div>
        </div > */}

        {/* Popup Something Went Wrong */}
        < div
          className={`absolute z-[999] top-0 left-0 overflow-hidden bg-[#000000]/80 transition-opacity ease-in-out duration-300 ${isPopupSomethingWentWrong
            ? "w-screen h-screen opacity-100"
            : "w-0 h-0 opacity-0"
            }`}
        >
          <SomethingWentWrongPopup
            triggerParentUpdate={setIsPopupSomethingWentWrong}
          />
        </div >
        {/* Popup Welcome */}
        < div
          className={`absolute z-[999] top-0 left-0 overflow-hidden bg-[#000000]/80 transition-opacity ease-in-out duration-300 ${isPopupWelcome ? "w-screen h-screen opacity-100" : "w-0 h-0 opacity-0"
            }`}
        >
          <WelcomePopup
            triggerParentUpdate={setIsPopupWelcome}
            triggerMintNFT={() => mintNFT()}
          />
        </div >
        {/* Popup Mint Success */}
        {/* <div
        className={`absolute z-[999] top-0 left-0 overflow-hidden bg-[#000000]/80 transition-opacity ease-in-out duration-300 ${isPopupMintSuccess
          ? "w-screen h-screen opacity-100"
          : "w-0 h-0 opacity-0"
          }`}
      >
        <MintSuccessPopup triggerParentUpdate={setIsPopupMintSuccess} />
      </div> */}
        {/* Popup Mint Limit Reached */}
        {/* <div
        className={`absolute z-[999] top-0 left-0 overflow-hidden bg-[#000000]/80 transition-opacity ease-in-out duration-300 ${isPopupMintLimitReached
          ? "w-screen h-screen opacity-100"
          : "w-0 h-0 opacity-0"
          }`}
      >
        <MintLimitReachedPopup
          triggerParentUpdate={setIsPopupMintLimitReached}
        />
      </div> */}
        {/* Popup You're Not In Whitelist */}
        {/* <div
        className={`absolute z-[999] top-0 left-0 overflow-hidden bg-[#000000]/80 transition-opacity ease-in-out duration-300 ${isPopupNotInWhitelist
          ? "w-screen h-screen opacity-100"
          : "w-0 h-0 opacity-0"
          }`}
      >
        <InformationPopup
          triggerParentUpdate={setIsPopupNotInWhitelist}
          title="Ooops!"
          message="You're not in whitelist"
        />
      </div> */}
        {/* Popup Mint Has Not Started Yet */}
        {/* <div
        className={`absolute z-[999] top-0 left-0 overflow-hidden bg-[#000000]/80 transition-opacity ease-in-out duration-300 ${isPopupMintHasNotStarted
          ? "w-screen h-screen opacity-100"
          : "w-0 h-0 opacity-0"
          }`}
      >
        <InformationPopup
          triggerParentUpdate={setIsPopupMintHasNotStarted}
          title="Ooops!"
          message="Mint hasn't started yet"
        />
      </div> */}
      </div >
    </>
  );
}
