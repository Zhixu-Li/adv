<template lang="html">
  <div style="width: 100%; height: 60px">
    <div ref="slider" />
  </div>
</template>

<script>
import noUiSlider from 'nouislider'
import 'nouislider/distribute/nouislider.css';

export default {
  props: {
    value: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      loaded: false,
      image: null,
      timeout: {},
      sliderSettings: {
        start: [0, 24],
        connect: true,
        tooltips: true,
        step: 1,
        range: {
          'min': 0,
          'max': 24
        },
        margin: 1,
        pips: {
          mode: 'positions',
          values: [0, 25, 50, 75, 100],
          density: 4
        }
      }

    }
  },
  mounted() {
    var vm = this
    this.slider = noUiSlider.create(this.$refs['slider'], this.sliderSettings);
    this.$refs['slider'].noUiSlider.on('update', function (values) {
      vm.$emit('input', [(String(Math.trunc(values[0])).padStart(2, "0") + ':00:00' ),(String(Math.trunc(values[1])).padStart(2, "0") + ':00:00')])
    });
  },
  beforeUnmount() {
    this.$refs['slider'].noUiSlider.destroy()
  },
  methods: {}
}
</script>

<style lang="scss">
.noUi-tooltip {
  display: none;
}
.noUi-active .noUi-tooltip {
  display: block;
}
.noUi-target {
  margin-left: 15px;
  margin-right: 15px;
}
.noUi-pips {
  height: 0px;
}
.noUi-connect {
  background: #007bff;
}
</style>
