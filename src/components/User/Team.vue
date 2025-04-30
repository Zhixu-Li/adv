<template lang="html">
  <b-container>
    <b-row class="pt-3">
      <b-col
        cols="6"
        class="mb-3"
      >
        <b-card :header="$t('common.information')">
          <b-card-text>
            <b-form-group
              :label="$t('common.name')"
              label-for="teamName"
            >
              <b-form-input
                id="teamName"
                v-model="team.name"
                :disabled="!hasAccess"
              />
            </b-form-group>
            <b-form-group
              :label="$t('teams.slug')"
              label-for="teamSlug"
            >
              <b-form-input
                id="teamSlug"
                v-model="team.abbrev"
                :disabled="!hasAccess"
              />
            </b-form-group>
            <b-form-group
              :label="$t('teams.description')"
              label-for="teamDescription"
            >
              <b-form-input
                id="teamDescription"
                v-model="team.description"
                :disabled="!hasAccess"
              />
            </b-form-group>
            <b-form-group
              :label="$t('teams.email')"
              label-for="teamEmail"
              description="Email address is required for teams with public displays."
            >
              <b-form-input
                id="teamEmail"
                v-model="team.email"
                :disabled="!hasAccess"
              />
            </b-form-group>
            <div class="pt-3">
              <a
                v-if="!team.stripeConnected
                  && ($auth.user.admin
                    || $auth.user.hasAccessInTeam(team.teamId, 'owner')
                    || $auth.user.hasAccessInTeam(team.teamId, 'thirdPartyKey'))"
                :href="stripeConnectLink"
                class="stripe-connect light-blue"
              >
                <span>{{ $t('stripe.toConnect') }}</span>
              </a>
              <b-button
                v-else
                variant="primary"
                @click="fetchDashboard"
              >
                Stripe Dashboard
              </b-button>
            </div>


            <b-button
              v-if="hasAccess"
              variant="primary"
              class="float-right"
              @click="updateTeam"
            >
              {{ $t('buttons.save') }}
            </b-button>
          </b-card-text>
        </b-card>
      </b-col>
      <b-col
        v-if="hasAccess"
        cols="6"
        class="mb-3"
      >
        <b-card :header="$t('teams.addUser')">
          <b-card-text>
            <b-form-group
              :label="$t('user.user')"
              label-for="user"
              description="Please ensure the user already exists."
            >
              <b-form-input
                id="user"
                v-model="user.user"
                :placeholder="$t('user.usernameEmail')"
              />
            </b-form-group>
            <b-form-group
              inline
              :label="$t('permissions.permissions')"
            >
              <b-row>
                <b-col cols="6">
                  <b-form-group stacked>
                    <b-form-checkbox
                      id="owner"
                      v-model="user.owner"
                    >
                      {{ $t('permissions.owner') }}
                    </b-form-checkbox>
                    <b-form-checkbox
                      id="display"
                      v-model="user.display"
                    >
                      {{ $t('permissions.display') }}
                    </b-form-checkbox>
                    <b-form-checkbox
                      id="pricing"
                      v-model="user.pricing"
                    >
                      {{ $t('permissions.pricing') }}
                    </b-form-checkbox>
                    <b-form-checkbox
                      id="campaign"
                      v-model="user.campaign"
                    >
                      {{ $t('permissions.campaign') }}
                    </b-form-checkbox>
                  </b-form-group>
                </b-col> <b-col cols="6">
                  <b-form-group stacked>
                    <b-form-checkbox
                      id="media"
                      v-model="user.media"
                    >
                      {{ $t('permissions.media') }}
                    </b-form-checkbox>
                    <b-form-checkbox
                      id="invoice"
                      v-model="user.invoice"
                    >
                      {{ $t('permissions.invoice') }}
                    </b-form-checkbox>
                    <b-form-checkbox
                      id="thirdPartyKey"
                      v-model="user.thirdPartyKey"
                    >
                      {{ $t('permissions.thirdParty') }}
                    </b-form-checkbox>
                    <b-form-checkbox
                      id="team"
                      v-model="user.team"
                    >
                      {{ $t('permissions.team') }}
                    </b-form-checkbox>
                  </b-form-group>
                </b-col>
              </b-row>
            </b-form-group>
            <b-button
              variant="primary"
              class="float-right pointer"
              @click="addUser"
            >
              {{ $t('buttons.add') }}
            </b-button>
          </b-card-text>
        </b-card>
      </b-col>
      <b-col
        cols="12"
        class="mb-3"
      >
        <b-card :header="$t('user.users')">
          <b-card-text>
            <b-table-simple
              v-if="hasAccess"
              striped
              responsive
              hover
            >
              <b-thead>
                <b-tr>
                  <b-th />
                  <b-th>{{ $t('permissions.display') }}</b-th>
                  <b-th>{{ $t('permissions.pricing') }}</b-th>
                  <b-th>{{ $t('permissions.campaign') }}</b-th>
                  <b-th>{{ $t('permissions.media') }}</b-th>
                  <b-th>{{ $t('permissions.invoice') }}</b-th>
                  <b-th>{{ $t('permissions.thirdParty') }}</b-th>
                  <b-th>{{ $t('permissions.team') }}</b-th>
                  <b-th>{{ $t('permissions.owner') }}</b-th>
                  <b-th />
                </b-tr>
              </b-thead>
              <b-tbody>
                <b-tr
                  v-for="user in users"
                  :key="user.userId"
                >
                  <b-td>{{ user.user }}</b-td>
                  <b-td>
                    <input
                      v-model="user.teamPermissions.displayAccess"
                      type="checkbox"
                      @change="updateUser(user)"
                    >
                  </b-td>
                  <b-td>
                    <input
                      v-model="user.teamPermissions.pricingAccess"
                      type="checkbox"
                      @change="updateUser(user)"
                    >
                  </b-td>
                  <b-td>
                    <input
                      v-model="user.teamPermissions.campaignAccess"
                      type="checkbox"
                      @change="updateUser(user)"
                    >
                  </b-td>
                  <b-td>
                    <input
                      v-model="user.teamPermissions.mediaAccess"
                      type="checkbox"
                      @change="updateUser(user)"
                    >
                  </b-td>
                  <b-td>
                    <input
                      v-model="user.teamPermissions.invoiceAccess"
                      type="checkbox"
                      @change="updateUser(user)"
                    >
                  </b-td>
                  <b-td>
                    <input
                      v-model="user.teamPermissions.thirdPartyKeyAccess"
                      type="checkbox"
                      @change="updateUser(user)"
                    >
                  </b-td>
                  <b-td>
                    <input
                      v-model="user.teamPermissions.teamAccess"
                      type="checkbox"
                      @change="updateUser(user)"
                    >
                  </b-td>
                  <b-td>
                    <input
                      v-model="user.owner"
                      type="checkbox"
                      @change="updateUser(user)"
                    >
                  </b-td>
                  <b-td>
                    <span
                      class="badge badge-default badge-danger"
                      @click.stop="removeUser(teamId, user.userId, user.user)"
                    >{{ $t('buttons.remove') }}</span>
                  </b-td>
                </b-tr>
              </b-tbody>
            </b-table-simple>
            <ul
              v-else
              class="list-group"
            >
              <li
                v-for="user in users"
                :key="user.userId"
                class="list-group-item list-group-item-action justify-content-between"
              >
                {{ user.user }}
              </li>
            </ul>
          </b-card-text>
        </b-card>
      </b-col>
      <b-col
        v-if="thirdPartyKeyAccess"
        cols="12"
        class="mb-3"
      >
        <b-card :header="$t('permissions.thirdParty')">
          <b-card-text>
            <b-table-simple
              v-if="keys.length > 0"
              striped
              responsive
              hover
            >
              <b-thead>
                <b-tr>
                  <b-th>{{ $t('common.type') }}</b-th>
                  <b-th>{{ $t('common.key') }}</b-th>
                  <b-th />
                </b-tr>
              </b-thead>
              <b-tbody>
                <b-tr
                  v-for="key in keys"
                  :key="key.keyName"
                >
                  <b-td>{{ key.keyName }}</b-td>
                  <b-td>{{ key.keyValue }}</b-td>
                  <b-td>
                    <span
                      class="badge badge-default badge-danger"
                      @click.stop="deleteKey(key.keyId)"
                    >{{ $t('buttons.delete') }}</span>
                  </b-td>
                </b-tr>
              </b-tbody>
            </b-table-simple>
            <b-form inline>
              <b-form-group
                class="mr-2"
                :label="$t('common.type')"
                label-for="keyType"
              >
                <b-form-select
                  id="keyType"
                  v-model="newKey.name"
                  class="ml-2"
                  :options="keyTypes"
                />
              </b-form-group>
              <b-form-group
                class="mr-2"
                :label="$t('common.key')"
                label-for="key"
              >
                <b-form-input
                  id="key"
                  v-model="newKey.key"
                  class="ml-2"
                />
              </b-form-group>
              <b-button
                variant="primary"
                @click="addKey"
              >
                {{ $t('buttons.addKey') }}
              </b-button>
            </b-form>
          </b-card-text>
        </b-card>
      </b-col>
      <b-col
        v-if="showDisplays"
        xs="12"
        lg="6"
        class="mb-3"
      >
        <b-card :header="$t('displays.displays')">
          <b-card-text>
            <div v-if="displays.length > 0">
              <div
                v-for="display in displays"
                :key="display.displayId"
              >
                <!-- it's probably worth noting that this requires changing the activeTeam context.. -->
                <b-link :to="{ name: 'display', params: { displayId: display.displayId } }">
                  {{ display.name }}
                </b-link>
              </div>
            </div>
            <div v-else-if="team.displays">
              <div
                v-for="display in team.displays"
                :key="display.displayId"
              >
                <b-link :to="{ name: 'display', params: { displayId: display.displayId } }">
                  {{ display.name }}
                </b-link>
              </div>
            </div>
            <div v-else>
              <span>{{ $t('message.noDisplay') }}</span>
            </div>
          </b-card-text>
        </b-card>
      </b-col>
      <b-col
        v-if="showCampaigns"
        xs="12"
        lg="6"
        class="mb-3"
      >
        <b-card :header="$t('campaigns.campaigns')">
          <b-card-text>
            <div v-if="campaigns.length > 0">
              <div
                v-for="campaign in filteredCampaigns"
                :key="campaign.campaignId"
              >
                <b-link :to="{ name: 'campaign', params: { campaignId: campaign.campaignId } }">
                  {{ campaign.name }}
                </b-link>
              </div>
            </div>
            <div v-else-if="team.campaigns">
              <div
                v-for="campaign in team.campaigns"
                :key="campaign.campaignId"
              >
                <b-link :to="{ name: 'campaign', params: { campaignId: campaign.campaignId } }">
                  {{ campaign.name }}
                </b-link>
              </div>
            </div>
            <div v-else>
              <span>{{ $t('message.noCampaigns') }}</span>
            </div>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>


