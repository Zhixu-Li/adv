<template>
  <b-container
    fluid
    class="h-100"
  >
    <b-row
      id="top-area"
      class="header mt-3 pb-1 w-100"
      no-gutters
    >
      <b-col class="d-none d-md-block">
        <h2>{{ $t('campaigns.campaigns') }}</h2>
        <p class="d-none d-md-block">
          {{ $t('tutorial.campaignsExample') }}
        </p>
      </b-col>
      <b-col
        cols="11"
        class="d-md-none"
      >
        <multiselect
          class=""
          :options="filtered"
          track-by="campaignId"
          label="name"
          :value="compSelected"
          :allow-empty="false"
          @select="selectCampaign"
        >
          <template #singleLabel>
            <div class="trim">
              {{ compSelected.name }}
            </div>
          </template>
        </multiselect>
      </b-col>
      <b-col
        cols="1"
        class="d-md-none pl-3 text-right"
        align-self="center"
      >
        <!-- take your pick.. -->
        <!-- <b-button class="m-1 border-success text-success" variant="light" v-b-modal.new>
          <span><b-icon icon="film"></b-icon> {{$t('dashboard.links.newCampaign')}}</span>
        </b-button> -->
        <!-- <div v-b-modal.new> <v-icon name="plus" scale="1.5" label="New Campaign"></v-icon></div>
          -->
        <div v-b-modal.new>
          <font-awesome-icon
            icon="plus"
            style="transform :scale(1.5);"
            title="New Campaign"
            class="text-dark"
          />
        </div>
      </b-col>
    </b-row>
    <b-row>
      <!-- <b-col cols="12" class="d-md-none">
        <multiselect class="" :options="filtered" track-by="campaignId" label="name" @select="selectCampaign"
          :value="compSelected" :allow-empty="false">
            <template #singleLabel>
              <div class="trim">{{ compSelected.name }}</div>
            </template>
          </multiselect>
      </b-col> -->
    </b-row>

    <b-row
      v-if="loading"
      id="content-area"
    >
      <div class="spinner" />
    </b-row>

    <b-row
      v-else
      id="content-area"
    >
      <b-col
        ref="sidebar"
        md="4"
        lg="2"
        class="d-none d-md-block h-100 overflow list"
      >
        <b-form-input
          id="search"
          v-model="search"
          class="search"
          :placeholder="$t('actions.search')"
        />
        <div
          v-b-modal.new
          class="new-item item"
        >
          <!-- <v-icon name="plus" scale="1.5" label="New Campaign"></v-icon> -->
          <font-awesome-icon
            icon="plus"
            style="transform: scale(1.5);"
            title="New Campaign"
            class="text-dark"
          />
        </div>

        <template v-if="filtered.length > 0">
          <div
            v-for="campaign in filtered"
            :id="'c_'+campaign.campaignId"
            :key="campaign.campaignId"
            class="pt-3 pb-3 item overflow"
            :class="{ selected: compSelected !== {} && compSelected.campaignId === campaign.campaignId }"
            @click="selectCampaign(campaign)"
          >
            {{ campaign.name }}
            <b-badge
              v-if="campaign.displays && campaign.displays.length === 1"
              variant="success"
            >
              Scheduled
            </b-badge>
            <b-badge
              v-if="campaign.displays && campaign.displays.length > 1"
              variant="primary"
            >
              Multiple
            </b-badge>
            <div class="text-muted">
              <small>
                <b>{{ campaign.media.data.reduce((a,c) => Math.max(a,c.end), 0) }}</b> seconds,
                <b>{{ Number(campaign.media.data.reduce((a,c) => Math.max(a,c.size), 0) / 1024 / 1024).toFixed(2) }}</b>
                
              </small>
            </div>
          </div>
        </template>
        <template v-else-if="activeTeam.id == 0">
          <div class="pt-4 text-muted text-center">
            {{ $t('campaigns.noTeam') }}
          </div>
        </template>
        <template v-else>
          <div class="pt-4 text-muted text-center">
            {{ $t('campaigns.noCampaigns') }}
          </div>
        </template>
      </b-col>

      <b-col
        cols="12"
        md="8"
        lg="10"
        class="h-100 overflow"
      >
        <transition name="fade">
          <router-view
            v-if="filtered.length > 0 && compSelected !== {} && $route.params.campaignId"
            :active-team="activeTeam"
            :campaign="compSelected"
            @close="closeEdit()"
            @delete="fetchCampaigns(null)"
            @update="fetchCampaigns(null)"
            @refresh="refreshCampaigns"
            @refresh-campaign="refreshSelected"
          />
        </transition>
      </b-col>
    </b-row>

    <b-modal
      id="new"
      size="md"
      :title="$t('campaigns.newCampaign')"
      hide-footer
    >
      <div
        v-if="errors.length > 0"
        class="alert alert-danger"
      >
        <ul>
          <li
            v-for="(error, index) in errors"
            :key="index"
          >
            {{ error }}
          </li>
        </ul>
      </div>
      <b-row @keyup.enter.prevent.stop="createCampaign()">
        <b-col
          id="campaignInformation"
          cols="12"
        >
          <b-form-group
            :label="$t('campaigns.campaignName')"
            label-for="name"
          >
            <b-form-input
              id="name"
              v-model="newName"
              class="form-control"
              :placeholder="$t('campaigns.campaignName')"
            />
          </b-form-group>
          <b-form-group :label="$t('common.team')">
            <b-input
              disabled
              :value="activeTeam.name"
            />
          </b-form-group>
          <b-form-group>
            <b-button
              class="mt-2"
              variant="primary"
              @click="createCampaign"
            >
              {{ $t('buttons.create') }}
            </b-button>
          </b-form-group>
        </b-col>
      </b-row>
    </b-modal>

    <!-- TODO: add computed name with pencil fa-icon -->
    <b-modal
      v-if="compSelected !== {} || loading"
      id="edit-new"
      size="xl"
      :title="compSelected.name"
      hide-footer
    >
      <campaign-editor
        :active-team="activeTeam"
        :campaign="compSelected"
        @saved="closeEdit()"
      />
    </b-modal>
  </b-container>
