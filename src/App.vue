<template>
  <div id="app" class="w-100 h-100">
<!-- Navbar -->
<BNavbar
  id="navbar"
  toggleable="lg"
  :type="navText"
  :variant="navColour"
  class="fixed-top"
>
  <BNavbarBrand :href="publicUrl">
    <img :src="`/static/${logoName}.svg`" height="34" />
    <i
      v-if="isTest"
      animation="cylon-vertical"
      class="ml-2"
      icon="exclamation-circle-fill"
      variant="warning"
      font-scale="1.5"
    />
  </BNavbarBrand>

  <BNavbarToggle @click="visible = !visible" class="border-0" />


  <!-- ✅ Updated to use Vue 3 syntax -->
  <BCollapse v-model:visible="visible" id="nav-collapse" is-nav>
    <BNavbarNav class="ms-auto">
          <BNavItem v-if="$auth.user.authenticated">
            <BNavItemDropdown right>
              <template #button-content>
                <span class="text-white d-flex">
                <font-awesome-icon
                  :icon="['fas','user']"
                  scale="1.5"
                  class="icon"
                />
                {{ $auth.user.username }}
                </span>
              </template>
              <BDropdownItem @click="navigate({ path: '/account' })">
                {{ $t('account.my') }}
              </BDropdownItem>
              <BDropdownItem @click="logout">
                {{ $t('account.logout') }}
              </BDropdownItem>
            </BNavItemDropdown>
          </BNavItem>

          <BNavItem v-if="!$auth.user.authenticated">
            <a class="nav-link text-white" href="#" @click.prevent="openLoginModal">
              <font-awesome-icon
                :icon="['fas','right-to-bracket']"
                scale="1.5"
              />
              {{ $t('account.login') }}
            </a>
          </BNavItem>

          <BNavItem v-if="!$auth.user.authenticated">
            <a class="nav-link text-white" href="#" @click.prevent="openRegisterModal">
              <font-awesome-icon
                :icon="['fas','user-plus']"
                scale="1.5"
              />
              {{ $t('account.register') }}
            </a>
          </BNavItem>

          <BNavItem>
            <a
              class="nav-link text-white"
              :href="supportUrl"
              target="_blank"
            >
              <font-awesome-icon
                :icon="['fas','circle-question']"
                scale="1.5"
              />
              {{ $t('dashboard.common.support') }}
            </a>
          </BNavItem>

          <!-- Language Dropdown -->
          <BNavItem>
            <BNavItemDropdown
  toggle-class="text-white d-flex align-items-center"
  menu-class="dropdown-menu-end"
  @click.stop
>
    <template #button-content>
      <span class="d-flex align-items-center">
        <font-awesome-icon
          :icon="['fas', 'globe']"
          class="me-2 text-white"
        />
        {{ languages[$i18n.locale] }}
      </span>
    </template>

    <BDropdownItem>
      <span @click.prevent.stop="lang('en')">English</span>
    </BDropdownItem>
    <BDropdownItem>
      <span @click.prevent.stop="lang('zh')">中文</span>
    </BDropdownItem>
  </BNavItemDropdown>
</BNavItem>


        </BNavbarNav>
      </BCollapse>
    </BNavbar>

    <!-- Main Content -->
    <BContainer
      fluid
      class="pl-0 pb-0 pr-0 pt-5 main-content"
      @click="unDrop"
    >
      <div class="row m-0 h-100">
        <sidebar
          :links="links"
          :active="sidebarActive"
          :user="$auth.user"
          :reset-teams-trigger="resetTeamsTrigger"
          @update-team="updateTeam"
          @hide="sidebarActive = false"
        />
        <div
          class="col-12 pb-0 pr-0 pl-0 h-100"
          :class="{
            faded: sidebarActive,
            'col-md-12 col-lg-10': $auth.user.authenticated
          }"
        >
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component
                :is="Component"
                :key="$route.fullPath"
                :active-team="activeTeam"
              />
            </transition>
          </router-view>
        </div>
      </div>
    </BContainer>

    <!-- Notifications -->
    <notifications />

<!-- Login Modal -->
<BModal
  id="login"
  v-model="showLogin"
  hide-header
  hide-footer
  no-fade
  centered
  no-close-on-backdrop
  no-close-on-esc
  @hidden="onLoginModalHidden"
>
  <LoginForm ref="loginForm" />
</BModal>

<!-- Register Modal -->
<BModal
  id="register"
  v-model="showRegister"
  hide-header
  hide-footer
  no-fade
  centered
  no-close-on-backdrop
  no-close-on-esc
  :ok-only="false"
  :footer="false"
  @hidden="onRegisterModalClosed"
>
  <Register ref="registerForm" />
</BModal>

  </div>
</template>


<script>
import { nextTick } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Login from '@/lib/auth/components/Login.vue'
import LoginForm from '@/lib/auth/components/Login.vue'
import Register from '@/lib/auth/components/Register.vue'
import TeamSelector from '@/components/TeamSelector.vue'
import {
  BNavbar,
  BNavbarBrand,
  BNavbarToggle,
  BCollapse,
  BNavbarNav,
  BNavItem,
  BNavItemDropdown,
  BDropdownItem,
  BContainer,
  BModal
} from 'bootstrap-vue-next'

