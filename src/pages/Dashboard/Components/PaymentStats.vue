<template>
  <div>
    <b-card :title="'Payment Status'">
      <b-card-text>
        <div>
          <h5>
            Overall Status:
            <b-badge
              v-if="status"
              variant="success"
            >
              Good
            </b-badge>
            <span v-else>
              <b-badge variant="danger">Bad</b-badge>
              <label
                id="badHelp"
                class="ml-1"
                data-placement="top"
              >
                <v-icon name="question-circle" />
              </label>
              <b-popover
                target="badHelp"
                triggers="hover focus"
              >
                {{ $t('popover.badHelp') }}
              </b-popover>
            </span>
          </h5>
          <b-row>
            <b-col cols="6">
              <h5>Team</h5>
              <b-table-simple
                small
                borderless
              >
                <b-tr>
                  <b-td>
                    Team Contact
                  </b-td>
                  <b-td v-if="team.email">
                    <b-badge variant="success">
                      {{ team.email }}
                    </b-badge>
                  </b-td>
                  <b-td v-else>
                    <b-badge
                      :to="{ name: 'team', params: { teamId: team.teamId } }"
                      variant="danger"
                    >
                      Not Set
                    </b-badge>
                  </b-td>
                </b-tr>
                <b-tr>
                  <b-td>
                    Stripe Account
                  </b-td>
                  <b-td v-if="team.stripeConnected">
                    <b-badge variant="success">
                      Connected
                    </b-badge>
                  </b-td>
                  <b-td v-else>
                    <b-badge
                      :to="{ name: 'team', params: { teamId: team.teamId } }"
                      variant="danger"
                    >
                      Not Connected
                    </b-badge>
                  </b-td>
                </b-tr>
                <!-- <b-tr>
                  <b-td>
                    Stripe Standing
                  </b-td>
                  <b-td v-if="team">
                    <b-badge variant="success">Connected</b-badge>
                  </b-td>
                  <b-td>
                    <b-badge variant="danger">Not Connected</b-badge>
                  </b-td>
                </b-tr> -->
              </b-table-simple>
            </b-col>
            <b-col cols="6">
              <h5>Public Displays</h5>
              <b-table-simple
                v-if="filteredDisplays.length > 0"
                small
                borderless
              >
                <b-tr
                  v-for="display in filteredDisplays"
                  :key="display.id"
                >
                  <b-td>
                    {{ display.name }}
                  </b-td>
                  <b-td>
                    <b-badge
                      v-if="display.approval && display.blockTime > 0 && display.maxTimePurchasable > 0 && display.baselinePrice !== null"
                      variant="success"
                    >
                      Ready
                    </b-badge>
                    <b-badge
                      v-if="!display.approval"
                      class="mr-1"
                      variant="warning"
                    >
                      Pending Approval
                    </b-badge>
                    <b-badge
                      v-if="display.blockTime <= 0"
                      :to="{ name: 'display-pricing', params: { displayId: display.displayId } }"
                      class="mr-1"
                      variant="danger"
                    >
                      Block Time
                    </b-badge>
                    <b-badge
                      v-if="display.maxTimePurchasable <= 0"
                      :to="{ name: 'display-pricing', params: { displayId: display.displayId } }"
                      class="mr-1"
                      variant="danger"
                    >
                      Max Time
                    </b-badge>
                    <b-badge
                      v-if="display.baselinePrice === null"
                      :to="{ name: 'display-pricing', params: { displayId: display.displayId } }"
                      class="mr-1"
                      variant="danger"
                    >
                      Baseline Price
                    </b-badge>
                  </b-td>
                </b-tr>
              </b-table-simple>
              <p v-else>
                No public displays
              </p>
            </b-col>
          </b-row>
        </div>
      </b-card-text>
    </b-card>
  </div>
</template>

<script>

export default {
  components: {
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
