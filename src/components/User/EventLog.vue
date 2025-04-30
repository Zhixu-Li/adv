<template>
  <b-card :header="$t('event.log')">
    <b-card-text style="responsive">
      <div
        v-show="loading"
        class="loader"
      >
        <div class="spinner" />
      </div>
      <div v-if="logs.length > 0">
        <div>
          <b-table-simple striped>
            <b-thead>
              <b-tr>
                <b-th>{{ $t('dateTime.date') }}</b-th>
                <b-th>{{ $t('event.ip') }}</b-th>
                <b-th>{{ $t('event.action') }}</b-th>
              </b-tr>
            </b-thead>
            <b-tbody>
              <b-tr
                v-for="log in logs"
                :key="log.timestamp"
              >
                <b-td>{{ log.timestamp }}</b-td>
                <b-td>{{ log.ip }}</b-td>
                <b-td>{{ log.message }}</b-td>
              </b-tr>
            </b-tbody>
          </b-table-simple>
        </div>
      </div>
      <div v-else>
        <span>{{ $t('message.noLogs') }}</span>
      </div>
    </b-card-text>
    <div
      v-if="logsMeta.totalPages > 1"
      class="card-footer"
    >
      <b-button-group>
        <b-button
          v-if="logsMeta.totalPages > 1 && currentPage != 1"
          variant="outline-secondary"
          @click="fetchLogs(logsMeta.previousPage)"
        >
          {{ $t('buttons.previous') }}
        </b-button>
        <b-button
          v-if="logsMeta.totalPages > 1 && currentPage != logsMeta.totalPages"
          variant="outline-secondary"
          @click="fetchLogs(logsMeta.nextPage)"
        >
          {{ $t('buttons.next') }}
        </b-button>
      </b-button-group>
    </div>
  </b-card>
</template>
<script>
export default{
  name: 'EventLog',
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      logs: [],
      logsMeta: {},
      currentPage: 1,
      loading: true
    }
  },
  watch: {
    userId () {
      this.fetchLogs(this.currentPage)
    }
  },
  mounted () {
    this.fetchLogs(1)
  },
  methods: {
    fetchLogs (page) {
      this.loading = true
      this.$axios.get('v1/users/' + this.userId + '/logs?limit=5&page=' + page).then(
        (response) => {
          this.logs = response.data.data
          this.logsMeta = response.data.meta
          this.currentPage = page
          this.loading = false
        },
        () => {
          this.loading = false
        }
      )
    }
  }
}
</script>
<style>

</style>
