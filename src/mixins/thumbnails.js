export default {
  methods: {
    getThumbnail (hash, size) {
      return process.env.VUE_APP_THUMBNAILS + hash + '_' + size.toLowerCase() + '.jpg'
    }
  }
}
