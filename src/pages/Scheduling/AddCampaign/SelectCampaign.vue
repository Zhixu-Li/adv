<template lang="html">
  <div>
    <h2>{{ $t('schedule.selectCampaign') }}</h2>
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
    <multiselect
      v-model="campaign"
      :options="filteredCampaigns"
      :searchable="true"
      :placeholder="$t('schedule.selectCampaign')"
      label="name"
      @input="selectCampaign"
    />
    <BButton
      variant="primary"
      class="float-right mt-2"
      @click="next"
    >
      {{ $t('buttons.next') }}
    </BButton>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import {BButton} from 'bootstrap-vue-next'
export default {
  components: {
    Multiselect,
    BButton
  },
  data () {
    return {
      campaigns: [],
      campaign: {},
      errors: []
    }
  },
  computed: {
    filteredCampaigns () {
      return this.campaigns.filter((campaign) => {
        if (campaign.media.data.length > 0) {
          return true
        }
        return false
      })
    }
  },
  mounted () {
    this.fetchCampaigns()
  },
  methods: {
    fetchCampaigns () {
      var scope = this
      this.$axios.get('v1/campaigns?limit=all&include=media').then(
        (response) => {
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
    },
    selectCampaign () {
      this.errors = []
      this.$emit('campaignSelected', this.campaign)
    },
    next () {
      if (Object.keys(this.campaign).length > 0) {
        this.$emit('next')
      } else {
        this.errors = [
          'Please select a campaign.'
        ]
      }
    }
  }
}
</script>

<style lang="css">
</style>
