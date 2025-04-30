<template lang="html">
  <div>
    <h2>{{ $t('schedule.selectSource') }}</h2>
    <div
      v-if="errors.length > 0"
      class="alert alert-danger"
    >
      <ul>
        <li
          v-for="(error, index) in errors"
          :key="index"
        >
          {{ error }}
        </li>
      </ul>
    </div>
    <multiselect
      v-model="source"
      :options="filteredSources"
      :searchable="true"
      :placeholder="$t('schedule.selectSource')"
      label="name"
      @input="selectSource"
    />
    <b-button
      variant="primary"
      class="float-right mt-2"
      @click="next"
    >
      {{ $t('buttons.next') }}
    </b-button>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'

export default {
  components: {
    Multiselect
  },
  data () {
    return {
      sources: [],
      source: {},
      errors: []
    }
  },
  computed: {
    filteredSources () {
      return this.sources.filter((source) => {
        if (source.media.data.length > 0) {
          return true
        }
        return false
      })
    }
  },
  mounted () {
    this.fetchSources()
  },
  methods: {
    fetchSources () {
      var scope = this
      this.$axios.get('v1/sources?limit=all&include=media').then(
        (response) => {
          this.sources = response.data.data
        }).catch(
        function (error) {
          if (!error.response) {
            scope.$notifications.add({
              title: 'Error',
              type: 'warning',
              body: error.message,
              timeout: true
            })
          } else if (error.response.status !== 404) {
            scope.$notifications.add({
              title: 'Error',
              type: 'warning',
              body: error.response.data.message,
              timeout: true
            })
          }
        }
      )
    },
    selectSource () {
      this.errors = []
      this.$emit('sourceSelected', this.source)
    },
    next () {
      if (Object.keys(this.source).length > 0) {
        this.$emit('next')
      } else {
        this.errors = [
          'Please select a source.'
        ]
      }
    }
  }
}
</script>

<style lang="css">
</style>
