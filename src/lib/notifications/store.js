const state = []

// function Store (Vue, options) {
function Store () {

}

Store.prototype.state = state

Store.prototype.add = function (notification) {
  var exists = this.state.some(function(notification) {
    return notification.value === this.notification.value
  });
  if (!exists) {
    this.state.push(notification)
  }
}

Store.prototype.remove = function (notification) {
  this.state.splice(this.state.findIndex((element) => {
    return element === notification
  }), 1)
}

export default Store
