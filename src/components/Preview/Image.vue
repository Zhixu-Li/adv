<template lang="html">
  <img
    v-if="isShowing(image)"
    :src="image.uri"
    class="image"
    :style="styles"
  >
</template>

<script>
import showing from '../../mixins/show.js'

export default {
  mixins: [
    showing
  ],
  props: {
    image: {
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
      if (this.image.position === 'middle,center') {
        styles['height'] = 100 + '%'
        styles['width'] = 100 + '%'
        styles['object-fit'] = 'contain'

      } else {
        let height = (this.image.height / this.height) * 100
        let width = (this.image.width / this.width) * 100
        styles['z-index'] = 1 + Math.floor((Math.pow((this.image.width + this.image.height), -0.3) * Math.pow(10, 7)))
        styles['height'] = height + '%'
        styles['width'] = width + '%'
      }

      return styles
    }
  }
}
</script>

<style lang="scss" scoped>
.image {
  position: absolute;
}

@import 'positions.scss';
</style>
