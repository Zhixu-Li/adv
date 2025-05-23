<template lang="html">
  <BRow>
    <BCol cols="12">
      <BCard>
        <BCardText>
          <h4>{{ $t('dashboard.links.quickLinks') }}</h4>

          <!-- New Display Modal -->
          <BModal id="newdisplay" :title="$t('displays.newDisplay')" size="lg" hide-footer>
            <NewDisplay
              v-if="activeTeam.id !== 0"
              :active-team="activeTeam"
              @refresh-displays="savedUpdate"
            />
          </BModal>

          <!-- Live View Modal -->
          <BModal
            id="liveview"
            size="xl"
            no-fade
            no-close-on-backdrop
            hide-footer
            :title="$t('Live View')"
          >
            <LiveView :displays="displays" :refresh-time="refreshTime" />
          </BModal>

          <!-- Upload Media Modal -->
          <BModal id="upload" no-fade no-close-on-backdrop hide-footer>
            <NewMedia :active-team="activeTeam" />
          </BModal>

          <!-- New Campaign Modal -->
          <BModal id="campaign" no-fade no-close-on-backdrop hide-footer>
            <div v-if="newCampaign.errors.length">
              <BAlert v-for="err in newCampaign.errors" :key="err" variant="danger" show>
                {{ err }}
              </BAlert>
            </div>
            <CampaignEditor
              v-if="newCampaign.created"
              :active-team="activeTeam"
              :show="showNewCampaign"
              :campaign="newCampaign.campaign"
              @saved="$bvModal.hide('campaign')"
            />
            <div v-else class="row">
              <div id="campaignInformation" class="form-group col-12">
                <div class="form-group">
                  <label for="name">{{ $t('campaigns.campaignName') }}</label>
                  <input
                    id="name"
                    v-model="newCampaign.campaign.name"
                    class="form-control"
                    :placeholder="$t('campaigns.campaignName')"
                  />
                </div>
                <button type="button" class="btn btn-primary float-end" @click="createCampaign">
                  {{ $t('buttons.create') }}
                </button>
              </div>
            </div>
          </BModal>

          <!-- Display Details Modal -->
          <BModal
            id="display"
            size="lg"
            no-fade
            no-close-on-backdrop
            hide-footer
          >
            <router-view
              :active-team="activeTeam"
              :page="page"
              :name="page.name"
              :display="display"
            />
          </BModal>

          <!-- Quick-Links Buttons -->
          <BCol class="text-center">
            <BButton v-b-modal.liveview class="m-1 border-danger text-danger" variant="light">
              <span><BIcon icon="grid-3x3-gap-fill" /> {{ $t('dashboard.links.liveView') }}</span>
            </BButton>

            <BButton v-b-modal.upload class="m-1 border-primary text-primary" variant="light">
              <span><BIcon icon="upload" /> {{ $t('dashboard.links.upload') }}</span>
            </BButton>

            <BButton v-b-modal.campaign class="m-1 border-success text-success" variant="light">
              <span><BIcon icon="film" /> {{ $t('dashboard.links.newCampaign') }}</span>
            </BButton>

            <BButton class="m-1 border-info text-info" variant="light" @click="newDisplay">
              <span><BIcon icon="display" /> {{ $t('dashboard.links.newDisplay') }}</span>
            </BButton>
          </BCol>
        </BCardText>
      </BCard>
    </BCol>
  </BRow>
</template>


<script>
import NewMedia from '@/pages/Media/Components/NewMedia.vue'
import CampaignEditor from '@/components/CampaignEditor/CampaignEditor.vue'
import LiveView from './LiveView.vue'
import newDisplay from '@/pages/Displays/Components/NewDisplay.vue'
import teamContext from '@/mixins/teamContext'
import {
  BRow,
  BCol,
  BCard,
  BCardText,
  BModal,
  BButton,
  BIcon,
  BAlert
} from 'bootstrap-vue-next'

export default {
  components: {
    NewMedia,
    CampaignEditor,
    LiveView,
    newDisplay,
    BRow,
    BCol,
    BCard,
    BCardText,
    BModal,
    BButton,
    BIcon,
    BAlert,
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
