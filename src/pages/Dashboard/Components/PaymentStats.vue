<template>
  <div>
    <BCard title="Payment Status">
      <BCardText>
        <div>
          <h5>
            Overall Status:
            <BBadge v-if="status" variant="success">Good</BBadge>
            <span v-else>
              <BBadge variant="danger">Bad</BBadge>
              <label id="badHelp" class="ms-1" data-placement="top">
                <v-icon name="question-circle" />
              </label>
              <BPopover target="badHelp" triggers="hover focus">
                {{ $t('popover.badHelp') }}
              </BPopover>
            </span>
          </h5>

          <BRow>
            <BCol cols="6">
              <h5>Team</h5>
              <BTableSimple small borderless>
                <BTr>
                  <BTd>Team Contact</BTd>
                  <BTd v-if="team.email">
                    <BBadge variant="success">{{ team.email }}</BBadge>
                  </BTd>
                  <BTd v-else>
                    <BBadge
                      variant="danger"
                      :to="{ name:'team', params:{ teamId:team.teamId } }"
                    >Not Set</BBadge>
                  </BTd>
                </BTr>
                <BTr>
                  <BTd>Stripe Account</BTd>
                  <BTd v-if="team.stripeConnected">
                    <BBadge variant="success">Connected</BBadge>
                  </BTd>
                  <BTd v-else>
                    <BBadge
                      variant="danger"
                      :to="{ name:'team', params:{ teamId:team.teamId } }"
                    >Not Connected</BBadge>
                  </BTd>
                </BTr>
              </BTableSimple>
            </BCol>

            <BCol cols="6">
              <h5>Public Displays</h5>
              <BTableSimple v-if="filteredDisplays.length" small borderless>
                <BTr
                  v-for="display in filteredDisplays"
                  :key="display.id"
                >
                  <BTd>{{ display.name }}</BTd>
                  <BTd>
                    <BBadge
                      v-if="display.approval && display.blockTime>0 && display.maxTimePurchasable>0 && display.baselinePrice!==null"
                      variant="success"
                    >Ready</BBadge>
                    <BBadge
                      v-if="!display.approval"
                      variant="warning"
                      class="me-1"
                    >Pending Approval</BBadge>
                    <BBadge
                      v-if="display.blockTime<=0"
                      variant="danger"
                      class="me-1"
                      :to="{ name:'display-pricing', params:{ displayId:display.displayId } }"
                    >Block Time</BBadge>
                    <BBadge
                      v-if="display.maxTimePurchasable<=0"
                      variant="danger"
                      class="me-1"
                      :to="{ name:'display-pricing', params:{ displayId:display.displayId } }"
                    >Max Time</BBadge>
                    <BBadge
                      v-if="display.baselinePrice===null"
                      variant="danger"
                      class="me-1"
                      :to="{ name:'display-pricing', params:{ displayId:display.displayId } }"
                    >Baseline Price</BBadge>
                  </BTd>
                </BTr>
              </BTableSimple>
              <p v-else>No public displays</p>
            </BCol>
          </BRow>
        </div>
      </BCardText>
    </BCard>
  </div>
</template>

<script>
import {
  BCard,
  BCardText,
  BRow,
  BCol,
  BTableSimple,
  BTr,
  BTd,
  BBadge,
  BPopover
} from 'bootstrap-vue-next'
export default {
  components: {
    BCard,
    BCardText,
    BRow,
    BCol,
    BTableSimple,
    BTr,
    BTd,
    BBadge,
    BPopover,
  },
  props: {
    activeTeam: {
      type: Object,
      required: true
    },
    displays: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      team: {}
    }
  },
  computed: {
    status () {
      if (!this.team.email) {
        return false
      }
      if (!this.team.stripeConnected) {
        return false
      }
      let goodDisplays = this.filteredDisplays.filter((display) => {
        if (display.blockTime > 0 || display.approval || display.maxTimePurchasable > 0 || display.baselinePrice !== null) {
          return true
        }
      })
      if (goodDisplays.length < 1) {
        return false
      }

      return true
    },
    filteredDisplays () {
      return this.displays.filter((display) => {
        if (display.private == false) {
          return true
        }
      })
    }
  },
  watch: {
    'activeTeam': function() {
      this.fetchTeam()
    },
  },
  mounted() {
    this.fetchTeam()
  },
  methods: {
    fetchTeam () {
      var scope = this
      this.$axios.get('v1/teams/' + this.activeTeam.id).then(
        (response) => {
          this.team = response.data.data
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
        }
      )
    },
    
  }
}
</script>

<style scoped lang="scss">
div.dashboard {
  min-height: 100%;
}

.preview {
  height: 40vh;
}

</style>
