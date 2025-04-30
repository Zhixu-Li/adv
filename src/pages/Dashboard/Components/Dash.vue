<template lang="html">
  <b-row class="">
    <b-col
      cols="12"
      lg="6"
    >
      <b-row class="pl-3">
        <b-col
          cols="12"
          class="p-0"
        >
          <approval :active-team="activeTeam" />
        </b-col>
        <b-col
          cols="12"
          class="p-0"
        >
          <network
            :active-team="activeTeam"
            :displays="displays"
          />
        </b-col>
        <b-col
          cols="12"
          class="p-0 mt-2"
        >
          <b-card>
            <b-card-text>
              <b-col
                class="mx-auto"
                cols="12"
                xl="11"
              >
                <campaigns
                  :active-team="activeTeam"
                  :refresh-time="refreshTime"
                />
                <media
                  class="pt-2"
                  :active-team="activeTeam"
                  :refresh-time="refreshTime"
                />
              </b-col>
            </b-card-text>
          </b-card>
        </b-col>
        <b-col
          cols="12"
          class="p-0 mt-2"
        >
          <links
            :active-team="activeTeam"
            :displays="displays"
            :refresh-time="refreshTime"
          />
        </b-col>
        <b-col
          cols="12"
          class="p-0 mt-2"
        >
          <payment
            :active-team="activeTeam"
            :displays="displays"
          />
        </b-col>
      </b-row>
    </b-col>
    <b-col
      cols="12"
      lg="6"
      class="pl-2"
    >
      <b-col
        v-if="supportUrl==='https://support.adverpost.com/'"
        cols="12"
        class="p-0 mb-2"
      >
        <b-card class="">
          <b-row class="pl-4 pr-4">
            <b-col
              cols="12"
              xl="6"
            >
              <h3 class="mt-0 pt-0">
                Support
              </h3>
              <p>
                Support for the Adverpost system is typically provided by your reseller. If you have purchased
                access to Adverpost directly from One World LED, or have an active support contract with us, tickets can be
                created using the facilities on this page.
              </p>
              <p>
                Other resources are available <a
                  style="display: inline"
                  :href="supportUrl"
                >here</a>.
              </p>
            </b-col>
            <b-col
              cols="12"
              xl="6"
              class="border rounded pt-3"
            >
              <h5 class="text-center">
                Create Support Ticket
              </h5>
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
                Telephone number (within Australia): <a href="tel:0883744557">(08) 8374 4557 <i
                  class="fas fa-phone"
                /></a> <br>(10AM to 5PM weekdays ACST)
              </p>
            </b-col>
          </b-row>
        </b-card>
      </b-col>
      <b-col
        cols="12"
        class="p-0"
      >
        <active :active-team="activeTeam" />
      </b-col>
      <b-col
        v-if="false && displays.length > 0"
        cols="12"
        class="pt-2"
      >
        <b-card>
          <template>
            <Graph :displays="displays" />
          </template>
        </b-card>
      </b-col>
    </b-col>
  </b-row>
</template>

<script>
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
    Payment
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
