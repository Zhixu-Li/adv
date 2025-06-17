// import Login from './components/Login.vue'
// import Register from './components/Register.vue'
// import Auth from './main.js'

// export default function install (Vue, options) {
//   let auth = new Auth(Vue, options)
//   let router = options.router

//   Object.defineProperty(Vue.prototype, '$auth', {
//     get: function get () { return auth },
//   })

//   Vue.component(Login)
//   Vue.component(Register)

//   router.beforeEach(
//     (to, from, next) => {
//       if (to.matched.some(record => record.meta.admin)) {
//         if (!auth.user.admin) {
//           next({
//             path: '/',
//             query: { redirect: to.fullPath }
//           })
//         }
//       }

//       if (to.matched.some(record => record.meta.auth)) {
//         if (!auth.user.authenticated) {
//           next({
//             path: '/login',
//             query: { redirect: to.fullPath }
//           })
//         }
//       }
//       next()
//     }
//   )

//   Vue.prototype.$axios.interceptors.request.use(
//     (request) => {
//       if (!request.url.includes(process.env.VUE_APP_NETWORK_ENDPOINT)) {
//         request.headers.common['Application-Token'] = process.env.VUE_APP_APPLICATION_TOKEN
//         if (request.url !== 'auth/refresh' && request.url !== 'auth/authorise' && request.url !== 'auth/register' && request.url !== 'auth/resetPassword') {
//           if (auth.user.tokenExpired()) {
//             auth.refresh(false).then(
//               () => {
//                 request.headers.common['Authorization'] = auth.getAuthHeader()
//                 return request
//               }
//             ).catch(
//               () => {
//                 auth.logout('/')
//               }
//             )
//           } else {
//             if (auth.user.id !== 0) {
//               request.headers.common['Authorization'] = auth.getAuthHeader()
//             }
//             return request
//           }
//         } else {
//           return request
//         }
//       } else {
//         return request
//       }
//     }
//   )

//   // if auth token and refreshtoken are expired on load
//   // remove from storage & clear the user
//   // else attempt to refresh the access token
//   if (auth.user.tokenExpired() && auth.user.refreshTokenExpired()) {
//     auth.logout()
//   } else if (!auth.user.refreshTokenExpired()) {
//     auth.refresh(true).then(
//       () => {
//       }
//     ).catch(
//       () => {
//         auth.logout('/')
//       }
//     )
//   }
// }


// src/lib/auth/auth.js
import Login    from './components/Login.vue'
import Register from './components/Register.vue'
import Auth     from './main.js'      // ← your Auth class

export default {
  install(app, options) {
    const { router } = options
    console.log('[AuthPlugin] install() →', { router })

    // 1) Grab the same axios instance you put on globalProperties in main.js
    const http = app.config.globalProperties.$axios
    if (!http) {
      throw new Error(
        '[AuthPlugin] $axios not found – ensure you set app.config.globalProperties.$axios BEFORE installing authPlugin'
      )
    }

    // 2) Create and inspect the Auth instance
    const auth = new Auth(app, options)
    console.log(
      '[AuthPlugin] Auth.prototype methods:',
      Object.getOwnPropertyNames(Object.getPrototypeOf(auth))
    )

    // 3) Register $auth
    app.config.globalProperties.$auth = auth
    app.provide('auth', auth)

    // 4) Register Login/Register components
    app.component('Login', Login)
    app.component('Register', Register)

    // 5) Route guards
    if (router) {
      router.beforeEach((to, from, next) => {
        if (to.meta.admin && !(auth.user?.admin)) {
          return next({ path: '/', query: { redirect: to.fullPath } })
        }
        if (to.meta.auth && !(auth.user?.authenticated)) {
          return next({ path: '/login', query: { redirect: to.fullPath } })
        }
        next()
      })
    }

    // 6) HTTP request interceptor: Application-Token + Bearer token
    http.interceptors.request.use(async (request) => {
      // always include your App token
      request.headers['Application-Token'] = process.env.VUE_APP_APPLICATION_TOKEN

      // skip auth on these endpoints
      const skip = [
        '/auth/refresh',
        '/auth/authorise',
        '/auth/register',
        '/auth/resetPassword'
      ]
      if (!skip.some(p => request.url.includes(p))) {
        // if access token expired, refresh it
        if (auth.user.tokenExpired()) {
          try {
            await auth.refresh(false)
          } catch {
            auth.logout('/')
            // prevent the original request from going out
            return Promise.reject(new Error('Session expired'))
          }
        }
        // attach Bearer header
        if (auth.user.id) {
          request.headers['Authorization'] = auth.getAuthHeader()
        }
      }

      return request
    })

    // 7) On app boot, if tokens are stale, log out or refresh
    if (auth.user.tokenExpired() && auth.user.refreshTokenExpired()) {
      auth.logout()
    } else if (!auth.user.refreshTokenExpired()) {
      auth.refresh(true).catch(() => auth.logout('/'))
    }
  }
}
