export const animations = {
  duration: {
    fast: 0.15,
    normal: 0.25,
    slow: 0.4,
  },

  easing: {
    default: "easeOut",
    smooth: "easeInOut",
  },

  hover: {
    scale: 1.02,
    y: -4,
  },

  tap: {
    scale: 0.98,
  },

  fade: {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
    },
  },

  slideUp: {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  },
};