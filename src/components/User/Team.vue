<template lang="html">
  <BContainer>
    <BRow class="pt-3">
      <!-- Team Info Card -->
      <BCol cols="6" class="mb-3">
        <BCard :header="$t('common.information')">
          <BCardText>
            <BFormGroup :label="$t('common.name')" label-for="teamName">
              <BFormInput id="teamName" v-model="team.name" :disabled="!hasAccess" />
            </BFormGroup>
            <BFormGroup :label="$t('teams.slug')" label-for="teamSlug">
              <BFormInput id="teamSlug" v-model="team.abbrev" :disabled="!hasAccess" />
            </BFormGroup>
            <BFormGroup :label="$t('teams.description')" label-for="teamDescription">
              <BFormInput id="teamDescription" v-model="team.description" :disabled="!hasAccess" />
            </BFormGroup>
            <BFormGroup
              :label="$t('teams.email')"
              label-for="teamEmail"
              description="Email address is required for teams with public displays."
            >
              <BFormInput id="teamEmail" v-model="team.email" :disabled="!hasAccess" />
            </BFormGroup>

            <div class="pt-3">
              <a
                v-if="!team.stripeConnected && ( $auth.user.admin ||
                  $auth.user.hasAccessInTeam(team.teamId,'owner') ||
                  $auth.user.hasAccessInTeam(team.teamId,'thirdPartyKey') )"
                :href="stripeConnectLink"
                class="stripe-connect light-blue"
              >
                <span>{{ $t('stripe.toConnect') }}</span>
              </a>
              <BButton v-else variant="primary" @click="fetchDashboard">
                Stripe Dashboard
              </BButton>
            </div>

            <BButton
              v-if="hasAccess"
              variant="primary"
              class="float-right"
              @click="updateTeam"
            >
              {{ $t('buttons.save') }}
            </BButton>
          </BCardText>
        </BCard>
      </BCol>

      <!-- Add User Card -->
      <BCol v-if="hasAccess" cols="6" class="mb-3">
        <BCard :header="$t('teams.addUser')">
          <BCardText>
            <BFormGroup
              :label="$t('user.user')"
              label-for="user"
              description="Please ensure the user already exists."
            >
              <BFormInput
                id="user"
                v-model="user.user"
                :placeholder="$t('user.usernameEmail')"
              />
            </BFormGroup>

            <BFormGroup inline :label="$t('permissions.permissions')">
              <BRow>
                <BCol cols="6">
                  <BFormGroup stacked>
                    <BFormCheckbox id="owner" v-model="user.owner">
                      {{ $t('permissions.owner') }}
                    </BFormCheckbox>
                    <BFormCheckbox id="display" v-model="user.display">
                      {{ $t('permissions.display') }}
                    </BFormCheckbox>
                    <BFormCheckbox id="pricing" v-model="user.pricing">
                      {{ $t('permissions.pricing') }}
                    </BFormCheckbox>
                    <BFormCheckbox id="campaign" v-model="user.campaign">
                      {{ $t('permissions.campaign') }}
                    </BFormCheckbox>
                  </BFormGroup>
                </BCol>
                <BCol cols="6">
                  <BFormGroup stacked>
                    <BFormCheckbox id="media" v-model="user.media">
                      {{ $t('permissions.media') }}
                    </BFormCheckbox>
                    <BFormCheckbox id="invoice" v-model="user.invoice">
                      {{ $t('permissions.invoice') }}
                    </BFormCheckbox>
                    <BFormCheckbox id="thirdPartyKey" v-model="user.thirdPartyKey">
                      {{ $t('permissions.thirdParty') }}
                    </BFormCheckbox>
                    <BFormCheckbox id="team" v-model="user.team">
                      {{ $t('permissions.team') }}
                    </BFormCheckbox>
                  </BFormGroup>
                </BCol>
              </BRow>
            </BFormGroup>

            <BButton
              variant="primary"
              class="float-right pointer"
              @click="addUser"
            >
              {{ $t('buttons.add') }}
            </BButton>
          </BCardText>
        </BCard>
      </BCol>

      <!-- Users List / Table -->
      <BCol cols="12" class="mb-3">
        <BCard :header="$t('user.users')">
          <BCardText>
            <BTableSimple v-if="hasAccess" striped responsive hover>
              <BThead>
                <BTr>
                  <BTh/>
                  <BTh>{{ $t('permissions.display') }}</BTh>
                  <BTh>{{ $t('permissions.pricing') }}</BTh>
                  <BTh>{{ $t('permissions.campaign') }}</BTh>
                  <BTh>{{ $t('permissions.media') }}</BTh>
                  <BTh>{{ $t('permissions.invoice') }}</BTh>
                  <BTh>{{ $t('permissions.thirdParty') }}</BTh>
                  <BTh>{{ $t('permissions.team') }}</BTh>
                  <BTh>{{ $t('permissions.owner') }}</BTh>
                  <BTh/>
                </BTr>
              </BThead>
              <BTbody>
                <BTr v-for="user in users" :key="user.userId">
                  <BTd>{{ user.user }}</BTd>
                  <BTd>
                    <input
                      type="checkbox"
                      v-model="user.teamPermissions.displayAccess"
                      @change="updateUser(user)"
                    />
                  </BTd>
                  <BTd>
                    <input
                      type="checkbox"
                      v-model="user.teamPermissions.pricingAccess"
                      @change="updateUser(user)"
                    />
                  </BTd>
                  <BTd>
                    <input
                      type="checkbox"
                      v-model="user.teamPermissions.campaignAccess"
                      @change="updateUser(user)"
                    />
                  </BTd>
                  <BTd>
                    <input
                      type="checkbox"
                      v-model="user.teamPermissions.mediaAccess"
                      @change="updateUser(user)"
                    />
                  </BTd>
                  <BTd>
                    <input
                      type="checkbox"
                      v-model="user.teamPermissions.invoiceAccess"
                      @change="updateUser(user)"
                    />
                  </BTd>
                  <BTd>
                    <input
                      type="checkbox"
                      v-model="user.teamPermissions.thirdPartyKeyAccess"
                      @change="updateUser(user)"
                    />
                  </BTd>
                  <BTd>
                    <input
                      type="checkbox"
                      v-model="user.teamPermissions.teamAccess"
                      @change="updateUser(user)"
                    />
                  </BTd>
                  <BTd>
                    <input
                      type="checkbox"
                      v-model="user.owner"
                      @change="updateUser(user)"
                    />
                  </BTd>
                  <BTd>
                    <span
                      class="badge badge-default badge-danger"
                      @click.stop="removeUser(teamId, user.userId, user.user)"
                    >
                      {{ $t('buttons.remove') }}
                    </span>
                  </BTd>
                </BTr>
              </BTbody>
            </BTableSimple>

            <ul v-else class="list-group">
              <li
                v-for="user in users"
                :key="user.userId"
                class="list-group-item list-group-item-action justify-content-between"
              >
                {{ user.user }}
              </li>
            </ul>
          </BCardText>
        </BCard>
      </BCol>

      <!-- Third-Party Keys -->
      <BCol v-if="thirdPartyKeyAccess" cols="12" class="mb-3">
        <BCard :header="$t('permissions.thirdParty')">
          <BCardText>
            <BTableSimple v-if="keys.length" striped responsive hover>
              <BThead>
                <BTr>
                  <BTh>{{ $t('common.type') }}</BTh>
                  <BTh>{{ $t('common.key') }}</BTh>
                  <BTh/>
                </BTr>
              </BThead>
              <BTbody>
                <BTr v-for="key in keys" :key="key.keyName">
                  <BTd>{{ key.keyName }}</BTd>
                  <BTd>{{ key.keyValue }}</BTd>
                  <BTd>
                    <span
                      class="badge badge-default badge-danger"
                      @click.stop="deleteKey(key.keyId)"
                    >
                      {{ $t('buttons.delete') }}
                    </span>
                  </BTd>
                </BTr>
              </BTbody>
            </BTableSimple>

            <BForm inline>
              <BFormGroup class="mr-2" :label="$t('common.type')" label-for="keyType">
                <BFormSelect
                  id="keyType"
                  v-model="newKey.name"
                  class="ml-2"
                  :options="keyTypes"
                />
              </BFormGroup>
              <BFormGroup class="mr-2" :label="$t('common.key')" label-for="key">
                <BFormInput id="key" v-model="newKey.key" class="ml-2" />
              </BFormGroup>
              <BButton variant="primary" @click="addKey">
                {{ $t('buttons.addKey') }}
              </BButton>
            </BForm>
          </BCardText>
        </BCard>
      </BCol>

      <!-- Displays List -->
      <BCol v-if="showDisplays" xs="12" lg="6" class="mb-3">
        <BCard :header="$t('displays.displays')">
          <BCardText>
            <div v-if="displays.length">
              <div v-for="display in displays" :key="display.displayId">
                <BLink :to="{ name:'display',params:{displayId:display.displayId} }">
                  {{ display.name }}
                </BLink>
              </div>
            </div>
            <div v-else-if="team.displays">
              <div v-for="display in team.displays" :key="display.displayId">
                <BLink :to="{ name:'display',params:{displayId:display.displayId} }">
                  {{ display.name }}
                </BLink>
              </div>
            </div>
            <div v-else>
              <span>{{ $t('message.noDisplay') }}</span>
            </div>
          </BCardText>
        </BCard>
      </BCol>

      <!-- Campaigns List -->
      <BCol v-if="showCampaigns" xs="12" lg="6" class="mb-3">
        <BCard :header="$t('campaigns.campaigns')">
          <BCardText>
            <div v-if="filteredCampaigns.length">
              <div
                v-for="campaign in filteredCampaigns"
                :key="campaign.campaignId"
              >
                <BLink :to="{ name:'campaign',params:{campaignId:campaign.campaignId} }">
                  {{ campaign.name }}
                </BLink>
              </div>
            </div>
            <div v-else-if="team.campaigns">
              <div v-for="campaign in team.campaigns" :key="campaign.campaignId">
                <BLink :to="{ name:'campaign',params:{campaignId:campaign.campaignId} }">
                  {{ campaign.name }}
                </BLink>
              </div>
            </div>
            <div v-else>
              <span>{{ $t('message.noCampaigns') }}</span>
            </div>
          </BCardText>
        </BCard>
      </BCol>
    </BRow>
  </BContainer>
</template>


<script>

import {
  BContainer,
  BRow,
  BCol,
  BCard,
  BCardText,
  BFormGroup,
  BFormInput,
  BButton,
  BFormCheckbox,
  BForm,
  BFormSelect,
  BTableSimple,
  BThead,
  BTr,
  BTh,
  BTbody,
  BTd,
  BLink
} from 'bootstrap-vue-next'

export default {
  name: 'Team',
  components:{
    BContainer,
    BRow,
    BCol,
    BCard,
    BCardText,
    BFormGroup,
    BFormInput,
    BButton,
    BFormCheckbox,
    BForm,
    BFormSelect,
    BTableSimple,
    BThead,
    BTr,
    BTh,
    BTbody,
    BTd,
    BLink,
  },
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
