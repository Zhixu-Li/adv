<template lang="html">
  <div>
    <canvas
      :id="chartId"
      ref="canvas"
    />
  </div>
</template>

<script>
import Chart from 'chart.js'

export default {
  props: {
    type: {
      type: String,
      required: false,
      default: 'line'
    },
    value: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      required: false,
      default () {
        return {}
      }
    },
    chartId: {
      default: 'chart',
      type: String
    },
    width: {
      default: 400,
      type: Number
    },
    height: {
      default: 400,
      type: Number
    }
  },
  data () {
    return {
      defaults: {
        title: {
          display: false
        },
        legend: {
          display: false
        }
      },
      chartData: {}
    }
  },
  watch: {
    'value': {
      handler () {
        this.chartData = this.value
        this.updateChart()
        this.$emit('input', this.value)
      },
      deep: true
    }
  },
  mounted () {
    this.chartData = this.value
    this.renderChart(Object.assign({}, this.defaults, this.options))
  },
  beforeUnmount () {
    this._chart.destroy()
  },
  methods: {
    updateChart () {
      this.chartData.datasets.forEach((dataset, i) => {
        this._chart.data.datasets[i].data = dataset.data
      })

      this._chart.data.labels = this.chartData.labels
      this._chart.update()
    },
    renderChart (options) {
      this._chart = new Chart(
        this.$refs.canvas.getContext('2d'), {
          type: this.type,
          data: this.chartData,
          'options': options
        }
      )
      this._chart.generateLegend()
    }
  }
}
</script>
