<template>
  <div id="app" class="w-100 h-100">
    <b-navbar
      id="navbar"
      toggleable="lg"
      :type="navText"
      :variant="navColour"
      class="fixed-top"
    >
      <b-navbar-brand :href="publicUrl">
        <img :src="`/static/${logoName}.svg`" height="34" />
        <i
          v-if="isTest"
          animation="cylon-vertical"
          class="ml-2"
          icon="exclamation-circle-fill"
          variant="warning"
          font-scale="1.5"
        ></i>
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse" />
      <b-collapse id="nav-collapse" v-model="visible" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item v-if="$auth.user.authenticated" right>
            <b-nav-item-dropdown right>
              <template #button-content>
                <font-awesome-icon
                  :icon="['fas', 'user']"
                  scale="1.5"
                  class="icon"
                />
                {{ $auth.user.username }}
              </template>
              <b-dropdown-item
                @click="navigate({ path: '/account' })"
              >{{ $t('account.my') }}</b-dropdown-item>
              <b-dropdown-item @click="logout"
              >{{ $t('account.logout') }}</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-nav-item>

          <!-- Login/Logout Section -->
          <b-nav-item v-if="!$auth.user.authenticated" right>
            <a href="#" class="nav-link" @click.prevent="openLoginModal">
              <font-awesome-icon
                :icon="['fas', 'right-to-bracket']"
                scale="1.5"
              />
              {{ $t('account.login') }}
            </a>
          </b-nav-item>
          <b-nav-item v-if="!$auth.user.authenticated" right>
            <a href="#" class="nav-link" @click.prevent="openRegisterModal">
              <font-awesome-icon
                :icon="['fas', 'user-plus']"
                scale="1.5"
              />
              {{ $t('account.register') }}
            </a>
          </b-nav-item>

          <b-nav-item right>
            <a
              target="_blank"
              :href="supportUrl"
              class="nav-link"
            >
              <font-awesome-icon
                :icon="['fas', 'circle-question']"
                scale="1.5"
              />
              {{ $t('dashboard.common.support') }}
            </a>
          </b-nav-item>

          <!-- Language Dropdown -->
          <b-nav-item right>
            <b-nav-item-dropdown right>
              <template #button-content>
                <font-awesome-icon
                  :icon="['fas', 'globe']"
                />{{ languages[$i18n.locale] }}
              </template>
              <b-dropdown-item @click="lang('en')">English</b-dropdown-item>
              <b-dropdown-item @click="lang('zh')">中文</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <!-- Main Content -->
    <b-container
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
    </b-container>

    <!-- Notifications -->
    <notifications />

    <!-- Login Modal -->
    <BModal
      id="login"
      v-model="showLogin"
      title=""
      hide-header
      no-fade
      hide-footer
    >
      <login @reset-teams="$nextTick(() => resetTeamsTrigger++)" />
    </BModal>

    <!-- Register Modal -->
    <BModal
      id="register"
      v-model="showRegister"
      title=""
      centered
      hide-header
      no-fade
      hide-footer
    >
      <register />
    </BModal>
  </div>
</template>

<script>
import { nextTick } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Login from '@/lib/auth/components/Login.vue'
import Register from '@/lib/auth/components/Register.vue'
import TeamSelector from '@/components/TeamSelector.vue'
import { BModal } from 'bootstrap-vue-next'

export default {
  name: 'App',
  components: {
    TeamSelector,
    Sidebar,
    Register,
    Login,
    BModal
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
    transition: all 0.3s ease-in-out;
  }
  .content.faded {
    background: rgba(0, 0, 0, 0.7);
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
