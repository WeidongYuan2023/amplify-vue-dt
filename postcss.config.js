export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-pxtorem': {
      rootValue: 16, // 根元素字体大小
      propList: ['*'], // 需要转换的属性，这里表示全部
      unitPrecision: 5, // 转换后的小数点位数
      selectorBlackList: [], // 忽略的选择器
      replace: true,
      mediaQuery: false, // 是否转换媒体查询中的px
      minPixelValue: 0, // 小于该值的px单位不转换
    },
  },
}
