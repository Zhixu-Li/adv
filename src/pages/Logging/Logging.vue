<template>
  <b-container
    fluid
    class="h-100"
  >
    <b-row
      id="top-area"
      class="header mt-3 pb-3 w-100"
      no-gutters
    >
      <b-col
        class="d-none d-md-block"
        cols="3"
        md="12"
      >
        <h2>{{ $t('index.logging') }}</h2>
        <p>{{ $t('tutorial.loggingExample') }}</p>
      </b-col>
      <b-col class="d-md-none">
        <multiselect
          :options="filteredBookings"
          track-by="id"
          :custom-label="labelGenerator"
          :value="compSelected"
          :searchable="false"
          :allow-empty="false"
          @select="selectBooking"
        />
      </b-col>
    </b-row>

    <b-row
      v-if="loading"
      id="content-area"
    >
      <div class="spinner" />
    </b-row>

    <b-row
      v-else
      id="content-area"
    >
      <b-col
        ref="sidebar"
        md="4"
        lg="2"
        class="d-none d-md-block h-100 overflow list"
      >
        <b-form-input
          id="search"
          v-model="search"
          class="search"
          :placeholder="$t('actions.search')"
        />
        <button
          type="button"
          style="width: 100%"
          class="btn btn-outline-success"
          @click="togglePaid()"
        >
          {{ $t('buttons.paidOnly') }}
          {{ paid === true ? '☑' : '☐' }}
        </button>
        <div
          v-for="booking in filteredBookings"
          :id="'l_' + booking.id"
          :key="booking.id"
          class="pt-3 pb-3 item"
          :class="{ selected: compSelected.id === booking.id }"
          @click="selectBooking(booking)"
        >
          <p class="mb-0">
            <span class="font-weight-bold">{{ booking.campaignName }}</span> on
          </p>
          <p class="mb-0 font-weight-bold">
            {{ booking.displayName }}
          </p>
          <p>Start: {{ booking.startDate }}</p>
        </div>
      </b-col>

      <b-col
        cols="12"
        md="8"
        lg="10"
        class="h-100 overflow"
      >
        <transition name="fade">
          <router-view
            v-if="compSelected !== {} && filteredBookings.length > 0"
            :booking="compSelected"
          />
        </transition>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
// import 'vue-awesome/icons/arrow-left'
// import 'vue-awesome/icons/plus'
import moment from 'moment'
import teamContext from '@/mixins/teamContext'
import autoResize from '@/mixins/autoResize'
import Multiselect from 'vue-multiselect'


export default {
  name: 'Logging',
  components: {
    Multiselect,
  },
  mixins: [teamContext, autoResize],
  data() {
    return {
      date: moment().format('YYYY-MM-DD'),
      search: '',
      bookings: [],
      errors: [],
      loading: true, //reset
      paid: false
    }
  },
  computed: {
    filteredBookings() {
      return this.bookings.filter((booking) => {
        if (booking.displayTeamId === this.activeTeam.id || booking.advertiserId === this.activeTeam.id) {
          if (this.restrict === false) {
            return true
          } else {
            return booking.endDate >= this.date && (booking.approval === 'approved' || booking.approval === 'pending')
          }
        }
      }).filter((booking) => {
        if (this.search === '') {
          return true
        } else {
          return booking.campaignName.toLowerCase().includes(this.search.toLowerCase()) || booking.displayName.toLowerCase().includes(this.search.toLowerCase()) || booking.startDate.toLowerCase().includes(this.search.toLowerCase()) || booking.endDate.toLowerCase().includes(this.search.toLowerCase())
        }
      }).filter((booking) => {
        if (this.paid === false) {
          return true
        } else {
          return booking.invoice != null && booking.invoice.data.total > 0
        }
      })
    },
    compSelected() {
      let selected = this.bookings.find((booking) => {
        if (booking.id === parseInt(this.$route.params.bookingId)) {
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
    filteredBookings() {
      this.updateRoute()
    }
  },
  mounted() {
    this.fetchBookings()
  },
  beforeUnmount() {
  },
  methods: {
    updateRoute() {
      if (this.activeTeam.id !== 0 && this.filteredBookings != 0) {
        if (this.$route.params.bookingId && this.filteredBookings.length > 0) {
          let booking = this.filteredBookings.find(
            (booking) => {
              return booking.id === this.$route.params.campaignId
            }
          )
          this.$router.replace({ name: 'log', params: { bookingId: booking !== undefined ? booking : this.filteredBookings[0].id }})
           this.$nextTick(() => {
              const lId = document.querySelector('#l_'+booking.id)
              if (lId)
                this.$refs.sidebar.scrollTop = lId.offsetTop
            })
        } else if (this.bookings.length > 0) {
          this.$router.replace({ name: 'log', params: { bookingId: this.bookings[0].id }})}
      } else {
        this.$router.replace({ name: 'logging' })
      }
    },
    fetchBookings() {
      this.$axios.get('v1/scheduling/index?limit=all&complete=true&include=invoice&dropexpired=true').then((response) => {
        this.bookings = response.data.data.reverse()
        this.loading = false
      })
    },
    selectBooking(booking) {
      this.$router.push({
        name: 'log',
        params: {
          bookingId: booking.id
        }
      })
    },
    togglePaid() {
      this.paid = !this.paid
    },
    labelGenerator (item) {
      if (item.campaignName && item.displayName) {
        return item.campaignName + ' on ' + item.displayName
      }
      return ''
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
