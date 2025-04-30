<template lang="html">
  <b-row>
    <b-col cols="12">
      <b-card>
        <b-card-text>
          <h4>{{ $t('dashboard.links.quickLinks') }}</h4>

          <b-modal
            id="newdisplay"
            :title="$t('displays.newDisplay')"
            size="lg"
            hide-footer
          >
            <new-display
              v-if="activeTeam.id != 0"
              :active-team="activeTeam"
              @refresh-displays="savedUpdate"
            />
          </b-modal>

          <b-modal
            id="liveview"
            size="xl"
            no-fade
            no-close-on-backdrop
            hide-footer
            :title="$t('Live View')"
          >
            <live-view
              :displays="displays"
              :refresh-time="refreshTime"
            />
          </b-modal>

          <b-modal
            id="upload"
            no-fade
            no-close-on-backdrop
            hide-footer
          >
            <new-media :active-team="activeTeam" />
          </b-modal>

          <b-modal
            id="campaign"
            no-fade
            no-close-on-backdrop
            hide-footer
          >
            <div v-if="newCampaign.errors.length > 0">
              <b-alert
                v-for="error in newCampaign.errors"
                :key="error"
                show
                variant="danger"
              >
                {{ error }}
              </b-alert>
            </div>
            <campaign-editor
              v-if="newCampaign.created"
              :active-team="activeTeam"
              :show="showNewCampaign"
              :campaign="newCampaign.campaign"
              @saved="$bvModal.hide('campaign')"
            />
            <div
              v-else
              class="row"
            >
              <div
                id="campaignInformation"
                class="form-group col-12"
              >
                <div class="form-group">
                  <label for="name">{{ $t('campaigns.campaignName') }}</label>
                  <input
                    id="name"
                    v-model="newCampaign.campaign.name"
                    class="form-control"
                    :placeholder="$t('campaigns.campaignName')"
                  >
                </div>
                <button
                  type="button"
                  class="btn btn-primary right"
                  @click="createCampaign"
                >
                  Create
                </button>
              </div>
            </div>
          </b-modal>

          <b-modal
            id="display"
            size="lg"
            no-fade
            no-close-on-backdrop
            hide-footer
          >
            <router-view
              :active-team="activeTeam"
              :name="page.name"
              :page="page"
              :display="display"
            />
          </b-modal>

          <b-col class="text-center">
            <b-button
              v-b-modal.liveview
              class="m-1 border-danger text-danger"
              variant="light"
            >
              <span><b-icon icon="grid-3x3-gap-fill" /> {{ $t('dashboard.links.liveView') }}</span>
            </b-button>
            <b-button
              v-b-modal.upload
              class="m-1 border-primary text-primary"
              variant="light"
            >
              <span><b-icon icon="upload" /> {{ $t('dashboard.links.upload') }}</span>
            </b-button>
            <b-button
              v-b-modal.campaign
              class="m-1 border-success text-success"
              variant="light"
            >
              <span><b-icon icon="film" /> {{ $t('dashboard.links.newCampaign') }}</span>
            </b-button>
            <b-button
              class="m-1 border-info text-info"
              variant="light"
              @click="newDisplay"
            >
              <span><b-icon icon="display" /> {{ $t('dashboard.links.newDisplay') }}</span>
            </b-button>
          </b-col>
        </b-card-text>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import NewMedia from '@/pages/Media/Components/NewMedia.vue'
import CampaignEditor from '@/components/CampaignEditor/CampaignEditor.vue'
import LiveView from './LiveView.vue'
import newDisplay from '@/pages/Displays/Components/NewDisplay.vue'
import teamContext from '@/mixins/teamContext'

export default {
  components: {
    NewMedia,
    CampaignEditor,
    LiveView,
    newDisplay
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
    }
  },
  data () {
    return {
      newCampaign: {
        created: false,
        errors: [],
        campaign: {},
      },
      page: {
        name: 'Page0'
      },
      display: {}
    }
  },
  methods: {
    createCampaign () {
      var scope = this
      this.newCampaign.errors = []
      this.newCampaign.campaign.teamName = this.activeTeam.name
      if (!this.newCampaign.campaign.name) {
        this.newCampaign.errors.push('Please give your campaign a name')
      }
      if (!this.newCampaign.campaign.teamName) {
        this.newCampaign.errors.push('Please give the campaign a team')
      } else if (this.newCampaign.campaign.name) {
        this.$axios.post('v1/campaigns', this.newCampaign.campaign).then((response) => {
          this.newCampaign.campaign = response.data.data
          this.newCampaign.created = true
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
    },
    newDisplay () {
      this.$bvModal.show('newdisplay')
    },
    savedUpdate() {
      this.$bvModal.hide('newdisplay');
    },
  }
}
</script>

<style lang="css">
/* fix for icon alignment inside buttons */
.btn .fa-icon {
    margin-top: -0.20em !important;
}
</style>
