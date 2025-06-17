<template>
  <div class="relative">
    <template v-if="queue.length > 0">
      <div class="mx-auto text-center h4">
        <BButtonGroup>
          <BBadge
            v-for="c in displayedQueue"
            :key="c.campaignId"
            class="btn border btn-light butty font-weight-bold"
            :variant="c.campaignId === context
              ? 'primary'
              : mediaDone(c)
                ? 'light'
                : 'danger'"
            @click="triggerJump(c.campaignId)"
          >
            {{ String(c.campaignId).padStart(2, '0') }}
          </BBadge>
        </BButtonGroup>
      </div>
    </template>

    <template v-if="isRealCampaign">
      <div class="mx-auto text-center h5">
        name: <em>{{ computedName }}</em>
      </div>
    </template>

    <player-core
      ref="player"
      class="player-wrapper mx-auto m-4"
      :style="{ width: width, height: height }"
      background="#000"
      :hide-controls="!isRealCampaign"
      :cache="availableCache"
      :queue="availableQueue"
      @setcontext="setContext"
    />

    <div v-if="errored.length > 0">
      failed to load:
      <div v-for="(uri, idx) in errored" :key="idx">
        {{ uri }}
      </div>
    </div>
  </div>
</template>


<script>
/* eslint-disable no-unused-vars */
/* eslint-disable vue/no-unused-components */
/* eslint-disable no-mixed-spaces-and-tabs */
import { BButtonGroup, BBadge } from 'bootstrap-vue-next'
import axios from 'axios'
import moment from 'moment'
import PlayerCore from './Core.vue'
import Multiselect from 'vue-multiselect'

