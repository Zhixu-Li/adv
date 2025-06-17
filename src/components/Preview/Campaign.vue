<template lang="html">
  <div>
    <div
      id="campaign-preview"
      ref="campaign"
      class="campaign-preview"
    >
      <div class="content w-100 p-0 m-0">
        <video-item
          v-for="video in videos"
          :key="video.id"
          :video="video"
          :time="time"
          :width="screenWidth"
          :height="screenHeight"
          :playing="playing"
          :class="video.position.replace(',', ' ')"
        />
        <image-item
          v-for="image in images"
          :key="image.id"
          :image="image"
          :time="time"
          :width="screenWidth"
          :height="screenHeight"
          :playing="playing"
          :class="image.position.replace(',', ' ')"
        />
        <audio-item
          v-for="audioItem in audio"
          :key="audioItem.id"
          :audio="audioItem"
          :time="time"
          :class="audioItem.position.replace(',', ' ')"
          style="z-index: 1"
        />
        <text-item
          v-for="textItem in text"
          :key="textItem.id"
          :text="textItem"
          :time="time"
          class="text"
          :class="textItem.position.replace(',', ' ')"
          style="z-index: 2147483647"
        />
        <!-- this could probably be cleaned up somehow -->
        <div
          v-if="selectedFrame"
          class="durationBar bg-white border border-muted rounded p-0 m-0"
        >
          {{ $t('campaigns.frameDuration') }}: 
          <!-- <b-form-input class="d-inline" min="0" max="9999" number required trim id="duration" type="number" v-model.number="selectedFrame.duration"></b-form-input> -->
          <BFormInput
            class="d-inline"
            min="0"
            max="9999"
            type="number"
            :value="selectedFrame.duration"
            @input="updateDuration($event)"
          />
        </div>
      </div>
    </div>
    <div
      v-if="!noControls"
      class="campaign-controls"
    >
      <div
        class="play-pause"
        @click="playPause()"
      >
        <!-- //<v-icon class="play-icon" :name="playingIcon"></v-icon> -->
        <font-awesome-icon
          icon="pause"
          class="play-icon"
        />
      </div>
      <BFormInput
        v-model.number="time"
        class="seek-bar"
        type="range"
        min="0"
        :max="end"
      />
      {{ timeFormat(time) }}/{{ timeFormat(time) }}
    </div>
  </div>
</template>

<script>
import VideoItem from './Video.vue'
import ImageItem from './Image.vue'
import AudioItem from './Audio.vue'
import TextItem from './Text.vue'
import {BFormInput} from 'bootstrap-vue-next'
// import 'vue-awesome/icons/play'
// import 'vue-awesome/icons/pause'

