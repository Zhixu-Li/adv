<template>
  <b-container
    fluid
    text-center
  >
    <b-modal
      id="delete-modal"
      :title="$t('actions.delete') + ' ' + display.name"
    >
      {{ $t('message.displayDelete') }}
      <template #modal-footer>
        <button
          type="button"
          class="btn delete-button btn-primary left"
          @click="deleteDisplay()"
        >
          {{ $t('answers.yes') }}
        </button>
        <button
          type="button"
          class="btn delete-button btn-primary right"
          @click="$bvModal.hide('delete-modal')"
        >
          {{ $t('answers.no') }}
        </button>
      </template>
    </b-modal>

    <b-col class="d-none d-md-block">
      <div class="d-flex p-1 justify-content-between border-bottom">
        <h2>{{ display.name }}</h2>
        <b-button-toolbar>
          <b-button-group class="delete-button">
            <b-button
              v-for="button in buttons"
              :key="button.route"
              :disabled="$router.currentRoute.name === button.route"
              :variant="$router.currentRoute.name === button.route ? 'primary' : 'outline-primary'"
              :to="{ name: button.route, params: { displayId: display.displayId } }"
            >
              {{ $t(button.label) }}
            </b-button>
            <b-button
              variant="danger"
              @click="$bvModal.show('delete-modal')"
            >
              {{ $t('actions.delete') }}
            </b-button>
          </b-button-group>
        </b-button-toolbar>
      </div>
    </b-col>
    <!-- For mobile viewing -->
    <b-col class="d-md-none">
      <div class="d-flex p-1 justify-content-between border-bottom">
        <h3>{{ display.name }}</h3>
        <b-dropdown
          id="dropdown-1"
          :text="$t('actions.actions')"
          class="m-2"
          variant="outline-dark"
          size="lg"
        >
          <b-dropdown-item
            v-for="button in buttons"
            :key="button.route"
            :to="{ name: button.route, params: { displayId: display.displayId } }"
          >
            <h5>{{ $t(button.label) }}</h5>
          </b-dropdown-item>
          <b-dropdown-item @click="$bvModal.show('delete-modal')">
            <h5>{{ $t('actions.delete') }}</h5>
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </b-col>

    <b-col
      cols="12"
      class="h-100 display-main"
    >
      <transition name="fade">
        <router-view
          v-if="display !== {}"
          :active-team="activeTeam"
          :display="{...display}"
          @refresh-displays="$emit('refreshDisplays')"
        />
      </transition>
    </b-col>
  </b-container>
</template>

<script>
import teamContext from '@/mixins/teamContext'

export default {
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
