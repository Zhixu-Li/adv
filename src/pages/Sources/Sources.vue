<template>
  <BContainer fluid>
    <BRow
      id="top-area"
      class="header mt-3 pb-3 w-100"
      no-gutters
    >
      <BCol class="d-none d-md-block">
        <h2>{{ $t('sources.sources') }}</h2>
        <p>{{ $t('tutorial.sources') }}</p>
      </BCol>
      <BCol class="d-md-none">
        <Multiselect
          :options="filtered"
          track-by="sourceId"
          label="name"
          :value="compSelected"
          :allow-empty="false"
          @select="selectSource"
        />
      </BCol>
      <BCol
        align-self="center"
        cols="1"
        class="d-md-none pl-3"
      >
        <div v-b-modal.new-source>
          <font-awesome-icon
            icon="plus"
            size="lg"
            aria-label="New Source"
          />
        </div>
      </BCol>
    </BRow>

    <BRow v-if="loading" id="content-area">
      <div class="spinner" />
    </BRow>

    <BRow v-else id="content-area">
      <BCol
        ref="sidebar"
        md="4"
        lg="2"
        class="d-none d-md-block h-100 overflow list"
      >
        <BFormInput
          id="search"
          v-model="search"
          class="search"
          :placeholder="$t('actions.search')"
        />
        <div v-b-modal.new-source class="new-item item">
          <font-awesome-icon
            icon="plus"
            size="lg"
            aria-label="New Source"
          />
        </div>
        <div
          v-for="source in filtered"
          :id="'s_' + source.sourceId"
          :key="source.sourceId"
          class="pt-3 pb-3 item"
          :class="{ selected: compSelected?.sourceId === source.sourceId }"
          @click="selectSource(source)"
        >
          {{ source.name }}
        </div>
      </BCol>

      <BCol cols="12" md="8" lg="10" class="h-100 overflow">
        <transition name="fade">
          <router-view
            v-if="!loading && $route.params.sourceId && compSelected?.sourceId"
            :active-team="activeTeam"
            :source="compSelected"
            @update="fetchSources"
          />
        </transition>
      </BCol>
    </BRow>

    <BModal
      id="new-source"
      size="lg"
      no-fade
      no-close-on-backdrop
      hide-footer
    >
      <NewSource
        :active-team="activeTeam"
        @refresh="fetchSources"
      />
    </BModal>
  </BContainer>
</template>

<script>
import NewSource from '@/pages/Sources/NewSource.vue'
// import 'vue-awesome/icons/arrow-left'
// import 'vue-awesome/icons/plus'
import teamContext from '@/mixins/teamContext'
import autoResize from '@/mixins/autoResize'
import Multiselect from 'vue-multiselect'
import {
  BContainer,
  BRow,
  BCol,
  BFormInput,
  BModal
} from 'bootstrap-vue-next'

export default {
  name: 'Sources',
  components: {
    NewSource,
    Multiselect,
    BContainer,
    BRow,
    BCol,
    BFormInput,
    BModal,
  },
  mixins: [teamContext, autoResize],
  data () {
    return {
      newSource: {},
      sources: [],
      created: false,
      loading: true,
      errors: [],
      search: '',
    }
  },
  computed: {
    filtered () {
      return this.sources.filter((source) => {
        if (this.search === '') {
          return true
        } else {
          return source.name.toLowerCase().includes(this.search.toLowerCase())
        }
      })
    },
    modalSize () {
      return this.created ? 'xl' : ''
    },
    compSelected() {
      let selected = this.sources.find((source) => {
        if (source.sourceId === parseInt(this.$route.params.sourceId)) {
          return true
        } else {
          return false
        }
      })
      if (selected) {
        return selected
      } else
        return {}
    }
  },
  watch: {
    filtered () {
      this.updateRoute()
    },
    'activeTeam': function() {
      this.loaded = false
      this.fetchSources()
    },
  },
  mounted () {
    this.fetchSources()
    this.updateRoute()
  },
  beforeUnmount () {
  },
  methods: {
    updateRoute () {
        if (this.filtered.length > 0) {
          let maybeId = this.$route.params?.sourceId
          if (maybeId !== undefined) {
            let maybeObject = this.filtered.find(d => d.sourceId == maybeId)
            if (maybeObject !== undefined) {
              this.$nextTick(() => {
                const sId = document.querySelector('#s_'+maybeId)
                if (sId)
                  this.$refs.sidebar.scrollTop = sId.offsetTop
              })
              return this.$router.replace({ name: 'source', params: { sourceId: maybeId } })
            }
            else {
              return this.$router.replace({ name: 'sources' })
            }
          }
          return this.$router.replace({ name: 'source', params: { sourceId: this.filtered[0].sourceId } })
        }
    },
    fetchSources() {
      var scope = this
      this.loading = true
      let url = 'v1/sources?limit=all&restrict=true&team=' + parseInt(this.activeTeam.id)
      this.$axios.get(url).then(
        (response) => {
          this.sources = response.data.data.reverse()
          this.meta = response.data.meta
          this.changing = false
          this.loading = false
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
          scope.sources = []
          scope.loading = false
        }
      )
    },
    selectSource (source) {
      this.$router.push({ name: 'source', params: { sourceId: source.sourceId } })
    },
    refreshSources () {
      if (this.$router.currentRoute.name === 'sources') {
        this.fetchSources()
      }
    },
    close () {
      this.source = {}
      this.newSource = {}
      this.created = false
      this.fetchSources()
    }
  }
}
</script>

<style scoped lang="scss">
.header {
  display: inline-flex;
  background-color: white;
  z-index: 100;
  border-bottom: 1px #e9e9e9 solid;
}

.item:hover,
.selected {
  background-color: #e6e6e6;
}

.item {
  cursor: pointer;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  line-height: 1.25;
  padding-top: .425rem;
  padding-bottom: .425rem;
  padding-left: 20px;
  display: block;
  border-bottom: #e9e9e9 solid 1px;
}

.overflow {
  overflow-y: auto;
  display: block;
}

.search {
  width: 100%;
  height: 54px;
  border: none;
  text-align: center;
  border-bottom: 1px #e9e9e9 solid;
}

.new-item {
  padding-left: 0;
  text-align: center;
}

.list {
  border-right: #e9e9e9 solid 1px;
  padding: 0px;
}

.spinner {
  margin-left: auto;
  margin-right: auto;
  margin-top: auto;
  margin-bottom: auto;
}
</style>
