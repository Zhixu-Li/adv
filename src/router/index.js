// import Vue from 'vue'
// import Router from 'vue-router'

// Vue.use(Router)

// const router = new Router({
//   // mode: 'history',
//   routes: [
//     {path: '/forgot/:reAuthToken', component: require('@/pages/PasswordNew.vue').default},
//     {path: '/stripeConnect', component: require('@/pages/Account/StripeConnect.vue').default},
//     {
//       path: '/home',
//       components: {
//         default: require('@/pages/Frontstuff/Home.vue').default,
//         login: require('@/lib/auth/components/Login.vue').default,
//         register: require('@/lib/auth/components/Register.vue').default
//       },
//       alias: '/'
//     },
//     {
//       path: '/privacy',
//       component: require('@/pages/Frontstuff/Privacy.vue').default,
//       name: 'privacy',
//     },
//     {
//       path: '/terms',
//       component: require('@/pages/Frontstuff/Terms.vue').default,
//       name: 'terms',
//     },
//     {
//       path: '/ip',
//       component: require('@/pages/Frontstuff/Placeholder.vue').default,
//       name: 'ip',
//     },
//     {
//       path: '/owners',
//       components: {
//         default: require('@/pages/Frontstuff/Placeholder.vue').default,
//         login: require('@/lib/auth/components/Login.vue').default,
//         register: require('@/lib/auth/components/Register.vue').default
//       },
//       name: 'owners',
//     },
//     {
//       path: '/activate/:userId/:hash',
//       component: require('@/pages/EmailActivation.vue').default // r => require.ensure([], () => r(require('@/pages/EmailActivation.vue')), 'auth')
//     },
//     {
//       path: '/dashboard',
//       component: require('@/pages/Dashboard/Dashboard.vue').default, // r => require.ensure([], () => r(require('@/pages/Dashboard/Dashboard.vue')), 'dashboard'),
//       meta: {
//         auth: true
//       }
//     },
//     {
//       path: '/logging',
//       component: require('@/pages/Logging/Logging.vue').default,
//       name: 'logging',
//       meta: {
//         auth: true
//       },
//       children: [
//         {
//           path: ':bookingId',
//           name: 'log-tabs',
//           component: require('@/pages/Logging/TabContainer.vue').default,
//           children: [
//             {
//               path: 'log',
//               component: require('@/pages/Logging/Log.vue').default,
//               name: 'log',
//             },
//             {
//               path: 'report',
//               component: require('@/pages/Logging/Report.vue').default,
//               name: 'report',
//             }
//           ]
//         }
//       ]
//     },
//     {
//       path: '/displays',
//       component: require('@/pages/Displays/Displays.vue').default, // r => require.ensure([], () => r(require('@/pages/Displays/Displays.vue'))),
//       name: 'displays',
//       meta: {
//         auth: true
//       },
//       children: [
//         {
//           path: ':displayId',
//           component: require('@/pages/Displays/Display.vue').default,
//           name: 'display',
//           children: [
//             {
//               path: 'view',
//               name: 'display-view',
//               component: require('@/pages/Displays/ViewDisplay.vue').default
//             },
//             {
//               path: 'edit',
//               name: 'display-edit',
//               component: require('@/pages/Displays/EditDisplay.vue').default
//             },
//             {
//               path: 'dashboard',
//               name: 'display-dashboard',
//               component: require('@/pages/Displays/Dashboard/Dash.vue').default
//             },
//             {
//               path: 'coupons',
//               name: 'display-coupons',
//               component: require('@/pages/Displays/Coupon/DisplayCoupons.vue').default
//             },
//             {
//               path: 'pricing',
//               name: 'display-pricing',
//               component: require('@/pages/Displays/DisplayPricing.vue').default
//             }
//           ]
//         }
//       ]
//     },
//     {
//       path: '/scheduling',
//       component: require('@/pages/Scheduling/Scheduling.vue').default, // r => require.ensure([], () => r(require('@/pages/Scheduling/Scheduling.vue'))),
//       meta: {
//         auth: true
//       },
//       children: [
//         {
//           path: '',
//           component: require('@/pages/Scheduling/SchedulingMap.vue').default,
//           alias: 'map',
//           name: 'Map'
//         },
//         {
//           path: 'ipam',
//           component: require('@/pages/Scheduling/SchedulingIpam.vue').default,
//           name: 'IPAM',
//           props: true,
//         }
//       ]
//     },
//     {
//       path: '/sources',
//       component: require('@/pages/Sources/Sources.vue').default,
//       name: 'sources',
//       meta: {
//         auth: true
//       },
//       children: [
//         {
//           path: ':sourceId',
//           component: require('@/pages/Sources/Source.vue').default,
//           name: 'source'
//         }
//       ]
//     },
//     {
//       path: '/campaigns',
//       component: require('@/pages/Campaigns/Campaigns.vue').default,
//       name: 'campaigns',
//       meta: {
//         auth: true
//       },
//       children: [
//         {
//           path: ':campaignId',
//           component: require('@/pages/Campaigns/Campaign.vue').default,
//           name: 'campaign'
//         }
//       ]
//     },
//     {
//       path: '/media',
//       name: 'media',
//       component: require('@/pages/Media/Media.vue').default,
//       meta: {
//         auth: true
//       }
//     },
//     {
//       path: '/teams',
//       name: 'teams',
//       component: require('@/pages/Teams/Teams.vue').default,
//       children: [
//         {
//           path: ':teamId',
//           name: 'team',
//           component: require('@/pages/Teams/Team.vue').default
//         }
//       ],
//       meta: {
//         auth: true
//       }
//     },
//     {
//       path: '/news',
//       name: 'news',
//       component: require('@/pages/News/News.vue').default
//     },
//     {
//       path: '/users',
//       name: 'users',
//       component: require('@/pages/Users/Users.vue').default,
//       children: [
//         {
//           path: ':userId',
//           component: require('@/pages/Users/User.vue').default,
//           children: [
//             {
//               path: '',
//               name: 'user-view',
//               component: require('@/pages/Users/ViewUser.vue').default
//             },
//             {
//               path: 'edit',
//               name: 'user-edit',
//               component: require('@/pages/Users/EditUser.vue').default
//             }
//           ]
//         }
//       ],
//       meta: {
//         auth: true
//       }
//     },
//     {
//       path: '/account',
//       component: require('@/pages/Account/Account.vue').default,
//       name: 'Account',
//       meta: {
//         auth: true
//       }
//     },
//     {
//       path: '/checkout',
//       component: require('@/pages/Checkout/Checkout.vue').default,
//       name: 'Checkout',
//       meta: {
//         auth: true
//       }
//     },
//     { path: '*', redirect: '/' }
//   ]
// })

