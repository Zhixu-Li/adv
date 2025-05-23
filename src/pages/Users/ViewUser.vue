<template>
  <BRow class="pt-3">
    <BCol
      class="pb-2"
      cols="12"
      lg="6"
    >
      <User :user="user" />
    </BCol>
    <BCol
      class="pb-2"
      cols="12"
      lg="6"
    >
      <Teams
        :user-id="user.userId"
        :show-create="false"
      />
    </BCol>
    <BCol
      class="pb-2"
      cols="12"
      lg="6"
    >
      <Invoices :user-id="user.userId" />
    </BCol>
    <BCol
      class="pb-2"
      cols="12"
      lg="6"
    >
      <EventLog :user-id="user.userId" />
    </BCol>
  </BRow>
</template>

<script>
import { BRow, BCol } from 'bootstrap-vue-next'
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
    EventLog,
    BRow,
    BCol,
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
