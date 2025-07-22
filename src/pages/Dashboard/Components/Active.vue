<template>
  <div>
    <!-- Active Bookings Table -->
    <BRow v-show="filteredBookings.length">
      <BCard :title="$t('dashboard.common.current')">
        <BCardText>
          <div v-if="!loading">
            <BTable
              id="activeTable"
              v-model:sort-by="sortBy"
              v-model:sort-desc="sortDesc"
              :items="filteredBookings"
              :fields="fields"
              :per-page="10"
              :current-page="currentPage"
              responsive
              stacked="md"
              borderless
              small
              sort-icon-left
            >
              <!-- Expand/Collapse Button Column -->
              <template #cell(buttons)="row">
                <BButton
                  size="sm"
                  variant="light"
                  class="border border-muted text-dark"
                  @click="row.toggleDetails"
                >
                  <!-- <BIcon :icon="row.detailsShowing ? 'arrow-up' : 'arrow-down'" /> -->
                  <font-awesome-icon :icon="row.detailsShowing ? 'arrow-up' : 'arrow-down'" />
                  {{ row.detailsShowing ? 'Close' : 'Expand' }}
                </BButton>
              </template>

              <!-- Paid Status Badge -->
              <template #cell(paidStatus)="paid">
                <BBadge v-if="paid.item.displayTeamId !== paid.item.advertiserId" variant="success">
                  {{ $t('currency.symbol') }}
                </BBadge>
              </template>

              <!-- Display Name Link -->
              <template #cell(displayName)="display">
                <BLink
                  class="text-dark"
                  :to="{ name:'display-view', params:{ displayId: display.item.displayId } }"
                >
                  {{ display.item.displayName }}
                </BLink>
              </template>

              <!-- Campaign Name Link -->
              <template #cell(campaignName)="campaign">
                <BLink
                  class="text-dark"
                  :to="{ name:'campaign', params:{ campaignId: campaign.item.campaignId } }"
                >
                  {{ campaign.item.campaignName }}
                </BLink>
              </template>

              <!-- End Date Column -->
              <template #cell(endDate)="booking">
                <p v-if="booking.item.endDate >= '2037-01-01'">
                  <!-- <BIcon icon="arrow-repeat" /> No End Date -->
                   <font-awesome-icon icon="arrow-repeat" /> No End Date
                </p>
                <p v-else>{{ booking.item.endDate }}</p>
              </template>

              <!-- Row Details -->
              <template #row-details="row">
                <BRow class="m-0 p-0">
                  <BCol>
                    <campaign
                      style="height:18vh"
                      :media="campaigns.find(c => c.value.campaignId === row.item.campaignId).value.media.data"
                      no-controls
                    />
                  </BCol>
                  <BCol>
                    <BTableSimple small borderless>
                      <BTr>
                        <BTh>Start Time</BTh><BTd>{{ row.item.startTime }}</BTd>
                      </BTr>
                      <BTr>
                        <BTh>End Time</BTh><BTd>{{ row.item.endTime }}</BTd>
                      </BTr>
                      <BTr>
                        <BTh>Duration</BTh><BTd>{{ row.item.duration }} {{ $t('seconds') }}</BTd>
                      </BTr>
                      <BTr>
                        <BTh>Days Enabled</BTh>
                        <BTd>
                          <div class="btn-group">
                            <div
                              v-for="(day,i) in ['M','T','W','T','F','S','S']"
                              :key="i"
                              class="d-inline-block border text-light p-1"
                              :class="row.item.daysEnabled & (2**i) ? 'bg-dark' : 'bg-light'"
                              style="font-weight:bold;width:2em;font-size:90%"
                            >
                              {{ day }}
                            </div>
                          </div>
                        </BTd>
                      </BTr>
                      <BTr v-if="row.item.displayTeamId === row.item.advertiserId">
                        <BTh>Actions</BTh>
                        <BTd>
                          <div v-if="row.item.approval === 'approved'">
                            <BButton
                              variant="warning"
                              size="sm"
                              class="me-1"
                              @click="working = row.item; $bvModal.show('replace-modal')"
                            >
                              {{ $t('dashboard.current.replace') }}
                            </BButton>
                            <BButton
                              variant="danger"
                              size="sm"
                              @click="working = row.item; $bvModal.show('cancel-modal')"
                            >
                              {{ $t('dashboard.current.cancel') }}
                            </BButton>
                          </div>
                          <BBadge
                            v-else
                            :variant="row.item.startDate > currentDate ? 'warning' : 'danger'"
                          >
                            {{ $t('Pending Approval') }}
                          </BBadge>
                        </BTd>
                      </BTr>
                      <BTr v-else>
                        <BTh>Advertiser</BTh>
                        <BTd>
                          {{ row.item.advertiser }} <em>{{ row.item.advertiserContact }}</em>
                        </BTd>
                      </BTr>
                    </BTableSimple>
                  </BCol>
                </BRow>
              </template>
            </BTable>
            <BPagination
              v-if="rows > 10"
              v-model="currentPage"
              hide-goto-end-buttons
              hide-ellipsis
              align="center"
              :total-rows="rows"
              :per-page="perPage"
              aria-controls="activeTable"
            />
          </div>
          <div v-else class="loader">
            <BSpinner label="Loading" />
          </div>
        </BCardText>
      </BCard>
    </BRow>

    <!-- Cancel Modal -->
    <BModal id="cancel-modal" :title="$t('actions.cancel')" size="md">
      <p>{{ $t('message.paidCancel') }}</p>
      <BTableSimple outlined small>
        <BTr>
          <BTh>{{ $t('dashboard.campaigns.name') }}</BTh>
          <BTd>{{ working.campaign.data.name }}</BTd>
        </BTr>
        <BTr>
          <BTh>{{ $t('dashboard.campaigns.display') }}</BTh>
          <BTd>{{ working.displayName }}</BTd>
        </BTr>
        <BTr v-if="working.startDate === working.endDate">
          <BTh>{{ $t('dateTime.date') }}</BTh><BTd>{{ working.startDate }}</BTd>
        </BTr>
        <BTr v-else>
          <BTh>{{ $t('dateTime.dateRange') }}</BTh>
          <BTd>{{ working.startDate }} to {{ working.endDate }}</BTd>
        </BTr>
        <BTr>
          <BTh>{{ $t('dateTime.dailyTimes') }}</BTh>
          <BTd v-if="working.startTime==='00:00:00' && working.endTime==='23:59:59'">
            {{ $t('dateTime.allDay') }}
          </BTd>
          <BTd v-else>{{ working.startTime }} to {{ working.endTime }}</BTd>
        </BTr>
      </BTableSimple>
      <p><em>{{ $t('message.paidCancelNote') }}</em></p>
      <template #modal-footer>
        <BButton variant="primary" class="me-2" @click="$bvModal.hide('cancel-modal')">
          {{ $t('answers.no') }}
        </BButton>
        <BButton variant="danger" @click="removeCampaign(working.id, working.displayId)">
          {{ $t('actions.cancel') }}
        </BButton>
      </template>
    </BModal>

    <!-- Replace Modal -->
    <BModal id="replace-modal" :title="$t('actions.replace')" size="md">
      <p>{{ $t('message.replaceBooking') }}</p>
      <BForm>
        <BFormGroup label-for="campaign-group">
          <BFormSelect
            id="campaign"
            v-model="selectedCampaign"
            :options="campaigns"
            required
          />
        </BFormGroup>
      </BForm>
      <div class="mt-1">
        <campaign style="height:18vh" :media="previewMedia" no-controls />
      </div>
      <BTableSimple small>
        <BTr>
          <BTh />
          <BTh>Current Campaign</BTh>
          <BTh>Selected Campaign</BTh>
        </BTr>
        <BTr>
          <BTh>Duration</BTh><BTd>{{ working.duration }}s</BTd><BTd>{{ selectedDuration }}s</BTd>
        </BTr>
      </BTableSimple>
      <h4>
        {{ $t('dashboard.current.variantActions.' + suitable) }}
        <BBadge :variant="suitable">{{ suitable }}</BBadge>
      </h4>
      <p v-if="suitable==='danger'"><em>{{ $t('message.replaceLong') }}</em></p>
      <p v-else-if="suitable!=='success'"><em>{{ $t('message.replaceShort') }}</em></p>
      <template #modal-footer>
        <BButton variant="secondary" class="me-2" @click="$bvModal.hide('replace-modal')">
          {{ $t('dashboard.current.cancel') }}
        </BButton>
        <BButton
          variant="primary"
          :disabled="suitable==='danger'"
          @click="replaceCampaign(working.id, working.displayId, selectedCampaign.campaignId)"
        >
          {{ $t('actions.replace') }}
        </BButton>
      </template>
    </BModal>
  </div>
