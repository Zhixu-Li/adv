<template lang="html">
  <b-row>
    <b-col class="text-center align-middle">
      <b-row>
        <b-col class="m-0 p-1">
          <b-link :to="{ name: 'media', params: {} }">
            <b-icon
              class="border rounded-circle p-2 bg-light"
              variant="dark"
              icon="image"
              font-scale="3"
            />
          </b-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="m-0 p-1">
          <b>{{ images.total }}</b>
          {{ $tc('dashboard.mediaStats.image', images.total) }}
        </b-col>
      </b-row>
    </b-col>

    <b-col class="text-center align-middle">
      <b-row>
        <b-col class="m-0 p-1">
          <b-link :to="{ name: 'media', params: {} }">
            <b-icon
              class="border rounded-circle p-2 bg-light"
              variant="dark"
              icon="film"
              font-scale="3"
            />
          </b-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="m-0 p-1">
          <b>{{ videos.total }}</b>
          {{ $tc('dashboard.mediaStats.video', images.total) }}
        </b-col>
      </b-row>
    </b-col>

    <b-col class="text-center align-middle">
      <b-row>
        <b-col class="m-0 p-1">
          <b-icon
            class="border rounded-circle p-2 bg-light"
            variant="dark"
            icon="soundwave"
            font-scale="3"
          />
        </b-col>
      </b-row>
      <b-row>
        <b-col class="m-0 p-1">
          <b>{{ audio.total }}</b>
          {{ $t('dashboard.mediaStats.audio') }}
        </b-col>
      </b-row>
    </b-col>

    <b-col class="text-center align-middle">
      <b-row>
        <b-col class="m-0 p-1">
          <b-icon
            class="border rounded-circle p-2 bg-light"
            variant="dark"
            icon="hdd"
            font-scale="3"
          />
        </b-col>
      </b-row>
      <b-row>
        <b-col class="m-0 p-1">
          <!-- <b>{{totalUsage | humanFileSize}}</b> -->
          <b>{{ humanFileSize(totalUsage) }}</b>
          {{ $t('dashboard.mediaStats.used') }}
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</template>

<script>
export default {
  props: {
    refreshTime: {
      type: Number,
      required: false,
      default: 5
    }
  },
  data () {
    return {
      images: {
        size: 0,
        total: 0
      },
      videos: {
        size: 0,
        total: 0
      },
      audio: {
        size: 0,
        total: 0
      },
      interval: {}
    }
  },
  computed: {
    totalUsage () {
      return this.images.size + this.videos.size + this.audio.size
    }
  },
  watch: {
    refreshTime () {
      clearInterval(this.interval)
      this.interval = setInterval(this.fetchMediaStats, (this.refreshTime * 60 * 1000))
    }
  },
  mounted () {
    this.fetchMediaStats()
    this.interval = setInterval(this.fetchMediaStats, (this.refreshTime * 60 * 1000))
  },
  beforeUnmount () {
    clearInterval(this.interval)
  },
  methods: {
    fetchMediaStats () {
      let url = 'v1/media/stats'
      this.$axios.get(url).then(
        (response) => {
          this.images = response.data.data.images
          this.videos = response.data.data.videos
          this.audio = response.data.data.audio
        },
        () => {
          this.images = {
            size: 0,
            total: 0
          }
          this.videos = {
            size: 0,
            total: 0
          }
          this.audio = {
            size: 0,
            total: 0
          }
        }
      )
    },
    humanFileSize(bytes, si = true, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

    return bytes.toFixed(dp) + ' ' + units[u];
  },
    
  }
}
</script>

<style lang="css">
</style>
