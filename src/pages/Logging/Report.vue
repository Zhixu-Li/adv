<template>
  <b-container
    v-if="isLoaded"
    fluid
  >
    <b-row>
      <b-col class="text-center">
        <b-button
          class="m-2"
          variant="primary"
          @click="printReport"
        >
          Print Report
        </b-button>
      </b-col>
    </b-row>
    <b-row id="report">
      <b-col>
        <b-row>
          <b-col cols="4">
            <!-- logo -->
            <img
              src="/static/logo_black.png"
              class="img-responsive"
            >
          </b-col>
          <b-col cols="6">
            <!-- title -->
            <h3>Campaign Playback Report</h3>
          </b-col>
          <b-col
            cols="2"
            class="text-right"
          >
            <!-- timestamp -->
            <b-row>
              <b-col>
                generated on
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                {{ currentDate }}
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                {{ currentTime }}
              </b-col>
            </b-row>
          </b-col>
        </b-row>
        <b-row class="pt-4 text-center">
          <!-- title row -->
          <b-col>
            <h5>Display Details</h5>
          </b-col>
          <b-col>
            <h5>Campaign Details</h5>
          </b-col>
          <b-col>
            <h5>Media Details</h5>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-row
              v-for="key in ['display_name', 'display_owner', 'display_contact', 'display_resolution', 'display_block_time', 'display_size', 'display_pixel_ratio']"
              :key="key"
            >
              <b-col class="pt-1 font-weight-bold">
                {{ $t('report.'+key) }}
              </b-col>
              <b-col>
                {{ report[key] }}
              </b-col>
            </b-row>
          </b-col>
          <b-col>
            <b-row
              v-for="key in ['campaign_name', 'start_date', 'end_date', 'start_time_daily', 'end_time_daily', 'total_duration']"
              :key="key"
            >
              <b-col class="pt-1 font-weight-bold">
                {{ $t('report.'+key) }}
              </b-col>
              <b-col>
                {{ report[key] }}
              </b-col>
            </b-row>
          </b-col>
          <b-col>
            <b-row
              v-for="key in ['media_items', 'media_size', 'media_types', 'min_max_width', 'min_max_height', 'avg_aspect_ratio']"
              :key="key"
            >
              <b-col class="pt-1 font-weight-bold">
                {{ $t('report.'+key) }}
              </b-col>
              <b-col>
                {{ report[key] }}
              </b-col>
            </b-row>
          </b-col>
        </b-row>
        <b-row class="text-center pt-4">
          <b-col>
            <h5>Scheduled Data</h5>
          </b-col>
          <b-col>
            <h5>Live Data</h5>
          </b-col>
          <b-col>
            <h5>Other Details</h5>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-row
              v-for="key in ['expected_total_plays', 'expected_current_plays', 'current_progress', 'expected_duration']"
              :key="key"
            >
              <b-col class="pt-1 font-weight-bold">
                {{ $t('report.'+key) }}
              </b-col>
              <b-col>
                {{ report[key] }}
              </b-col>
            </b-row>
          </b-col>
          <b-col>
            <b-row
              v-for="key in ['total_plays_to_date', 'extra_plays', 'average_duration', 'min_duration', 'max_duration', 'deviation_margin']"
              :key="key"
            >
              <b-col class="pt-1 font-weight-bold">
                {{ $t('report.'+key) }}
              </b-col>
              <b-col>
                {{ report[key] }}
              </b-col>
            </b-row>
          </b-col>
          <b-col>
            <b-row
              v-for="key in ['efficiency_percent', 'minimum_brightness', 'maximum_brightness']"
              :key="key"
            >
              <b-col
                cols="8"
                class="pt-1 font-weight-bold"
              >
                {{ $t('report.'+key) }}
              </b-col>
              <b-col cols="4">
                {{ report[key] }}
              </b-col>
            </b-row>
          </b-col>
        </b-row>
        <b-row class="text-center pt-4">
          <b-col>
            <h5>Key Information</h5>
          </b-col>
          <b-col>
            <h5>Financial Information</h5>
          </b-col>
          <b-col>
            <h5>System Health</h5>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-row
              v-for="key in ['playback_quality', 'playback_rating', 'content_fit', 'content_scale', 'extra_value']"
              :key="key"
            >
              <b-col class="pt-1 font-weight-bold">
                {{ $t('report.'+key) }}
              </b-col>
              <b-col>
                {{ report[key] }}
              </b-col>
            </b-row>
          </b-col>
          <b-col>
            <b-row
              v-for="key in ['buyer_name', 'buyer_contact', 'total_cost', 'actual_cost', 'discount', 'gst', 'payout']"
              :key="key"
            >
              <b-col class="pt-1 font-weight-bold">
                {{ $t('report.'+key) }}
              </b-col>
              <b-col>
                {{ report[key] }}
              </b-col>
            </b-row>
          </b-col>
          <b-col>
            <b-row
              v-for="key in []"
              :key="key"
            >
              <b-col class="pt-1 font-weight-bold">
                {{ $t('report.'+key) }}
              </b-col>
              <b-col>
                {{ report[key] }}
              </b-col>
            </b-row>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <h5>Media Timings</h5>
            <b-table-simple small>
              <b-th>Type</b-th>
              <b-th>Filename</b-th>
              <b-th>Size</b-th>
              <b-th>Width</b-th>
              <b-th>Height</b-th>
              <b-th>Start</b-th>
              <b-th>End</b-th>
              <b-tr
                v-for="(media,index) in report.media"
                :key="index"
              >
                <b-td> {{ media.type }}</b-td>
                <b-td> {{ media.name }}</b-td>
                <b-td> {{ media.size }}</b-td>
                <b-td> {{ media.width }}</b-td>
                <b-td> {{ media.height }}</b-td>
                <b-td> {{ media.start }}</b-td>
                <b-td> {{ media.end }}</b-td>
              </b-tr>
            </b-table-simple>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
  <b-container v-else>
    <b-row>
      <b-col>
        Generating report, this might take a minute.. <b-spinner
          small
          variant="danger"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import moment from 'moment'

export default {
  name: 'Log',
  components: {},
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

