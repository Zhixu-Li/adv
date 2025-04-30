<template lang="html">
  <b-row class="mt-2 mr-2">
    <b-col cols="12">
      <b-card>
        <b-card-text>
          <h4>{{ $t('dashboard.common.news') }}</h4>
          <div v-if="loaded">
            <div
              v-for="news in news"
              :key="news.title"
              class="news"
            >
              <hr>
              <div>
                <span style="font-size: 1.5em;">{{ news.title }}</span> <span
                  class="float-right"
                  style="font-size: 0.75em;"
                >{{ (news.postedDate.substring(0, 10)) }}</span> <!-- -->
              </div>
              <br>
              <div style="white-space: pre-wrap;">
                <span v-html="news.content" />
              </div>
              <div
                class="text-right"
                style="font-size: 0.75em;"
              >
                {{ $t('news.postedBy') }}{{ news.author }}
              </div>
            </div>
          </div>
          <div v-else>
            {{ $t('dashboard.common.loading') }}
          </div>
        </b-card-text>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>

export default {
  data () {
    return {
      news: [],
      loaded: false,
      newsMeta: {
        totalPages: 0
      }
    }
  },
  mounted () {
    this.fetchNews()
  },
  methods: {
    fetchNews () {
      this.news = []
      this.loaded = false
      let url = 'v1/news'
      this.$axios.get(url).then(
        (response) => {
          this.news = response.data.data
          this.newsMeta = response.data.meta
          this.loaded = true
        },
        () => {
          this.loaded = true
          this.newsMeta = {totalPages: 0}
        }
      )
    }
  }
}
</script>

<style scoped lang="scss">

</style>