export default {
  name: 'App',
  components: {
    TeamSelector,
    Sidebar,
    Register,
    Login,
    LoginForm,
    BModal,
    BNavbar,
    BNavbarBrand,
    BNavbarToggle,
    BCollapse,
    BNavbarNav,
    BNavItem,
    BNavItemDropdown,
    BDropdownItem,
    BContainer,
  
  },
  data() {
    return {
      publicUrl: process.env.VUE_APP_PUBLIC_URL,
      supportUrl: process.env.VUE_APP_SUPPORT_URL,
      navColour: process.env.VUE_APP_NAV_COLOUR,
      navText: process.env.VUE_APP_NAV_TEXT,
      logoName: process.env.VUE_APP_LOGO,
      languages: {
        en: 'English',
        zh: '中文'
      },
      cart: [],
      resetTeamsTrigger: 0,
      activeTeam: { name: 'none selected', id: 0 },
      links: [
        { key: 'index.dashboard', uri: '/dashboard', icon: 'cogs' },
        {
          key: 'schedule.map',
          uri: '/scheduling/map',
          icon: 'map',
          noadmin: true
        },
        { key: 'schedule.ipam', uri: '/scheduling/ipam', icon: 'table' },
        { key: 'index.displays', uri: '/displays', icon: 'cogs' },
        { key: 'index.sources', uri: '/sources', icon: 'code-branch' },
        { key: 'index.campaigns', uri: '/campaigns', icon: 'film' },
        { key: 'index.media', uri: '/media', icon: 'photo-video' },
        { key: 'index.logging', uri: '/logging', icon: 'clipboard-list' },
        { key: 'index.teammgt', uri: '/teams', icon: 'users' },
        {
          key: 'index.admin',
          icon: 'cogs',
          admin: true,
          children: [
            { key: 'index.usermgt', uri: '/users', icon: 'user' },
            { key: 'index.news', uri: '/news', icon: 'sticky-note' }
          ]
        }
      ],
      sidebarActive: false,
      dropdownOpen: false,
      langDropdown: false,
      isTest: process.env.VUE_APP_API_ROOT.includes('adverdev'),
      visible: false,
      showLogin: false,
      showRegister: false
    }
  },
  mounted() {
    window.onbeforeunload = this.leaving
    this.resetTeamsTrigger++
    if (this.$cart && this.$cart.store) {
      this.cart = this.$cart.store
    } else {
      console.warn('Cart plugin not available')
    }
  },
  methods: {
    // Defer all router navigations until after Vue has completed its patch cycle
    navigate(to) {
      nextTick(() => {
        this.$router.push(to).catch(() => {})
      })
    },
  onLoginModalHidden() {
    // Reset form state via ref
    if (this.$refs.loginForm?.resetState) {
      this.$refs.loginForm.resetState()
    }
  },
  onRegisterModalClosed() {
    if (this.$refs.registerForm?.resetState) {
      this.$refs.registerForm.resetState()
    }
  },
    triggerUpdate() {
      this.resetTeamsTrigger++
    },
    updateTeam(team) {
      this.resetTeamsTrigger++
      this.activeTeam = team
    },
    unDrop() {
      this.dropdownOpen = false
      this.langDropdown = false
    },
    lang(locale) {
      localStorage.setItem('locale', locale)
      this.$i18n.locale = locale
      this.$router.go(0)
    },
    logout() {
      this.resetTeamsTrigger++
      this.dropdownOpen = false
      this.$cart.store = []
      this.$auth.logout()       // clear tokens, etc.
      this.navigate({ path: '/' }) // then navigate home
    },
    openLoginModal() {
      this.showLogin = true
    },
    openRegisterModal() {
      this.showRegister = true
    }
  }
}
</script>

<style lang="scss">
// Bootstrap imports
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/bootstrap";

// Layout & responsive tweaks
@include media-breakpoint-up(lg) {
  .dropdown-toggle,
  .link-toggle,
  .logo {
    display: inline-block;
  }
}
@include media-breakpoint-down(md) {
  .nav-link {
    padding-right: 0;
    padding-left: 0;
  }
}
@include media-breakpoint-up(xs) {
  .toggle-center {
    align-self: center;
    cursor: pointer;
  }
  .fade-enter-active {
    transition: opacity .5s;
  }
  .fade-enter {
    opacity: 0;
  }
  .content {
     -webkit-transition: all 0.3s ease-in-out;
    -moz-transition: all 0.3s ease-in-out;
    -ms-transition: all 0.3s ease-in-out;
    -o-transition: all 0.3s ease-in-out;
    transition: all 0.3s ease-in-out;
  }
  .content.faded {
 background: rgba(0, 0, 0, 0.7);
    -webkit-transition: all 0.3s ease-in-out;
    -moz-transition: all 0.3s ease-in-out;
    -ms-transition: all 0.3s ease-in-out;
    -o-transition: all 0.3s ease-in-out;
    transition: all 0.3s ease-in-out;
  }
}

// Global scroll/height fixes
html, body, #app {
  height: auto;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
  margin: 0;
}
body {
  padding-top: 64px;
}
.main-content {
  position: relative;
  z-index: 1;
}
.row {
  position: relative;
  z-index: 1;
}

// Navbar styling
#navbar {
  background-color: #343A40 !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

// Utility classes
.navigation-box {
  text-align: left;
  font-size: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-y: auto;
  max-height: 50em;
}
.navigation-box-item {
  color: white;
  &:hover {
    color: lighten(white, 20%);
    text-decoration: none;
  }
}
.icon {
  color: white;
}
a:focus {
  color: darken(white, 20%);
}
.flatpickr-calendar {
  z-index: 1080 !important;
}
</style>
