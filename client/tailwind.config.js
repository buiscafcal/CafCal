export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00A86B',
        'primary-light': '#98FF98',
        accent: '#FF8C42',
        'dark-gray': '#333333',
        'light-gray': '#F5F5F5',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};