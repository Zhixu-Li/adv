<!-- <template>
  <input class="flatpickr flatpickr-input form-control input" :value="value" type="text" :placeholder="placeholder" @input="$emit('input', $event.target.value)">
</template> -->

<template>
  <input
    class="flatpickr flatpickr-input form-control input"
    :value="modelValue"
    type="text"
    :placeholder="placeholder"
    @input="$emit('update:modelValue', $event.target.value)"
  >
</template>


<script>
require('../../node_modules/flatpickr/dist/flatpickr.min.css')
import Flatpickr from 'flatpickr'
import {zh} from 'flatpickr/dist/l10n/zh.js'
import Vue from 'vue'

const locales = {
  'zh': zh
}

export default {
  props: {
    placeholder: {
      type: String,
      required: false,
      default: 'Date'
    },
    options: {
      type: Object,
      required: true
    },
    //value: {
      //required: false
    //}
    modelValue:{
      type: [String. Date],
      default:''
    }
  },
  data () {
    return {
      flatpickr: {},
      default: {}
    }
  },
  computed: {
    defaultOptions () {
      if (Vue.config.lang === 'en') {
        return Object.assign({}, this.default)
      } else {
        return Object.assign({
          locale: locales[Vue.config.lang]
        }, this.default)
      }
    }
  },
  watch: {
    options: {
      handler () {
        this.flatpickr = new Flatpickr(this.$el, this.options)
      },
      deep: true
    }
  },
  mounted () {
    // time pickers dont emit input events
    // so we use the on close to emit it for us and update the v-model
    let self = this
    this.default.onClose = function (selectedDates, dateStr) {
      //self.$emit('input', dateStr)
      self.$emit('update:modelValue', dateStr)
    }

    this.flatpickr = new Flatpickr(this.$el, Object.assign({}, this.options, this.defaultOptions))
  },
  unmounted () {
    this.flatpickr.destroy()
  }
}
</script>
<style scoped>

</style>
