// src/main.js
import { createApp } from 'vue'
import App           from './App.vue'
import router        from './router'

console.log('router:', router)

import { createI18n }          from 'vue-i18n'
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { FaUser, FaHome, FaCog } from 'oh-vue-icons/icons'
import Notifications           from '@kyvg/vue3-notification'
import CartPlugin              from './lib/cart/src/cart.js'
import authPlugin              from './lib/auth/auth.js'

import { BootstrapVueNext, BVModalPlugin } from 'bootstrap-vue-next'
import {createBootstrap} from 'bootstrap-vue-next'


import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'

import VueLazyload      from 'vue-lazyload'
import axios            from 'axios'

import { library }      from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faHome, faQuestionCircle, faTrash, faFaceSmile, faFaceFrown,
  faUser, faSignInAlt, faUserPlus, faGlobe, faCogs,
  faCalendar, faTable, faMap, faFilm, faCodeBranch,
  faShoppingCart, faClipboardList, faStickyNote, faPhotoVideo,
  faDesktop, faArrowCircleLeft, faCloudArrowUp, faArrowRotateRight,
  faCircleXmark, faExpandAlt, faPlay, faCalendarCheck, faCalendarDays,
  faPlus
} from '@fortawesome/free-solid-svg-icons'
import {
  faCcVisa, faCcMastercard, faCcDiscover, faCcApplePay,
  faCcDinersClub, faCcPaypal, faCcAmex, faCcAmazonPay,
  faCcJcb, faCcStripe
} from '@fortawesome/free-brands-svg-icons'

import messages from '@/lang'
import moment   from 'moment'


// i18n Setup
const i18n = createI18n({
  legacy: true,
  globalInjection: true,
  locale: localStorage.getItem('locale') || 'en',
  messages,
})
moment.locale(i18n.global.locale)


// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
})

// FontAwesome setup
library.add(
  faHome, faQuestionCircle, faTrash, faFaceSmile, faFaceFrown,
  faUser, faSignInAlt, faUserPlus, faGlobe, faCogs,
  faCalendar, faTable, faMap, faFilm, faCodeBranch,
  faShoppingCart, faClipboardList, faStickyNote, faPhotoVideo,
  faDesktop, faArrowCircleLeft, faCloudArrowUp, faArrowRotateRight,
  faCircleXmark, faExpandAlt, faPlay, faCalendarCheck, faCalendarDays,
  faPlus,
  faCcVisa, faCcMastercard, faCcDiscover, faCcApplePay,
  faCcDinersClub, faCcPaypal, faCcAmex, faCcAmazonPay,
  faCcJcb, faCcStripe
)

// Create Vue app
const app = createApp(App)
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error]:', err, info);
};
// Global axios instance
window.onerror = function (message, source, lineno, colno, error) {
  console.error('[Global Error]:', message, source, lineno, colno, error);
};
app.config.globalProperties.$axios = axios.create({
  baseURL: process.env.VUE_APP_API_ROOT + '/api'
})
app.config.compatConfig={
  MODE:3
}
// Install plugins
app.use(router)
app.use(createBootstrap())
app.use(BootstrapVueNext)
app.use(BVModalPlugin) // ✅ This fixes injection for BModal
app.use(authPlugin, { router })
app.use(i18n)
app.use(VueLazyload)
app.use(Notifications)
app.use(CartPlugin)
// Register global components
addIcons(FaUser, FaHome, FaCog)
app.component('v-icon', OhVueIcon)
app.component('LMap', LMap)
app.component('LTileLayer', LTileLayer)
app.component('LMarker', LMarker)
app.component('font-awesome-icon', FontAwesomeIcon)


// Mount
app.mount('#app')
const observer = new MutationObserver(() => {
  document.querySelectorAll('.modal-footer').forEach(footer => {
    footer.remove();
  });
});

observer.observe(document.body, { childList: true, subtree: true });