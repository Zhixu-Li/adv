<template>
  <b-container fluid>
    <b-row>
      <b-row
        id="top-area"
        class="p-2"
      >
        <b-col
          cols="12"
          class="head"
        >
          <h2 class="d-none d-md-block">
            {{ $t('media.media') }}
          </h2>
          <b-row>
            <b-col md="10">
              <p class="d-none d-md-block">
                {{ $t('tutorial.mediaExample') }} {{ $t('tutorial.acceptedFileFormats') }}
              </p>
            </b-col>
            <b-col md="2">
              <b-button
                size="lg"
                block
                variant="primary"
                @click="$bvModal.show('new-media-modal')"
              >
                {{ $t('buttons.upload') }}
              </b-button>
            </b-col>
          </b-row>
        </b-col>
        <b-col cols="12">
          <b-row>
            <b-col
              xl="4"
              lg="4"
              md="4"
              sm="12"
              xs="12"
            >
              <b-button-group style="width: 100% !important">
                <b-form-input
                  id="searchbar"
                  v-model="debouncedSearch"
                  class="searchbar"
                  :placeholder="$t('actions.search')"
                />
                <b-dropdown
                  id="mediatypeSort"
                  variant="outline-success"
                  :text="type"
                  no-caret
                >
                  <b-dropdown-item @click="resetView(); type = 'All'">
                    {{ $t('buttons.all') }}
                  </b-dropdown-item>
                  <b-dropdown-item @click="resetView(); type = 'Image'">
                    {{ $t('buttons.image') }}
                  </b-dropdown-item>
                  <b-dropdown-item @click="resetView(); type = 'Video'">
                    {{ $t('buttons.video') }}
                  </b-dropdown-item>
                </b-dropdown>
                <b-dropdown
                  id="mediaSort"
                  variant="outline-success"
                  :text="button + (sortToggle === true ? '▲' : '▼')"
                  no-caret
                >
                  <b-dropdown-item @click="resetView(); button = 'Date'; sortToggle = !sortToggle">
                    {{ $t('buttons.date') }}
                  </b-dropdown-item>
                  <b-dropdown-item @click="resetView(); button = 'Name'; sortToggle = !sortToggle">
                    {{ $t('buttons.name') }}
                  </b-dropdown-item>
                  <b-dropdown-item @click="resetView(); button = 'Size'; sortToggle = !sortToggle">
                    {{ $t('buttons.size') }}
                  </b-dropdown-item>
                  <b-dropdown-item @click="resetView(); button = 'Dimensions'; sortToggle = !sortToggle">
                    {{ $t('buttons.dimensions') }}
                  </b-dropdown-item>
                </b-dropdown>
              </b-button-group>
            </b-col>
            <b-col
              cols="3"
              xl="2"
              lg="2"
              md="auto"
              sm="auto"
              xs="12"
            >
              <button
                type="button"
                style="width: 100%"
                class="btn btn-outline-success"
                @click="toggleUsed()"
              >
                {{ $t('buttons.used') }}
                {{ used === true ? '☑' : '☐' }}
              </button>
            </b-col>
          </b-row>
        </b-col>
      </b-row>

      <b-col
        id="content-area"
        cols="12"
        class="p-0 items"
        @scroll="infinityScroll($event)"
      >
        <div
          v-show="loading"
          class="loader"
        >
          <div class="spinner" />
        </div>
        <!-- <b-col xl="3" lg="3" md="4" sm="6" xs="12" class="pb-2 less-gutter" :key="item.mediaId" v-for="item in filteredMedia" @click="select(item)"> -->
        <b-col
          v-for="item in filteredMedia"
          :key="item.mediaId"
          :cols="viewportCols"
          class="pb-2 less-gutter"
          @click="select(item)"
        >
          <b-card
            class="item-card"
            :img-src="getThumbnail(item.hash)"
            img-alt="item.name"
            :overlay="true"
            :footer="item.name"
            footer-class="cut-text"
            img-top
            @click="showInfo(item)"
          >
            <b-card-text>
              <div class="float-right">
                <b-badge
                  v-if="item.campaign"
                  variant="success"
                >
                  In Use
                </b-badge> <b-badge variant="light">
                  {{ item.width }} x {{ item.height }}
                </b-badge>
              </div>
            </b-card-text>
          </b-card>
        </b-col>
      </b-col>

      <b-modal
        id="delete-media-modal"
        :title="$t('actions.delete')"
        size="md"
      >
        {{ $t('message.mediaDelete') }}
        <!-- <div slot="modal-footer">
          <b-button variant="primary" class="float-left" @click="$bvModal.hide('delete-media-modal')">{{$t('answers.no')}}</b-button>
          <b-button variant="warning" class="float-right ml-2" @click="deleteMedia()">{{$t('answers.yes')}}</b-button>
        </div> -->
        <template #modal-footer>
          <b-button
            variant="primary"
            class="float-left"
            @click="$bvModal.hide('delete-media-modal')"
          >
            {{ $t('answers.no') }}
          </b-button>
          <b-button
            variant="warning"
            class="float-right ml-2"
            @click="deleteMedia()"
          >
            {{ $t('answers.yes') }}
          </b-button>
        </template>
      </b-modal>

      <b-modal
        id="new-media-modal"
        :title="$t('media.create')"
        size="md"
        hide-footer
      >
        <new-media
          v-if="activeTeam.id !== 0"
          :active-team="activeTeam"
          @updated="addMedia()"
          @finished="addMedia()"
        />
        <div v-else>
          Please select a team first.
        </div>
      </b-modal>

      <!-- possibly move this to a separate component in the future -->
      <b-modal
        id="media-info"
        :title="`Filename: ${selectedItem.name}`"
        size="lg"
        centered
        hide-footer
      >
        <b-row class="item-details">
          <b-col class="row no-gutters align-content-start">
            <b-col
              cols="12"
              class="mb-3 text-right"
            >
              <em
                v-if="selectedItem.campaign"
                class="p-1"
              >({{ $t('message.inUseDelete') }})</em>
              <b-button
                variant="danger"
                :disabled="selectedItem.campaign"
                @click="$bvModal.show('delete-media-modal')"
              >
                {{ $t('buttons.delete') }}
              </b-button>
              <b-card class="mt-2">
                <b-card-text>
                  <media-item :item="selectedItem" />
                </b-card-text>
              </b-card>
            </b-col>

            <b-col
              cols="12"
              class="mb-3"
            >
              <b-card :header="$t('common.information')">
                <b-card-text>
                  <b-row>
                    <span class="col-3"><strong>{{ $t('common.name') }}</strong></span>
                    <span
                      v-if="selectedItem.string"
                      class="col-9"
                    >{{ selectedItem.string }}</span>
                    <span
                      v-else
                      class="col-9"
                    >{{ selectedItem.name }}</span>
                  </b-row>
                  <b-row>
                    <span
                      v-if="selectedItem.mimeType"
                      class="col-3"
                    ><strong>{{ $t('media.mimeType') }}</strong></span>
                    <span
                      v-if="selectedItem.mimeType"
                      class="col-9"
                    >{{ selectedItem.mimeType }}</span>
                  </b-row>
                  <b-row>
                    <span
                      v-if="selectedItem.mimeType"
                      class="col-3"
                    ><strong>{{ $t('common.team') }}</strong></span>
                    <span
                      v-if="selectedItem.mimeType"
                      class="col-9"
                    >{{ activeTeam.name }}</span>
                  </b-row>
                </b-card-text>
              </b-card>
            </b-col>
            <b-col
              cols="12"
              lg="6"
              class="mb-3"
            >
              <b-card :header="$t('message.inUse')">
                <b-card-text>
                  <div v-if="selectedItem.campaign">
                    <ul
                      v-for="campaign in selectedItem.campaign"
                      :key="campaign.id"
                    >
                      <b-link :to="{ name: 'campaign', params: { campaignId: campaign.id } }">
                        {{ campaign.name }}
                      </b-link>
                    </ul>
                  </div>
                  <div v-else>
                    {{ $t('message.notUsed') }}
                  </div>
                </b-card-text>
              </b-card>
            </b-col>
          </b-col>

          <!-- <b-col cols="12" lg="6" class="mb-3">
              <b-card :header="$t('common.dimensions')">
                <b-card-text>
                  <b-row>
                    <span class="col-3" v-if="selectedItem.size"><strong>{{$t('campaigns.size')}}</strong></span>
                    <span class="col-9" v-if="selectedItem.size">{{ selectedItem.size | humanFileSize}}</span>
                    <span class="col-3" v-if="selectedItem.height"><strong>{{$t('campaigns.height')}}</strong></span>
                    <span class="col-9" v-if="selectedItem.height">{{ selectedItem.height }} px</span>
                    <span class="col-3" v-if="selectedItem.width"><strong>{{$t('campaigns.width')}}</strong></span>
                    <span class="col-9" v-if="selectedItem.width">{{ selectedItem.width }} px</span>
                    <span class="col-3" v-if="selectedItem.duration"><strong>{{$t('dateTime.duration')}}</strong></span>
                    <span class="col-9" v-if="selectedItem.duration">{{ selectedItem.duration }}
                      {{$t('measurement.seconds')}}</span>
                    <span class="col-3" v-if="selectedItem.fontFamily"><strong>{{$t('media.fontFamily')}}</strong></span>
                    <span class="col-9" v-if="selectedItem.fontFamily">{{ selectedItem.fontFamily }}</span>
                    <span class="col-3" v-if="selectedItem.fontSize"><strong>{{$t('media.fontSize')}}</strong></span>
                    <span class="col-9" v-if="selectedItem.fontSize">{{ selectedItem.fontSize }}</span>
                    <span class="col-3" v-if="selectedItem.fontStyle"><strong>{{$t('media.fontStyle')}}</strong></span>
                    <span class="col-9" v-if="selectedItem.fontStyle">{{ selectedItem.fontStyle }}</span>
                    <span class="col-3" v-if="selectedItem.fontWeight"><strong>{{$t('media.fontWeight')}}</strong></span>
                    <span class="col-9" v-if="selectedItem.fontWeight">{{ selectedItem.fontWeight }}</span>
                  </b-row>
                </b-card-text>
              </b-card>
            </b-col> -->
        </b-row>
      </b-modal>
    </b-row>
  </b-container>
