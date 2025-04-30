
<template lang="html">
  <b-col
    v-if="user.authenticated"
    cols="10"
    md="4"
    lg="2"
    class="sidebar d-none d-md-block h-100"
    :class="{visible: active}"
  >
    <b-row class="p-0 m-0">
      <b-col class="pt-2 m-0">
        <h6 class="m-0 text-muted text-center">
          {{ $t('dashboard.headers.activeTeam') }}
        </h6>
      </b-col>
    </b-row>

    <team-selector
      :reset-teams-trigger="resetTeamsTrigger"
      @update-team="$emit('updateTeam', $event)"
    />

    <ul class="accordion-menu pl-2">
      <li
        v-for="(link, index) in filterLinks"
        :key="index"
        :class="{'has-children': link.children}"
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
          <v-icon
            :name="link.icon"
            scale="1"
            class="icon mr-2"
          />
          <span>{{ $t(link.key) }}</span>
        </label>

        <!-- Children links -->
        <ul v-if="link.children" @click="$emit('hide')">
          <li
            v-for="(child, childIndex) in link.children"
            :key="childIndex"
          >
            <router-link
              custom
              :to="child.uri"
              v-slot="{ navigate, isActive }"
            >
              <div
                class="sidebar-link child-link"
                :class="{ active: isActive }"
                @click="navigate"
              >
                <font-awesome-icon
                  :icon="child.icon"
                  class="icon mr-2"
                />
                <span>{{ $t(child.key) }}</span>
              </div>
            </router-link>
          </li>
        </ul>

        <!-- Single link if no children -->
        <ul v-else @click="$emit('hide')">
          <li class="sidebar-link">
            <router-link
              :to="link.uri"
              class="d-flex align-items-center"
            >
              <font-awesome-icon
                :icon="link.icon"
                class="icon mr-2"
              />
              <span>{{ $t(link.key) }}</span>
            </router-link>
          </li>
        </ul>
      </li>
    </ul>
  </b-col>
</template>

<script>
import TeamSelector from '@/components/TeamSelector.vue'

export default {
  name: 'Sidebar',
  components: { TeamSelector },
  props: {
    active: { type: Boolean, required: true },
    resetTeamsTrigger: { type: Number, required: true },
    links: { type: Array, required: true },
    user: { type: Object, required: true }
  },
  computed: {
    filterLinks() {
      this.resetTeamsTrigger; // re-compute when trigger changes
      return this.user.admin
        ? this.links
        : this.links.filter(i => !i.admin)
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

.accordion-menu label, .accordion-menu a {
  position: relative;
}

.accordion-menu .has-children ul li {
  visibility: hidden;
  height: 0;
  transition: visibility 0.3s ease-out 0.3, height ease-out 0.3s;
}

.accordion-menu .has-children ul {
  visibility: hidden;
  height: 0;
  transition: visibility 0s ease-out 0.3s, height ease-out 0.5s;
}

.accordion-menu .has-children input[type=checkbox]:checked + label + ul li {
  visibility: visible;
  height: 3.5rem;
  transition: visibility 0s ease-in 0.3s, height ease-in 0.3s;
  display: flex;
  align-items: center;
}

.accordion-menu .has-children input[type=checkbox]:checked + label + ul {
  visibility: visible;
  height: auto;
  transition: visibility 0s ease-in 0.3s, height ease-in 0.3s;
}

.accordion-menu .has-children input[type=checkbox] {
  height: 0;
  width: 0;
}

.sidebar {
  display: block;
  padding: 0;
  z-index: 1020;
  background-color: #f5f5f5;
  border-right: 1px solid #eee;
  box-shadow: 5px 0 15px -7px #aaaaaa;
  left: -83.333333%;
  transition: left 0.3s linear;
  position: fixed;
  overflow-y: auto;
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
  padding: .425rem 20px;
  display: block;
  margin-bottom: 0;
  border-bottom: 1px solid rgba(189,195,199,0.30);
  &:hover, &.router-link-active {
    background-color: #e6e6e6;
  }
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