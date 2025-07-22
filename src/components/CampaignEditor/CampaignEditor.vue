<template lang="html">
  <BRow>
    <!-- Preview Modal -->
    <BModal id="preview" centered size="md" hide-footer>
      <div
        class="p-2"
        :style="{ width: '100%', height: '30vh', resize: 'both' }"
      >
        <player
          :media="computedMedia"
          :show-controls="true"
          :style="{ width: '100%', height: '100%' }"
        />
      </div>
    </BModal>

    <!-- Mobile Toggle Buttons -->
    <BCol v-if="computedMobile" cols="12" class="text-center m-3">
      <BButton class="m-2" variant="primary" @click="isMediaLibrary(false)">
        Playlist
      </BButton>
      <BButton class="m-2" variant="primary" @click="isMediaLibrary(true)">
        Media Library
      </BButton>
    </BCol>

    <!-- Media Library Column -->
    <BCol
      v-if="showLibrary"
      id="mediaCol"
      cols="12"
      md="6"
      :style="computedMediaStyle"
    >
      <!-- Upload Modal -->
      <BModal
        id="upload"
        :title="$t('media.create')"
        no-close-on-backdrop
        no-fade
        hide-footer
      >
        <new-media
          :active-team="activeTeam"
          @updated="fetchMedia"
          @finished="$bvModal.hide('upload')"
        />
      </BModal>

      <BRow>
        <BCol class="mx-auto text-center p-0 m-0 mb-1 pb-1">
          <input
            v-model="searchComputed"
            type="text"
            :placeholder="$t('actions.search')"
            class="form-control d-inline-block w-auto"
          />
          <BButton
            class="ml-4"
            type="button"
            variant="primary"
            size="sm"
            v-b-modal:upload
          >
            {{ $t('buttons.upload') }}
          </BButton>
        </BCol>
      </BRow>

      <div class="media-index h-100 d-flex flex-wrap align-content-start border p-1">
        <div v-if="loading" class="spinner" />
        <div
          v-else
          v-for="mediaItem in filteredMedia"
          :key="mediaItem.mediaId"
          :id="mediaItem.mediaId"
          overlay
          class="w-25"
          @click="selectMedia(mediaItem)"
        >
          <BImg
            fluidGrow
            center
            :src="getThumbnail(mediaItem.hash, 's')"
            class="media-item"
            :title="makeTitle(mediaItem)"
          >
            <div v-if="mediaItem.videoId" class="duration">
              <span>{{ formatTime(mediaItem.duration) }}</span>
            </div>
          </BImg>
        </div>
      </div>
    </BCol>

    <!-- Campaign List Column -->
    <BCol v-if="showCampaignList" cols="12" md="6" :style="computedMediaStyle">
      <h6 class="text-center">
        Drag the arrow icon or thumbnail to re-order.
      </h6>

      <BListGroup v-if="previewMedia.length === 0">
        <BListGroupItem class="text-center">
          No media added! try clicking on a thumbnail.
        </BListGroupItem>
      </BListGroup>

      <BListGroup v-else>
        <draggable
          tag="ul"
          :list="previewMedia"
          class="list-group"
          handle=".handle"
          ghost-class="ghost"
        >
          <BListGroupItem
            v-for="(mediaItem, index) in previewMedia"
            :key="index"
            class="pr-2"
          >
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <div class="text-muted text-center" :title="mediaItem.name">
                  <small>{{ mediaItem.name }}</small>
                </div>
                <div class="d-flex align-items-center justify-content-center mt-2">
                  <div>
                    <BImg
                      rounded
                      class="w-100 handle"
                      :src="getThumbnail(mediaItem.hash, 's')"
                      alt=""
                    />
                  </div>
                  <div class="ml-2">
                    <div class="d-flex justify-content-around ml-2 mr-2">
                      <BFormGroup
                        invalid-feedback="duration can't be nothing!"
                        :state="parseInt(mediaItem.duration) > 0"
                      >
                        <BInputGroup size="sm" prepend="play for" append="secs">
                          <BFormInput
                            :disabled="mediaItem.mimeType.includes('video')"
                            type="text"
                            :value="mediaItem.duration"
                            placeholder="duration:"
                            @input="setDuration(index, $event)"
                          />
                        </BInputGroup>
                      </BFormGroup>

                      <BButton
                        variant="outline-danger"
                        size="sm"
                        squared
                        class="h-100 ml-2"
                        @click="deleteMedia(index)"
                      >
                        Delete
                      </BButton>

                      <font-awesome-icon
                        icon="arrows-up-down-left-right"
                        class="text-muted m-2 ml-4 p-1 handle"
                        size="2x"
                      />
                    </div>

                    <div class="text-center ml-2 mr-2">
                      <hr class="mb-0 mt-2 p-0" />
                      <small class="text-muted">file details:</small>
                      <BBadge variant="light" class="m-1">
                        {{ mediaItem.width }}x{{ mediaItem.height }}
                      </BBadge>
                      <BBadge variant="light" class="m-1">
                        {{ humanFileSize(mediaItem.size) }}
                      </BBadge>
                      <BBadge
                        v-if="mediaItem.videoDuration"
                        variant="light"
                        class="m-1"
                      >
                        {{ mediaItem.videoDuration }} seconds
                      </BBadge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BListGroupItem>
        </draggable>
      </BListGroup>

      <div class="m-2">
        <BButton variant="success" :disabled="computedInvalid" @click="save()">
          {{ $t('buttons.saveCampaign') }}
        </BButton>
        <BButton v-b-modal:preview variant="danger" class="ml-2">
          Show Preview
        </BButton>
      </div>
    </BCol>
  </BRow>
