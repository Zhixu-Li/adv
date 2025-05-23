<template>
  <div v-show="filteredBookings.length">
    <BModal id="mediamodal" hide-footer size="md">
      <campaign :media="media" class="preview" />
    </BModal>

    <BCard :title="$t('dashboard.common.approvalQueue')">
      <BCardText>
        <div v-if="!loading">
          <BTable
            id="approvalTable"
            :items="filteredBookings"
            :per-page="perPage"
            :current-page="currentPage"
            :fields="fields"
            small
          >
            <template #cell(buttons)="row">
              <BButtonGroup>
                <BButton
                  variant="secondary"
                  size="sm"
                  @click="preview(row.item.campaign.data.media.data)"
                >
                  {{ $t('common.preview') }}
                </BButton>
                <BButton
                  variant="primary"
                  size="sm"
                  @click="approveCampaign(row.item.displayId, row.item.id)"
                >
                  {{ $t('dashboard.approval.approve') }}
                </BButton>
                <BButton
                  variant="danger"
                  size="sm"
                  @click="denyCampaign(row.item.displayId, row.item.id)"
                >
                  {{ $t('dashboard.approval.deny') }}
                </BButton>
              </BButtonGroup>
            </template>
          </BTable>

          <BPagination
            v-model="currentPage"
            size="sm"
            :total-rows="rows"
            :per-page="perPage"
            aria-controls="approvalTable"
          />
        </div>

        <div v-else class="loader">
          <BSpinner label="Loading" />
        </div>
      </BCardText>
    </BCard>
  </div>
</template>

<script>
import Campaign from '@/components/Preview/Campaign.vue'
import {
  BModal,
  BCard,
  BCardText,
  BTable,
  BButtonGroup,
  BButton,
  BPagination,
  BSpinner
} from 'bootstrap-vue-next'
export default {
  components: {
    Campaign,
    BModal,
    BCard,
    BCardText,
    BTable,
    BButtonGroup,
    BButton,
    BPagination,
    BSpinner,
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
