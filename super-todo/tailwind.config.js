/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['MiSans', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#667eea",
          foreground: "#ffffff",
          gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom design colors
        text: {
          main: "#2d3748",
          sub: "#718096",
        },
        prio: {
          high: "#ff6b6b",
          med: "#ffa500",
          low: "#51cf66",
        },
        success: "#20c997",
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'stat-total': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'stat-pending': 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        'stat-done': 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
        'stat-rate': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      },
      boxShadow: {
        'soft': '0 10px 40px rgba(0, 0, 0, 0.08)',
        'hover': '0 20px 50px rgba(102, 126, 234, 0.2)',
        'card': '0 4px 6px rgba(0,0,0,0.02)',
        'card-hover': '0 20px 40px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