</template>

<script>

import {
  BRow,
  BCol,
  BModal,
  BButton,
  BImg,
  BListGroup,
  BListGroupItem,
  BFormGroup,
  BInputGroup,
  BFormInput,
  BBadge
} from 'bootstrap-vue-next'
import Player from '@/components/Player/PropPlayer.vue'
import _ from 'lodash'
//import 'vue-awesome/icons/trash'
//import 'vue-awesome/icons/chevron-down'
import verge from 'verge'
import NewMedia from '@/pages/Media/Components/NewMedia.vue'
import thumbnails from '@/mixins/thumbnails'
import draggable from 'vuedraggable'

export default {
  components: {
    NewMedia,
    Player,
    draggable,
    BRow,
    BCol,
    BModal,
    BButton,
    BImg,
    BListGroup,
    BListGroupItem,
    BFormGroup,
    BInputGroup,
    BFormInput,
    BBadge,
  },
  mixins: [thumbnails],
  props: {
    activeTeam: {
      type: Object,
      required: true,
    },
    campaign: {
      type: Object,
      required: true
    },
  },
  data () {
    return {
      search: '',
      dragging: false,
      previewMedia: [],
      selected: {},
      selectedFrame: {media: []},
      time: 0,
      height: 0,
      midCenter: false,
      viewport: '',
      media: [],
      trigger: 0,
      loading: true,
      showLibrary: true,
      showCampaignList: true,
    }
  },
  computed: {
    computedMedia() {
      this.trigger;
      let counter = 0
      return this.previewMedia.map(m => {
        let r = Object.assign({}, m)
        r.start = counter
        r.end = counter + parseInt(r.duration)
        counter = r.end
        return r
      })
    },
    computedInvalid() {
      this.trigger;
      return this.previewMedia.some(m => !parseInt(m.duration) > 0)
    },
    computedPreviewStyle() {
      if (this.viewport === 'xs') {
        return { 'height': '40vh' }
      }
      else {
        return { 'height': '50vh' }
      }
    },
    computedMediaStyle() {
      if (this.viewport === 'xs') {
        return { 'height': '70vh', 'overflow-y': 'scroll' }
      }
      else {
        return { 'height': '60vh', 'overflow-y': 'scroll' }
      }
    },
    colBreak() {
      if (this.viewport === 'xs') {
        return 12
      }
      else {
        return 6
      }
    },
        searchComputed: {
      get() {
        return this.search
      },
      set: _.debounce(function(newValue) {
        this.search = newValue
      }, 100)

    },
    filteredMedia() {
      return this.media.filter((item) => {
        if (item.teamId == this.activeTeam.id) {
          if (this.search === '') {
            return true
          } else {
            if (item.name) {
              return item.name.toLowerCase().includes(this.search.toLowerCase())
            }
            if (item.string) {
              return item.string.toLowerCase().includes(this.search.toLowerCase())
            }
          }
        }
      })
    },
  computedMobile(){
      if (this.viewport === 'xs') {
        this.isMobile(true)
        return true
      }else{
        this.isMobile(false)
        return false
      }
  },

  },
  mounted () {
  this.trigger++

  // — safe default to an empty array if media or data is undefined —
  const mediaArray = this.campaign.media?.data ??[]

  this.previewMedia = mediaArray.map(c => {
    // compute duration
    c.duration = Math.max(0, c.end - c.start)
    return c
  })

  this.resize()
  this.fetchMedia()
  window.addEventListener('resize', this.resize)
},
reUnmount () {
    window.removeEventListener('resize', this.resize)
  },
  methods: {
    setDuration(index, duration) {
      this.previewMedia[index].duration = duration
      this.trigger++
    },
    humanFileSize(bytes, si = true, dp = 1) {
    const thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) return bytes + ' B';

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
    formatTime(seconds){
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
},
    makeTitle(item) {
      return `${item.name}\n${item.width}x${item.height}px`
    },
    deleteMedia(index) {
      this.previewMedia.splice(index, 1) 
    },
    selectMedia(item) {
      if (item.duration) {
        item.videoDuration = item.duration
      }
      else {
        item.duration = 10
      }
      // fix what is expected to be there
      item.id = item.mediaId
      item.position = 'middle,center'
      this.previewMedia.push(item)
    },
    fetchMedia: _.debounce(function() {
      var scope = this
      let url = 'v1/media?limit=all'
      url += this.restrict ? '&restrict' : ''
      this.$axios.get(url).then(
      (response) => {
        this.media = response.data.data.sort((a,b) => (a.mediaId < b.mediaId ? 1 : -1))
        this.loading = false
      }).catch(
        function (error) {
          if (!error.response) {
            scope.$notifications.add({
              title: 'Error',
              type: 'warning',
              body: error.message,
              timeout: true
            })
          } else if (error.response.status !== 404) {
            scope.$notifications.add({
              title: 'Error',
              type: 'warning',
              body: error.response.data.message,
              timeout: true
            })
          }
          scope.media = []
          scope.loading = false
        }
      )
    }, 1000),
    save () { // save button function
      // this is just for updating the name
      this.$axios.post('v1/campaigns/' + this.campaign.campaignId, this.campaign)

      // should switch all this to axios asap
      this.$axios.post('v1/campaigns/' + this.campaign.campaignId + '/media', this.previewMedia).then(
        () => {
          this.fetchMedia()
          this.$emit('saved')
          this.$notifications.add({
            title: 'Success',
            type: 'success',
            body: this.$t('notifications.campaignSave'),
            timeout: true
          })
        },
        () => {
          this.$notifications.add({
            title: 'Error',
            type: 'danger',
            body: this.$t('notifications.campaignSaveError'),
            timeout: true
          })
        })
    },
    resize: _.debounce(
      function () {
        // add check for horizontal width only
        let width = verge.viewportW()
        if      (width > 1900) { this.viewport = 'xl' }
        else if (width > 1200) { this.viewport = 'lg' }
        else if (width > 992)  { this.viewport = 'md' }
        else if (width > 768)  { this.viewport = 'sm' }
        else if (width > 480)  { this.viewport = 'xs' }
        else                   { this.viewport = 'xs' }
    }, 200),
  
    isMediaLibrary(library){
      if (library) {
        this.showLibrary=true
        this.showCampaignList=false
      }else{
        this.showLibrary=false
        this.showCampaignList=true
      }
    },

    isMobile(isMobile){
      if (isMobile) {
        this.showLibrary=false
        this.showCampaignList=true        
      }else{
        this.showLibrary=true
        this.showCampaignList=true

      }
    },
  },
  watch: {
  }
}
</script>

<style lang="scss" scoped>
// @import "node_modules/bootstrap/scss/_functions.scss";
// @import "node_modules/bootstrap/scss/_variables.scss";
// @import "node_modules/bootstrap/scss/mixins/_breakpoints.scss";
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/bootstrap";
.name-trim {
  font-size: 100%;
  display: block;
  width: 100%;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-group-item:hover {
  border: 2px dashed red;
}

.ghost {
  opacity: 0.5;
  background: red;
}

.media-item {
  cursor: cell;
  border: 3px solid white;
}

.media-item:hover {
  box-sizing: border-box;
  border: 3px solid lightskyblue;
}

.spinner {
  margin-left: auto;
  margin-right: auto;
  margin-top: auto;
  margin-bottom: auto;
}

.handle {
  float: left;
  padding-top: 2px;
  padding-bottom: 2px;
  cursor: grab;
}
</style>
