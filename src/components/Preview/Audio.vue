<template lang="html">
  <audio
    ref="audio"
    :src="audio.uri"
  />
</template>

<script>
import showing from '../../mixins/show.js'

export default {
  mixins: [
    showing
  ],
  props: {
    audio: {
      type: Object,
      required: true
    },
    time: {
      type: Number,
      required: true
    },
    playing: {
      type: Boolean,
      required: true
    }
  },
  time: {
    handler (newTime, oldTime) {
      this.isShowing(this.audio)
      if (!this.playing) {
        if (this.showing) {
          this.$refs.audio.currentTime = this.time - this.audio.start
        }
      } else {
        if (this.showing && (newTime !== (oldTime + 1))) {
          this.$refs.audio.pause()
          this.$refs.audio.currentTime = this.time - this.audio.start
          this.$refs.audio.play()
        }
      }
    }
  },
  showing (isShowing, wasShowing) {
    if (!wasShowing && isShowing) {
      this.$refs.audio.play()
    } else if (wasShowing && !isShowing) {
      this.$refs.audio.pause()
      this.$refs.audio.currentTime = 0
    }
  },
  playing (isPlaying, wasPlaying) {
    if (wasPlaying && !isPlaying) {
      if (this.showing) {
        this.$refs.audio.pause()
      }
    } else if (!wasPlaying && isPlaying) {
      if (this.showing) {
        this.$refs.audio.currentTime = this.time - this.audio.start
        this.$refs.audio.play()
      }
    }
  }
}
</script>

<style lang="css">
</style>