export default {
  name: 'Campaign',
  components: {
    VideoItem,
    ImageItem,
    AudioItem,
    TextItem,
    BFormInput,
  },
  props: {
    media: {
      type: Array,
      required: true
    },
    selectedFrame: {
      type: Object,
    },
    timeSkip: {
      type: Number,
      required: false,
      default: 0
    },
    noControls: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      height: 0,
      width: 0,
      screenHeight: 1080,
      screenWidth: 1920,
      end: 0,
      videos: [],
      images: [],
      audio: [],
      text: [],
      interval: {},
      playing: true,
      vertical: false,
      time: 0
    }
  },
  computed: {
    size () {
      return {
        margin: 'auto',
        height: this.height + 'px',
        width: this.height * this.aspect + 'px'
      }
    },
    playingIcon () {
      if (this.playing) {
        return 'pause'
      } else {
        return 'play'
      }
    },
    aspect () {
      return this.screenWidth / this.screenHeight
    }
  },
  watch: {
    media () {
      console.log(this.media)
    },
    aspect () {
      this.calculateSize()
    },
    timeSkip () {
      if (this.timeSkip >= 0) {
        this.time = this.timeSkip
      }
    },
    screenWidth () {
      if (this.screenWidth != 0) {
        this.screenWidth = Math.abs(this.screenWidth)
      }
    },
    screenHeight () {
      if (this.screenHeight != 0) {
        this.screenHeight = Math.abs(this.screenHeight)
      }
    }
  },
  mounted () {
    this.initialise()
    this.filterMedia()
    this.calculateEnd()
    this.interval = setTimeout(this.tick, 1000)
    window.addEventListener('resize', this.calculateSize)
    this.$watch('media', () => {
      if (this.playing) {
        clearInterval(this.interval)
        this.filterMedia()
        this.calculateEnd()
        this.calculateSize()
        this.interval = setTimeout(this.tick, 1000)
      } else {
        this.filterMedia()
        this.calculateEnd()
        this.calculateSize()
      }
    }, {deep: true})
    this.calculateSize()
  },
  beforeUnmount () {
    clearTimeout(this.interval)
    window.removeEventListener('resize', this.calculateSize)
  },
  methods: {
    filterMedia () {
      this.videos = this.media.filter(this.isVideo)
      this.images = this.media.filter(this.isImage)
      this.audio = this.media.filter(this.isAudio)
      this.text = this.media.filter(this.isText)
    },
    timeFormat(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },
    calculateEnd () {
      if (this.media.length > 0) {
        let newEnd = 0
        for (let item of this.media) {
          newEnd = parseInt(item.end) > newEnd ? parseInt(item.end) : newEnd
        }
        this.end = newEnd
      } else {
        this.end = 0
      }
    },
    isVideo (element) {
      if (typeof element.mimeType !== 'undefined') {
        return element.mimeType.startsWith('video')
      } else {
        return false
      }
    },
    isImage (element) {
      if (typeof element.mimeType !== 'undefined') {
        return element.mimeType.startsWith('image')
      } else {
        return false
      }
    },
    isAudio (element) {
      if (typeof element.mimeType !== 'undefined') {
        return element.mimeType.startsWith('audio')
      } else {
        return false
      }
    },
    isText (element) {
      return typeof element.mimeType === 'undefined'
    },
    calculateSize () {
      let height = this.$refs.campaign.offsetHeight
      let width = height * this.aspect

      // if we're overflowing horizontally or we don't have a set height
      // so calculate based off width
      if (width > this.$refs.campaign.offsetWidth || height === 0) {
        width = this.$refs.campaign.offsetWidth
        height = width / this.aspect
      }

      this.height = height
      this.width = width
    },
    tick () {
      this.time = this.time >= this.end ? 0 : this.time + 1
      this.interval = setTimeout(this.tick, 1000)
    },
    playPause () {
      if (this.playing) {
        clearTimeout(this.interval)
        this.playing = false
      } else {
        clearTimeout(this.interval)
        this.interval = setTimeout(this.tick, 1000)
        this.playing = true
      }
    },
    initialise () {
      let tempWidth = this.screenWidth
      let tempHeight = this.screenHeight
      this.screenWidth = 0
      this.screenHeight = 0
      this.screenWidth = tempWidth
      this.screenHeight = tempHeight
    }
  }
}
</script>

<style lang="scss" scoped>
.campaign-controls {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 10%;

  input[type=range] {
    -webkit-appearance: none;
    margin: 10px 0;
  }

  ::range-track {
    background-color: #3071a9;
    height: 5px;
    cursor: pointer;
  }

  ::range-thumb {
    height: 5px;
    border-radius: 5px;
    cursor: pointer;
    border: 1px solid #000000;
    box-shadow: 1px 1px 1px #000000;
    background: white;
    height: 15px;
    width: 15px;
    border-radius: 15px;
    margin-top: -5.5px;
    -webkit-appearance: none;
  }
  .play-pause {
    width: 5%;

    .play-icon {
      display: inline-block;
      margin: auto;
    }
  }

  .seek-bar {
    width: 95%;
  }
}

.refresh {
  font-size: 20px;
}

.campaign-preview {
  height: 90%;
  width: 100%;
  overflow: hidden;

  .content {
    height: 100%;
    position: relative;
    margin: auto;

    background: repeating-conic-gradient(#CCC 0% 25%, transparent 0% 50%) 50% / 20px 20px;

    & > * {
      position: absolute;
    }
  }

  &:hover {
    + .campaign-controls {
      visibility: visible;
      opacity: 1;
      transition: visibility 0s, opacity 0.5s linear;
    }
  }
}


.durationBar {
  bottom: 0;
  right: 0;

  input {
    width: 4em;
  }
}
</style>
