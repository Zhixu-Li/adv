ade.js
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
//import jwtDecode from 'jwt-decode'
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

// Auth.prototype.user = user

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
  // Just clear tokens — do NOT send delete request
  this.user.removeRefreshToken()
  this.user.removeToken()
  this.user.removeTeams()
  
  // Optional: clear any intervals/timeouts if you have them
  clearTimeout(this.interval)

  // Reset user object
  this.user = new User()

  // Handle redirect if specified
  if (redirect) {
    if (redirect === _router.currentRoute.value.path) {
      _router.go() // Same path, reload
    } else {
      _router.push(redirect) // Different path, navigate
    }
  }
}

// Auth.prototype.logout = function (redirect) {
//   let p
//   if (this.user.getRefreshToken()) {
//     let decodedToken = jwtDecode(this.user.getRefreshToken())
//     p = _Vue.config.globalProperties.$axios.delete('v1/users/' + decodedToken.userId + '/tokens/' + decodedToken.tokenId)
//       .catch(err => {
//         if (err.response && err.response.status === 401) {
//           console.warn('Token already expired, ignore 401.')
//         } else {
//           throw err
//         }
//       })
//   } else {
//     p = Promise.resolve()
//   }

//   p.finally(() => {
//     this.user.removeRefreshToken()
//     this.user.removeToken()
//     this.user.removeTeams()
//     clearTimeout(this.interval)
//     this.user = new User()

//     if (redirect) {
//       if (redirect === _router.currentRoute.value.path) {
//         _router.go()
//       } else {
//         _router.push(redirect)
//       }
//     }
//   })
// }


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






// import jwtDecode from 'jwt-decode'
// import moment from 'moment'

// function User (token, refresh, teams) {
//   if (token && refresh && teams) {
//     localStorage.setItem('accessToken', token)
//     localStorage.setItem('refreshToken', refresh)
//     localStorage.setItem('teams', JSON.stringify(teams))

//     let decodedToken = jwtDecode(token)
//     let decodedRefreshToken = jwtDecode(refresh)

//     this.authenticated = Boolean(decodedToken)
//     this.admin = Boolean(decodedToken.isAdmin)
//     this.id = decodedToken.userId
//     this.username = decodedToken.username
//     this.tokenExpires = decodedToken.exp
//     this.refreshTokenExpires = decodedRefreshToken.exp
//     this.teams = teams
//   }
//   else {
//     this.authenticated = false
//     this.admin = false
//     this.id = 0
//     this.username = null
//     this.tokenExpires = null
//     this.refreshTokenExpires = null
//     this.activeTeam = null
//     this.teams = {}
//   }
// }

// User.prototype.setActiveTeam = function (team_id) {
//   this.activeTeam = team_id
// }

// User.prototype.refreshTokenExpiresBefore = function (expiry) {
//   return moment(this.refreshTokenExpires).isBefore(moment(expiry))
// }

// User.prototype.hasAccessInTeam = function (teamId, permission) {
//   if (this.admin === true) {
//     return true
//   }
//   else if (this.teams[teamId]) {
//     return this.teams[teamId]['permissions'][permission] === '1'
//   } else {
//     return false
//   }
// }

// User.prototype.updateUser = function (token, teams) {
//   let decodedToken = this.setToken(token)
//   this.setTeams(teams)

//   this.authenticated = true
//   this.admin = Boolean(decodedToken.isAdmin)
//   this.id = decodedToken.userId
//   this.username = decodedToken.username
//   this.teams = teams
// }

// User.prototype.getToken = function () {
//   return localStorage.getItem('accessToken')
// }

// User.prototype.getRefreshToken = function () {
//   return localStorage.getItem('refreshToken')
// }

// User.prototype.setToken = function (token) {
//   let decodedToken = jwtDecode(token)
//   this.tokenExpires = decodedToken.exp
//   localStorage.setItem('accessToken', token)
//   return decodedToken
// }

// User.prototype.setRefreshToken = function (refreshToken) {
//   let decodedToken = jwtDecode(refreshToken)
//   this.refreshTokenExpires = decodedToken.exp
//   localStorage.setItem('refreshToken', refreshToken)
//   return decodedToken
// }

// User.prototype.removeToken = function () {
//   localStorage.removeItem('accessToken')
// }

// User.prototype.removeRefreshToken = function () {
//   localStorage.removeItem('refreshToken')
// }

// User.prototype.setTeams = function (teams) {
//   localStorage.setItem('teams', JSON.stringify(teams))
// }

// User.prototype.removeTeams = function () {
//   localStorage.removeItem('teams')
// }

