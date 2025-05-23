<template>
  <BContainer v-if="isLoaded" fluid>
    <BRow>
      <BCol class="text-center">
        <BButton class="m-2" variant="primary" @click="printReport">
          Print Report
        </BButton>
      </BCol>
    </BRow>

    <BRow id="report">
      <BCol>
        <!-- Header -->
        <BRow>
          <BCol cols="4">
            <img src="/static/logo_black.png" class="img-responsive" />
          </BCol>
          <BCol cols="6">
            <h3>Campaign Playback Report</h3>
          </BCol>
          <BCol cols="2" class="text-right">
            <BRow><BCol>generated on</BCol></BRow>
            <BRow><BCol>{{ currentDate }}</BCol></BRow>
            <BRow><BCol>{{ currentTime }}</BCol></BRow>
          </BCol>
        </BRow>

        <!-- Section titles -->
        <BRow class="pt-4 text-center">
          <BCol><h5>Display Details</h5></BCol>
          <BCol><h5>Campaign Details</h5></BCol>
          <BCol><h5>Media Details</h5></BCol>
        </BRow>

        <!-- Display / Campaign / Media details -->
        <BRow>
          <BCol>
            <BRow
              v-for="key in [
                'display_name','display_owner','display_contact',
                'display_resolution','display_block_time','display_size',
                'display_pixel_ratio'
              ]"
              :key="key"
            >
              <BCol class="pt-1 font-weight-bold">
                {{ $t(`report.${key}`) }}
              </BCol>
              <BCol>{{ report[key] }}</BCol>
            </BRow>
          </BCol>
          <BCol>
            <BRow
              v-for="key in [
                'campaign_name','start_date','end_date',
                'start_time_daily','end_time_daily','total_duration'
              ]"
              :key="key"
            >
              <BCol class="pt-1 font-weight-bold">
                {{ $t(`report.${key}`) }}
              </BCol>
              <BCol>{{ report[key] }}</BCol>
            </BRow>
          </BCol>
          <BCol>
            <BRow
              v-for="key in [
                'media_items','media_size','media_types',
                'min_max_width','min_max_height','avg_aspect_ratio'
              ]"
              :key="key"
            >
              <BCol class="pt-1 font-weight-bold">
                {{ $t(`report.${key}`) }}
              </BCol>
              <BCol>{{ report[key] }}</BCol>
            </BRow>
          </BCol>
        </BRow>

        <!-- More sections (omitted for brevity) -->

        <!-- Media Timings Table -->
        <BRow>
          <BCol>
            <h5>Media Timings</h5>
            <BTableSimple small>
              <BTr>
                <BTh>Type</BTh>
                <BTh>Filename</BTh>
                <BTh>Size</BTh>
                <BTh>Width</BTh>
                <BTh>Height</BTh>
                <BTh>Start</BTh>
                <BTh>End</BTh>
              </BTr>
              <BTr
                v-for="(media, index) in report.media"
                :key="index"
              >
                <BTd>{{ media.type }}</BTd>
                <BTd>{{ media.name }}</BTd>
                <BTd>{{ media.size }}</BTd>
                <BTd>{{ media.width }}</BTd>
                <BTd>{{ media.height }}</BTd>
                <BTd>{{ media.start }}</BTd>
                <BTd>{{ media.end }}</BTd>
              </BTr>
            </BTableSimple>
          </BCol>
        </BRow>
      </BCol>
    </BRow>
  </BContainer>

  <BContainer v-else>
    <BRow>
      <BCol>
        Generating report… <BSpinner small variant="danger" />
      </BCol>
    </BRow>
  </BContainer>
</template>
<script>
import moment from 'moment'
import {
  BContainer,
  BRow,
  BCol,
  BButton,
  BSpinner,
  BTableSimple,
  BTh,
  BTr,
  BTd
} from 'bootstrap-vue-next'
export default {
  name: 'Log',
  components: {
    BContainer,
    BRow,
    BCol,
    BButton,
    BSpinner,
    BTableSimple,
    BTh,
    BTr,
    BTd
  },
  props: {
  booking: {
    type: Object,
    required: true
  },
  },
  data() {
  return {
    isLoaded: false,
    currentDate: moment().format('DD/MM/YYYY'),
    currentTime: moment().format('HH:MM:SS a'),
    report: {},
    // keys: ["display_name", "display_owner", "display_contact", "display_resolution", "display_block_time", "display_size", "display_pixel_ratio", "campaign_name", "date_scheduled", "start_date", "end_date", "start_time_daily", "end_time_daily", "expected_total_plays", "expected_current_plays", "total_plays_to_date", "extra_plays", "current_progress", "total_duration", "expected_duration", "average_duration", "min_duration", "max_duration", "deviation_margin", "efficiency_percent", "minimum_brightness", "maximum_brightness", "average_brightness", "media_items", "media_size", "media_types", "playback_quality", "playback_rating", "content_fit", "content_scale", "min_max_width", "min_max_height", "avg_aspect_ratio", "buyer_name", "buyer_contact", "total_cost", "actual_cost", "discount", "gst", "payout", "extra_value", "date", "time"],
  }
  },
  computed: {
  },
  beforeUnmount() {
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    printReport() {
      this.$htmlToPaper('report');
    },
    fetchData() {
    this.$axios.get('ext/report/'+this.booking.id).then(
      (response) => {
        this.report = response.data
        this.isLoaded = true
      },
      (response) => {
        console.log('error', response)
      }
    )
    }
  }
}
</script>

<style scoped>
/* .row { border: 2px solid blue !important }
.col { border: 2px solid red !important } */

#report {
    border: 1px solid black;
    padding: 10mm;
    margin: 1em auto;
    box-sizing: border-box;

    /* I don't know why, but bootstrap doesn't like me using A4 size in this preview */
    width: 297mm;
    min-height: 419mm;
    zoom: 66.7%;
}
</style>

