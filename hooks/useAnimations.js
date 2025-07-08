import { useEffect } from 'react';
import { useAnimation, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export const useAnimations = () => {
  // Jump controls
  const jumpControls = {
    1: useAnimation(),
    2: useAnimation(),
    3: useAnimation(),
    4: useAnimation(),
    5: useAnimation(),
    6: useAnimation(),
  };

  // Scroll animations
  const { scrollY } = useScroll();
  const parallaxControls = useAnimation();
  
  const transforms = {
    yDefiDog: useTransform(scrollY, [0, 400], [0, -70]),
    y1: useTransform(scrollY, [0, 400], [0, -70]),
    y2: useTransform(scrollY, [0, 400], [0, -60]),
    y3: useTransform(scrollY, [0, 400], [0, -50]),
    yMain: useTransform(scrollY, [0, 400], [0, -40]),
  };

  // InView refs
  const [ref1, inView1] = useInView({ threshold: 0.1, triggerOnce: true });
  const [ref2, inView2] = useInView({ threshold: 0.1, triggerOnce: true });
  const [ref3, inView3] = useInView({ threshold: 0.1, triggerOnce: true });
  const [ref4, inView4] = useInView({ threshold: 0.1, triggerOnce: true });
  const [ref5, inView5] = useInView({ threshold: 0.1, triggerOnce: true });
  const [ref6, inView6] = useInView({ threshold: 0.1, triggerOnce: true });

  const refs = { ref1, ref2, ref3, ref4, ref5, ref6 };
  const inViews = { inView1, inView2, inView3, inView4, inView5, inView6 };

  // Jump-in animation effects
  useEffect(() => {
    if (inView1) jumpControls[1].start("visible");
    if (inView2) jumpControls[2].start("visible");
    if (inView3) jumpControls[3].start("visible");
    if (inView4) jumpControls[4].start("visible");
    if (inView5) jumpControls[5].start("visible");
    if (inView6) jumpControls[6].start("visible");
  }, [inView1, inView2, inView3, inView4, inView5, inView6]);

  // Parallax animation effect
  useEffect(() => {
    parallaxControls.start({
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    });
  }, [parallaxControls]);

  return {
    jumpControls,
    parallaxControls,
    transforms,
    refs,
    inViews,
  };
};