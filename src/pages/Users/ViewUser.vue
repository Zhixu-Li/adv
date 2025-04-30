<template>
  <b-row class="pt-3">
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
      <teams
        :user-id="user.userId"
        :show-create="false"
      />
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
  props: {
    user: {
      type: Object
    }
  }
}
</script>

<style scoped lang="scss">
</style>
