<template>
  <div>
    <canvas
      :id="chartId"
      ref="canvas"
      :width="width"
      :height="height"
    />

    <div
      v-if="inputs"
      class="input-values"
    >
      <input
        v-for="(val, key) in localData"
        :key="key"
        class="input-value text-center"
        type="number"
        :value="val"
        min="0"
        max="100"
        @input="updateValue(key, $event.target.value)"
      >
    </div>

    <!-- Optional UI to add time points -->
    <!--
    <div class="form-group">
      <label for="newTime">New Time</label>
      <input id="newTime" type="number" min="0" max="23" v-model="newTime" />
      <button type="button" class="btn btn-primary" @click="addTime()">+</button>
    </div>
    -->
  </div>
</template>

<script>
import Chart from 'chart.js';

export default {
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    inputs: {
      type: Boolean,
      default: true,
    },
    chartId: {
      type: String,
      default: 'line-chart'
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 400
    }
  },
  data() {
    return {
      localData: {},
      newTime: 0,
      chartData: {},
      options: {
        title: { display: false },
        legend: { display: false },
        scales: {
          yAxes: [{
            display: true,
            ticks: {
              max: 100,
              min: 0
            }
          }]
        }
      }
    };
  },
  watch: {
    modelValue: {
      handler(newVal) {
        this.localData = { ...newVal };
        this.updateChartData();
        this.updateChart();
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.localData = { ...this.modelValue };
    this.updateChartData();
    this.renderChart();
  },
  beforeUnmount() {
    if (this._chart) {
      this._chart.destroy();
    }
  },
  methods: {
    updateChartData() {
      this.chartData = {
        labels: Object.keys(this.localData),
        datasets: [
          {
            backgroundColor: '#f87979',
            data: Object.values(this.localData)
          }
        ]
      };
    },
    updateChart() {
      if (!this._chart) return;

      this._chart.data.labels = this.chartData.labels;
      this._chart.data.datasets[0].data = this.chartData.datasets[0].data;
      this._chart.update();
    },
    renderChart() {
      this._chart = new Chart(this.$refs.canvas.getContext('2d'), {
        type: 'line',
        data: this.chartData,
        options: this.options
      });
    },
    updateValue(key, val) {
      this.localData[key] = Number(val);
      this.$emit('update:modelValue', { ...this.localData });
      this.updateChartData();
      this.updateChart();
    },
    addTime() {
      this.localData[this.newTime] = 100;
      this.$emit('update:modelValue', { ...this.localData });
      this.updateChartData();
      this.updateChart();
    }
  }
};
</script>

<style scoped>
.input-values {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 10px;
}

.input-value {
  flex: 1 0 18%;
  margin: 0 4px;
  text-align: center;
}
</style>
