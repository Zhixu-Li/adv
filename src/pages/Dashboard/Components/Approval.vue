<template>
  <div v-show="filteredBookings.length">
    <b-modal
      id="mediamodal"
      hide-footer
      size="md"
    >
      <campaign
        :media="media"
        class="preview"
      />
    </b-modal>
    <b-card :title="$t('dashboard.common.approvalQueue')">
      <b-card-text>
        <div v-if="!loading">
          <b-table
            id="approvalTable"
            :items="filteredBookings"
            :per-page="perPage"
            :current-page="currentPage"
            :fields="fields"
            small
          >
            <template #cell(buttons)="row">
              <b-button-group>
                <b-button
                  variant="secondary"
                  size="sm"
                  @click="preview(row.item.campaign.data.media.data)"
                >
                  {{ $t('common.preview') }}
                </b-button>
                <b-button
                  variant="primary"
                  size="sm"
                  @click="approveCampaign(row.item.displayId, row.item.id)"
                >
                  {{ $t('dashboard.approval.approve') }}
                </b-button>
                <b-button
                  variant="danger"
                  size="sm"
                  @click="denyCampaign(row.item.displayId, row.item.id)"
                >
                  {{ $t('dashboard.approval.deny') }}
                </b-button>
              </b-button-group>
            </template>
          </b-table>
          <b-pagination
            v-model="currentPage"
            size="sm"
            :total-rows="rows"
            :per-page="perPage"
            aria-controls="approvalTable"
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
  </div>
</template>

<script>
import Campaign from '@/components/Preview/Campaign.vue'

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
      media: [],
      data: [],
      perPage: 3,
      currentPage: 1,
      fields: [{
          key: 'advertiser',
          sortable: false,
          label: this.$t('dashboard.approval.advertiser')
        },
        {
          key: 'campaignName',
          sortable: false,
          label: this.$t('dashboard.approval.name')
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
          label: ''
        }
      ],
    }
  },
  computed: {
    rows() {
      return this.filteredBookings.length
    },
    filteredBookings() {
      return this.data.filter((booking) => {
        if (booking.display.data.teamId === this.activeTeam.id) {
            return true
        }
      })
    }
  },
  mounted() {
    this.getApprovalQueue()
  },
  methods: {
    getApprovalQueue() {
      this.loading = true
      this.$axios.get('v1/displays/campaigns/pending?include=campaign.media,display&limit=all', {}).then(
        (response) => {
          this.loading = false
          this.data = response.data.data

        },
        (response) => {
          if (response.status === 404) {
            this.loading = false
            this.data = []
          }
        }
      )
    },
    preview(media) {
      this.$bvModal.show('mediamodal')
      this.media = media
    },
    approveCampaign(displayId, id) {
      this.$emit('working')
      this.$axios.post('v1/displays/' + displayId + '/campaigns/' + id, {
        approval: 'approved'
      }).then(
        () => {
          this.$notifications.add({
            title: 'Success',
            type: 'success',
            body: this.$t('notifications.campaignApprove'),
            timeout: true
          })
          this.getApprovalQueue()
          this.$emit('done')
        },
        () => {
          this.$notifications.add({
            title: 'Error',
            type: 'danger',
            body: this.$t('notifications.campaignApproveError'),
            timeout: true
          })
        }
      )
    },
    denyCampaign(displayId, id) {
      this.$emit('working')
      this.$axios.post('v1/displays/' + displayId + '/campaigns/' + id, {
        approval: 'denied'
      }).then(
        () => {
          this.$notifications.add({
            title: 'Success',
            type: 'success',
            body: this.$t('notifications.campaignDenied'),
            timeout: true
          })
          this.getApprovalQueue()
          this.$emit('done')
        },
        () => {
          this.$notifications.add({
            title: 'Error',
            type: 'danger',
            body: this.$t('notifications.campaignDeniedError'),
            timeout: true
          })
        }
      )
    }
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