</template>

<script>
import MediaItem from './Components/MediaItem.vue'
import NewMedia from './Components/NewMedia.vue'
// import Thumbnail from '@/components/Thumbnail.vue'
import _ from 'lodash'
// import 'vue-awesome/icons/caret-up'
// import 'vue-awesome/icons/caret-down'
import teamContext from '@/mixins/teamContext'
import autoResize from '@/mixins/autoResize'
import extendedViewports from '@/mixins/extendedViewports'

export default {
  name: 'Media',
  components: {
    MediaItem,
    NewMedia,
    // Thumbnail
  },
  mixins: [teamContext, autoResize, extendedViewports],
  data () {
    return {
      media: [],
      meta: {},
      search: '',
      selectedItem: {},
      teams: [],
      scrolls: 1,
      loaded: false,
      sortToggle: false,
      ascButtonVariant: 'outline-primary',
      descButtonVariant: 'primary',
      loading: true,
      button: this.$t('buttons.date'),
      type: this.$t('buttons.all'),
      used: false
    }
  },
  watch: {
    'activeTeam': function() {
      this.loaded = false
      this.fetchMedia(true)
    },
  },
  mounted () {
    document.addEventListener('keydown', this.keyListener)
    this.fetchMedia()
  },
  beforeUnmount () {
    document.removeEventListener('keydown', this.keyListener)
  },
  computed: {
    itemsByViewport: function () {
     if      (this.viewport === 'xs') { return 6 }
     else if (this.viewport === 'sm') { return 12 }
     else if (this.viewport === 'md') { return 16 }
     else if (this.viewport === 'lg') { return 24 }
     else if (this.viewport === 'xl') { return 32 }
     else { return 3 }
    },
    viewportCols() {
      if      (this.viewport === 'xs') { return 12 }
      else if (this.viewport === 'sm') { return 6 }
      else if (this.viewport === 'md') { return 6 }
      else if (this.viewport === 'lg') { return 4 }
      else if (this.viewport === 'xl') { return 2 }
      else { return 12 }
    },
    ascVariant() {
      if (this.sortToggle === true) {
        return 'primary'
      }
      else {
        return 'outline-primary'
      }
    },
    descVariant() {
      if (this.sortToggle === false) {
        return 'primary'
      }
      else {
        return 'outline-primary'
      }
    },
    filteredMedia() {
      let temp = this.media
      if (this.used) {
        temp = temp.filter(function(item){
          if(!item.campaign) {
            return item
          }
        }, this)
      }
      if (this.debouncedSearch !== '') {
        temp = temp.filter(function(item){
        if(item.name){
            return item.name.toLowerCase().includes(this.debouncedSearch.toLowerCase())
          }
          else {
            return item.string.toLowerCase().includes(this.debouncedSearch.toLowerCase())
          }
        }, this)
      }
      if (this.type === 'Image') {
        temp = temp.filter(function(item){
          if (item.mimeType){
            return item.mimeType.includes('image')
          }
        }, this)
      }
      if (this.type === 'Video') {
        temp = temp.filter(function(item){
          if (item.mimeType){
            return item.mimeType.includes('video')
          }
        }, this)
      }
      if (this.button === "Size") {
        if(this.sortToggle){
          temp.sort(function(a, b){if (a.size > b.size) {return 1} else {return -1}})
        }
        else {
          temp.sort(function(a, b){if (b.size > a.size) {return 1} else {return -1}})
        }
      }
      if (this.button === "Name") {
        if(this.sortToggle){
        temp = temp.sort(function(a, b) {
        let real_a = (a.name ? a.name : a.string)
        let real_b = (b.name ? b.name : b.string)
        if (real_a.localeCompare(real_b) > 0) {return 1} else {return -1}
      }) 
      }
      else {
        temp = temp.sort(function(a, b) {
        let real_a = (a.name ? a.name : a.string)
        let real_b = (b.name ? b.name : b.string)
        if (real_b.localeCompare(real_a) > 0) {return 1} else {return -1}
      })
      }
      }
      if (this.button === "Dimensions") {
        if(this.sortToggle){
          temp.sort(function(a, b){if ((a.width * a.height) > (b.width * b.height)) {return 1} else {return -1}})
        }
        else {
          temp.sort(function(a, b){if ((b.width * b.height) > (a.width * a.height)) {return 1} else {return -1}})
        }
      }
      if (this.button === "Date") {
        if(this.sortToggle){
          temp.sort(function(a, b){if (a.mediaId > b.mediaId) {return 1} else {return -1}})
        }
        else {
          temp.sort(function(a, b){if (b.mediaId > a.mediaId) {return 1} else {return -1}})
      }
      }
      let displayItems = this.itemsByViewport * this.scrolls
      return temp.slice(0, displayItems)
    },
    debouncedSearch: {
      get() {
        return this.search
      },
      set: _.debounce(function(newValue)  {
        if (newValue !== this.search) {
          this.search = newValue
        }
      }, 250)
    }
  },
  methods: {
    getThumbnail(hash) {
      return process.env.VUE_APP_THUMBNAILS + hash + '_l.jpg'
    },
    showInfo(item) {
      this.selectedItem = item
      this.$bvModal.show('media-info')
    },
    infinityScroll (e) {
      if ((e.target.offsetHeight + e.target.scrollTop) >= e.target.scrollHeight) {
        this.scrolls++
      }
    },
    fetchMedia (reset) {
      var scope = this
      if (reset) {
        this.media = []
      }
      this.loading = true
      let url = 'v1/media'
      let params = {
        limit: 'all',
        search: this.debouncedSearch,
        team: parseInt(this.activeTeam.id)
      }
      this.$axios.get(url, {'params': params}).then(
      (response) => {
        this.media = this.media.concat(response.data.data.reverse())
        this.meta = response.data.meta
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
          scope.loading = false
        }
      )
    },
    addMedia: _.debounce(function() {
      this.media = []
      this.fetchMedia()
    }, 500),
    select (item) {
      this.selectedItem = item
    },
    resetView () {
      // This only activates when "filter by" is changed, not on initial page load
      let mediaGrid = document.getElementById('content-area')
      mediaGrid.scrollTo(0,0)
      this.scrolls = 1
    },
    close () {
      this.selectedItem = {}
      this.loaded = false
    },
    deleteMedia () {
      this.$axios.delete('v1/media/' + this.selectedItem.mediaId).then(
      () => {
        this.$notifications.add({
          title: 'Success',
          type: 'success',
          body: this.$t('notifications.mediaDelete') + ' ' + this.selectedItem.mediaId,
          timeout: true
        })
        this.fetchMedia(true)
        this.$bvModal.hide('delete-media-modal')
        this.$bvModal.hide('media-info')
        this.close()
      },
      () => {
        this.$notifications.add({
          title: 'Error',
          type: 'danger',
          body: this.$t('notifications.mediaDeleteError') + ' ' + this.selectedItem.mediaId,
          timeout: true
        })
      })
    },
    toggleUsed () {
      this.used = !this.used
    }
  }
}
</script>

