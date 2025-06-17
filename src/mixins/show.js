export default {
  data () {
    return {
      showing: false
    }
  },
  methods: {
    isShowing (media) {
      this.showing = this.time >= media.start && this.time < media.end
      return this.showing
    }
  }
}
