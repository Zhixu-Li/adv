<template>
  <b-tabs content-class="mt-3">
    <b-tab
      title="Overview"
      active
      @click="() => $router.push({ name: 'log', params: { booking: booking } })"
    >
      <router-view :booking="booking" />
    </b-tab>
    <b-tab title="Complete Log">
      <b-button
        variant="primary"
        :href="rootUrl + '/api/ext/log/' + booking.id"
      >
        Download Playback Log (csv format)
      </b-button>
    </b-tab>
    <b-tab
      title="Report"
      @click="() => $router.push({ name: 'report', params: { booking: booking } })"
    >
      <router-view :booking="booking" />
    </b-tab>
  </b-tabs>
</template>

<script>
// import 'vue-awesome/icons/arrow-left'
// import 'vue-awesome/icons/plus'

export default {
  name: 'TabContainer',
  components: {
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