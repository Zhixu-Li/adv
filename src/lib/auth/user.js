import jwtDecode from 'jwt-decode'
import moment from 'moment'

function User (token, refresh, teams) {
  if (token && refresh && teams) {
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
  let decodedToken = this.setToken(token)
  this.setTeams(teams)

  this.authenticated = true
  this.admin = Boolean(decodedToken.isAdmin)
  this.id = decodedToken.userId
  this.username = decodedToken.username
  this.teams = teams
}

User.prototype.getToken = function () {
  return localStorage.getItem('accessToken')
}

User.prototype.getRefreshToken = function () {
  return localStorage.getItem('refreshToken')
}

User.prototype.setToken = function (token) {
  let decodedToken = jwtDecode(token)
  this.tokenExpires = decodedToken.exp
  localStorage.setItem('accessToken', token)
  return decodedToken
}

User.prototype.setRefreshToken = function (refreshToken) {
  let decodedToken = jwtDecode(refreshToken)
  this.refreshTokenExpires = decodedToken.exp
  localStorage.setItem('refreshToken', refreshToken)
  return decodedToken
}

User.prototype.removeToken = function () {
  localStorage.removeItem('accessToken')
}

User.prototype.removeRefreshToken = function () {
  localStorage.removeItem('refreshToken')
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
    return moment(moment().unix()).isSameOrAfter(this.tokenExpires)
  }
}

User.prototype.refreshTokenExpired = function () {
  if (this.refreshTokenExpires === null) {
    return true
  } else {
    return moment(moment().unix()).isSameOrAfter(this.refreshTokenExpires)
  }
}

User.prototype.refereshTokenExpiresSoon = function () {
  let now = moment()
  return (this.refreshTokenExpires - now.unix()) <= (process.env.VUE_APP_REFRESH_EXPIRY_TIME / 8)
}

export default User
