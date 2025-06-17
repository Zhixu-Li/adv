<template lang="html">
  <div>
    <select-source
      v-if="pages[index] === 'select'"
      @source-selected="selectSource"
      @next="next"
    />
    <schedule-source
      v-if="pages[index] === 'schedule'"
      :select-disabled="selectDisabled"
      :source="source"
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
import SelectSource from './SelectSource.vue'
import ScheduleSource from './ScheduleSource.vue'

export default {
  components: {
    SelectSource,
    ScheduleSource
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
    selectedSource: {
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
      source: {},
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

    if (Object.keys(this.selectedSource).length !== 0) {
      this.source = this.selectedSource
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
    selectSource (source) {
      this.source = source
    },
    dataChange (newData) {
      this.bookingData = newData
    }
  }
}
</script>

<style lang="scss">
</style>
