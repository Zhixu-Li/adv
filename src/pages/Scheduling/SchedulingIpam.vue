<template>
  <BContainer fluid>
    <BRow id="toparea" no-gutters>
      <div>
        <h2 class="pt-1 d-none d-sm-block">
          {{ $t('schedule.ipamTitle') }}
          <BButton v-if="loaded" variant="outline-success">
            {{ $t('schedule.lastUpdateText') }} {{ lastUpdate }}
          </BButton>
          <BButton v-else-if="!loaded && !tried" variant="outline-warning">
            {{ $t('schedule.loading') }}
          </BButton>
        </h2>
        <p class="d-none d-md-block">{{ $t('tutorial.schedulingExample') }}</p>
      </div>

      <BRow class="w-100 m-0 p-0">
        <BCol xl="4" lg="4" md="6" sm="12" xs="12" class="p-1">
          <BButtonGroup style="width: 100% !important">
            <BFormInput
              v-model="displayFilter"
              :placeholder="$t('schedule.searchDisplay')"
            />
            <BDropdown
              id="displaySort"
              variant="outline-success"
              :text="displaySortMethod ? $t('schedule.newest') : $t('schedule.oldest')"
            >
              <BDropdownItem @click="displaySortMethod = true">
                {{ $t('schedule.newest') }}
              </BDropdownItem>
              <BDropdownItem @click="displaySortMethod = false">
                {{ $t('schedule.oldest') }}
              </BDropdownItem>
            </BDropdown>
          </BButtonGroup>
        </BCol>

        <BCol xl="4" lg="4" md="6" sm="12" xs="12" class="p-1">
          <BButtonGroup style="width: 100% !important">
            <BFormInput
              v-model="campaignFilter"
              :placeholder="$t('schedule.searchCampaigns')"
            />
            <BDropdown
              id="campaignSort"
              variant="outline-info"
              :text="campaignSortMethod ? $t('schedule.newest') : $t('schedule.oldest')"
            >
              <BDropdownItem @click="campaignSortMethod = true">
                {{ $t('schedule.newest') }}
              </BDropdownItem>
              <BDropdownItem @click="campaignSortMethod = false">
                {{ $t('schedule.oldest') }}
              </BDropdownItem>
            </BDropdown>
          </BButtonGroup>
        </BCol>

        <BCol xl="2" lg="2" md="6" sm="12" xs="12" class="p-1">
          <BButton
            block
            variant="outline-success"
            @click="toggleActive()"
          >
            {{ $t('schedule.active') }} {{ activeSwitch ? '☑' : '☐' }}
          </BButton>
        </BCol>

        <BCol xl="2" lg="2" md="6" sm="12" xs="12" class="p-1">
          <BButton
            block
            variant="outline-warning"
            @click="toggleSources()"
          >
            {{ $t('schedule.source') }} {{ sourceSwitch ? '☑' : '☐' }}
          </BButton>
        </BCol>
      </BRow>
    </BRow>

    <BRow v-if="displays.length < 1 || (sources.length < 1 && campaigns.length < 1)">
      <BCol>
        <div v-if="displays.length < 1" class="text-center">
          <p>{{ $t('schedule.noDisplayFound') }}</p>
          <BButton variant="primary" :to="{ name: 'display' }">
            {{ $t('index.displays') }}
          </BButton>
        </div>
        <div v-else class="text-center">
          <p>{{ $t('schedule.noCampaignFound') }}</p>
          <BButton variant="primary" class="mr-2" :to="{ name: 'campaign' }">
            {{ $t('index.campaigns') }}
          </BButton>
          <BButton variant="primary" :to="{ name: 'source' }">
            {{ $t('index.sources') }}
          </BButton>
        </div>
      </BCol>
    </BRow>

    <BRow v-else no-gutters>
      <BTableSimple
        v-if="loaded"
        fixed
        hover
        responsive
        :sticky-header="tableHeight"
        class="m-0"
      >
        <BThead>
          <BTr>
            <BTh colspan="2" style="vertical-align: top">
              <BButtonGroup>
                <BButton
                  variant="outline-primary"
                  :disabled="canGoPrevious"
                  @click="previousPage"
                >
                  {{ $t('schedule.prePage') }}
                </BButton>
                <BButton
                  variant="outline-primary"
                  :disabled="canGoNext"
                  @click="nextPage"
                >
                  {{ $t('schedule.nexPage') }}
                </BButton>
              </BButtonGroup>
            </BTh>

            <template v-for="dc in headerRange" :key="dc">
              <ipam-header
                class="align-top"
                :display="filteredDisplays[dc]"
              />
            </template>
          </BTr>
        </BThead>

        <BTbody>
          <BTr
            v-for="row in campaignRange"
            :key="row"
            class="ipam-row"
          >
            <BTh colspan="2" v-if="filteredRows[row].campaignId">
              <div class="pt-1 pb-1">
                <BLink
                  :id="'popover-target-' + row"
                  class="text-dark"
                  :to="{ name: 'campaign', params: { campaignId: filteredRows[row].campaignId } }"
                >
                  {{ filteredRows[row].name }}
                </BLink>
                <small>{{ getCampaignLength(filteredRows[row].media.data) }} seconds</small>
                <BPopover
                  :target="'popover-target-' + row"
                  triggers="hover"
                  custom-class="campaign-preview"
                  container-null
                >
                  <template #title>{{ filteredRows[row].name }}</template>
                  <prop-player
                    style="width:20em; height:15em"
                    :media="filteredRows[row].media.data"
                  />
                </BPopover>
              </div>
            </BTh>

            <BTh colspan="2" v-else>
              <div class="pt-1 pb-1">
                <BBadge variant="dark">E2V</BBadge>
                <BLink
                  class="text-dark"
                  :to="{ name: 'sources', params: { sourceId: filteredRows[row].sourceId } }"
                >
                  {{ filteredRows[row].name }}
                </BLink>
              </div>
            </BTh>

            <ipam-cell
              v-for="col in Array(displayLimit).keys()"
              :key="col"
              :content="cells[row][col]"
              @trigger-modal="triggerModal"
            />
          </BTr>

          <BButton
            v-if="campaignsVisible < filteredRows.length"
            variant="primary"
            class="mt-1 mb-4 ml-2"
            @click="loadCampaigns"
          >
            Load More
          </BButton>
        </BTbody>
      </BTableSimple>
    </BRow>

    <BModal id="addCampaign" size="lg" no-fade hide-footer no-stacking>
      <add-campaign
        :selected-campaign="selectedCampaign"
        :selected-display="selectedDisplay"
        :starting-index="1"
        :select-disabled="true"
        @done="closeAndRefresh"
      />
    </BModal>

    <BModal id="manageCampaign" size="lg" no-fade hide-footer no-stacking>
      <manage-campaigns
        :display="selectedDisplay"
        :campaign="selectedCampaign"
        @add="$bvModal.show('addCampaign')"
        @deleted="fetchDisplays"
      />
    </BModal>

    <BModal id="addSource" size="lg" no-fade hide-footer no-stacking>
      <add-source
        :selected-source="selectedCampaign"
        :selected-display="selectedDisplay"
        :starting-index="1"
        :select-disabled="true"
        @done="closeAndRefresh"
      />
    </BModal>

    <BModal id="manageSource" size="lg" no-fade hide-footer no-stacking>
      <manage-sources
        :display="selectedDisplay"
        :source="selectedCampaign"
        :sources="sources"
        @add="$bvModal.show('addSource')"
        @deleted="fetchDisplays"
      />
    </BModal>
  </BContainer>
