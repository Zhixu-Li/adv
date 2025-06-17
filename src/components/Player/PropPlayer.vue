<template>
  <div>
    <template v-if="!media.every(m => cache[m.id])">
      Downloading ({{ Object.keys(dl).length }}) files:
      <div
        v-for="(file, index) in dl"
        :key="index"
      >
        <!-- {{ file.name }} {{ file.progress | percent }} -->
        {{ formatPercent(file.progress) }}
      </div> 
    </template>
    <template v-else>
      <player-core
        id="core"
        :background="'#000'"
        :hide-controls="false"
        :cache="computedCache"
        :queue="computedMedia"
      />
    </template>
  </div>
</template>

<script>
// /* eslint-disable no-unused-vars */
// /* eslint-disable vue/no-unused-components */
import PlayerCore from '@/components/Player/Core.vue'
import axios from 'axios'

export default {
    components: {
      PlayerCore
    },
    props: {
      media: {
        type: Array,
        required: true
      },
      showControls: {
        type: Boolean,
        required: false,
        default: false
      }
    },
    data() {
      return {
        axios: {},
        cancelTokens: {},
        cache: {},
        dl: {},
        errored: {},
        progress: 0,
        test: 0,
      }
    },
    computed: {
      computedCache() {
        return {
          0: this.cache
        }
      },
      computedMedia() {
        return [
        {
          campaignId: 0,
          media: this.media,
          }
        ]
      }
    },
    watch: {
      media() {
        this.idempotent_add()
      },
      seekOffset() {
        
      }
    },
    mounted() {
      this.idempotent_add()
    },
    beforeUnmount() {
      // cancel existing downloads
      Object.values(this.cancelTokens).forEach(req => req.cancel())
    },
    methods: {
      idempotent_add() {
        // console.log('idempotent_add')
        for (let media of this.media.filter(m => !m.mimeType.includes('text'))) { 
          // console.log('adding', media.id, 'to cache')
          if (this.cache[media.id] || this.axios[media.id]) {
            // console.log('media id', media.id, 'already exists')
          }
          else {
            // this.$set(this.dl, media.id, {
            //   name: media.name,
            //   progress: 0,
            // })
            this.dl[media.id] = {
              name: media.name,
              progress: 0,
            }

            const CancelToken = axios.CancelToken
            this.cancelTokens[media.id] = CancelToken.source()
            this.axios[media.id] = axios.get(media.uri, {
              responseType: 'blob',
              cancelToken: this.cancelTokens[media.id].token,
              onDownloadProgress: (status) => {
                this.dl[media.id].progress = parseInt((status.loaded / status.total) * 100)
              },
            })
              .then((response) => {
                this.cache[media.id] = response.data
                // this.$delete(this.dl, media.id)
                delete this.dl[media.id]
              })
              .catch(function () {
                // console.log(error);
              })
          }
        }
      },
      formatPercent(value) {
        if (isNaN(value)) return '0%';
        return `${Math.round(value)}%`;
      }
    },
}

</script>

<style scoped>
  #core {
    width: 100%;
    height: 100%;
  }
</style>