export default {
    components: {
        PlayerCore,
        Multiselect,
        BButtonGroup,
        BBadge
    },
    props: {
      width: {
        type: String,
        required: true
      },
      height: {
        type: String,
        required: true
      },
      uri: {
        type: String,
        required: true
      },
      params: {
        type: Object,
        require: true,
      }
    },
    data() {
      return {
        schedule: {},
        queue: [],
        unprocessed: [],
        // make these into props?
        batch_size: 2,
        precachable: 25,
        displayLimit: 7,
        desiredOffset: 0,
        axios: {},
        cancelTokens: {},
        cache: {},
        downloading: {},
        context: 0,
        errored: [],
        progress: 0,
        test: 0,
        intv_queue: 0,
      }
    },
    computed: {
      computedName() {
        return this.availableQueue.find(q => q.campaignId == this.context)?.name
      },
      displayedQueue() {
        if (this.queue.length > this.displayLimit) {
          // i refuse to explain this
          let q = this.queue.length
          let mod = (i) => (i % q + q) % q
          let real_context = this.queue.findIndex(q => q.campaignId == this.context)
          if (real_context == -1)
            real_context = 0
          let start = real_context - Math.floor(this.displayLimit / 2)
          let rot =  [...Array(this.displayLimit)].map((_, i) => start + i * 1).map(i => this.queue[mod(i)])
          return rot
        }
        else {
          return this.queue
        }
      },
      currentId() {
        if (this.queue[0]) {
          return this.queue[0].campaignId
        }
        else {
          return 0
        }
      },
      isRealCampaign() {
        return this.context != 0
        // return (this.queue !== [] && this.availableQueue[this.startId] && this.availableQueue[this.startId].campaignId !== 0) ? true : false
      },
      availableCache() {
        // console.log('availableCache')
        return this.cache
      },
      availableQueue() {
        // console.log('availableQueue')
        if (this.queue.length > 0) {
          return this.queue.filter(c => this.mediaDone(c))
        }
        return this.fake_campaign("Loading..")
      }
    },
    watch: {
      uri: function() {
        this.reset_cache()
        this.getSchedule()
      },
      params: {
        deep: true,
        handler: function() {
          console.log('triggered!!')
          this.reset_cache()
          this.getSchedule()
        }
      },

    },
    mounted() {
      // triggering initial download
      // we don't really need to re-trigger this unless e2v_props changes
      this.getSchedule()
      this.intv_queue = setInterval(() => this.add_more(), 2500)
    },
    beforeUnmount() {
      // cancel existing downloads
      Object.values(this.cancelTokens).forEach(c => Object.values(c).forEach(req => req.cancel('unmounting')))
      clearInterval(this.intv_queue)
    },
    methods: {
      triggerJump(campaign) {
        // console.log('triggering jump!')
        this.$refs.player.warp(campaign)
      },
      add_more() {
        // TODO: maybe incorporate total items played into delaying this
        // or put this logic into setContext
        if (this.unprocessed.length > 0) {
          let still_running = this.queue.reduce((a,c) => a + this.mediaDone(c) ?0:1, 0)
          if (still_running < this.batch_size) {
            let chomp = this.unprocessed.splice(0, this.batch_size - still_running)
            chomp.forEach(c => this.idempotent_add(c))
            // this.queue.push(...chomp)
          }
        }
      },
      setContext(ctx) {
        // console.log('got new context', ctx)
        this.context = ctx
      },
      hasDownloadable(campaign) {
        return campaign.media.filter(m => !m.mimeType.includes('text'))
      },
      mediaDone(campaign) {
        let media_ids = this.hasDownloadable(campaign)
        // console.log(media_ids)
        if (!this.cache[campaign.campaignId]) {
          return false
        }
        if (media_ids.every(m => this.cache[campaign.campaignId][m.id])) {
          return true
        }
        else {
          return false
        }
      },
      fake_campaign(str) {
        return [{
          campaignId: 0,
          name: 'str',
          media: [{
            id: 9999,
            mimeType: 'text/plain',
            start: 0,
            end: 4,
            duration: 10,
            position: 'middle,center',
            string: str,
            font_family: 'Tahoma',
            font_weight: '900',
            font_style: 'normal',
            font_size: '4em',
          }]
        }]
      },
      nextItem() {

      },
      prevItem() {

      },
      getSchedule: function() {
        axios.post(this.uri + '?_path=/getSchedule', {
          ...this.params
        })
        .then((response) => {
            // console.dir(response.data)
            if (response.data.DisplayGroup.Sequence[0].Campaign) {
              let campaigns = response.data.DisplayGroup.Sequence[0].Campaign
              // rather than fucking around with computed properties, we just normalise it here
              campaigns.sort((a,b) => moment(a.start_date).isBefore(b.start_date) || b.end_time - a.end_time || b.Content[0].duration - a.Content[0].duration)
              campaigns.splice(0, this.precachable).forEach( campaign => 
              this.unprocessed.push({
                ...campaign,
                campaignId: campaign.id,
                media: [
                  ...campaign.Content[0].Image.map(
                  image => {
                      return {
                          position: image.ContentsHasImage.position,
                          start: image.ContentsHasImage.start,
                          end: image.ContentsHasImage.end,
                          mimeType: 'image/png',
                          ...image,
                      }
                  }),
                  ...campaign.Content[0].Video.map(
                  video => {
                      return {
                          position: video.ContentsHasVideo.position,
                          start: video.ContentsHasVideo.start,
                          end: video.ContentsHasVideo.end,
                          mimeType: 'video/webm',
                          ...video,
                      }
                  }),
                  ...campaign.Content[0].Text.map(
                  text => {
                      return {
                          position: text.ContentsHasText.position,
                          start: text.ContentsHasText.start,
                          end: text.ContentsHasText.end,
                          mimeType: 'text/plain',
                          ...text,
                      }
                  }),
                ]
              })
              )

              this.queue = [...this.unprocessed]
              let chomp = this.unprocessed.splice(0, this.batch_size)
              chomp.forEach(c => this.idempotent_add(c))
              // this.queue.push(...chomp)
            }
            else {
              console.log("Theres no campaign data, bucko")
            }
        })
        .catch(function (error) {
            console.log(error)
        })
      },
      idempotent_add(campaign) {
        // make cache slot if it doesn't exist
        if (!this.cache[campaign.campaignId]) {
          // this.$set(this.cache, campaign.campaignId, {})
          // this.$set(this.downloading, campaign.campaignId, {})
          // this.$set(this.axios, campaign.campaignId, {})
          // this.$set(this.cancelTokens, campaign.campaignId, {})
          this.cache[campaign.campaignId] = {}
          this.downloading[campaign.campaignId] = {}
          this.axios[campaign.campaignId] = {}
          this.cancelTokens[campaign.campaignId] = {}
        }
        for (let media of campaign.media.filter(m => !m.mimeType.includes('text'))) { 
          // check if data blob or actual uri
          if (media.uri.substr(0, 4) === 'data') {
            // this.$set(this.cache[campaign.campaignId], media.id, media.uri)
            this.cache[campaign.campaignId][media.id] = media.uri
          }
          else {
            if (media.uri.includes('https')) {
              media.uri = media.uri.replace(/(http|https):\/\/(.+)/, process.env.VUE_APP_CORS_PROXY_URL)
            }
            else {
              media.uri = media.uri.replace(/(http|https):\/\/(.+)/, process.env.VUE_APP_CORS_PROXY_URL)
            }
            // console.log('adding', media.id, 'to cache')
            if (this.cache[campaign.campaignId][media.id]) {
              console.log('media id', campaign.campaignId, media.id, 'already exists')
            }
            else {
              // this.$set(this.downloading[campaign.campaignId], media.id, {
              //   name: media.name,
              //   progress: 0,
              this.downloading[campaign.campaignId][media.id] = {
                name: media.name,
                progress: 0,
              }

              
              const CancelToken = axios.CancelToken
              this.cancelTokens[campaign.campaignId][media.id] = CancelToken.source()
              this.axios[campaign.campaignId][media.id] = axios.get(media.uri, {
                responseType: 'blob',
                cancelToken: this.cancelTokens[campaign.campaignId][media.id].token,
                onDownloadProgress: (status) => {
                  this.downloading[campaign.campaignId][media.id].progress = parseInt((status.loaded / status.total) * 100)
                },
              })
                .then((response) => {
                  // console.log(String(campaign.campaignId), media.id, 'added to cache')
                  // this.$set(this.cache[campaign.campaignId], media.id, response.data)
                  // this.$delete(this.downloading[campaign.campaignId], media.id)
                  this.cache[campaign.campaignId][media.id] = response.data
                  delete this.downloading[campaign.campaignId][media.id]
                })
                .catch(() => {
                  this.errored.push(media.uri)
                  // console.log(error)
                })
            }
          }
        }
      },
      reset_cache() {
        // console.log('resetting')
        this.context = 0
        this.queue = []
        console.log(this.availableQueue)
        this.$refs.player.reset_immediate()
        setTimeout(() => {
          this.cache = {}
          this.schedule = {}
          Object.values(this.cancelTokens).forEach(c => Object.values(c).forEach(req => req.cancel('unmounting')))
          this.downloading = {}
          this.axios = {}
          this.cancelTokens = {}
          this.errored = []
        }, 50)
      }
    },
}

</script>

<style scoped>
.relative {
  position: relative;
}
.player-wrapper {
  resize: both;
}
.butty {
  cursor: pointer;
}
</style>
