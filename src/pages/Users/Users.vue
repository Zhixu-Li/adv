<template>
  <BContainer fluid>
    <BRow
      id="top-area"
      class="header mt-3 pb-3 w-100"
      no-gutters
    >
      <BCol class="d-none d-md-block">
        <h2>{{ $t('user.users') }}</h2>
        <p>{{ $t('tutorial.usermanagementExample') }}</p>
      </BCol>
      <BCol class="d-md-none">
        <multiselect
          :options="filteredUsers"
          track-by="userId"
          label="username"
          :value="compSelected"
          :allow-empty="false"
          @select="selectUser"
        />
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
        <div
          v-for="user in filteredUsers"
          :key="user.userId"
          class="pb-3 pt-3 item"
          :class="{ selected: compSelected.userId === user.userId }"
          @click="selectUser(user)"
        >
          {{ user.username }}
        </div>
      </BCol>

      <BCol
        cols="12"
        md="8"
        lg="10"
        class="h-100 overflow"
      >
        <transition name="fade">
          <router-view 
            v-if="filteredUsers.length > 0 && $route.params.userId && Object.keys(compSelected).length > 0"
            :user="compSelected" 
            @delete="fetchUsers" 
            @refresh="fetchUsers"
          />
        </transition>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
// import 'vue-awesome/icons/arrow-left'
import _ from 'lodash'
import verge from 'verge'
import Multiselect from 'vue-multiselect'
import {
  BContainer,
  BRow,
  BCol,
  BFormInput
} from 'bootstrap-vue-next'
export default {
  name: 'Users',
  components: {
    Multiselect,
    BContainer,
    BRow,
    BCol,
    BFormInput,
  },
  data() {
    return {
      users: [],
      show: false,
      search: '',
      loading: true
    }
  },
  computed: {
    filteredUsers() {
      // consider sorting by user.username here - before filtering
      return _.sortBy(this.users.filter((user) => {
        if (this.search === '') {
          return true
        } else {
          return user.username.toLowerCase().includes(this.search.toLowerCase())
        }
      }), function (i) {
        return i.username.toLowerCase()
      })
    },
    compSelected() {
      let selected = this.users.find((user) => {
        if (user.userId === parseInt(this.$route.params.userId)) {
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
    filteredUsers() {
      this.updateRoute()
    }
  },
  mounted() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
    this.fetchUsers()
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
    fetchUsers() {
      var scope = this
      this.loading = true
      this.$axios.get('v1/users?limit=all').then(
        (response) => {
          this.users = response.data.data.reverse()
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
    selectUser(user) {
      this.$router.push({
        name: 'user-view',
        params: {
          userId: user.userId
        }
      })
    },
    updateRoute() {
      if (this.filteredUsers.length > 0) {
        let maybeId = this.$route.params?.userId
        if (maybeId !== undefined) {
          let maybeUser = this.filteredUsers.find(u => u.userId == maybeId)
          if (maybeUser !== undefined) {
            return this.$router.replace({
              name: 'user-view',
              params: {
                userId: maybeId
              }
            })
          } else {
            return this.$router.replace({
              name: 'users'
            })
          }
        }
        return this.$router.replace({
          name: 'user-view',
          params: {
            userId: this.filteredUsers[0].userId
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
