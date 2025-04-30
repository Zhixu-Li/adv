// import _ from 'lodash'
// // var _Vue
// // var options

// // function Cart (Vue, options) {
// function Cart () {
//     // _Vue = Vue
//   // _options = options
// }

// Cart.prototype.store = []

// Cart.prototype.add = function (booking) {
//   // only insert unique bookings
//   let stored = _.find(this.store, function (element) {
//     return _.isEqual(element, booking)
//   })

//   if (stored == null) {
//     this.store.push(booking)
//     return true
//   } else {
//     return false
//   }
// }

// Cart.prototype.remove = function (booking) {
//   this.store.splice(this.store.findIndex((element) => {
//     return element === booking
//   }), 1)
// }

// export default Cart




//Above is the vue 2 version of cart.js





import _ from 'lodash'

class Cart {
  constructor() {
    this.store = []
  }

  add(booking) {
    let stored = _.find(this.store, (element) => _.isEqual(element, booking))
    if (stored == null) {
      this.store.push(booking)
      return true
    } else {
      return false
    }
  }

  remove(booking) {
    const index = this.store.findIndex((element) => element === booking)
    if (index !== -1) {
      this.store.splice(index, 1)
    }
  }
}

// Vue 3 plugin wrapper
export default {
  install(app) {
    app.config.globalProperties.$cart = new Cart()
  }
}
