export const VARIANTS = {
    // Bay từ bên trái vào
    left: {
      hidden: { x: -100, opacity: 0 },
      visible: {
        x: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 80,
          damping: 10,
          mass: 0.5
        }
      }
    },
    // Bay từ bên phải vào
    right: {
      hidden: { x: 100, opacity: 0 },
      visible: {
        x: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 80,
          damping: 10,
          mass: 0.5
        }
      }
    },
    // Bay từ trên xuống
    top: {
      hidden: { y: -100, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 80,
          damping: 10,
          mass: 0.5
        }
      }
    },
    // Bay từ dưới lên
    bottom: {
      hidden: { y: 100, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 80,
          damping: 10,
          mass: 0.5
        }
      }
    },
    // Bay từ góc trên bên phải
    topRight: {
      hidden: { x: 100, y: -100, opacity: 0 },
      visible: {
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 70,
          damping: 10,
          mass: 0.5
        }
      }
    },
    // Bay từ góc dưới bên trái
    bottomLeft: {
      hidden: { x: -100, y: 100, opacity: 0 },
      visible: {
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 70,
          damping: 10,
          mass: 0.5
        }
      }
    }
  };