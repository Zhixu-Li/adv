<template lang="html">
  <BRow>
    <BCol class="text-center align-middle">
      <BRow>
        <BCol class="m-0 p-1">
          <BLink :to="{ name: 'media', params: {} }">
            <BIcon
              class="border rounded-circle p-2 bg-light"
              variant="dark"
              icon="image"
              font-scale="3"
            />
          </BLink>
        </BCol>
      </BRow>
      <BRow>
        <BCol class="m-0 p-1">
          <strong>{{ images.total }}</strong>
          {{ $tc('dashboard.mediaStats.image', images.total) }}
        </BCol>
      </BRow>
    </BCol>

    <BCol class="text-center align-middle">
      <BRow>
        <BCol class="m-0 p-1">
          <BLink :to="{ name: 'media', params: {} }">
            <BIcon
              class="border rounded-circle p-2 bg-light"
              variant="dark"
              icon="film"
              font-scale="3"
            />
          </BLink>
        </BCol>
      </BRow>
      <BRow>
        <BCol class="m-0 p-1">
          <strong>{{ videos.total }}</strong>
          {{ $tc('dashboard.mediaStats.video', videos.total) }}
        </BCol>
      </BRow>
    </BCol>

    <BCol class="text-center align-middle">
      <BRow>
        <BCol class="m-0 p-1">
          <BIcon
            class="border rounded-circle p-2 bg-light"
            variant="dark"
            icon="soundwave"
            font-scale="3"
          />
        </BCol>
      </BRow>
      <BRow>
        <BCol class="m-0 p-1">
          <strong>{{ audio.total }}</strong>
          {{ $t('dashboard.mediaStats.audio') }}
        </BCol>
      </BRow>
    </BCol>

    <BCol class="text-center align-middle">
      <BRow>
        <BCol class="m-0 p-1">
          <BIcon
            class="border rounded-circle p-2 bg-light"
            variant="dark"
            icon="hdd"
            font-scale="3"
          />
        </BCol>
      </BRow>
      <BRow>
        <BCol class="m-0 p-1">
          <strong>{{ humanFileSize(totalUsage) }}</strong>
          {{ $t('dashboard.mediaStats.used') }}
        </BCol>
      </BRow>
    </BCol>
  </BRow>
</template>
<script>
import { BRow, BCol, BLink, BIcon } from 'bootstrap-vue-next'
export default {
  components:{
    BRow,
    BCol,
    BLink,
    BIcon
  },
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
