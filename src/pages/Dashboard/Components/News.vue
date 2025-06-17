<template lang="html">
  <BRow class="mt-2 mr-2">
    <BCol cols="12">
      <BCard>
        <BCardText>
          <h4>{{ $t('dashboard.common.news') }}</h4>
          <div v-if="loaded">
            <div
              v-for="news in news"
              :key="news.title"
              class="news"
            >
              <hr />
              <div>
                <span style="font-size:1.5em;">{{ news.title }}</span>
                <span class="float-right" style="font-size:0.75em;">
                  {{ news.postedDate.substring(0,10) }}
                </span>
              </div>
              <br />
              <div style="white-space:pre-wrap;">
                <span v-html="news.content" />
              </div>
              <div class="text-right" style="font-size:0.75em;">
                {{ $t('news.postedBy') }}{{ news.author }}
              </div>
            </div>
          </div>
          <div v-else>
            {{ $t('dashboard.common.loading') }}
          </div>
        </BCardText>
      </BCard>
    </BCol>
  </BRow>
</template>


<script>
import { BRow, BCol, BCard, BCardText } from 'bootstrap-vue-next'
export default {
  components:{
    BRow,
    BCol,
    BCard,
    BCardText
  },
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
