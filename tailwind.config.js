/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src-vue/**/*.{vue,js,ts,jsx,tsx}",
    "./vue-app/**/*.{html,vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        /* Element Plus 主题色系 */
        primary: {
          DEFAULT: "#4D70FF",
          50: "#FAFBFF",
          100: "#F0F3FF",
          200: "#E5EAFF",
          300: "#C6D1FF",
          400: "#A6B8FF",
          500: "#4D70FF",
          600: "#3A5AD9",
          700: "#2A44B3",
          800: "#1A2E8D",
          900: "#0A1866",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#67C23A",
          light: "#E1F3D8",
          lighter: "#F0F9EB",
          dark: "#529B2E",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#E6A23C",
          light: "#F5DAB1",
          lighter: "#FAF6EC",
          dark: "#B88230",
          foreground: "#FFFFFF",
        },
        danger: {
          DEFAULT: "#F56C6C",
          light: "#FBC4C4",
          lighter: "#FEF0F0",
          dark: "#C85858",
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT: "#909399",
          light: "#E9E9EB",
          lighter: "#F4F4F5",
          dark: "#73767A",
          foreground: "#FFFFFF",
        },
        /* 背景和文字 - 直接使用颜色值 */
        background: "#FFFFFF",
        "background-page": "#F2F3F5",
        foreground: "#303133",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#303133",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#303133",
        },
        /* 文字色系 */
        "text-primary": "#303133",
        "text-regular": "#606266",
        "text-secondary": "#909399",
        "text-placeholder": "#A8ABB2",
        "text-disabled": "#C0C4CC",
        /* 边框色系 */
        border: {
          DEFAULT: "#DCDFE6",
          light: "#E4E7ED",
          lighter: "#EBEEF5",
          dark: "#D4D7DE",
          darker: "#CDD0D6",
        },
        /* 填充色系 */
        fill: {
          DEFAULT: "#F0F2F5",
          light: "#F5F7FA",
          lighter: "#FAFAFA",
          dark: "#EBEDF0",
          darker: "#E6E8EB",
        },
        ring: "rgba(77, 112, 255, 0.5)",
        chart: {
          1: "#4D70FF",
          2: "#67C23A",
          3: "#E6A23C",
          4: "#F56C6C",
          5: "#909399",
        },
        sidebar: {
          DEFAULT: "#FFFFFF",
          foreground: "#303133",
          primary: "#4D70FF",
          "primary-foreground": "#FFFFFF",
          accent: "#F5F7FA",
          "accent-foreground": "#303133",
          border: "#E4E7ED",
          ring: "rgba(77, 112, 255, 0.5)",
        },
      },
      fontFamily: {
        sans: ["Helvetica Neue", "Helvetica", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", "Arial", "sans-serif"],
      },
      fontSize: {
        "extra-large": ["20px", { lineHeight: "1.5" }],
        "large": ["18px", { lineHeight: "1.5" }],
        "medium": ["16px", { lineHeight: "1.5" }],
        "base": ["14px", { lineHeight: "1.5" }],
        "small": ["13px", { lineHeight: "1.5" }],
        "extra-small": ["12px", { lineHeight: "1.5" }],
      },
      boxShadow: {
        light: "0px 0px 12px rgba(0, 0, 0, 0.12)",
        DEFAULT: "0px 12px 32px 4px rgba(0, 0, 0, 0.04), 0px 8px 20px rgba(0, 0, 0, 0.08)",
        dark: "0px 16px 48px 16px rgba(0, 0, 0, 0.08), 0px 12px 32px rgba(0, 0, 0, 0.12)",
      },
      transitionDuration: {
        DEFAULT: "300ms",
        fast: "200ms",
      },
    },
  },
  plugins: [],
}
