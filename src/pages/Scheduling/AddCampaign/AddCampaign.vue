<template lang="html">
  <div>
    <select-campaign
      v-if="pages[index] === 'select'"
      @campaign-selected="selectCampaign"
      @next="next"
    />
    <schedule-campaign
      v-if="pages[index] === 'schedule'"
      :select-disabled="selectDisabled"
      :campaign="campaign"
      :display="display"
      :saved-booking="bookingData"
      @next="next"
      @back="previous"
      @data-change="dataChange"
      @done="$emit('done')"
    />
  </div>
</template>

<script>
import SelectCampaign from './SelectCampaign.vue'
import ScheduleCampaign from './ScheduleCampaign.vue'

export default {
  components: {
    SelectCampaign,
    ScheduleCampaign
  },
  props: {
    startingIndex: {
      type: Number,
      default: 0
    },
    selectedDisplay: {
      type: Object,
      required: true
    },
    selectedCampaign: {
      type: Object,
      default () {
        return {}
      }
    },
    selectDisabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      index: 0,
      campaign: {},
      display: {},
      bookingData: {},
      pages: [
        'select',
        'schedule'
      ]
    }
  },
  mounted () {
    this.index = this.startingIndex
    this.display = this.selectedDisplay

    if (Object.keys(this.selectedCampaign).length !== 0) {
      this.campaign = this.selectedCampaign
    }
  },
  methods: {
    next (data) {
      if (this.pages[this.index] === 'schedule') {
        this.bookingData = data
      }
      this.index += 1
    },
    previous () {
      this.index -= 1
    },
    goTo (page) {
      this.index = this.pages.findIndex((element) => {
        return element === page
      })
    },
    selectCampaign (campaign) {
      this.campaign = campaign
    },
    dataChange (newData) {
      this.bookingData = newData
    }
  }
}
</script>

<style lang="scss">
</style>