// export default router

// import { createRouter, createWebHistory } from 'vue-router'

// const routes = [
//   { path: '/forgot/:reAuthToken', component: () => import('@/pages/PasswordNew.vue') },
//   { path: '/stripeConnect', component: () => import('@/pages/Account/StripeConnect.vue') },
//   {
//     path: '/home',
//     components: {
//       default: () => import('@/pages/Frontstuff/Home.vue'),
//       login: () => import('@/lib/auth/components/Login.vue'),
//       register: () => import('@/lib/auth/components/Register.vue')
//     },
//     alias: '/'
//   },
//   { path: '/privacy', component: () => import('@/pages/Frontstuff/Privacy.vue'), name: 'privacy' },
//   { path: '/terms', component: () => import('@/pages/Frontstuff/Terms.vue'), name: 'terms' },
//   { path: '/ip', component: () => import('@/pages/Frontstuff/Placeholder.vue'), name: 'ip' },
//   {
//     path: '/owners',
//     components: {
//       default: () => import('@/pages/Frontstuff/Placeholder.vue'),
//       login: () => import('@/lib/auth/components/Login.vue'),
//       register: () => import('@/lib/auth/components/Register.vue')
//     },
//     name: 'owners'
//   },
//   { path: '/activate/:userId/:hash', component: () => import('@/pages/EmailActivation.vue') },
//   { path: '/dashboard', component: () => import('@/pages/Dashboard/Dashboard.vue'), meta: { auth: true } },
//   {
//     path: '/logging',
//     component: () => import('@/pages/Logging/Logging.vue'),
//     name: 'logging',
//     meta: { auth: true },
//     children: [
//       {
//         path: ':bookingId',
//         name: 'log-tabs',
//         component: () => import('@/pages/Logging/TabContainer.vue'),
//         children: [
//           { path: 'log', component: () => import('@/pages/Logging/Log.vue'), name: 'log' },
//           { path: 'report', component: () => import('@/pages/Logging/Report.vue'), name: 'report' }
//         ]
//       }
//     ]
//   },
//   {
//     path: '/displays',
//     component: () => import('@/pages/Displays/Displays.vue'),
//     name: 'displays',
//     meta: { auth: true },
//     children: [
//       {
//         path: ':displayId',
//         component: () => import('@/pages/Displays/Display.vue'),
//         name: 'display',
//         children: [
//           { path: 'view', name: 'display-view', component: () => import('@/pages/Displays/ViewDisplay.vue') },
//           { path: 'edit', name: 'display-edit', component: () => import('@/pages/Displays/EditDisplay.vue') },
//           { path: 'dashboard', name: 'display-dashboard', component: () => import('@/pages/Displays/Dashboard/Dash.vue') },
//           { path: 'coupons', name: 'display-coupons', component: () => import('@/pages/Displays/Coupon/DisplayCoupons.vue') },
//           { path: 'pricing', name: 'display-pricing', component: () => import('@/pages/Displays/DisplayPricing.vue') }
//         ]
//       }
//     ]
//   },
//   {
//     path: '/scheduling',
//     component: () => import('@/pages/Scheduling/Scheduling.vue'),
//     meta: { auth: true },
//     children: [
//       { path: '', component: () => import('@/pages/Scheduling/SchedulingMap.vue'), alias: 'map', name: 'Map' },
//       { path: 'ipam', component: () => import('@/pages/Scheduling/SchedulingIpam.vue'), name: 'IPAM', props: true }
//     ]
//   },
//   {
//     path: '/sources',
//     component: () => import('@/pages/Sources/Sources.vue'),
//     name: 'sources',
//     meta: { auth: true },
//     children: [
//       { path: ':sourceId', component: () => import('@/pages/Sources/Source.vue'), name: 'source' }
//     ]
//   },
//   {
//     path: '/campaigns',
//     component: () => import('@/pages/Campaigns/Campaigns.vue'),
//     name: 'campaigns',
//     meta: { auth: true },
//     children: [
//       { path: ':campaignId', component: () => import('@/pages/Campaigns/Campaign.vue'), name: 'campaign' }
//     ]
//   },
//   { path: '/media', name: 'media', component: () => import('@/pages/Media/Media.vue'), meta: { auth: true } },
//   {
//     path: '/teams',
//     name: 'teams',
//     component: () => import('@/pages/Teams/Teams.vue'),
//     children: [
//       { path: ':teamId', name: 'team', component: () => import('@/pages/Teams/Team.vue') }
//     ],
//     meta: { auth: true }
//   },
//   { path: '/news', name: 'news', component: () => import('@/pages/News/News.vue') },
//   {
//     path: '/users',
//     name: 'users',
//     component: () => import('@/pages/Users/Users.vue'),
//     meta: { auth: true },
//     children: [
//       {
//         path: ':userId',
//         component: () => import('@/pages/Users/User.vue'),
//         children: [
//           { path: '', name: 'user-view', component: () => import('@/pages/Users/ViewUser.vue') },
//           { path: 'edit', name: 'user-edit', component: () => import('@/pages/Users/EditUser.vue') }
//         ]
//       }
//     ]
//   },
//   { path: '/account', name: 'Account', component: () => import('@/pages/Account/Account.vue'), meta: { auth: true } },
//   { path: '/checkout', name: 'Checkout', component: () => import('@/pages/Checkout/Checkout.vue'), meta: { auth: true } },
//   { path: '/:pathMatch(.*)*', redirect: '/' }
// ]

