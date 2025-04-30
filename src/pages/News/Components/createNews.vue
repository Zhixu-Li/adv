<template lang="html">
  <b-container>
    <div class="newspage">
      <b-modal
        id="modal-xl"
        size="lg"
        :title="$t('actions.deleteNews') + selectedNews.title"
        hide-footer
      >
        <template #header>
          <h2 class="text-center">
            {{ $t() }} {{ selectedNews.title }}
          </h2>
        </template>
        <!-- <div slot="header">
          <h2 class="text-center">{{$t()}} {{selectedNews.title}} </h2>
        </div> -->

        {{ $t('message.newsDelete') }}
        <div>
          <b-button
            type="button"
            variant="danger"
            class="remove-button"
            @click="deleteNews(selectedNews); $bvModal.hide('modal-xl')"
          >
            {{ $t('answers.yes') }}
          </b-button>
          <b-button
            type="button"
            variant="primary"
            @click="$bvModal.hide('modal-xl')"
          >
            {{ $t('answers.no') }}
          </b-button>
        </div>
      </b-modal>
      <b-card
        cols="12"
        class="mb-3"
      >
        <h4 class="card-title">
          {{ $t('admin.createNews') }}
        </h4>
        {{ $t('admin.title') }}
        <b-form-input
          v-model="newNews.title"
          class="form-control"
          placeholder="Title"
        /> <!-- v-model="news.title"  -->
        {{ $t('admin.body') }}
        <b-form-textarea
          v-model="newNews.content"
          class="form-control"
          placeholder="Body"
          rows="3"
        /> <!-- v-model="news.title"  -->
        <b-button
          variant="primary"
          type="submit"
          class="btn btn-primary mt-3"
          @click="addNews()"
        >
          Submit
        </b-button>
      </b-card>
      <b-card cols="12">
        <div class="card-block">
          <h4 class="card-title">
            {{ $t('Current news list') }}
          </h4>
          <b-card-text>
            <div v-if="loaded">
              <div
                v-for="newsItem in news"
                :key="newsItem.id"
                class="border-top mt-3 news"
              >
                <div v-if="editing === null">
                  <h5>{{ newsItem.title }}</h5>
                </div>
                <p>
                  <b-form-input
                    v-if="editing === newsItem.id"
                    v-model="newsItem.title"
                    class="form-control border-bottom"
                    style="margin-bottom: 0.5em;"
                  />
                  {{ $t('news.postedBy') }} {{ newsItem.author }} {{ $t('news.on') }} {{ $t(newsItem.postedDate) }} 
                </p>
                <p v-if="editing !== newsItem.id">
                  {{ newsItem.content }}
                </p>
                <p>
                  <b-form-textarea
                    v-if="editing === newsItem.id"
                    v-model="newsItem.content"
                    class="form-control"
                    style="margin-bottom: 0.5em;"
                    rows="3"
                  />
                </p>
                <b-button
                  v-if="editing!==newsItem.id"
                  type="button"
                  variant="primary"
                  @click="editing=newsItem.id"
                >
                  {{ $t('buttons.edit') }}
                </b-button>
                <div v-else-if="editing === newsItem.id">
                  <b-button
                    type="button"
                    variant="primary"
                    class="remove-button"
                    @click="editing=null, updateNews(newsItem)"
                  >
                    {{ $t('Submit') }}
                  </b-button>
                  <b-button
                    type="button"
                    variant="warning"
                    class="remove-button"
                    @click="editing=null, fetchNews()"
                  >
                    {{ $t('Cancel') }}
                  </b-button>
                  <b-button
                    v-b-modal.modal-xl
                    type="button"
                    variant="danger"
                    class="remove-button"
                    @click="selectedNews = newsItem"
                  >
                    {{ $t('actions.delete') }}
                  </b-button> 
                </div>
              </div>
            </div>
            <div v-else>
              {{ $t('dashboard.common.loading') }}
            </div>
          </b-card-text>
        </div>
      </b-card>
    </div>
  </b-container>
</template>

<script>
import moment from 'moment'

export default {
  props: {
  },
  data () {
    return {
      componentKey: 0,
      news: [],
      selectedNews: '',
      newsMeta: {
        totalPages: 0
      },
      editing: null,
      loaded: false,
      restrict: false,
      count: {
        online: 0,
        passive: 0,
        date: moment().format('YYYY-MM-DD hh:mm:ss'),
        offline: 0
      },
      newNews: {
        postedDate: moment(this.date).format('YYYY-MM-DD hh:mm:ss'),
        title: '',
        content: '',
        dateEdited: moment(this.date).format('YYYY-MM-DD hh:mm:ss'),
        removeDate: '',
        author: this.$auth.user.username,
        editedBy: ''
      },
      status: {
        online: true,
        passive: true,
        offline: true
      },
      updated: {},
      interval: {}
    }
  },
  computed: {
  },
  mounted () {
    this.fetchNews()
  },
  beforeUnmount () {
    this.$emit('refresh')
  },
  methods: {
    fetchNews () {
      this.news = []
      this.loaded = false
      let url = 'v1/news'
      this.$axios.get(url).then(
        (response) => {
          this.loaded = true
          this.news = response.data.data
          this.newsMeta = response.data.meta
        },
        () => {
          this.loaded = true
          this.newsMeta = {totalPages: 0}
        }
      )
    },
    deleteNews (news) {
      let id = news.id
      this.$axios.delete('v1/news/' + id).then(
      () => {
        this.fetchNews()
        this.$notifications.add({
          title: 'Success',
          type: 'success',
          body: this.$t('notifications.newsDelete'),
          timeout: true
        })
        this.$emit('delete')
      },
      (response) => {
        // let news = this.news.data
        this.fetchNews()
        this.$notifications.add({
          title: 'Error',
          type: 'danger',
          body: response.data.message || this.$t('notifications.newsDeleteError'),
          timeout: true
        })
      })
    },
    addNews () { // add news
      this.newNews.postedDate = moment(this.date).format('YYYY-MM-DD hh:mm:ss')
      this.$axios.post('v1/news', this.newNews).then(() => {
        this.fetchNews()
        this.$notifications.add({
          title: 'Added! - News with Title: ',
          type: 'success',
          body: this.newNews.title,
          timeout: true
        })
        this.$emit('finished')
      }, (response) => {
        if (response.data.error) {
          this.$notifications.add({
            title: 'Error',
            type: 'danger',
            body: response.data.message,
            timeout: true
          })
        }
      })
    },
    updateNews (news) { // update news
      let id = news.id
      // this.news.title = this.news.title
      // this.news.content = this.news.content
      this.$axios.post('v1/news/' + id, news).then(() => {
        this.$notifications.add({
          title: 'Edited!',
          type: 'success',
          body: this.news.title,
          timeout: true
        })
        this.$emit('finished')
      }, (response) => {
        if (response.data.error) {
          this.$notifications.add({
            title: 'Error',
            type: 'danger',
            body: response.data.message,
            timeout: true
          })
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.remove-button {
  margin-right: 0.2em;
}

.status-list {
  list-style: none;
  padding: 0;
  line-height: 1rem;
}

.online {
  svg {
    color: green;
    padding-right: 5px;
  }

  span {
    vertical-align: super;
  }
}

.passive {
  svg {
    color: yellow;
    padding-right: 5px;
  }

  span {
    vertical-align: super;
  }
}

.offline {
  svg {
    color: red;
    padding-right: 5px;
  }

  span {
    vertical-align: super;
  }
}
</style>
