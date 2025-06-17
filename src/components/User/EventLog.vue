<template>
  <BCard :header="$t('event.log')">
    <BCardText>
      <div v-show="loading" class="loader">
        <div class="spinner" />
      </div>
      <div v-if="logs.length > 0">
        <BTableSimple striped>
          <BThead>
            <BTr>
              <BTh>{{ $t('dateTime.date') }}</BTh>
              <BTh>{{ $t('event.ip') }}</BTh>
              <BTh>{{ $t('event.action') }}</BTh>
            </BTr>
          </BThead>
          <BTbody>
            <BTr v-for="log in logs" :key="log.timestamp">
              <BTd>{{ log.timestamp }}</BTd>
              <BTd>{{ log.ip }}</BTd>
              <BTd>{{ log.message }}</BTd>
            </BTr>
          </BTbody>
        </BTableSimple>
      </div>
      <div v-else>
        <span>{{ $t('message.noLogs') }}</span>
      </div>
    </BCardText>

    <div v-if="logsMeta.totalPages > 1" class="card-footer">
      <BButtonGroup>
        <BButton
          v-if="currentPage > 1"
          variant="outline-secondary"
          @click="fetchLogs(logsMeta.previousPage)"
        >
          {{ $t('buttons.previous') }}
        </BButton>
        <BButton
          v-if="currentPage < logsMeta.totalPages"
          variant="outline-secondary"
          @click="fetchLogs(logsMeta.nextPage)"
        >
          {{ $t('buttons.next') }}
        </BButton>
      </BButtonGroup>
    </div>
  </BCard>
</template>



<script>
import {
  BCard,
  BCardText,
  BTableSimple,
  BThead,
  BTr,
  BTh,
  BTbody,
  BTd,
  BButtonGroup,
  BButton
} from 'bootstrap-vue-next'
export default{
  name: 'EventLog',
  components: {
    BCard,
    BCardText,
    BTableSimple,
    BThead,
    BTr,
    BTh,
    BTbody,
    BTd,
    BButtonGroup,
    BButton
  },
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
