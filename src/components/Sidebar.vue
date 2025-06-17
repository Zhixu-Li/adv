<!-- <template>
  <aside class="sidebar-wrapper">
    <BCol
      v-show="user.authenticated"
      cols="10"
      md="4"
      lg="2"
      class="sidebar d-none d-md-block h-100"
      :class="{ visible: active }"
    >
      <BRow class="p-0 m-0">
        <BCol class="pt-2 m-0">
          <h6 class="m-0 text-muted text-center">
            {{ $t('dashboard.headers.activeTeam') }}
          </h6>
        </BCol>
      </BRow>

      <team-selector
        :reset-teams-trigger="resetTeamsTrigger"
        @update-team="$emit('updateTeam', $event)"
      />

      <ul class="accordion-menu pl-2">
        <li
          v-for="(link, index) in filterLinks"
          :key="index"
          :class="{ 'has-children': link.children }"
        >
          <input
            v-if="link.children"
            :id="`group-${index}`"
            type="checkbox"
          />
          <label
            v-if="link.children"
            :for="`group-${index}`"
            class="sidebar-link"
          >
            <font-awesome-icon :icon="['fas', link.icon]" class="icon mr-2" />
            <span>{{ $t(link.key) }}</span>
          </label>

          <ul v-if="link.children">
            <li
              v-for="(child, childIndex) in link.children"
              :key="childIndex"
            >
              <router-link custom :to="child.uri" v-slot="{ navigate, isActive }">
                <div
                  class="sidebar-link child-link"
                  :class="{ active: isActive }"
                  @click="handleNavigation(navigate)"
                >
                  <font-awesome-icon
                    :icon="['fas', child.icon]"
                    class="icon mr-2"
                  />
                  <span>{{ $t(child.key) }}</span>
                </div>
              </router-link>
            </li>
          </ul>

          <ul v-else>
            <li>
              <router-link custom :to="link.uri" v-slot="{ navigate, isActive }">
                <div
                  class="sidebar-link d-flex align-items-center"
                  :class="{ active: isActive }"
                  @click="handleNavigation(navigate)"
                >
                  <font-awesome-icon :icon="['fas', link.icon]" class="icon mr-2" />
                  <span>{{ $t(link.key) }}</span>
                </div>
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </BCol>
  </aside>
</template> -->
<template lang="html">
  <BCol cols="10" md="4" lg="2" class="sidebar d-none d-md-block h-100" v-bind:class="{visible: active}" v-if="user.authenticated">
    <BRow class="p-0 m-0">
      <BCol class="pt-2 m-0">
        <h6 class="m-0 text-muted text-center">{{$t('dashboard.headers.activeTeam')}}</h6>
      </BCol>
    </BRow>
    <team-selector @updateTeam="$emit('updateTeam', $event)" :resetTeamsTrigger="resetTeamsTrigger" />
    <ul class="accordion-menu pl-2">
      <li v-for="(link, index) in filterLinks" :key="index" :class="{'has-children': link.children}">
        <input v-if="link.children" type="checkbox" :name="'group-'+index" :id="'group-'+index">
        <label v-if="link.children" :for="'group-'+index" class="sidebar-link ">
          <font-awesome-icon :icon="['fas', link.icon]" class="icon mr-2" />
          <span>{{ $t(link.key) }}</span>
        </label>

            <ul v-if="link.children">
        <li
          v-for="(child, childIndex) in link.children"
          :key="childIndex"
          @click="$emit('hide')"
        >
          <router-link custom :to="child.uri" v-slot="{ navigate, isActive }">
            <div
              class="sidebar-link child-link"
              :class="{ active: isActive }"
              @click="navigate"
            >
              <v-icon :name="child.icon" scale="1" class="icon mr-2" />
              <span>{{ $t(child.key) }}</span>
            </div>
          </router-link>
        </li>
      </ul>

      <ul v-else>
        <li @click="$emit('hide')">
          <router-link custom :to="link.uri" v-slot="{ navigate, isActive }">
            <div
              class="sidebar-link"
              :class="{ active: isActive }"
              @click="navigate"
            >
              <v-icon :name="link.icon" scale="1" class="icon mr-2" shape-rendering="geometricPrecision" />
              <span>{{ $t(link.key) }}</span>
            </div>
          </router-link>
        </li>
      </ul>
      </li>
    </ul>
  </BCol>
</template>

<script>
import { nextTick } from 'vue'
import { BCol, BRow } from 'bootstrap-vue-next'
import TeamSelector from '@/components/TeamSelector.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  name: 'Sidebar',
  components: {
    BCol,
    BRow,
    TeamSelector,
    FontAwesomeIcon
  },
  props: {
    active: { type: Boolean, required: true },
    resetTeamsTrigger: { type: Number, required: true },
    links: { type: Array, required: true },
    user: { type: Object, required: true }
  },
  computed: {
    filterLinks() {
      this.resetTeamsTrigger
      return this.user.admin
        ? this.links
        : this.links.filter(link => !link.admin)
    }
  },
  methods: {
    handleNavigation(navigate) {
      this.$emit('hide')
      nextTick(() => navigate().catch(() => {}))
    }
  }
}
</script>

<style scoped lang="scss">
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/bootstrap";

.accordion-menu input[type=checkbox] {
  position: absolute;
  opacity: 0;
}

.accordion-menu label,
.accordion-menu a {
  position: relative;
}

.accordion-menu .has-children ul,
.accordion-menu .has-children ul li {
  visibility: hidden;
  height: 0;
  transition: visibility 0s ease-out 0.3s, height ease-out 0.5s;
}

.accordion-menu .has-children [type=checkbox]:checked + label + ul {
  visibility: visible;
  height: auto;
  transition: visibility 0s ease-in 0.3s, height ease-in 0.3s;
}

.accordion-menu .has-children input[type=checkbox]:checked + label + ul li {
  visibility: visible;
  height: 3.5rem;
  display: flex;
  align-items: center;
  transition: visibility 0s ease-in 0.3s, height ease-in 0.3s;
}

.accordion-menu .has-children input[type=checkbox] {
  width: 0;
  height: 0;
}

.sidebar {
  display: block;
  padding: 0;
  z-index: 1020;
  background-color: #f5f5f5;
  border-right: 1px solid #eee;
  box-shadow: 5px 0 15px -7px #aaaaaa;
  left: -83.333333%;
  position: fixed;
  overflow-y: auto;
  transition: left 0.3s linear;
}

.sidebar.visible {
  left: 0;
}

.sidebar ul {
  list-style: none;
  padding-left: 0;
}

.sidebar-link {
  cursor: pointer;
  line-height: 3.5rem;
  padding: 0.425rem 20px;
  margin-bottom: 0;
  border-bottom: 1px solid rgba(189,195,199,0.30);
}

.sidebar-link:hover,
.sidebar-link.active {
  background-color: #e6e6e6;
}

.child-link {
  padding-left: 40px;
}

@include media-breakpoint-up(lg) {
  .sidebar {
    left: 0;
    position: relative;
  }
}
</style>