export default {
  name: 'Team',
  props: {
    teamId: {
      type: Number,
      required: true
    },
    showDisplays: {
      type: Boolean,
      default: false
    },
    showCampaigns: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      users: {},
      team: {},
      user: {
        display: false,
        pricing: false,
        campaign: false,
        media: false,
        invoice: false,
        thirdPartyKey: false,
        team: false,
        owner: false
      },
      keyTypes: [
          { text: this.$t('dealcodes.dealcode'), value: 'dealcode' }
      ],
      newKey: {
        name: '',
        key: ''
      },
      keys: [],
      displays: [],
      campaigns: [],
      stripeDash: ''
    }
  },
  computed: {
    filteredCampaigns() {
      return this.campaigns.filter(c => c.deleted != false)
    },
    hasAccess () {
      return this.$auth.user.admin || this.$auth.user.hasAccessInTeam(this.team.teamId, 'owner') || this.$auth.user.hasAccessInTeam(this.team.teamId, 'team')
    },
    thirdPartyKeyAccess () {
      return this.$auth.user.admin || this.$auth.user.hasAccessInTeam(this.team.teamId, 'owner') || this.$auth.user.hasAccessInTeam(this.team.teamId, 'thirdPartyKeyAccess')
    },
    stripeConnectLink () {
      return 'https://connect.stripe.com/express/oauth/authorize?response_type=code&client_id=' + process.env.VUE_APP_STRIPE_CLIENT_ID + '&scope=read_write&state=' + this.team.teamId + '&suggested_capabilities[]=card_payments&assert_capabilities[]=card_payments'
    }
  },
  watch: {
    teamId () {
      this.fetchUsers()
      this.fetchTeam()
      if (this.showDisplays) {
        this.fetchDisplays()
      }

      if (this.showCampaigns) {
        this.fetchCampaigns()
      }
      this.user = {
        display: false,
        pricing: false,
        campaign: false,
        media: false,
        invoice: false,
        thirdPartyKey: false,
        team: false,
        owner: false
      }
    }
  },
  mounted () {
    if (this.teamId) {
      this.fetchUsers()
      this.fetchTeam()
      this.fetchKeys()

      if (this.showDisplays) {
        this.fetchDisplays()
      }

      if (this.showCampaigns) {
        this.fetchCampaigns()
      }
    }
  },
  methods: {
    fetchUsers () {
      var scope = this
      this.$axios.get('v1/teams/' + this.teamId + '/users?limit=all').then(
        (response) => {
          this.users = response.data.data
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
    fetchDashboard () {
      var scope = this
      this.$axios.get('v1/teams/' + this.teamId + '/stripedash').then(
        (response) => {
          window.location.href = response.data.url;
          //window.open(response.data.url, '_blank')
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
          scope.stripeDash = ''
        }
      )
    },
    fetchTeam () {
      var scope = this
      this.$axios.get('v1/teams/' + this.teamId).then(
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
    fetchKeys () {
      var scope = this
      if (this.thirdPartyKeyAccess) {
        this.$axios.get('v1/teams/' + this.teamId + '/keys?limit=all').then(
          (response) => {
            this.keys = response.data.data
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
          scope.keys = []
        }
      )
      }
    },
    removeUser (teamId, userId, name) {
      var scope = this
      this.$axios.delete('v1/teams/' + teamId + '/users/' + userId).then(
      () => {
        this.$notifications.add({
          title: this.$t('message.success'),
          type: 'success',
          body: this.$t('notifications.userKick') + ' ' + name,
          timeout: true
        })
        this.fetchUsers()
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
    addUser () {
      var scope = this
      if (this.validateEmail(this.user.user)) {
        this.user.email = this.user.user
        delete this.user.user
      } else {
        this.user.username = this.user.user
        delete this.user.user
      }

      this.$axios.post('v1/teams/' + this.team.teamId + '/users', this.user).then(
        () => {
          this.user = {
            display: false,
            pricing: false,
            campaign: false,
            media: false,
            invoice: false,
            thirdPartyKey: false,
            team: false,
            owner: false
          }
          this.fetchUsers()
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
    updateUser (user) {
      var scope = this
      let permissions = user.teamPermissions
      permissions.owner = user.owner
      this.$axios.post('v1/teams/' + this.teamId + '/users/' + user.userId, permissions).catch(
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
    validateEmail (email) {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(email)
    },
    updateTeam () {
      var scope = this
      this.$axios.post('v1/teams/' + this.teamId, this.team).then(() => {
        this.$notifications.add({
          title: this.$t('message.success'),
          type: 'success',
          body: this.$t('notifications.teamUpdate'),
          timeout: true
        })
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
    addKey () {
      var scope = this
      this.$axios.post('v1/teams/' + this.teamId + '/keys', this.newKey).then(
        (response) => {
          this.keys.push(response.data.data)
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
    deleteKey (keyId) {
      var scope = this
      this.$axios.delete('v1/teams/' + this.teamId + '/keys/' + keyId).then(
        () => {
          this.$notifications.add({
            title: this.$t('message.success'),
            type: 'success',
            body: this.$t('notifications.keyRemove'),
            timeout: true
          })
          this.fetchKeys()
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
    fetchDisplays () {
      var scope = this
      this.$axios.get('v1/teams/' + this.teamId + '/displays?limit=all').then((response) => {
        this.displays = response.data.data
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
    fetchCampaigns () {
      var scope = this
      this.$axios.get('v1/teams/' + this.teamId + '/campaigns?limit=all').then((response) => {
        this.campaigns = response.data.data
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
    }
  }
}
</script>

<style lang="scss" scoped>
// .users-block {
//   padding: 0;
// }

// .table td {
//   text-align: center;
// }

@media (min-width: 992px) {
  .modal-lg {
      max-width: 855px;
  }
}

.stripe-connected {
  padding: 5px;
  background: #b5c3d8;
  background-image: linear-gradient(#b5c3d8, #9cabc2);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;

  span {

    &::before {
      content: '\2713';
      padding: 5px;
      color: green;
    }
  }
}
</style>
