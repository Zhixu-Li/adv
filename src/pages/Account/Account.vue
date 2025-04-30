<template>
  <div class="pt-3">
    <div
      v-show="loading"
      class="loader"
    >
      <div class="spinner" />
    </div>
    <b-row
      v-show="!loading"
      class="view h-100"
    >
      <b-col
        class="pb-2"
        cols="12"
        lg="6"
      >
        <user :user="user" />
      </b-col>
      <b-col
        class="pb-2"
        cols="12"
        lg="6"
      >
        <teams :user-id="user.userId" />
      </b-col>
      <b-col
        class="pb-2"
        cols="12"
        lg="6"
      >
        <invoices :user-id="user.userId" />
      </b-col>
      <b-col
        class="pb-2"
        cols="12"
        lg="6"
      >
        <event-log :user-id="user.userId" />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import User from '@/components/User/User.vue'
import Teams from '@/components/User/Teams.vue'
import Invoices from '@/components/User/Invoices.vue'
import EventLog from '@/components/User/EventLog.vue'

export default {
  name: 'ViewUser',
  components: {
    User,
    Teams,
    Invoices,
    EventLog
  },
  data () {
    return {
      user: {},
      loading: true
    }
  },
  mounted: function () {
    this.fetchUser()
  },
  methods: {
    fetchUser: function () {
      var scope = this
      this.loading = true
      this.$axios.get('v1/users/' + this.$auth.user.id).then(
        (response) => {
          this.user = response.data.data
          this.loading = false
        }).catch(
        function (error) {
          if (!error.response) {
            scope.$notifications.add({
              title: 'Error',
              type: 'warning',
              body: error.message,
              timeout: true
            })
          } else if (error.response.status !== 404) {
            scope.$notifications.add({
              title: 'Error',
              type: 'warning',
              body: error.response.data.message,
              timeout: true
            })
          }
          scope.loading = false
        }
      )
    }
  }
}
</script>

<style scoped lang="scss">
.view {
  overflow-y: auto;
}
</style>
