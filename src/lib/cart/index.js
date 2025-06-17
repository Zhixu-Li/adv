import Cart from './src/cart.js'

export default function install (Vue, options) {
  var cart = new Cart(Vue, options)
  Object.defineProperty(Vue.prototype, '$cart', {
    get: function get () { return cart }
  })
}
