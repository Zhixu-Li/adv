<template lang="html">
  <BContainer fluid>
    <BModal
      id="newdisplay"
      :title="$t('displays.newDisplay')"
      size="lg"
      hide-footer
    >
      <NewDisplay
        v-if="activeTeam.id !== 0"
        :active-team="activeTeam"
        @refresh-displays="savedUpdate"
      />
    </BModal>

    <BRow
      id="top-area"
      class="header mt-3 pb-3 w-100"
      no-gutters
    >
      <BCol class="d-none d-md-block">
        <h2>{{ $t('displays.displays') }}</h2>
        <p>{{ $t('tutorial.displaysExample') }}</p>
      </BCol>

      <BCol cols="11" class="d-md-none">
        <Multiselect
          :options="filtered"
          track-by="displayId"
          label="name"
          :value="compSelected"
          :allow-empty="false"
          @select="selectDisplay"
        />
      </BCol>
      <BCol align-self="center" cols="1" class="d-md-none pl-3">
        <div @click="newDisplay()">
          <font-awesome-icon
            icon="plus"
            style="transform: scale(1.5);"
            title="New Display"
            class="text-dark"
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
        <div class="new-item item" @click="newDisplay()">
          <font-awesome-icon
            icon="plus"
            style="transform: scale(1.5);"
            title="New Display"
            class="text-dark"
          />
        </div>
        <div
          v-for="display in filtered"
          :id="'d_' + display.displayId"
          :key="display.displayId"
          class="pt-3 pb-3 item"
          :title="clients[display.hardwareId]
            ? 'Online'
            : 'Offline (last connected: ' + display.lastConnected + ')'"
          :class="{ selected: compSelected.displayId === display.displayId }"
          @click="selectDisplay(display)"
        >
          <p class="mb-0">
            <font-awesome-icon
              v-if="clients[display.hardwareId]"
              icon="face-smile"
              class="bg-white rounded-circle text-success"
            />
            <font-awesome-icon
              v-else
              icon="face-frown"
              class="bg-white rounded-circle text-danger"
            />
            {{ display.name }}
          </p>
          <div class="text-muted">
            <small>
              {{ display.pixelWidth === 0
                ? '(LCD native)'
                : `${display.pixelWidth}x${display.pixelHeight} px` }}
            </small>
          </div>
          <div v-if="$auth.user.admin" class="text-muted">
            <small>{{ display.hardwareId }}</small>
          </div>
          <div v-if="$auth.user.admin" class="text-muted">
            <small>{{ display.acid }}</small>
          </div>
        </div>
      </BCol>

      <BCol cols="12" md="8" lg="10" class="h-100 overflow">
        <transition name="fade">
          <router-view
            v-if="filtered.length && $route.params.displayId && compSelected.displayId"
            class="h-100"
            :display="compSelected"
            :active-team="activeTeam"
            @delete="fetchDisplays"
            @refresh-displays="refreshDisplays"
          />
        </transition>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
// import 'vue-awesome/icons/arrow-left'
// import 'vue-awesome/icons/plus'
import _ from 'lodash'
import {
  BContainer,
  BRow,
  BCol,
  BModal,
  BFormInput
} from 'bootstrap-vue-next'
import Multiselect from 'vue-multiselect'
import autoResize from '@/mixins/autoResize'
import teamContext from '@/mixins/teamContext'
import newDisplay from './Components/NewDisplay.vue'

export default {
  name: 'Displays',
  components: {
    Multiselect,
    newDisplay,
    BContainer,
    BRow,
    BCol,
    BModal,
    BFormInput,
  },
  mixins: [teamContext, autoResize],
  data() {
    return {
      displays: [],
      page: {
        name: 'Page0'
      },
      display: {},
      search: '',
      loading: true,
      fetcher: Number(),
      clients: {},
    }
  },
  computed: {
    filtered() {
      return _.sortBy(this.displays.filter((display) => {
        if (this.search === '') {
          return true
        } else {
          for (var t = 0; t < display.tags.data.length; t++) {
            if (display.tags.data[t].tag.toLowerCase().includes(this.search.toLowerCase())) {
              return true
            }
          }
          return display.name.toLowerCase().includes(this.search.toLowerCase())
        }
      }), function (i) {
        return i.name.toLowerCase()
      })
    },
    compSelected() {
      let selected = this.displays.find((display) => {
        if (display.displayId === parseInt(this.$route.params.displayId)) {
          return true
        } else {
          return false
        }
      })
      if (selected)
        return selected
      else
        return {}
    }
  },
  watch: {
    filtered() {
      this.updateRoute()
    },
    'activeTeam': function() {
      this.loading = true
      this.fetchDisplays()
    },
  },
  mounted() {
    this.fetchDisplays()
    this.updateRoute()
    this.timer = setInterval(() => {
      this.getClients()
    }, 10000)
    this.getClients()
  },
  unmounted() {
    clearInterval(this.fetcher)
  },
  methods: {
    getClients() {
      this.$axios.get(process.env.VUE_APP_NETWORK_ENDPOINT + 'clients', {
        headers: {}
      }).then(
        (response) => {
          this.clients = response.data
        },
        () => {

        })
    },
    updateRoute() {
      if (this.filtered.length > 0) {
        let maybeId = this.$route.params?.displayId
        if (maybeId !== undefined) {
          let maybeDisplay = this.filtered.find(d => d.displayId == maybeId)
          if (maybeDisplay !== undefined) {

              this.$nextTick(() => {
                const dId = document.querySelector('#d_'+maybeId)
                if (dId)
                  this.$refs.sidebar.scrollTop = dId.offsetTop
              })

            return this.$router.replace({
              name: 'display-view',
              params: {
                displayId: maybeId
              }
            })
          } else {
            return this.$router.replace({
              name: 'displays'
            })
          }
        }
        return this.$router.replace({
          name: 'display-view',
          params: {
            displayId: this.filtered[0].displayId
          }
        })
      }
    },
    savedUpdate() {
      this.$bvModal.hide('newdisplay');
      this.fetchDisplays();
    },
    refreshDisplays() {
      this.fetchDisplays()
    },
    selectDisplay(display) {
      this.$router.push({
        name: 'display-view',
        params: {
          displayId: display.displayId
        }
      })
    },
    fetchDisplays() {
      var scope = this
      this.loading = true
      let url = 'v1/displays?limit=all&include=tags&team=' + parseInt(this.activeTeam.id)
      this.$axios.get(url).then(
        (response) => {
          this.displays = response.data.data.reverse()
          this.meta = response.data.meta
          this.loading = false
        }
      ).catch(
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
          scope.displays = []
          scope.loading = false
        }
      )
    },
    newDisplay() {
      this.$bvModal.show('newdisplay')
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