<style scoped lang="scss">

#content-area {
  box-sizing: border-box;
}

.searchbar {
  border: 1px solid grey;
  width: 100%;
  text-align: left;
}


.delete-button {
  margin: 5px;
}

.icon {
   height: 75%;
   width: 85%;

   > * {
     margin: auto;
   }
}

.items {
  display: flex;
  flex-wrap: wrap;
  overflow-y: auto;
  align-content: flex-start;
}

.items .item {
  flex: 1 0 20%;
  height: 30%;
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: space-between;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 20%;
  padding: 5px;

  &:hover {
    background-color: #e6e6e6;
  }
}

.card-body {
  padding: 0.5rem;
}

.item-backdrop {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color:  rgba(0,0,0,.6);
/*  margin-top: 95px; */
}

.less-gutter {
  padding-left: 0.5em;
  padding-right: 0.5em;
}

.close {
  padding: 10px;
}

.card-block.preview {
  padding: 0;
}

.header {
  position: absolute;;
  border-bottom: #e9e9e9 solid 1px;
}

.header-title {
  padding-left: 15px;
}

// @import "node_modules/bootstrap/scss/_functions.scss";
// @import "node_modules/bootstrap/scss/_variables.scss";
// @import "node_modules/bootstrap/scss/mixins/_breakpoints.scss";
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/bootstrap";

@include media-breakpoint-down(md) {
  .header {
    display: inline-flex;
    background-color: white;
    z-index: 100;
  }

  .item {
    flex-basis: 50% !important;
    max-width: 50% !important;
  }

  .item-details {
    width: 100%;
    right: -100%;
  }

  .item-details.open {
    right: 0;
  }
}

@include media-breakpoint-down(sm) {
  .item {
    flex-basis: 100% !important;
    max-width: 100% !important;
  }
}
</style>

<style lang="scss">
thumbnail {
  max-width:100%;
}
.cut-text {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-left: 0.5rem;
}
.item-card:hover {
    background-color: #e6e6e6;
  }
</style>
