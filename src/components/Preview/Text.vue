<template lang="html">
  <div v-if="isShowing(text)">
    <span
      class="text-item"
      :style="{ fontSize: text.fontSize, fontFamily: text.fontFamily, fontStyle: text.fontStyle, fontWeight: text.fontWeight }"
    >
      {{ text.string }}
    </span>
  </div>
</template>

<script>
import showing from '../../mixins/show.js'

export default {
  mixins: [
    showing
  ],
  props: {
    text: {
      type: Object,
      required: true
    },
    time: {
      type: Number,
      required: true
    },
    playing: {
      type: Boolean,
      default () {
        return true
      }
    }
  }
}
</script>

<style lang="scss">
@import 'positions.scss';

.text-item {
  color: white;
}
</style>
