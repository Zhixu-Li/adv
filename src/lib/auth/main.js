// import jwtDecode from 'jwt-decode'
// import User from './user.js'
// import moment from 'moment'

// let _Vue
// let _router
// let user

// function Auth (Vue, options) {
//   _Vue = Vue
//   _router = options.router

//   let accessToken = localStorage.getItem('accessToken')
//   let refreshToken = localStorage.getItem('refreshToken')
//   let teams = JSON.parse(localStorage.getItem('teams'))

//   // will it be a problem if teams is null? should be an empty object
//   if (accessToken !== null && refreshToken !== null && teams !== null) {
//     this.user = new User(accessToken, refreshToken, teams)
//     this.initInterval()
//   } else {
//     this.user = new User()
//   }
// }

// Auth.prototype.user = user

// /**
// *
// * Make POST request to v1/auth/authorise with the users credentials
// * Store the returned tokens and decode them to create the user object
// * then redirect the user to the home page
// *
// */
// Auth.prototype.login = function (context, credentials, redirect) {
//   _Vue.prototype.$axios.post('auth/authorise', credentials).then(
//     (response) => {
//       this.user = new User(response.data.accessToken, response.data.refreshToken, response.data.teams)
//       this.initInterval()
//       context.$bvModal.hide('login')
//       context.$emit('resetTeams')
//       if (redirect) {
//         if (redirect === _router.currentRoute.path)
//         {
//           // same path! don't redirect! (https://github.com/vuejs/vue-router/issues/2884)
//           _router.go()
//         }
//         else
//         {
//           _router.push(redirect)
//         }
//       }
//     }).catch(
//       function (error) {
//         if (!error.response) {
//           context.errors.push(error.message)
//         } else if (error.response.status !== 404) {
//           context.errors.push(error.response.data.message)
//         }
//       }
//     )
// }

// /**
// *
// * Delete locally stored tokens and make delete request to v1/users/userId/tokens/tokenId
// * this logs the user out and removes the refreshToken from the db
// */
// Auth.prototype.logout = function (redirect) {
//   if (this.user.getRefreshToken()) {
//     let decodedToken = jwtDecode(this.user.getRefreshToken())
//     _Vue.prototype.$axios.delete('v1/users/' + decodedToken.userId + '/tokens/' + decodedToken.tokenId)
//   }

//   this.user.removeRefreshToken()
//   this.user.removeToken()
//   this.user.removeTeams()
//   clearTimeout(this.interval)
//   this.user = new User()

//   if (redirect) {
//     if (redirect === _router.currentRoute.path)
//     {
//       // same path! don't redirect! (https://github.com/vuejs/vue-router/issues/2884)
//       _router.go()
//     }
//     else
//     {
//       _router.push(redirect)
//     }
//   }
// }

// /**
// * Post to v1/auth/register
// */
// Auth.prototype.register = function (context, credentials) {
//   let promise = new Promise(function (resolve, reject) {
//     _Vue.prototype.$axios.post('auth/register', credentials).then(
//       (response) => {
//         if (response.data.data) {
//           context.registered = true
//           context.user = response.data.data
//         } else {
//           context.errors.push('Something Happened...')
//         }
//         resolve(response)
//       }).catch(
//         function (error, response) {
//           if (!error.response) {
//             context.errors.push(error.message)
//           } else if (error.response.status !== 404) {
//             context.errors.push(error.response.data.message)
//           }
//           reject(response)
//         }
//       )
//   })
//   return promise
// }

// /**
// * Make a post request to v1/auth/refresh with the saved
// * refreshToken to get a new accessToken which is then decoded and stored locally
// */

// Auth.prototype.refresh = function (update) {
//   let updateRefreshToken = update !== undefined ? update : false
//   let data = {
//     refreshToken: this.user.getRefreshToken(),
//     'updateRefreshToken': updateRefreshToken
//   }

//   let promise = new Promise(
//     (resolve, reject) => {
//       _Vue.prototype.$axios.post('auth/refresh', data).then(
//         (response) => {
//           this.user.updateUser(response.data.accessToken, response.data.teams)

//           if (updateRefreshToken) {
//             this.user.setRefreshToken(response.data.refreshToken)
//           }
//           resolve(response)
//         },
//         (response) => {
//           reject(response)
//         }
//       )
//     }
//   )

//   return promise
// }

// // The string to be passed as a header for authenticated requests
// Auth.prototype.getAuthHeader = function () {
//   return 'Bearer ' + this.user.getToken()
// }

