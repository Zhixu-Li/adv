<template>
  <BTabs contentClass="mt-3">
    <BTab
      title="Overview"
      active
      @click="() => $router.push({ name: 'log', params: { booking } })"
    >
      <router-view :booking="booking" />
    </BTab>

    <BTab title="Complete Log">
      <BButton
        variant="primary"
        :href="`${rootUrl}/api/ext/log/${booking.id}`"
      >
        Download Playback Log (csv format)
      </BButton>
    </BTab>

    <BTab
      title="Report"
      @click="() => $router.push({ name: 'report', params: { booking } })"
    >
      <router-view :booking="booking" />
    </BTab>
  </BTabs>
</template>

<script>
// import 'vue-awesome/icons/arrow-left'
// import 'vue-awesome/icons/plus'
import { BTabs, BTab, BButton } from 'bootstrap-vue-next'
export default {
  name: 'TabContainer',
  components: {
    BTabs,
    BTab,
    BButton
  },
  props: {
    booking: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      rootUrl: process.env.VUE_APP_API_ROOT
    }
  },
  methods: {
    openReport() {
        
    }
  },
}

</script>