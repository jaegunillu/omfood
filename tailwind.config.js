/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'pretendard': ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  safelist: [
    // CONTACT 페이지 핵심 유틸 (누락 방지)
    'min-h-screen','bg-[#FAF6F0]','bg-[#fdf8f3]',
    'text-5xl','text-3xl','text-lg','font-extrabold',
    'rounded-2xl','shadow-lg','p-16','mt-8','mb-12',
    'grid','grid-cols-2','gap-6','w-full','max-w-4xl',
    'border','border-gray-200','border-gray-300',
    'px-4','py-3','text-sm','focus:border-[#E5002B]',
    'focus:ring-2','focus:ring-[#E5002B]','text-right',
    'flex','flex-col','items-center','justify-start',
    'py-12','mt-[120px]','text-center','mb-6','mb-10',
    'max-w-3xl','mx-auto','leading-relaxed','gap-6',
    'mb-2','text-gray-700','font-semibold','relative',
    'appearance-none','WebkitAppearance-none','MozAppearance-none',
    'pointer-events-none','text-xs','text-red-500','mt-1',
    'min-h-[120px]','resize-none','mt-2','text-gray-400',
    'flex-1','cursor-pointer','underline','hover:text-[#C4002B]',
    'transition-colors','bg-gray-50','max-h-48','overflow-y-auto',
    'disabled:opacity-50','disabled:cursor-not-allowed','font-semibold',
    'text-base','transition-colors','duration-200','mt-6',
    'mt-16','max-w-6xl','h-48','border-gray-200','rounded-2xl',
    'p-6','bg-white','shadow','font-pretendard','text-[#E5002B]',
    'mt-2','text-base','text-center','mt-1','text-[#5a3723]',
    'break-words','whitespace-pre-line'
  ],
  plugins: [],
} 