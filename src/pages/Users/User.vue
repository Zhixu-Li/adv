<template>
  <BRow>
    <BModal
      id="deleteuser"
      size="lg"
      :title="$t('actions.delete')"
    >
      {{ $t('message.userDelete') }}
      <template #modal-footer>
        <button
          type="button"
          class="btn btn-primary left"
          @click="deleteUser"
        >
          {{ $t('answers.yes') }}
        </button>
        <button
          type="button"
          class="btn btn-primary right"
          @click="$bvModal.hide('deleteuser')"
        >
          {{ $t('answers.no') }}
        </button>
      </template>
    </BModal>

    <BCol cols="12" class="user-nav">
      <div class="d-flex justify-content-between align-items-center">
        <h1>{{ localUser.username }}</h1>
        <div>
          <BButton
            v-if="!localUser.verified"
            variant="primary"
            class="ml-2"
            @click="verify"
          >
            {{ $t('buttons.verify') }}
          </BButton>
          <BButton
            v-else
            disabled
            variant="primary"
            class="ml-2"
          >
            verified
          </BButton>
          <BButton
            variant="danger"
            class="ml-2"
            @click="$bvModal.show('deleteuser')"
          >
            {{ $t('actions.delete') }}
          </BButton>
        </div>
      </div>
    </BCol>

    <BCol cols="12" class="h-100 user-main">
      <div
        v-if="errors.length > 0"
        class="mt-2 mb-2 alert alert-danger"
      >
        <ul>
          <li v-for="(error, index) in errors" :key="index">
            {{ error }}
          </li>
        </ul>
      </div>

      <transition name="fade">
        <router-view :user="localUser" />
      </transition>
    </BCol>
  </BRow>
</template>

<script>
import {
  BRow,
  BCol,
  BModal,
  BButton
} from 'bootstrap-vue-next'
export default {
  components: {
    BRow,
    BCol,
    BModal,
    BButton
  },
  name: 'User',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      localUser: {},
      errors: [],
      dropdownOpen: false
    }
  },
  watch: {
    user: {
      immediate: true,
      handler(newVal) {
        this.localUser = { ...newVal }
      },
      deep: true
    }
  },
  methods: {
    deleteUser () {
      this.$axios.delete('v1/users/' + this.localUser.userId).then(
        () => {
          this.$notifications.add({
            title: 'Success',
            type: 'success',
            body: this.$t('notifications.userRemove'),
            timeout: true
          })
          this.$bvModal.hide('deleteuser')
          this.$emit('delete', this.localUser)
        },
        () => {
          this.$notifications.add({
            title: 'Error',
            type: 'danger',
            body: this.$t('notifications.userRemoveError'),
            timeout: true
          })
          this.$bvModal.hide('deleteuser')
        }
      )
    },
    verify () {
      this.$axios.get('auth/activate/' + this.localUser.userId + '/aa').then(
        () => {
          this.localUser.verified = true
          this.$emit('verified', this.localUser)
          this.$notifications.add({
            title: 'Success',
            type: 'success',
            body: this.$t('notifications.accountActivated'),
            timeout: true
          })
        },
        () => {
          this.$notifications.add({
            title: 'Alert',
            type: 'warning',
            body: this.$t('notifications.accountActivateError'),
            timeout: true
          })
        }
      )
    }
  }
}
</script>

<style scoped lang="scss">
.fade-enter-active {
  transition: opacity .5s;
}
.fade-enter {
  opacity: 0;
}

.user-nav {
  border-bottom: #e9e9e9 solid 1px;
  padding: 0 20px;
  background-color: white;
}

.user-main {
  padding-top: 54px;
}

@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/bootstrap";

@include media-breakpoint-up(md) {
  .user-nav {
    position: absolute;
  }
}
</style>