// Auth.prototype.initInterval = function () {
//   let interval = (process.env.VUE_APP_ACCESS_EXPIRY_TIME - ((process.env.VUE_APP_ACCESS_EXPIRY_TIME) / 8)) * 1000
//   this.interval = setInterval(function () {
//     this.refresh(this.user.refreshTokenExpiresBefore(moment().unix() + interval)).then(
//       () => {
//       },
//       () => {
//       }
//     )
//   }.bind(this), interval)
// }

// export default Auth
import jwtDecode from 'jwt-decode'
import User from './user.js'
import moment from 'moment'

let _Vue
let _router
let user

function Auth (Vue, options) {
  _Vue = Vue
  _router = options.router

  let accessToken = localStorage.getItem('accessToken')
  let refreshToken = localStorage.getItem('refreshToken')
  let teams = JSON.parse(localStorage.getItem('teams'))

  if (accessToken !== null && refreshToken !== null && teams !== null) {
    this.user = new User(accessToken, refreshToken, teams)
    this.initInterval()
  } else {
    this.user = new User()
  }
}

Auth.prototype.user = user

Auth.prototype.login = function (context, credentials, redirect) {
  _Vue.config.globalProperties.$axios.post('auth/authorise', credentials).then(
    (response) => {
      this.user = new User(response.data.accessToken, response.data.refreshToken, response.data.teams)
      this.user.authenticated = true
      this.initInterval()
      context.$bvModal.hide('login')
      context.$emit('resetTeams')
      if (redirect) {
        if (redirect === _router.currentRoute.value.path) {
            _router.push(redirect || '/dashboard')
          _router.go() // same path! don't redirect!
        } else {
          _router.push(redirect || '/dashboard')
          console.log('login pushedhhh to router:', redirect)
        }
      }
    }).catch(function (error) {
      if (!error.response) {
        context.errors.push(error.message)
      } else if (error.response.status !== 404) {
        context.errors.push(error.response.data.message)
      }
    })
    console.log('login successful', this,user)
}

Auth.prototype.logout = function (redirect) {
  if (this.user.getRefreshToken()) {
    let decodedToken = jwtDecode(this.user.getRefreshToken())
    _Vue.config.globalProperties.$axios.delete('v1/users/' + decodedToken.userId + '/tokens/' + decodedToken.tokenId)
  }

  this.user.removeRefreshToken()
  this.user.removeToken()
  this.user.removeTeams()
  clearTimeout(this.interval)
  this.user = new User()

  if (redirect) {
    if (redirect === _router.currentRoute.value.path) {
      _router.go() // same path! don't redirect!
    } else {
      _router.push(redirect)
    }
  }
}

Auth.prototype.register = function (context, credentials) {
  let promise = new Promise(function (resolve, reject) {
    _Vue.config.globalProperties.$axios.post('auth/register', credentials).then(
      (response) => {
        if (response.data.data) {
          context.registered = true
          context.user = response.data.data
        } else {
          context.errors.push('Something Happened...')
        }
        resolve(response)
      }).catch(function (error, response) {
        if (!error.response) {
          context.errors.push(error.message)
        } else if (error.response.status !== 404) {
          context.errors.push(error.response.data.message)
        }
        reject(response)
      })
  })
  return promise
}

Auth.prototype.refresh = function (update) {
  let updateRefreshToken = update !== undefined ? update : false
  let data = {
    refreshToken: this.user.getRefreshToken(),
    'updateRefreshToken': updateRefreshToken
  }

  let promise = new Promise((resolve, reject) => {
    _Vue.config.globalProperties.$axios.post('auth/refresh', data).then(
      (response) => {
        this.user.updateUser(response.data.accessToken, response.data.teams)

        if (updateRefreshToken) {
          this.user.setRefreshToken(response.data.refreshToken)
        }
        resolve(response)
      },
      (response) => {
        reject(response)
      }
    )
  })

  return promise
}

Auth.prototype.getAuthHeader = function () {
  return 'Bearer ' + this.user.getToken()
}

Auth.prototype.initInterval = function () {
  let interval = (process.env.VUE_APP_ACCESS_EXPIRY_TIME - ((process.env.VUE_APP_ACCESS_EXPIRY_TIME) / 8)) * 1000
  this.interval = setInterval(function () {
    this.refresh(this.user.refreshTokenExpiresBefore(moment().unix() + interval)).then(
      () => {},
      () => {}
    )
  }.bind(this), interval)
}

export default Auth




