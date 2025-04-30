<template>
  <div v-show="filteredBookings.length">
    <b-card
      class=""
      :title="$t('dashboard.common.current')"
    >
      <b-card-text>
        <div v-if="!loading">
          <!-- <b-table id="activeTable" :items="filteredBookings" :per-page="10" v-model:sort-by="sortBy v-model:sort-desc="sortDesc" :current-page="currentPage" :fields="fields" responsive stacked="md" borderless small sort-icon-left> -->
            
          <b-table
            id="activeTable"
            v-model:sort-by="sortBy"
            v-model:sort-desc="sortDesc"
            :items="filteredBookings"
            :fields="fields"
            :per-page="10"
            :current-page="currentPage"
            responsive
stacked="md" borderless small sort-icon-left
          >
            <template #cell(buttons)="row">
              <template v-if="row.detailsShowing">
                <b-button
                  size="sm"
                  class="border border-muted text-dark"
                  variant="light"
                  @click="row.toggleDetails"
                >
                  <b-icon icon="arrow-up" /> Close
                </b-button>
              </template>
              <template v-else>
                <b-button
                  size="sm"
                  class="border border-muted text-dark"
                  variant="light"
                  @click="row.toggleDetails"
                >
                  <b-icon icon="arrow-down" /> Expand
                </b-button>
              </template>
            </template>

            <template #cell(paidStatus)="paid">
              <b-badge
                v-if="paid.item.displayTeamId !== paid.item.advertiserId"
                variant="success"
              >
                {{ $t('currency.symbol') }}
              </b-badge>
            </template>

            <template #cell(displayName)="display">
              <b-link
                class="text-dark"
                :to="{ name: 'display-view', params: { displayId: display.item.displayId } }"
              >
                {{ display.item.displayName }}
              </b-link>
            </template>

            <template #cell(campaignName)="campaign">
              <b-link
                class="text-dark"
                :to="{ name: 'campaign', params: { campaignId: campaign.item.campaignId } }"
              >
                {{ campaign.item.campaignName }}
              </b-link>
            </template>

            <template #cell(endDate)="booking">
              <p v-if="booking.item.endDate >= '2037-01-01'">
                <b-icon-arrow-repeat /> No End Date
              </p>
              <p v-else>
                {{ booking.item.endDate }}
              </p>
            </template>

            <template #row-details="row">
              <b-row class="m-0 p-0">
                <b-col>
                  <campaign
                    style="height: 18vh"
                    :media="campaigns.find(c => c.value.campaignId == row.item.campaignId).value.media.data"
                    no-controls
                  />
                </b-col>
                <b-col>
                  <b-table-simple
                    small
                    borderless
                  >
                    <b-tr>
                      <b-th>Start Time</b-th>
                      <b-td>{{ row.item.startTime }}</b-td>
                    </b-tr>
                    <b-tr>
                      <b-th>End Time</b-th>
                      <b-td>{{ row.item.endTime }}</b-td>
                    </b-tr>
                    <b-tr>
                      <b-th>Duration</b-th>
                      <b-td>{{ row.item.duration }} {{ $t('seconds') }}</b-td>
                    </b-tr>
                    <b-tr>
                      <b-th>Days Enabled</b-th>
                      <b-td>
                        <div class="btn-group">
                          <div 
                            v-for="(day, index) in ['M','T','W','T','F','S','S']"
                            :key="index"
                            class="d-inline-block border text-light p-1 pl-2 pr-2"
                            :class="row.item.daysEnabled & (2 ** index) ? 'bg-dark' : 'bg-light'"
                            :style="{fontWeight:'bold', width:'2em', fontSize:'90%'}"
                          >
                            {{ day }}
                          </div>
                        </div>
                      </b-td>
                    </b-tr>
                    <b-tr v-if="row.item.displayTeamId === row.item.advertiserId">
                      <b-th>Actions</b-th>
                      <b-td>
                        <div v-if="row.item.approval === 'approved'">
                          <b-button
                            variant="warning"
                            class="ml-0 mr-1"
                            size="sm"
                            @click="working=row.item;$bvModal.show('replace-modal')"
                          >
                            {{ $t('dashboard.current.replace') }}
                          </b-button>
                          <b-button
                            variant="danger"
                            class="ml-1"
                            size="sm"
                            @click="working=row.item;$bvModal.show('cancel-modal')"
                          >
                            {{ $t('dashboard.current.cancel') }}
                          </b-button>
                        </div>
                        <b-badge
                          v-else
                          :variant="row.item.startDate > currentDate ? 'warning' : 'danger'"
                        >
                          {{ $t('Pending Approval') }}
                        </b-badge>
                      </b-td>
                    </b-tr>
                    <b-tr v-else>
                      <b-th>Advertiser</b-th>
                      <b-td>
                        {{ row.item.advertiser }} <em>{{ row.item.advertiserContact }}</em>
                      </b-td>
                    </b-tr>
                  </b-table-simple>
                </b-col>
              </b-row>
            </template>
            
            >
          </b-table>
          <b-pagination
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
        <div
          v-else
          class="loader"
        >
          <b-spinner label="Loading" />
        </div>
      </b-card-text>
    </b-card>

    <b-modal
      id="cancel-modal"
      :title="$t('actions.cancel')"
      size="md"
    >
      <p>{{ $t('message.paidCancel') }}</p>
      <b-table-simple
        v-if="working.campaign"
        outlined
        small
      >
        <b-tr>
          <b-th>
            {{ $t('dashboard.campaigns.name') }}
          </b-th>
          <b-td>
            {{ working.campaign.data.name }}
          </b-td>
        </b-tr>
        <b-tr>
          <b-th>
            {{ $t('dashboard.campaigns.display') }}
          </b-th>
          <b-td>
            {{ working.displayName }}
          </b-td>
        </b-tr>
        <b-tr v-if="working.startDate === working.endDate">
          <b-th>
            {{ $t('dateTime.date') }}
          </b-th>
          <b-td>
            {{ working.startDate }}
          </b-td>
        </b-tr>
        <b-tr v-else>
          <b-th>
            {{ $t('dateTime.dateRange') }}
          </b-th>
          <b-td>
            {{ working.startDate }} to {{ working.endDate }}
          </b-td>
        </b-tr>
        <b-tr>
          <b-th>
            {{ $t('dateTime.dailyTimes') }}
          </b-th>
          <b-td v-if="working.startTime==='00:00:00' && working.endTime==='23:59:59'">
            {{ $t('dateTime.allDay') }}
          </b-td>
          <b-td v-else>
            {{ working.startTime }} to {{ working.endTime }}
          </b-td>
        </b-tr>
      </b-table-simple>
      <p><em>{{ $t('message.paidCancelNote') }}</em></p>
      <!-- <div slot="modal-footer">
        <b-button variant="primary" class="float-left" @click="$bvModal.hide('cancel-modal')">{{$t('answers.no')}}
        </b-button>
        <b-button variant="danger" class="float-right ml-2" @click="removeCampaign(working.id,working.displayId)">
          {{$t('actions.cancel')}}
        </b-button>
      </div> -->
      <template #modal-footer>
        <b-button
          variant="primary"
          class="float-left"
          @click="$bvModal.hide('cancel-modal')"
        >
          {{ $t('answers.no') }}
        </b-button>
        <b-button
          variant="danger"
          class="float-right ml-2"
          @click="removeCampaign(working.id, working.displayId)"
        >
          {{ $t('actions.cancel') }}
        </b-button>
      </template>
    </b-modal>

    <b-modal
      id="replace-modal"
      :title="$t('actions.replace')"
      size="md"
    >
      <p>{{ $t('message.replaceBooking') }}</p>
      <b-form>
        <b-form-group
          id="campaign-group"
          label-for="campaign"
        >
          <b-form-select
            id="campaign"
            v-model="selectedCampaign"
            :options="campaigns"
            required
          />
        </b-form-group>
      </b-form>
      <div class="mt-1">
        <campaign
          style="height: 18vh"
          :media="previewMedia"
          no-controls
        />
      </div>
      <b-table-simple small>
        <b-tr>
          <b-th />
          <b-th>
            Current Campaign
          </b-th>
          <b-th>
            Selected Campaign
          </b-th>
        </b-tr>
        <!-- <b-tr>
          <b-th>
            Name
          </b-th>
          <b-td>
            Current Name
          </b-td>
          <b-td>
            Selected Name
          </b-td>
        </b-tr> -->
        <b-tr>
          <b-th>
            Duration
          </b-th>
          <b-td>
            {{ working.duration }}s
          </b-td>
          <b-td>
            {{ selectedDuration }}s
          </b-td>
        </b-tr>
      </b-table-simple>
      <h4>
        Suitability for replacement: <b-badge :variant="suitable">
          {{ $t('dashboard.current.variantActions.' + suitable) }}
        </b-badge>
      </h4>
      <p v-if="suitable == 'danger'">
        <em>{{ $t('message.replaceLong') }}</em>
      </p>
      <p v-else-if="suitable != 'success'">
        <em>{{ $t('message.replaceShort') }}</em>
      </p>
      <!-- <p><em>{{$t('message.replaceNote')}}</em></p> -->
      <!-- <div slot="modal-footer">
        <b-button variant="secondary" class="float-left" @click="$bvModal.hide('cancel-modal')">
          {{$t('dashboard.current.cancel')}}
        </b-button>
        <b-button variant="primary" :disabled="suitable=='danger'" class="float-right ml-2"
          @click="replaceCampaign(working.id,working.displayId,selectedCampaign.campaignId)">
          {{$t('actions.replace')}}
        </b-button> -->
      <template #modal-footer>
        <b-button
          variant="secondary"
          class="float-left"
          @click="$bvModal.hide('cancel-modal')"
        >
          {{ $t('dashboard.current.cancel') }}
        </b-button>
        <b-button
          variant="primary"
          :disabled="suitable === 'danger'"
          class="float-right ml-2"
          @click="replaceCampaign(working.id, working.displayId, selectedCampaign.campaignId)"
        >
          {{ $t('actions.replace') }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import moment from 'moment'
import Campaign from '@/components/Player/PropPlayer.vue'

export default {
  components: {
    Campaign
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