// User.prototype.tokenExpired = function () {
//   if (this.tokenExpires === null) {
//     return false
//   } else {
//     return moment(moment().unix()).isSameOrAfter(this.tokenExpires)
//   }
// }

// User.prototype.refreshTokenExpired = function () {
//   if (this.refreshTokenExpires === null) {
//     return true
//   } else {
//     return moment(moment().unix()).isSameOrAfter(this.refreshTokenExpires)
//   }
// }

// User.prototype.refereshTokenExpiresSoon = function () {
//   let now = moment()
//   return (this.refreshTokenExpires - now.unix()) <= (process.env.VUE_APP_REFRESH_EXPIRY_TIME / 8)
// }

// export default User
import jwtDecode from 'jwt-decode'
import moment from 'moment'

function User (token, refresh, teams) {
  if (token && refresh && teams) {
    this.accessToken = token // ✅ Store in memory
    this.refreshToken = refresh // ✅ Store in memory

    localStorage.setItem('accessToken', token)
    localStorage.setItem('refreshToken', refresh)
    localStorage.setItem('teams', JSON.stringify(teams))

    let decodedToken = jwtDecode(token)
    let decodedRefreshToken = jwtDecode(refresh)

    this.authenticated = Boolean(decodedToken)
    this.admin = Boolean(decodedToken.isAdmin)
    this.id = decodedToken.userId
    this.username = decodedToken.username
    this.tokenExpires = decodedToken.exp
    this.refreshTokenExpires = decodedRefreshToken.exp
    this.teams = teams
  }
  else {
    this.authenticated = false
    this.admin = false
    this.id = 0
    this.username = null
    this.tokenExpires = null
    this.refreshTokenExpires = null
    this.activeTeam = null
    this.teams = {}
    this.accessToken = null // ✅ Default to null
    this.refreshToken = null // ✅ Default to null
  }
}

User.prototype.setActiveTeam = function (team_id) {
  this.activeTeam = team_id
}

User.prototype.refreshTokenExpiresBefore = function (expiry) {
  return moment(this.refreshTokenExpires).isBefore(moment(expiry))
}

User.prototype.hasAccessInTeam = function (teamId, permission) {
  if (this.admin === true) {
    return true
  }
  else if (this.teams[teamId]) {
    return this.teams[teamId]['permissions'][permission] === '1'
  } else {
    return false
  }
}

User.prototype.updateUser = function (token, teams) {
  let decodedToken = this.setToken(token) // ✅ Also updates memory
  this.setTeams(teams)

  this.authenticated = true
  this.admin = Boolean(decodedToken.isAdmin)
  this.id = decodedToken.userId
  this.username = decodedToken.username
  this.teams = teams
}

User.prototype.getToken = function () {
  return this.accessToken // ✅ Use in-memory token
}

User.prototype.getRefreshToken = function () {
  return this.refreshToken // ✅ Use in-memory token
}

User.prototype.setToken = function (token) {
  let decodedToken = jwtDecode(token)
  this.tokenExpires = decodedToken.exp
  this.accessToken = token // ✅ Store in memory
  localStorage.setItem('accessToken', token)
  return decodedToken
}

User.prototype.setRefreshToken = function (refreshToken) {
  let decodedToken = jwtDecode(refreshToken)
  this.refreshTokenExpires = decodedToken.exp
  this.refreshToken = refreshToken // ✅ Store in memory
  localStorage.setItem('refreshToken', refreshToken)
  return decodedToken
}

User.prototype.removeToken = function () {
  localStorage.removeItem('accessToken')
  this.accessToken = null // ✅ Clear memory
}

User.prototype.removeRefreshToken = function () {
  localStorage.removeItem('refreshToken')
  this.refreshToken = null // ✅ Clear memory
}

User.prototype.setTeams = function (teams) {
  localStorage.setItem('teams', JSON.stringify(teams))
}

User.prototype.removeTeams = function () {
  localStorage.removeItem('teams')
}

User.prototype.tokenExpired = function () {
  if (this.tokenExpires === null) {
    return false
  } else {
    return moment().unix() >= this.tokenExpires // ✅ Compare directly
  }
}

User.prototype.refreshTokenExpired = function () {
  if (this.refreshTokenExpires === null) {
    return true
  } else {
    return moment().unix() >= this.refreshTokenExpires // ✅ Compare directly
  }
}

User.prototype.refereshTokenExpiresSoon = function () {
  let now = moment()
  return (this.refreshTokenExpires - now.unix()) <= (process.env.VUE_APP_REFRESH_EXPIRY_TIME / 8)
}

export default User
