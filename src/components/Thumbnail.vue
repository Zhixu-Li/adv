<template lang="html">
  <transition-group
    ref="imageContainer"
    tag="div"
    name="blur"
    class="thumbnail-container"
  >
    <div
      v-if="!loaded"
      key="placeholder"
      class="placeholder blur-transition"
    />
  </transition-group>
</template>

<script>
export default {
  props: {
    hash: {
      type: String,
      required: true
    },
    size: {
      type: String,
      required: false,
      default: 'm'
    }
  },
  data () {
    return {
      loaded: false,
      image: null,
      timeout: {}
    }
  },
  mounted () {
    // Create a new image
    this.image = new Image()
    this.image.classList.add('blur-transition')
    this.image.classList.add('blur-enter')

    let self = this
    // Set the on load handler
    this.image.onload = function () {
      let container = self.$refs.imageContainer.$el
      container.appendChild(self.image)
      self.loaded = true

      this.timeout = setTimeout(function () {
        self.image.classList.remove('blur-enter')
      }, 50)
    }

    // Start loading the small image
    this.image.src = this.getThumbnail(this.size)
  },
  beforeUnmount () {
    clearTimeout(this.timeout)
  },
  methods: {
    getThumbnail (size) {
      return process.env.VUE_APP_THUMBNAILS + this.hash + '_' + size.toLowerCase() + '.jpg'
    }
  }
}
</script>

<style lang="scss">
.placeholder, .thumbnail-container {
  width: 100%;
  height: 100%;
  text-align: center;
}

.placeholder {
  background-color: rgba(0,0,0,.05);
  transition: filter linear 0.6s;
  filter: blur(0px)
}

.blur-transition {
  transition: filter linear 0.6s;
  filter: blur(0px)
}
.blur-enter, .blur-leave {
  filter: blur(5px)
}

img {
  max-width:100%;
}
</style>
