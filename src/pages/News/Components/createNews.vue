<template lang="html">
  <BContainer>
    <div class="newspage">
      <BModal
        id="modal-xl"
        size="lg"
        :title="$t('actions.deleteNews') + selectedNews.title"
        hideFooter
      >
        <template #header>
          <h2 class="text-center">
            {{ $t() }} {{ selectedNews.title }}
          </h2>
        </template>

        {{ $t('message.newsDelete') }}

        <div>
          <BButton
            type="button"
            variant="danger"
            class="remove-button"
            @click="deleteNews(selectedNews); $bvModal.hide('modal-xl')"
          >
            {{ $t('answers.yes') }}
          </BButton>
          <BButton
            type="button"
            variant="primary"
            @click="$bvModal.hide('modal-xl')"
          >
            {{ $t('answers.no') }}
          </BButton>
        </div>
      </BModal>

      <BCard class="mb-3">
        <h4 class="card-title">{{ $t('admin.createNews') }}</h4>
        {{ $t('admin.title') }}
        <BFormInput
          v-model="newNews.title"
          placeholder="Title"
          class="mb-2"
        />
        {{ $t('admin.body') }}
        <BFormTextarea
          v-model="newNews.content"
          placeholder="Body"
          rows="3"
          class="mb-2"
        />
        <BButton
          variant="primary"
          @click="addNews()"
        >
          Submit
        </BButton>
      </BCard>

      <BCard>
        <h4 class="card-title">{{ $t('Current news list') }}</h4>
        <BCardText>
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
                <BFormInput
                  v-if="editing === newsItem.id"
                  v-model="newsItem.title"
                  class="form-control border-bottom mb-1"
                />
                {{ $t('news.postedBy') }} {{ newsItem.author }} {{ $t('news.on') }} {{ newsItem.postedDate }}
              </p>
              <p v-if="editing !== newsItem.id">{{ newsItem.content }}</p>
              <p>
                <BFormTextarea
                  v-if="editing === newsItem.id"
                  v-model="newsItem.content"
                  rows="3"
                  class="form-control mb-1"
                />
              </p>

              <BButton
                v-if="editing !== newsItem.id"
                variant="primary"
                @click="editing = newsItem.id"
              >
                {{ $t('buttons.edit') }}
              </BButton>
              <template v-else>
                <BButton
                  variant="primary"
                  class="remove-button"
                  @click="editing = null; updateNews(newsItem)"
                >
                  {{ $t('Submit') }}
                </BButton>
                <BButton
                  variant="warning"
                  class="remove-button"
                  @click="editing = null; fetchNews()"
                >
                  {{ $t('Cancel') }}
                </BButton>
                <BButton
                  variant="danger"
                  class="remove-button"
                  v-b-modal.modal-xl
                  @click="selectedNews = newsItem"
                >
                  {{ $t('actions.delete') }}
                </BButton>
              </template>
            </div>
          </div>
          <div v-else>
            {{ $t('dashboard.common.loading') }}
          </div>
        </BCardText>
      </BCard>
    </div>
  </BContainer>
</template>
<script>
import moment from 'moment'
import {
  BContainer,
  BCard,
  BCardText,
  BModal,
  BButton,
  BFormInput,
  BFormTextarea
} from 'bootstrap-vue-next'
export default {
  components:{
  BContainer,
  BCard,
  BCardText,
  BModal,
  BButton,
  BFormInput,
  BFormTextarea
  },
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
