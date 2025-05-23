<template lang="html">
  <div class="preview-container">
    <template v-if="showLive">
      <div class="live">
        ⏺ live <small>(+{{ time }}s)</small>
      </div>
      <BImg
        fluid-grow
        block
        class="preview"
        :style="computedStyle"
        :src="imageUrl"
        alt="LOADING.."
      />
    </template>
    <template v-else>
      <BImg
        fluid-grow
        block
        class="preview"
        :style="computedStyle"
        :src="imageUrl"
        alt="LOADING.."
      />
    </template>
  </div>
</template>

<script>
import { BImg } from 'bootstrap-vue-next'
export default {
  components:{
    BImg,  
},
  props: {
    display: {
      type: Object,
      required: true
    },
    showLive: {
      type: Boolean,
      required: false,
      default: false,
    },
    height: {
      type: String,
      required: false,
      default: "100%",
    },
    refreshTime: {
      type: Number,
      required: false,
      default: 5
    }
  },
  data () {
    return {
      lastUpdate: new Date(),
      time: 0,
      img_time: 0,
      intv_time: Number(),
      intv_update: Number()
    }
  },
  computed: {
    computedStyle() {
      if (this.showLive) {
        return { height: 'calc(' + this.height + ' - 1em)' }
      }
      else {
        return { height: this.height }
      }
    },
    imageUrl() {
      return process.env.VUE_APP_NETWORK_ENDPOINT + 'polling_ask' + '?client=' + this.display.acid + '&ts=' + this.img_time
    }
  },
  mounted () {
    this.intv_time = setInterval(() => (this.time = this.time + 1), 1000)
    this.intv_update = setInterval(() => (this.img_time = new Date().getTime(), this.time = 0), 5000)
  },
  beforeUnmount () {
    clearInterval(this.intv_time)
    clearInterval(this.intv_update)
  },
  methods: {
  }
}
</script>

<style scoped lang="scss">
.live {
  color: red;
  font-size: large;
  font-weight: bold;
  font-variant: small-caps;
  z-index: 99;
  margin-top: 0.1em;
  margin-left: 0.1em;
  padding: 0em 0.25em;
  background: rgba(0,0,0,0.5);
  border-radius: 0.25em;
}

.preview-container {
  padding-bottom: 1em;
  color: #fff;
}

.preview {
  object-fit: scale-down;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  padding-bottom: 0.5em;
}

.loading,
.loading:after {
  border-radius: 50%;
  width: 5em;
  height: 5em;
}

.loading {
  margin: 60px auto;
  font-size: 10px;
  position: relative;
  text-indent: -9999em;
  border-top: 0.8em solid rgba(255, 255, 255, 0.2);
  border-right: 0.8em solid rgba(255, 255, 255, 0.2);
  border-bottom: 0.8em solid rgba(255, 255, 255, 0.2);
  border-left: 0.8em solid #ffffff;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-animation: load8 1.1s infinite linear;
  animation: load8 1.1s infinite linear;
}
@-webkit-keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

</style>