</template>
<script>
import {
  BRow,
  BCard,
  BCardText,
  BTable,
  BTr,
  BTh,
  BTd,
  BButton,
  BLink,
  // BIcon,
  BPagination,
  BSpinner,
  BTableSimple,
  BForm,
  BFormGroup,
  BFormSelect,
  BModal,
  BBadge,
  
} from 'bootstrap-vue-next'
import moment from 'moment'
import Campaign from '@/components/Player/PropPlayer.vue'

export default {
  components: {
    Campaign,
    BRow,
    BCard,
    BCardText,
    BTable,
    BTr,
    BTh,
    BTd,
    BButton,
    BLink,
    // BIcon,
    BPagination,
    BSpinner,
    BTableSimple,
    BForm,
    BFormGroup,
    BFormSelect,
    BModal,
    BBadge,
    
  },
  props: {
    activeTeam: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      hidden: false,
      data: Array(),
      perPage: 10,
      currentPage: 1,
      working: {},
      campaigns: [],
      selectedCampaign: {},
      selectedDuration: 0,
      previewMedia: [],
      currentDate: moment().format('YYYY-MM-DD'),
      sortBy: 'startDate',
      sortDesc: true,
      fields: [
        {
          key: 'paidStatus',
          sortable: false,
          label: "\xA0",
        },
        {
          key: 'campaignName',
          sortable: false,
          label: this.$t('dashboard.approval.name'),
          tdClass: 'booking-td',
          tdAttr: (v,k,i,t) => { v,k,i,t; return { title: i.campaignName } },
        },
        {
          key: 'displayName',
          sortable: false,
          label: this.$t('dashboard.approval.display')
        },
        {
          key: 'startDate',
          sortable: true,
          label: this.$t('dateTime.sDate')
        },
        {
          key: 'endDate',
          sortable: true,
          label: this.$t('dateTime.eDate')
        },
        {
          key: 'buttons',
          sortable: false,
          label: "\xA0",
          tdClass: 'text-sm-center text-md-left',
        }
      ],
    }
  },
  computed: {
    rows() {
      return this.filteredBookings.length
    },
    suitable () {
      if (this.selectedDuration > this.working.duration) {
        return 'danger'
      }
      else if (this.working.duration == this.selectedDuration) {
        return 'success'
      }
      else if ((this.working.duration - this.selectedDuration) > (this.working.duration*.1)) {
        return 'warning'
      }
      else if (((this.working.duration - this.selectedDuration) < (this.working.duration*.1))) {
        return 'info'
      }
      else {
        return 'garbage'
      }
    },
    filteredBookings() {
      return this.data.filter((booking) => {
        if (booking.advertiserId === this.activeTeam.id || booking.displayTeamId === this.activeTeam.id) {
            return true
        }
      })
    }
  },
  mounted() {
    this.getActiveBookings()
    this.fetchCampaigns()
    this.$watch('selectedCampaign', function () {
      this.updatePreview()
    })
  },
  methods: {
    getActiveBookings() {
      this.loading = true
      this.$axios.get('v1/campaigns/current?include=campaign&limit=all', {}).then(
        (response) => {
          this.loading = false
          this.data = Array.from(response.data.data)
        },
        (response) => {
          if (response.status === 404) {
            this.loading = false
            this.data = []
          }
        }
      )
    },
    removeCampaign (campaignId,displayId) {
      this.$axios.delete('v1/displays/' + displayId + '/campaigns/' + campaignId).then(
        () => {
          this.$notifications.add({
            title: 'Deleted',
            type: 'success',
            body: this.$t('notifications.campaignRemove'),
            timeout: true
          })
          this.$bvModal.hide('cancel-modal')
          this.getActiveBookings()
        },
        () => {
          this.$notifications.add({
            title: 'Alert',
            type: 'warning',
            body: this.$t('notifications.campaignRemoveError'),
            timeout: true
          })
        }
      )
    },
    replaceCampaign (campaignId,displayId,replacementId) {
      this.$axios.post('v1/displays/' + displayId + '/campaigns/' + campaignId + '/replace', {replacementCampaignId: replacementId}).then(
        () => {
          this.$notifications.add({
            title: 'Deleted',
            type: 'success',
            body: this.$t('notifications.campaignRemove'),
            timeout: true
          })
          this.$bvModal.hide('replace-modal')
          this.getActiveBookings()
        },
        () => {
          this.$notifications.add({
            title: 'Alert',
            type: 'warning',
            body: this.$t('notifications.campaignRemoveError'),
            timeout: true
          })
        }
      )
    },
    fetchCampaigns() {
      let url = 'v1/campaigns?include=tags,media&limit=all'
      this.$axios.get(url).then(
        (response) => {
          let array = response.data.data
          array.sort(function (a, b) {
            if (a.campaignId < b.campaignId) {
              return 1
            } else {
              return -1
            }
          })
          array.filter((campaign) => {
            if (campaign.media.data.length > 0) {
              return true
            }
            return false
          })
          let formattedArray = []
          for (let campaign of array) {
            formattedArray.push({
              text: campaign.name,
              value: campaign
            })
          }
          this.selectedCampaign = array[0]
          this.campaigns = formattedArray
        },
        () => {}
      )
    },
    updatePreview() {
      let duration = 0
      this.$axios.get('v1/campaigns/' + this.selectedCampaign.campaignId + '/media?limit=all').then(
        (response) => {
          this.previewMedia = response.data.data
          if (!this.previewMedia) {
              this.selectedDuration = 0
            }
            for (let item of this.previewMedia) {
              duration = parseInt(item.end) > duration ? parseInt(item.end) : duration
            }
            this.selectedDuration = duration
        },
        () => {
          this.previewMedia = []
        }
      )
    }
  }
}
</script>

<style>
div.dashboard {
  min-height: 100%;
}

.preview {
  height: 40vh;
}

.booking-td a {
  max-width: 10em;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

</style>
