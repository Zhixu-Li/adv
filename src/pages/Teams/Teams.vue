<template>
  <BContainer fluid>
    <BModal
      id="newteam"
      :title="$t('teams.newTeam')"
      size="lg"
      hide-footer
    >
      <NewTeam @refresh="fetchTeams()" />
    </BModal>

    <BRow
      id="top-area"
      class="header mt-3 pb-3 w-100"
      justify="between"
      no-gutters
    >
      <BCol class="d-none d-md-block">
        <h2>{{ $t('teams.teams') }}</h2>
        <p>{{ $t('tutorial.teamExample') }}</p>
      </BCol>

      <BCol class="d-md-none">
        <Multiselect
          :options="filteredTeams"
          track-by="teamId"
          label="name"
          :value="compSelected"
          :allow-empty="false"
          @select="selectTeam"
        />
      </BCol>

      <BCol
        align-self="center"
        cols="1"
        class="d-md-none pl-3"
      >
        <div @click="$bvModal.show('newteam')">
          <font-awesome-icon
            icon="plus"
            style="transform: scale(1.5);"
            title="New Team"
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

        <div class="new-item item" @click="$bvModal.show('newteam')">
          <font-awesome-icon
            icon="plus"
            class="text-dark"
            style="transform: scale(1.5);"
            title="New Team"
          />
        </div>

        <div
          v-for="team in filteredTeams"
          :key="team.teamId"
          class="pt-3 pb-3 item"
          :class="{ selected: compSelected.teamId === team.teamId }"
          @click="selectTeam(team)"
        >
          {{ team.name }}
          <BBadge variant="light" class="ml-2">
            {{ team.users.data.length }}
          </BBadge>
          <div class="text-muted">
            <small>{{ team.description }}</small>
          </div>
        </div>
      </BCol>

      <BCol cols="12" md="8" lg="10" class="h-100 overflow">
        <transition name="fade">
          <router-view
            v-if="filteredTeams.length > 0 && $route.params.teamId"
            :team="compSelected"
            @delete="deletePerformed"
          />
        </transition>
      </BCol>
    </BRow>
  </BContainer>
</template>


<script>
import NewTeam from '@/components/User/NewTeam.vue'
import _ from 'lodash'
// import 'vue-awesome/icons/arrow-left'
// import 'vue-awesome/icons/plus'
import verge from 'verge'
import Multiselect from 'vue-multiselect'
import {
  BContainer,
  BRow,
  BCol,
  BModal,
  BFormInput,
  BBadge
} from 'bootstrap-vue-next'


export default {
  name: 'Teams',
  components: {
    NewTeam,
    Multiselect,
    BContainer,
    BRow,
    BCol,
    BModal,
    BFormInput,
    BBadge,
  },
  data() {
    return {
      teams: [],
      loading: true,
      page: {
        name: 'Page1'
      },
      search: '',
    }
  },
  computed: {
    filteredTeams() {
      // consider sorting by team.name here - before filtering
      return _.sortBy(this.teams.filter((team) => {
        if (this.search === '') {
          return true
        } else {
          return team.name.toLowerCase().includes(this.search.toLowerCase())
        }
      }), function (i) {
        return i.name.toLowerCase()
      })
    },
    compSelected() {
      let selected = this.teams.find((team) => {
        if (team.teamId === parseInt(this.$route.params.teamId)) {
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
    filteredTeams() {
      this.updateRoute()
    }
  },
  mounted() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
    this.fetchTeams()
    this.updateRoute()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize: _.debounce(
      function () {
        let toparea = document.getElementById('top-area')
        let navbar = document.getElementById('navbar')
        let topheight = verge.rectangle(toparea).height
        let navbarheight = verge.rectangle(navbar).height
        let newheight = parseInt(verge.viewportH() - topheight - navbarheight) + 'px'
        document.getElementById('content-area').style.height = newheight
      }, 200),
    fetchTeams() {
      var scope = this
      this.loading = true
      this.$axios.get('v1/teams?limit=all&include=users,campaigns,displays').then(
        (response) => {
          this.teams = response.data.data.reverse()
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
          scope.loading = false
        }
      )
    },
    selectTeam(team) {
      this.$router.push({
        name: 'team',
        params: {
          teamId: team.teamId
        }
      })
    },
    deletePerformed() {
      this.$auth.refresh().then(
        () => {
          this.$root.$children[0].triggerUpdate()
        })
      this.fetchTeams()
    },
    updateRoute() {
      if (this.filteredTeams.length > 0) {
        let maybeId = this.$route.params?.teamId
        if (maybeId !== undefined) {
          let maybeTeam = this.filteredTeams.find(t => t.teamId == maybeId)
          if (maybeTeam !== undefined) {
            return this.$router.replace({
              name: 'team',
              params: {
                teamId: maybeId
              }
            })
          } else {
            return this.$router.replace({
              name: 'teams'
            })
          }
        }
        return this.$router.replace({
          name: 'team',
          params: {
            teamId: this.filteredTeams[0].teamId
          }
        })
      }
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