// const router = createRouter({
//   history: createWebHistory(),
//   routes
// })

// export default router
// // src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// (You can gradually replace these require()s with ES imports if you like)
const PasswordNew    = require('@/pages/PasswordNew.vue').default
const StripeConnect  = require('@/pages/Account/StripeConnect.vue').default
const Home           = require('@/pages/Frontstuff/Home.vue').default
const Privacy        = require('@/pages/Frontstuff/Privacy.vue').default
const Terms          = require('@/pages/Frontstuff/Terms.vue').default
const Placeholder    = require('@/pages/Frontstuff/Placeholder.vue').default
const EmailActivation = require('@/pages/EmailActivation.vue').default
const Dashboard      = require('@/pages/Dashboard/Dashboard.vue').default
const Logging        = require('@/pages/Logging/Logging.vue').default
const LogTabs        = require('@/pages/Logging/TabContainer.vue').default
const Log            = require('@/pages/Logging/Log.vue').default
const Report         = require('@/pages/Logging/Report.vue').default
const Displays       = require('@/pages/Displays/Displays.vue').default
const Display        = require('@/pages/Displays/Display.vue').default
const ViewDisplay    = require('@/pages/Displays/ViewDisplay.vue').default
const EditDisplay    = require('@/pages/Displays/EditDisplay.vue').default
const Dash           = require('@/pages/Displays/Dashboard/Dash.vue').default
const DisplayCoupons = require('@/pages/Displays/Coupon/DisplayCoupons.vue').default
const DisplayPricing = require('@/pages/Displays/DisplayPricing.vue').default
const Scheduling     = require('@/pages/Scheduling/Scheduling.vue').default
const SchedulingMap  = require('@/pages/Scheduling/SchedulingMap.vue').default
const SchedulingIpam = require('@/pages/Scheduling/SchedulingIpam.vue').default
const Sources        = require('@/pages/Sources/Sources.vue').default
const Source         = require('@/pages/Sources/Source.vue').default
const Campaigns      = require('@/pages/Campaigns/Campaigns.vue').default
const Campaign       = require('@/pages/Campaigns/Campaign.vue').default
const Media          = require('@/pages/Media/Media.vue').default
const Teams          = require('@/pages/Teams/Teams.vue').default
const Team           = require('@/pages/Teams/Team.vue').default
const News           = require('@/pages/News/News.vue').default
const Users          = require('@/pages/Users/Users.vue').default
const ViewUser       = require('@/pages/Users/ViewUser.vue').default
const EditUser       = require('@/pages/Users/EditUser.vue').default
const Account        = require('@/pages/Account/Account.vue').default
const Checkout       = require('@/pages/Checkout/Checkout.vue').default

