import NotificationStore from './store.js'
import Notifications from './components/Notifications.vue'

export default function install (Vue) {
  var notifications = new NotificationStore()
  Object.defineProperty(Vue.prototype, '$notifications', {
    get: function get () { return notifications }
  })
  Vue.component('Notifications', Notifications)
}
