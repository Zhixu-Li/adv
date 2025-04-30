<template>
  <b-container fluid>
    <b-row class="pt-3">
      <!-- can we do this another way? -->

      <!-- <b-modal id="delete-modal" :title="$t('actions.delete') + ' ' + team.name">
      {{$t('message.teamDelete')}}
      <p>{{$t('message.teamDeleteConfirm')}}</p>
      <b-form-input v-model="confirmText" placeholder="Confirm Here"></b-form-input>
      <div slot="modal-footer">
        <b-button variant="danger" :disabled="!confirmation" class="m-1" @click="deleteTeam()">{{$t('answers.yes')}}</b-button> 
        <b-button variant="primary" class="m-1" @click="$bvModal.hide('delete-modal'); confirmText=''">{{$t('answers.no')}}</b-button>
      </div>
    </b-modal> -->
      <b-modal
        id="delete-modal"
        :title="$t('actions.delete') + ' ' + team.name"
      >
        {{ $t('message.teamDelete') }}
        <p>{{ $t('message.teamDeleteConfirm') }}</p>
        <b-form-input
          v-model="confirmText"
          placeholder="Confirm Here"
        />

        <template #modal-footer>
          <b-button
            variant="danger"
            :disabled="!confirmation"
            class="m-1"
            @click="deleteTeam()"
          >
            {{ $t('answers.yes') }}
          </b-button> 
          <b-button
            variant="primary"
            class="m-1"
            @click="$bvModal.hide('delete-modal'); confirmText=''"
          >
            {{ $t('answers.no') }}
          </b-button>
        </template>
      </b-modal>
      <b-col
        cols="12"
        class="team-nav"
      >
        <div class="d-flex pl-3 justify-content-between align-items-center">
          <h1>{{ team.name }}</h1>
          <div
            class="btn btn-danger"
            @click="$bvModal.show('delete-modal')"
          >
            <a>{{ $t('buttons.delete') }}</a>
          </div>
        </div>
      </b-col>
      <b-col
        cols="12"
        class="h-100 team-main"
      >
        <div
          v-if="errors.length > 0"
          class="mt-2 mb-2 alert alert-danger"
        >
          <ul>
            <li
              v-for="(error, index) in errors"
              :key="index"
            >
              {{ error }}
            </li>
          </ul>
        </div>
        <transition name="fade">
          <team-view
            :team-id="team.teamId"
            :show-displays="true"
            :show-campaigns="true"
          />
        </transition>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import TeamView from '@/components/User/Team.vue'

export default {
  name: 'Team',
  components: {
    TeamView
  },
  props: {
    team: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      show: false,
      errors: [],
      dropdownOpen: false,
      confirmText: ''
    }
  },
  computed: {
    confirmation: function () {
      if (this.confirmText === "DELETE") {
        return true
      }
      else {
        return false
      }
      
    }
  },
  methods: {
    deleteTeam () {
      this.$axios.delete('v1/teams/' + this.team.teamId).then(
      () => {
        this.$notifications.add({
          title: 'Success',
          type: 'success',
          body: this.$t('notifications.teamRemove'),
          timeout: true
        })
        this.show = false
        this.$emit('delete')
      },
      () => {
        this.$notifications.add({
          title: 'Error',
          type: 'danger',
          body: this.$t('notifications.teamremoveError'),
          timeout: true
        })
        this.show = false
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

.team-nav {
  border-bottom: #e9e9e9 solid 1px;
  padding: 0 20px 0 20px;
  // position: fixed;
  // z-index: 99;
  background-color: white;
}

.team-main {
  padding-top: 54px;
}


// @import "node_modules/bootstrap/scss/_functions.scss";
// @import "node_modules/bootstrap/scss/_variables.scss";
// @import "node_modules/bootstrap/scss/mixins/_breakpoints.scss";

@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/bootstrap";
@include media-breakpoint-up(md) {
  .team-nav {
    position: absolute;
  }
}
</style>
