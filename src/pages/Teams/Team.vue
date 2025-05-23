<template>
  <BContainer fluid>
    <BRow class="pt-3">
      <BModal id="delete-modal" :title="$t('actions.delete') + ' ' + team.name">
        {{ $t('message.teamDelete') }}
        <p>{{ $t('message.teamDeleteConfirm') }}</p>
        <BFormInput v-model="confirmText" placeholder="Confirm Here" />

        <template #modal-footer>
          <BButton
            variant="danger"
            :disabled="!confirmation"
            class="m-1"
            @click="deleteTeam()"
          >
            {{ $t('answers.yes') }}
          </BButton>
          <BButton
            variant="primary"
            class="m-1"
            @click="$bvModal.hide('delete-modal'); confirmText=''"
          >
            {{ $t('answers.no') }}
          </BButton>
        </template>
      </BModal>

      <BCol cols="12" class="team-nav">
        <div class="d-flex pl-3 justify-content-between align-items-center">
          <h1>{{ team.name }}</h1>
          <BButton variant="danger" @click="$bvModal.show('delete-modal')">
            {{ $t('buttons.delete') }}
          </BButton>
        </div>
      </BCol>

      <BCol cols="12" class="h-100 team-main">
        <div v-if="errors.length" class="mt-2 mb-2 alert alert-danger">
          <ul>
            <li v-for="(error, idx) in errors" :key="idx">{{ error }}</li>
          </ul>
        </div>
        <transition name="fade">
          <TeamView
            :team-id="team.teamId"
            :show-displays="true"
            :show-campaigns="true"
          />
        </transition>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
import TeamView from '@/components/User/Team.vue'
import {
  BContainer,
  BRow,
  BCol,
  BModal,
  BFormInput,
  BButton
} from 'bootstrap-vue-next'

export default {
  name: 'Team',
  components: {
    TeamView,
    BContainer,
    BRow,
    BCol,
    BModal,
    BFormInput,
    BButton,
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
