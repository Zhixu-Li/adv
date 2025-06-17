<template lang="html">
  <BRow>
    <BCol cols="12" lg="6">
      <BRow class="pl-3">
        <BCol cols="12" class="p-0">
          <Approval :active-team="activeTeam" />
        </BCol>
        <BCol cols="12" class="p-0">
          <Network :active-team="activeTeam" :displays="displays" />
        </BCol>
        <BCol cols="12" class="p-0 mt-2">
          <BCard>
            <BCardText>
              <BCol class="mx-auto" cols="12" xl="11">
                <Campaigns :active-team="activeTeam" :refresh-time="refreshTime" />
                <Media class="pt-2" :active-team="activeTeam" :refresh-time="refreshTime" />
              </BCol>
            </BCardText>
          </BCard>
        </BCol>
        <BCol cols="12" class="p-0 mt-2">
          <Links :active-team="activeTeam" :displays="displays" :refresh-time="refreshTime" />
        </BCol>
        <BCol cols="12" class="p-0 mt-2">
          <Payment :active-team="activeTeam" :displays="displays" />
        </BCol>
      </BRow>
    </BCol>

    <BCol cols="12" lg="6" class="pl-2">
      <BCol
        v-if="supportUrl==='https://support.adverpost.com/'"
        cols="12"
        class="p-0 mb-2"
      >
        <BCard>
          <BRow class="pl-4 pr-4">
            <BCol cols="12" xl="6">
              <h3 class="mt-0 pt-0">Support</h3>
              <p>
                Support for the Adverpost system is typically provided by your reseller.
                If you have purchased access to Adverpost directly from One World LED,
                or have an active support contract with us, tickets can be created using
                the facilities on this page.
              </p>
              <p>
                Other resources are available
                <a :href="supportUrl">here</a>.
              </p>
            </BCol>
            <BCol cols="12" xl="6" class="border rounded pt-3">
              <h5 class="text-center">Create Support Ticket</h5>
              <p class="text-center">
                <a
                  href="//support.oneworldled.com/"
                  role="button"
                  class="btn btn-primary btn-lg m-1"
                >Australia</a>
                <a
                  href="//oneworldledusa.com/support"
                  role="button"
                  class="btn btn-primary btn-lg m-1"
                >United States</a>
              </p>
              <p class="text-center">
                Telephone number (within Australia):
                <a href="tel:0883744557">(08) 8374 4557 <i class="fas fa-phone" /></a><br />
                (10AM to 5PM weekdays ACST)
              </p>
            </BCol>
          </BRow>
        </BCard>
      </BCol>

      <BCol cols="12" class="p-0">
        <Active :active-team="activeTeam" />
      </BCol>

      <BCol v-if="false && displays.length" cols="12" class="pt-2">
        <BCard>
          <Graph :displays="displays" />
        </BCard>
      </BCol>
    </BCol>
  </BRow>
</template>

<script>import {
  BRow,
  BCol,
  BCard,
  BCardText
} from 'bootstrap-vue-next'
import Active from './Active'
import Approval from './Approval'
import Campaigns from './CampaignStats'
import Media from './MediaStats'
import Network from './Network'
import Links from './QuickLinks'
// import News from './News'
import Payment from './PaymentStats'
import Graph from './Graphs'
import teamContext from '@/mixins/teamContext'

export default {
  components: {
    Active,
    Approval,
    Campaigns,
    Media,
    Network,
    Links,
    // News,
    Graph,
    Payment,
    BRow,
    BCol,
    BCard,
    BCardText,
  },
  mixins: [teamContext],
  props: {
    displays: {
      type: Array,
      required: true
    },
    refreshTime: {
      type: Number,
      required: false,
      default: 5
    }
  },
  data () {
    return {
      supportUrl: process.env.VUE_APP_SUPPORT_URL,
      approvalHidden: false,
    }
  }
}
</script>

<style lang="css">
.text-red {
  color: rgb(192, 28, 45)
}
.red-bg {
  background-color: rgb(192, 28, 45)
}
</style>
