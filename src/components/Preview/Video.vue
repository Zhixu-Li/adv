<template lang="html">
  <!-- TODO: loading placeholder? -->
  <video
    v-show="showing"
    ref="video"
    class="video"
    :style="styles"
  >
    <source :src="video.uri">
  </video>
</template>

<script>
import showing from '../../mixins/show.js'

export default {
  mixins: [
    showing
  ],
  props: {
    video: {
      type: Object,
      required: true
    },
    time: {
      type: Number,
      required: true
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    playing: {
      type: Boolean,
      default () {
        return true
      }
    }
  },
  computed: {
    styles () {
      let styles = {}
      if (this.video.position === 'middle,center') {
        styles['height'] = 100 + '%'
        styles['width'] = 100 + '%'
      } else {
        styles['z-index'] = 1 + Math.floor((Math.pow((this.video.width + this.video.height), -0.3) * Math.pow(10, 7)))
        styles['height'] = (this.video.height / this.height) * 100 + '%'
        styles['width'] = (this.video.width / this.width) * 100 + '%'
      }

      return styles
    }
  },
  watch: {
    time: {
      handler (newTime, oldTime) {
        this.isShowing(this.video)
        if (!this.playing) {
          if (this.showing) {
            this.$refs.video.currentTime = this.time - this.video.start
          }
        } else {
          if (this.showing && (newTime !== (oldTime + 1))) {
            this.$refs.video.pause()
            this.$refs.video.currentTime = this.time - this.video.start
            this.$refs.video.play()
          }
        }
      }
    },
    showing (isShowing, wasShowing) {
      if (!wasShowing && isShowing) {
        this.$refs.video.play()
      } else if (wasShowing && !isShowing) {
        this.$refs.video.pause()
        this.$refs.video.currentTime = 0
      }
    },
    playing (isPlaying, wasPlaying) {
      if (wasPlaying && !isPlaying) {
        if (this.showing) {
          this.$refs.video.pause()
        }
      } else if (!wasPlaying && isPlaying) {
        if (this.showing) {
          this.$refs.video.currentTime = this.time - this.video.start
          this.$refs.video.play()
        }
      }
    }
  },
  mounted () {
    this.$refs.video.volume = 0
  }
}
</script>

<style lang="scss" scoped>
.video {
  position: absolute;
}

@import 'positions.scss';
</style>