</template>

<script>
import {
  BContainer,
  BRow,
  BCol,
  BButton,
  BButtonGroup,
  BFormInput,
  BDropdown,
  BDropdownItem,
  BTableSimple,
  BThead,
  BTbody,
  BTr,
  BTh,
  BLink,
  BPopover,
  BModal,
  BBadge
} from 'bootstrap-vue-next'
import _ from 'lodash'
import verge from 'verge'
import moment from 'moment'

import ManageCampaigns from '@/pages/Scheduling/ManageCampaign/ManageCampaigns.vue'
import AddCampaign from '@/pages/Scheduling/AddCampaign/AddCampaign.vue'
// import Campaign from '@/components/Preview/Campaign.vue'

import ManageSources from '@/pages/Scheduling/ManageSource/ManageSources.vue'
import AddSource from '@/pages/Scheduling/AddSource/AddSource.vue'

import IpamHeader from '@/components/IPAM/Header.vue'
import IpamCell from '@/components/IPAM/Cell.vue'
import PropPlayer from '@/components/Player/PropPlayer.vue'

// this whole module needs better error handling and maybe a dedicated IPAM component

export default {
  components: {
    // Campaign,
    PropPlayer,
    ManageCampaigns,
    AddCampaign,
    ManageSources,
    AddSource,
    IpamHeader,
    IpamCell,
    BContainer,
    BRow,
    BCol,
    BButton,
    BButtonGroup,
    BFormInput,
    BDropdown,
    BDropdownItem,
    BTableSimple,
    BThead,
    BTbody,
    BTr,
    BTh,
    BLink,
    BPopover,
    BModal,
    BBadge
  },
  props: {
    activeTeam: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      campaigns: [],
      displays: [],
      sources: [],
      filteredRows: [],
      filteredCampaigns: [],
      filteredDisplays: [],
      filteredSources: [],
      cells: [[]],
      viewport: '',
      loaded: false,
      tried: false,
      tableHeight: '',
      lastUpdate: moment().format('HH:MM'),
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HH:MM:SS'),
      activeSwitch: false,
      sourceSwitch: false,
      displayOffset: 0,
      displayRange: [],
      activeDisplays: {},
      activeCampaigns: {},
      activeSources: {},
      displayFilter: '',
      campaignFilter: '',
      displaySortMethod: true,
      campaignSortMethod: true,
      selectedTeam: {name:this.$t('schedule.allTeam'),teamId:0},
      selectedTeamId: 0,
      campaignRange: [],
      campaignsVisible: 10,
      campaignLimit: 9,
      selectedCampaign: 0,
      selectedDisplay: 0,
    }
  },
  computed: {
    canGoPrevious() {
      if (this.displayOffset === 0) {
        return true
      }
      else {
        return false
      }
    },
    canGoNext() {
      if (this.displayOffset + this.displayLimit >= this.filteredDisplays.length) {
        return true
      }
      else {
        return false
      }
    },
    displayLimit() {
      if      (this.viewport === 'xs' && this.filteredDisplays.length >= 3) { return 3 }
      else if (this.viewport === 'sm' && this.filteredDisplays.length >= 4) { return 4 }
      else if (this.viewport === 'md' && this.filteredDisplays.length >= 6) { return 6 }
      else if (this.viewport === 'lg' && this.filteredDisplays.length >= 8) { return 8 }
      else if (this.viewport === 'xl' && this.filteredDisplays.length >= 12) { return 12 }
      else { return this.filteredDisplays.length }
    },
    headerRange() {
      if (this.filteredDisplays.length > 0) {
        if (this.displayOffset + this.displayLimit > this.filteredDisplays.length) {
          return _.range((this.filteredDisplays.length - this.displayLimit), this.filteredDisplays.length)
        }
        else {
          return _.range(this.displayOffset, (this.displayOffset + this.displayLimit))
        }
      }
      else {
        return _.range(this.displayOffset, (this.displayOffset + this.displayLimit))
      }
    },
  },
  mounted () {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
    this.fetchDisplays()
  },
  beforeUnmount: function () {
    window.removeEventListener('resize', this.handleResize)
  },
  watch: {
    'activeTeam': function() {
      this.loaded = false
      this.fetchDisplays()
    },
    viewport: function() {
      let range = _.range(0, this.displayLimit)
      this.displayRange = range
    },
    displaySortMethod: function() {
      if (this.displaySortMethod === true) {
        this.displays = this.displays.sort(function(a, b) { if(a.displayId < b.displayId) { return 1 } else { return -1 } })
      }
      else {
        this.displays = this.displays.sort(function(a, b) { if(a.displayId > b.displayId) { return 1 } else { return -1 } })
      }
      this.buildGrid()
    },
    campaignSortMethod: function() {
      if (this.campaignSortMethod === true) {
        this.campaigns = this.campaigns.sort(function(a, b) { if(a.campaignId < b.campaignId) { return 1 } else { return -1 } })
      }
      else {
        this.campaigns = this.campaigns.sort(function(a, b) { if(a.campaignId > b.campaignId) { return 1 } else { return -1 } })
      }
      this.buildGrid()
    },
    displayFilter: _.debounce(function() { this.displayOffset = 0; this.handleResize() }, 250),
    campaignFilter: _.debounce(function() { this.campaignsVisible = 10; this.handleResize() }, 250),
  },
  methods: {
    closeAndRefresh() {
      this.$bvModal.hide('manageCampaign')
      this.$bvModal.hide('manageSource')
      this.$bvModal.hide('addCampaign')
      this.$bvModal.hide('addSource')
      this.fetchDisplays()
    },
    triggerModal(type, cc, dc) {
      this.selectedCampaign = cc
      this.selectedDisplay = dc
      if (type === 'addCampaign') {
        this.$bvModal.show('addCampaign')
      }
      else if (type === 'manageCampaign') {
        this.$bvModal.show('manageCampaign')
      }
      else if (type === 'addSource') {
        this.$bvModal.show('addSource')
      }
      else if (type === 'manageSource') {
        this.$bvModal.show('manageSource')
      }
    },
    toggleActive() {
      this.campaignsVisible = 10
      this.displayOffset = 0
      this.activeSwitch = !this.activeSwitch
      this.handleResize()
    },
    toggleSources() {
      this.campaignsVisible = 10
      this.displayOffset = 0
      this.sourceSwitch = !this.sourceSwitch
      this.handleResize()
    },
    getTeamID(obj) {
      this.selectedTeamId = obj ? obj.teamId : 0
      this.handleResize()
    },
    loadCampaigns() {
      this.campaignsVisible = this.campaignsVisible + this.campaignLimit
      this.buildGrid()
    },
    previousPage() {
      if (this.displayOffset === 0) {
        // do nothing
      }
      else if (this.displayOffset < this.displayLimit) {
        this.displayOffset = 0
      }
      // there might be an issue here? idk
      else {
        this.displayOffset = this.displayOffset - this.displayLimit
      }
      this.buildGrid()
    },
    nextPage() {
      if ((this.displayOffset + this.displayLimit) > (this.filteredDisplays.length - this.displayLimit)) {
        this.displayOffset = this.filteredDisplays.length - this.displayLimit
      }
      if ((this.displayOffset + this.displayLimit) === this.filteredDisplays.length) {
        this.displayOffset = this.filteredDisplays.length - this.displayLimit
      }
      else {
        this.displayOffset = this.displayOffset + this.displayLimit
      }
      this.buildGrid()
    },
    handleResize: _.debounce(
      function () {
        let toparea = document.getElementById('toparea')
        let navbar = document.getElementById('navbar')
        let topheight = verge.rectangle(toparea).height
        let navbarheight = verge.rectangle(navbar).height
        this.tableHeight = parseInt(verge.viewportH() - topheight - navbarheight) + 'px'

        // add check for horizontal width only
        let width = verge.viewportW()
        if      (width > 1900) { this.viewport = 'xl' }
        else if (width > 1200) { this.viewport = 'lg' }
        else if (width > 992)  { this.viewport = 'md' }
        else if (width > 768)  { this.viewport = 'sm' }
        else if (width > 480)  { this.viewport = 'xs' }
        else                   { this.viewport = 'xs' }
        this.loaded = false
        this.buildGrid()
    }, 200),
    fetchDisplays () {
      this.displays = []
      let url = 'v1/displays?include=bookings,e2vbookings,tags&limit=all&team=' + parseInt(this.activeTeam.id)
      this.$axios.get(url).then(
        (response) => {
          this.displays = response.data.data
          this.displayMeta = response.data.meta
          this.displays.sort(function(a, b) { if(a.displayId < b.displayId) { return 1 } else { return -1 } })
          this.filteredDisplays = this.displays
          this.fetchCampaigns()
        },
        () => {
          this.tried = true
          this.displayMeta = {totalPages: 0}
          this.displays = []
          this.filteredDisplays = []
        }
      )
    },
    fetchCampaigns () {
      let url = 'v1/campaigns?include=tags,media&limit=all&team=' + parseInt(this.activeTeam.id)
      this.$axios.get(url).then(
        (response) => {
          this.campaigns = response.data.data
          this.campaigns.sort(function(a, b) { if(a.campaignId < b.campaignId) { return 1 } else { return -1 } })
          this.filteredCampaigns = this.campaigns
          this.fetchSources()
        },
        () => {
          this.tried = true
          this.campaigns = []
          this.filteredCampaigns = []
          this.fetchSources()
        }
      )
    },
    fetchSources () {
      let url = 'v1/sources?limit=all&team=' + parseInt(this.activeTeam.id)
      this.$axios.get(url).then(
        (response) => {
          this.sources = response.data.data
          this.sources.sort(function(a, b) { if(a.sourceId < b.sourceId) { return 1 } else { return -1 } })
          this.filteredSources = this.sources
          this.buildGrid()
        },
        () => {
          this.sources = []
          this.filteredSources = []
          this.buildGrid()
        }
      )
    },
    getCampaignLength (media) {
      let duration = 0
      for (let item of media) {
        duration = parseInt(item.end) > duration ? parseInt(item.end) : duration
      }
      return duration
    },
    buildGrid() {
      if (((this.campaigns.length > 0)&&(this.displays.length > 0)) || ((this.sources.length > 0)&&(this.displays.length > 0))) {

        this.filteredDisplays = this.displays.filter(function(display) {
            return display.name.toLowerCase().includes(this.displayFilter.toLowerCase())
        }, this)

        this.filteredCampaigns = this.campaigns.filter(function(campaign) {
            return campaign.name.toLowerCase().includes(this.campaignFilter.toLowerCase())
        }, this)


        if (this.sourceSwitch !== true) {
          this.filteredSources = this.sources.filter(function(source) {
              return source.name.toLowerCase().includes(this.campaignFilter.toLowerCase())
           }, this)
        }
        else {
          this.filteredSources = []
        }

        this.activeCampaigns = []
        this.activeSources = []
        this.activeDisplays = []

        if (this.activeSwitch === true) {
          for(let display of this.filteredDisplays) {
            let maybeBookings = display.bookings.data.filter(booking => booking.endDate > this.date)
            if (maybeBookings.length !== 0) {
              for (let booking of maybeBookings) {
                this.activeDisplays[display.displayId] = 1
                this.activeCampaigns[booking.campaignId] = 1
              }
            }
            let maybeE2vBookings = display.e2vbookings.data.filter(booking => booking.endDate > this.date)
            if (maybeE2vBookings.length !== 0) {
              for (let e2vbooking of maybeE2vBookings) {
                this.activeDisplays[display.displayId] = 1
                this.activeSources[e2vbooking.sourceId] = 1
              }
            }
          }
          this.filteredCampaigns = this.filteredCampaigns.filter(campaign => this.activeCampaigns[campaign.campaignId] == 1)
          this.filteredSources = this.filteredSources.filter(source => this.activeSources[source.sourceId] == 1)
          this.filteredDisplays = this.filteredDisplays.filter(display => this.activeDisplays[display.displayId] == 1)
        }

        this.filteredRows = this.filteredSources.concat(this.filteredCampaigns)

        // construct the grid
        for (let row in this.filteredRows) {
          if ((row < this.campaignsVisible) && (row < this.filteredRows.length)) {
          if (!this.cells[row]) {
            //this.$set(this.cells, row, [])
            this.cell[row]=[];
          }
          _.range(this.displayOffset, (this.displayOffset + this.displayLimit)).forEach(
            function (virtual, index) {
             
              // this.$set(this.cells[row], index,
              this.cells[row][index]=
              { date: this.date,
                time: this.time,
                name: 'ADD',
                cc: this.filteredRows[row],
                dc: this.filteredDisplays[virtual] }
            }, this)
          }
        }

        this.campaignRange = _.range(0, (this.campaignsVisible > this.filteredRows.length ? this.filteredRows.length : this.campaignsVisible))
        this.loaded = true

        // construct the grid
        // for (let campaign in this.filteredCampaigns) {
        //   if ((campaign < this.campaignsVisible) && (campaign < this.filteredCampaigns.length)) {
        //   if (!this.cells[campaign]) {
        //     this.$set(this.cells, campaign, [])
        //   }
        //   _.range(this.displayOffset, (this.displayOffset + this.displayLimit)).forEach(
        //     function (virtual, index) {
        //       this.$set(this.cells[campaign], index,
        //       { date: this.date,
        //         time: this.time,
        //         name: 'ADD',
        //         cc: this.filteredCampaigns[campaign],
        //         dc: this.filteredDisplays[virtual] })
        //     }, this)
        //   }
        // }
        // this can probably be converted to a computed property
        // this.campaignRange = _.range(0, (this.campaignsVisible > this.filteredCampaigns.length ? this.filteredCampaigns.length : this.campaignsVisible))
        // this.loaded = true
      }
    }
  },
}
</script>

<style>
.ipam_cell {
  cursor: pointer !important;
  text-overflow: ellipsis;
}

.ipam_cell:hover {
  cursor: pointer !important;
  background: red;
}

@media screen and (max-width: 767px) {
  html,body {
    font-size: 3vw
  }
}

.campaign-preview {
  max-width: 50em;
  height: 20em;
}

</style>
