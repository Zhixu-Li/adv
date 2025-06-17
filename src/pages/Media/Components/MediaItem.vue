<template lang="html">
  <div class="text-center">
    <div v-if="item.audioId">
      <audio
        class="embed-fluid"
        controls
      >
        <source
          :src="item.uri.replace('http:', '')"
          :type="item.mimeType"
        >
        {{ $t('message.errorAudio') }}
      </audio>
    </div>
    <div v-if="item.imageId">
      <img
        :src="item.uri.replace('http:', '')"
        class="img-fluid"
      >
    </div>
    <div
      v-if="item.textId"
      class="text-item"
    >
      <span :style="{ fontSize: item.fontSize, fontFamily: item.fontFamily, fontStyle: item.fontStyle, fontWeight: item.fontWeight }">
        {{ item.string }}
      </span>
    </div>
    <div
      v-if="item.videoId"
      class="embed-responsive embed-responsive-16by9"
    >
      <video
        class="embed-responsive-item"
        controls
      >
        <source :src="item.uri.replace('http:', '')">
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.text-item {
  // height: 100%;
  // width: 100%;
  background-color: black;
  color: white;
  margin: 0 auto;
}
.text-center {
  background: repeating-conic-gradient(#CCC 0% 25%, transparent 0% 50%) 50% / 20px 20px;
}
</style>