</template>

<script>
import CampaignEditor from '@/components/CampaignEditor/CampaignEditor.vue'
// import 'vue-awesome/icons/arrow-left'
// import 'vue-awesome/icons/plus'
import teamContext from '@/mixins/teamContext'
import autoResize from '@/mixins/autoResize'
import Multiselect from 'vue-multiselect'


export default {
  name: 'Campaigns',
  components: {
    CampaignEditor,
    Multiselect,
  },
  mixins: [teamContext, autoResize],
  data () {
    return {
      campaigns: [],
      search: '',
      newName: '',
      loaded: false,
      errors: [],
      loading: true,
    }
  },
  computed: {
    filtered () {
      return this.campaigns.filter((campaign) => {
        if (this.search === '') {
          return true
        } else {
          for (var t = 0; t < campaign.tags.data.length; t++) {
            if (campaign.tags.data[t].tag.toLowerCase().includes(this.search.toLowerCase())) {
              return true
            }
          }
          return campaign.name.toLowerCase().includes(this.search.toLowerCase())
        }
      })
    },
    compSelected() {
      let selected = this.campaigns.find((campaign) => {
        if (campaign.campaignId === parseInt(this.$route.params.campaignId)) {
          return true
        } else {
          return false
        }
      })
      if (selected)
        return selected
      else
        return {}
    }
  },
  watch: {
    filtered() {
      this.updateRoute()
    },
    'activeTeam': function() {
      this.loading = true
      this.fetchCampaigns(null)
    },
  },
  mounted () {
    this.fetchCampaigns(null)
  },
  beforeUnmount () {
  },
  methods: {
    updateRoute() {
      if (this.filtered.length > 0) {
        let maybeId = this.$route.params?.campaignId
        if (maybeId !== undefined) {
          let maybeCampaign = this.filtered.find(d => d.campaignId == maybeId)
          if (maybeCampaign !== undefined) {
           //to make scrollbar jump to the selected item
            this.$nextTick(() => {
              const cid = document.querySelector('#c_'+maybeId)
              if (cid){
                this.$refs.sidebar.scrollTop = cid.offsetTop
              }
            })

            return this.$router.replace({ name: 'campaign', params: { campaignId: maybeId } })
          }
          else {
            this.$router.replace({ name: 'campaigns' })
          }
        }
        return this.$router.replace({ name: 'campaign', params: { campaignId: this.filtered[0].campaignId } })
      }
    },
    fetchCampaigns(newId) {
      var scope = this
      this.loading = true
      let url = 'v1/campaigns?limit=all&include=tags,media,bookings&team=' + parseInt(this.activeTeam.id)
      this.$axios.get(url).then(
        (response) => {
          this.campaigns = response.data.data.reverse()
          this.meta = response.data.meta
          this.changing = false
          this.loading = false
          if (newId !== null) {
            this.$router.push({
              name: 'campaign',
              params: {
                campaignId: newId
              }
            })
            // TODO should be this.selectedObject?
            this.$bvModal.hide('new')
            this.$bvModal.show('edit-new')
          }
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
          scope.campaigns = []
          scope.fetchMedia()
          scope.loading = false
        }
      )
    },
    refreshSelected () {
      var scope = this
      this.$axios.get('v1/campaigns/' + this.selectedObject.campaignId + '&include=tags,media').then(
        (response) => {
          let index = this.campaigns.findIndex((element) => {
            return element.campaignId === this.selectedObject
          })
          this.campaigns[index] = response.data.data
          this.selectedObject = response.data.data
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
    fetchMedia () {
      this.$axios.get('v1/media?limit=1&team=' + parseInt(this.activeTeam.id)).then(
        () => {},
        (response) => {
          if (response.status === 404) {
            this.$notifications.add({
              title: 'Notification',
              type: 'info',
              body: this.$t('notifications.mediaNone'),
              timeout: true,
              dismissable: true
            })
          }
        }
      )
    },
    selectCampaign (campaign) {
      this.$router.push({ name: 'campaign', params: { campaignId: campaign.campaignId } })

    },
    refreshCampaigns () {
      if (this.$router.currentRoute.name === 'campaigns') {
        this.fetchCampaigns(null)
      }
    },
    createCampaign () {
      var scope = this
      this.errors = []
      if (this.newName !== '') {
        let deets = { name: this.newName, teamName: this.activeTeam.name }
        this.$axios.post('v1/campaigns', deets).then(
        (response) => {
          this.fetchCampaigns(response.data.data.campaignId)
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
      else {
        this.errors.push(this.$t('campaigns.emptyName'))
      }
    },
    closeEdit () {
      // this is a bit of a kludge
      this.$bvModal.hide('edit-new')
      this.$bvModal.hide('edit-modal')
      this.campaign = {}
      this.newCampaign = {}
      this.fetchCampaigns(null)
    },
  }
}
</script>

<style scoped lang="scss">
.header {
  display: inline-flex;
  background-color: white;
  z-index: 100;
  /*border-bottom: 1px #e9e9e9 solid; */
}

.multiselect--active {
  z-index: 999999;
}

.trim {
  width: 100%;
  font-size: small;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/*.multiselect__single {
  font-size: x-large;
}*/

.item:hover,
.selected {
  background-color: #e6e6e6;
}

.item {
  cursor: pointer;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  line-height: 1.25;
  padding-top: .425rem;
  padding-bottom: .425rem;
  padding-left: 20px;
  display: block;
  border-bottom: #e9e9e9 solid 1px;
}

.overflow {
  overflow-y: auto;
  display: block;
}

.search {
  width: 100%;
  height: 54px;
  border: none;
  text-align: center;
  border-bottom: 1px #e9e9e9 solid;
}

.new-item {
  padding-left: 0;
  text-align: center;
}

.list {
  border-right: #e9e9e9 solid 1px;
  padding: 0px;
}

.spinner {
  margin-left: auto;
  margin-right: auto;
  margin-top: auto;
  margin-bottom: auto;
}
</style>