const routes = [
  { path: '/forgot/:reAuthToken', component: PasswordNew },
  { path: '/stripeConnect',       component: StripeConnect },
  {
    path: '/home',
    components: {
      default: Home,
      login:   require('@/lib/auth/components/Login.vue').default,
      register: require('@/lib/auth/components/Register.vue').default
    },
    alias: '/'
  },
  { path: '/privacy',  component: Privacy, name: 'privacy' },
  { path: '/terms',    component: Terms,   name: 'terms'   },
  { path: '/ip',       component: Placeholder, name: 'ip' },
  { path: '/owners',
    components: {
      default: Placeholder,
      login:   require('@/lib/auth/components/Login.vue').default,
      register: require('@/lib/auth/components/Register.vue').default
    },
    name: 'owners'
  },
  { path: '/activate/:userId/:hash', component: EmailActivation },
  { path: '/dashboard', component: Dashboard, meta: { auth: true } },
  {
    path: '/logging',
    component: Logging,
    meta: { auth: true },
    children: [
      {
        path: ':bookingId',
        component: LogTabs,
        children: [
          { path: 'log',   component: Log,    name: 'log'    },
          { path: 'report', component: Report, name: 'report' }
        ]
      }
    ]
  },
  {
    path: '/displays',
    component: Displays,
    meta: { auth: true },
    children: [
      {
        path: ':displayId',
        component: Display,
        children: [
          { path: 'view',      component: ViewDisplay,    name: 'display-view'    },
          { path: 'edit',      component: EditDisplay,    name: 'display-edit'    },
          { path: 'dashboard', component: Dash,           name: 'display-dashboard'},
          { path: 'coupons',   component: DisplayCoupons, name: 'display-coupons' },
          { path: 'pricing',   component: DisplayPricing, name: 'display-pricing' }
        ]
      }
    ]
  },
  {
    path: '/scheduling',
    component: Scheduling,
    meta: { auth: true },
    children: [
      { path: '',     component: SchedulingMap,  alias: 'map', name: 'Map'  },
      { path: 'ipam', component: SchedulingIpam, name: 'IPAM', props: true }
    ]
  },
  {
    path: '/sources',
    component: Sources,
    meta: { auth: true },
    children: [
      { path: ':sourceId', component: Source, name: 'source' }
    ]
  },
  {
    path: '/campaigns',
    component: Campaigns,
    name: 'campaigns',
    meta: { auth: true },
    children: [
      { path: ':campaignId', component: Campaign, name: 'campaign' }
    ]
  },
  { path: '/media',    component: Media,    meta: { auth: true }, name: 'media' },
  {
    path: '/teams',
    component: Teams,
    meta: { auth: true },
    children: [
      { path: ':teamId', component: Team, name: 'team' }
    ]
  },
  { path: '/news',     component: News, name: 'news' },
  {
    path: '/users',
    component: Users,
    meta: { auth: true },
    children: [
      {
        path: ':userId',
        children: [
          { path: '',     component: ViewUser, name: 'user-view' },
          { path: 'edit', component: EditUser, name: 'user-edit' }
        ]
      }
    ]
  },
  { path: '/account',  component: Account,  meta: { auth: true }, name: 'Account'  },
  { path: '/checkout', component: Checkout, meta: { auth: true }, name: 'Checkout' },
  // catch-all (must be last!)
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(), 
  routes
})

export default router
