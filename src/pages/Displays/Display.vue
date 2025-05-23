<template>
  <BContainer fluid class="text-center">
    <!-- Delete Confirmation Modal -->
    <BModal
      id="delete-modal"
      :title="$t('actions.delete') + ' ' + display.name"
      hide-footer
    >
      {{ $t('message.displayDelete') }}
      <template #modal-footer>
        <BButton variant="danger" class="me-2" @click="deleteDisplay">
          {{ $t('answers.yes') }}
        </BButton>
        <BButton variant="secondary" @click="$bvModal.hide('delete-modal')">
          {{ $t('answers.no') }}
        </BButton>
      </template>
    </BModal>

    <!-- Desktop Header with Toolbar -->
    <BCol class="d-none d-md-block">
      <div class="d-flex p-1 justify-content-between border-bottom">
        <h2>{{ display.name }}</h2>
        <BButtonToolbar>
          <BButtonGroup>
            <BButton
              v-for="btn in buttons"
              :key="btn.route"
              :to="{ name: btn.route, params: { displayId: display.displayId } }"
              :variant="isActive(btn.route) ? 'primary' : 'outline-primary'"
              :disabled="isActive(btn.route)"
            >
              {{ $t(btn.label) }}
            </BButton>
            <BButton variant="danger" @click="$bvModal.show('delete-modal')">
              {{ $t('actions.delete') }}
            </BButton>
          </BButtonGroup>
        </BButtonToolbar>
      </div>
    </BCol>

    <!-- Mobile Header with Dropdown -->
    <BCol class="d-md-none">
      <div class="d-flex p-1 justify-content-between border-bottom">
        <h3>{{ display.name }}</h3>
        <BDropdown id="mobile-actions" variant="outline-dark" size="lg" text="⠇">
          <BDropdownItem
            v-for="btn in buttons"
            :key="btn.route"
            :to="{ name: btn.route, params: { displayId: display.displayId } }"
          >
            {{ $t(btn.label) }}
          </BDropdownItem>
          <BDropdownItem @click="$bvModal.show('delete-modal')">
            {{ $t('actions.delete') }}
          </BDropdownItem>
        </BDropdown>
      </div>
    </BCol>

    <!-- Main Content -->
    <BCol cols="12" class="h-100 display-main">
      <transition name="fade">
        <router-view
          v-if="display"
          :active-team="activeTeam"
          :display="{ ...display }"
          @refresh-displays="$emit('refreshDisplays')"
        />
      </transition>
    </BCol>
  </BContainer>
</template>
<script>
import teamContext from '@/mixins/teamContext'
import {
  BContainer,
  BCol,
  BModal,
  BButton,
  BButtonToolbar,
  BButtonGroup,
  BDropdown,
  BDropdownItem
} from 'bootstrap-vue-next'
export default {
  components:{
      BContainer,
    BCol,
    BModal,
    BButton,
    BButtonToolbar,
    BButtonGroup,
    BDropdown,
    BDropdownItem
  },
  name: 'Display',
  mixins: [teamContext],
  props: {
    display: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      show: false,
      dropdownOpen: false,
      buttons: [{
          label: 'actions.view',
          route: 'display-view'
        },
        {
          label: 'actions.edit',
          route: 'display-edit'
        }, {
          label: 'actions.dashboard',
          route: 'display-dashboard'
        }, {
          label: 'actions.coupons',
          route: 'display-coupons'
        }, {
          label: 'actions.pricing',
          route: 'display-pricing'
        }
      ],
    }
  },
  beforeUnmount () {
    this.$emit('refresh')
  },
  methods: {
    deleteDisplay () {
      this.$axios.delete('v1/displays/' + this.display.displayId).then(
      () => {
        this.$notifications.add({
          title: 'Success',
          type: 'success',
          body: this.$t('notifications.displayDelete'),
          timeout: true
        })
        this.$bvModal.hide('delete-modal')
        this.$emit('delete')
      },
      (response) => {
        this.$notifications.add({
          title: 'Error',
          type: 'danger',
          body: response.data.message || this.$t('notifications.displayDeleteError'),
          timeout: true
        })
        this.$bvModal.hide('delete-modal')
      })
    }
  }
}
</script>

<style scoped lang="scss">
  .fade-enter-active {
    transition: opacity .5s
  }
  .fade-enter {
    opacity: 0
  }

  .display-nav {
    border-bottom: #e9e9e9 solid 1px;
    padding: 0 20px 0 20px;
    position: fixed;
    z-index: 50;
    background-color: white;
  }

  .delete-button {
    margin: 5px;
  }


// @import "node_modules/bootstrap/scss/_functions.scss";
// @import "node_modules/bootstrap/scss/_variables.scss";
// @import "node_modules/bootstrap/scss/mixins/_breakpoints.scss";
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/bootstrap";
  @include media-breakpoint-up(xs) {
    .dropdown-toggle {
      display: none;

      &.ellipsis {
        display:block;
      }
    }
  }

  @include media-breakpoint-up(md) {
    .dropdown-toggle {
      display: block;

      &.ellipsis {
        display: none;
      }
    }

    .display-nav {
      position: absolute;
    }
  }

</style>
