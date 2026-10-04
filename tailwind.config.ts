import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1.25rem", md: "2rem", xl: "3rem" }, screens: { "2xl": "1440px" } },
    extend: {
      colors: {
        ink: "#171717",
        ivory: "#F5F2EC",
        gold: { DEFAULT: "#B79B74", dark: "#8C7350" },
        mist: "#F7F6F3",
        muted: { DEFAULT: "#777777", foreground: "#777777" },
        line: "#E8E5DF",
        success: "#2F6B4F",
        danger: "#A1352B",
        border: "#E8E5DF",
        input: "#E8E5DF",
        ring: "#B79B74",
        background: "#FFFFFF",
        foreground: "#171717",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: { none: "0", sm: "2px", DEFAULT: "2px", md: "3px", lg: "4px" },
      letterSpacing: { label: "0.04em" },
      maxWidth: { prose: "68ch" },
    },
  },
  plugins: [animate],
};
export default config;
