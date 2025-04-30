<template>
  <b-row v-if="$auth.user.admin">
    <b-col class="text-center mt-3">
      <h2>{{ $t('schedule.adminSchedule') }}</h2>
    </b-col>
  </b-row>
  <b-row
    v-else
    class="h-100"
  >
    <b-modal
      id="pinconfirm"
      :title="selectedDisplay.name"
      size="md"
      hide-footer
    >
      <display-gallery :display-id="Number(selectedDisplay.displayId)" />
      <b-card class="mt-1">
        <b-table-simple
          v-if="selectedDisplay && !searchedForBookings"
          borderless
          small
        >
          <b-tr>
            <b-th>
              Daily
            </b-th>
            <b-th>
              Weekly
            </b-th>
            <b-th>
              Monthly
            </b-th>
          </b-tr>
          <b-tr>
            <b-td>
              <!-- ${{((selectedDisplay.baselinePrice.price_per_second))*15*(86400/selectedDisplay.blockTime) | money}} -->
              ${{ moneyFormat(((selectedDisplay.baselinePrice.price_per_second))*15*(86400/selectedDisplay.blockTime)) }}
            </b-td>
            <b-td>
              <!-- ${{((selectedDisplay.baselinePrice.price_per_second))*15*(86400*7/selectedDisplay.blockTime) | money}} -->
              ${{ moneyFormat(((selectedDisplay.baselinePrice.price_per_second))*15*(86400*7/selectedDisplay.blockTime)) }}
            </b-td>
            <b-td>
              <!-- ${{((selectedDisplay.baselinePrice.price_per_second))*15*(86400*30/selectedDisplay.blockTime) | money}} -->
              ${{ moneyFormat(((selectedDisplay.baselinePrice.price_per_second))*15*(86400*30/selectedDisplay.blockTime)) }}
            </b-td>
          </b-tr>
        </b-table-simple>
        <strong v-else-if="selectedDisplay && searchedForBookings">{{ $t('map.costOfBooking') }}: <span
          class="float-right"
        >${{ formatMoney(selectedDisplay.price) }}</span></strong>
        <p>{{ selectedDisplay.description }}</p>
        <hr>
        <small>
          <p><em>Display Contact: {{ selectedDisplay.contact_email }}</em> <br>
            <em>Maximum Campaign Length: {{ selectedDisplay.maxTimePurchasable }}s</em></p>
        </small>
      </b-card>
      <b-collapse
        v-model="modalDetails"
        class="mt-1"
      >
        <b-card
          v-if="searchedForBookings"
          :header="$t('map.bookingDetails')"
        >
          <b-table-simple
            borderless
            small
          >
            <b-tr>
              <b-th>
                {{ $t('campaigns.campaign') }}
              </b-th>
              <b-td>
                {{ selectedCampaign.name }}
              </b-td>
            </b-tr>
            <b-tr>
              <b-th v-if="daterange.search(' to ')>0">
                {{ $t('dateTime.dateRange') }}
              </b-th>
              <b-th v-else>
                {{ $t('dateTime.date') }}
              </b-th>
              <b-td>
                {{ daterange }}
              </b-td>
            </b-tr>
            <b-tr>
              <b-th>
                {{ $t('dateTime.dailyTimes') }}
              </b-th>
              <b-td v-if="times[0]==='00:00:00' && times[1]==='24:00:00'">
                {{ $t('dateTime.allDay') }}
              </b-td>
              <b-td v-else>
                {{ times[0] }} to {{ times[1] }}
              </b-td>
            </b-tr>
          </b-table-simple>
        </b-card>
      </b-collapse>
      <b-button
        v-if="searchedForBookings"
        class="mt-1"
        small
        variant="secondary"
        @click="modalDetails = !modalDetails"
      >
        {{ modalDetails? 'Hide':'View' }} Booking Details
      </b-button>
      <b-button
        v-if="searchedForBookings"
        class="float-right mt-1"
        variant="primary"
        @click="addToCart(); $bvModal.hide('pinconfirm')"
      >
        {{ $t('map.addToCart') }}
      </b-button>
    </b-modal>
    <b-col
      cols="12"
      md="8"
      xl="9"
      class="h-100 p-0"
    >
      <l-map
        :zoom="mapSettings.zoom"
        :center="mapCenter"
        :options="mapSettings.options"
        @update:bounds="getDisplays"
        @ready="mapCenter={lat: -34.98385,lng: 138.57395}"
      >
        <l-tile-layer
          :options="{ maxZoom: 13 }"
          :url="mapSettings.url"
          :attribution="mapSettings.attribution"
        />
        <div v-if="!loading">
          <div v-if="!searchedForBookings && type=='All'">
            <l-marker
              v-for="display in displaysPrivate"
              :key="display.displayId"
              :icon="mapSettings.iconPrivate"
              :lat-lng="{lat: display.latitude, lng: display.longitude}"
              :z-index-offset="-100"
            />
          </div>
          <l-marker
            v-for="display in filteredDisplays"
            :key="display.displayId"
            :icon="display.type==='LCD'&& display.pixelHeight===0 && display.pixelWidth===0 ? mapSettings.iconLcd : mapSettings.iconLed"
            :lat-lng="{lat: display.latitude, lng: display.longitude}"
            @click="selectedDisplay = display;$bvModal.show('pinconfirm')"
          />
        </div>
      </l-map>
    </b-col>
    <b-col
      class="sidebar"
      cols="12"
      md="4"
      xl="3"
    >
      <b-card
        class="mt-3"
        :title="$t('map.searchOptions')"
      >
        <b-card-text>
          <b-form>
            <b-form-group
              id="type-group"
              :label="$t('map.displayType')"
              label-for="type"
            >
              <b-form-select
                id="type"
                v-model="type"
                :options="typeOptions"
                selected="All"
                required
              />
            </b-form-group>
          </b-form>
        </b-card-text>
      </b-card>
      <div v-if="campaigns.length > 0 && !searchedForBookings">
        <b-card
          class="mt-3"
          :title="$t('map.bookingOptions')"
        >
          <b-card-text>
            <b-form>
              <b-form-group
                id="campaign-group"
                :label="$t('campaigns.campaignCap')"
                label-for="campaign"
              >
                <b-form-select
                  id="campaign"
                  v-model="selectedCampaign"
                  :options="campaigns"
                  required
                />
              </b-form-group>
            </b-form>
            <div class="mt-1">
              <campaign
                style="height: 18vh"
                :media="previewMedia"
                no-controls
              />
            </div>
            <hr class="mt-0">
            <b-form>
              <b-form-group
                id="date-group"
                :label="$t('map.date')"
                label-for="dateRangePicker"
              >
                <flatpickr
                  id="dateRangePicker"
                  v-model="daterange"
                  :options="flatpickrOptions"
                  :placeholder="$t('dateTime.dateSelect')"
                />
              </b-form-group>
              <br>
              <b-button-group
                size="sm"
                class="pb-3"
              >
                <b-button 
                  v-for="(btn, idx) in buttons"
                  v-show="btn.visible"
                  :key="idx"
                  v-model:pressed="btn.state"
                  :variant="btn.variant"
                  @mouseover="hover(true, btn)"
                  @mouseleave="hover(false, btn)"
                >
                  {{ btn.value }}
                </b-button>
              </b-button-group>
              <p><small>{{ dayCount ? dayCount : 'No' }} days selected.</small></p>
              <b-form-group>
                {{ $t('dateTime.weekSkip') }}
                <b-dropdown
                  size="sm"
                  variant="outline-primary"
                  :text="skippedWeeks"
                >
                  <b-dropdown-item @click="skippedWeeks = 'Do Not Skip'">
                    Do Not Skip
                  </b-dropdown-item>
                  <b-dropdown-item @click="skippedWeeks = 'Second Week'">
                    Second Week
                  </b-dropdown-item>
                  <b-dropdown-item @click="skippedWeeks = 'Third Week'">
                    Third Week
                  </b-dropdown-item>
                </b-dropdown>
              </b-form-group>
              <b-row class="mt-1">
                <p v-if="times[0]==='00:00:00' && times[1]==='24:00:00'">
                  {{ $t('checkout.dailyPlay') }}
                </p>
                <p v-else>
                  {{ $t('checkout.daily') }} {{ times[0] }} to {{ times[1] }}
                </p>
                <slider v-model="times" />
              </b-row>
              <b-button
                :disabled="!ready"
                variant="primary"
                class="mt-1"
                @click="searchedForBookings=true;filterDisplays()"
              >
                {{ $t('map.findDisplays') }}
              </b-button>
              <div v-if="cart.length">
                <hr>
                <b-button
                  class="w-100"
                  :to="{name: 'Checkout'}"
                >
                  <v-icon
                    name="shopping-cart"
                    class="icon"
                  /> {{ $t('checkout.checkout') }} <b-badge
                    class="ml-1"
                    variant="primary"
                  >
                    {{ cart.length }}
                  </b-badge>
                </b-button>
              </div>
            </b-form>
          </b-card-text>
        </b-card>
      </div>
      <b-card
        v-else-if="searchedForBookings"
        per-page="5"
        class="mt-3  mb-3"
      >
        <b-card-title>
          {{ $t('map.searchOptions') }}
          <b-button
            v-if="!loading"
            class="float-right"
            size="sm"
            variant="primary"
            @click="searchedForBookings=false; filterDisplays()"
          >
            <!-- <v-icon name="arrow-circle-left"> </v-icon> -->
            <font-awesome-icon icon="arrow-circle-left" />
            <span class="d-none d-xl-inline"> {{ $t('buttons.back') }}</span>
          </b-button>
        </b-card-title>
        <b-card-text>
          <div v-if="!loading">
            <!-- <b-form>
              <b-form-group class="mb-1" id="sort-group" label="Sort by:" label-for="sort">
                <b-form-select id="sort" v-model="sort" :options="sortOptions" required></b-form-select>
              </b-form-group>
            </b-form> -->
            <div class="list-view mb-3">
              <b-list-group>
                <b-list-group-item
                  v-for="item in filteredDisplays"
                  :key="item.displayId"
                  button
                  @click="selectedDisplay = item; $bvModal.show('pinconfirm')"
                >
                  <p class="mb-0">
                    {{ item.name }}
                  </p>
                  <p class="mb-0">
                    <b-badge
                      :variant="item.type==='LCD'&& item.pixelHeight===0 && item.pixelWidth===0 ? 'success' :'danger' "
                      pill
                    >
                      <span v-if="item.type==='LCD'&& item.pixelHeight===0 && item.pixelWidth===0">LCD</span><span
                        v-else
                      >LED</span>
                    </b-badge> <span class="float-right">${{ formatMoney(item.price) }}</span>
                  </p>
                </b-list-group-item>
              </b-list-group>
            </div>
            <hr>
            <b-button
              v-if="cart.length"
              class="w-100"
              :to="{name: 'Checkout'}"
            >
              <!-- <v-icon name="shopping-cart" class="icon" />  -->
              <font-awesome-icon
                icon="shopping-cart"
                class="icon"
              />{{ $t('checkout.checkout') }} <b-badge
                class="ml-1"
                variant="primary"
              >
                {{ cart.length }}
              </b-badge>
            </b-button>
          </div>
          <div v-else>
            <h4>{{ $t('map.preparingDisplays') }}</h4>
            <b-spinner
              style="width: 3rem; height: 3rem; margin-left: auto; margin-right: auto"
              label="Large Spinner"
            />
          </div>
        </b-card-text>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { latLng, icon } from 'leaflet'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import Flatpickr from '@/components/Flatpickr.vue'
import moment from 'moment'
// import 'vue-awesome/icons/arrow-circle-left'
// import 'vue-awesome/icons/shopping-cart'
import Campaign from '@/components/Preview/Campaign.vue'
import DisplayGallery from '@/components/DisplayGallery.vue'
import Slider from '@/components/Slider.vue'


// import noUiSlider from 'nouislider'

require('leaflet/dist/leaflet.css')

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    Flatpickr,
    Campaign,
    DisplayGallery,
    Slider
  },
  props: {
    activeTeam: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      buttons: [
        { value: 'Mon', state: false, full: "Monday", visible: true, variant: "outline-primary" },
        { value: 'Tue', state: false, full: "Tuesday", visible: true, variant: "outline-primary" },
        { value: 'Wed', state: false, full: "Wednesday", visible: true, variant: "outline-primary" },
        { value: 'Thu', state: false, full: "Thursday", visible: true, variant: "outline-primary" },
        { value: 'Fri', state: false, full: "Friday", visible: true, variant: "outline-primary" },
        { value: 'Sat', state: false, full: "Saturday", visible: true, variant: "outline-primary" },
        { value: 'Sun', state: false, full: "Sunday", visible: true, variant: "outline-primary" }
      ],
      typeOptions: [
        'All',
        'LCD',
        'LED'
      ],
      displays: [],
      displaysPrivate: [],
      cart: this.$cart.store,
      mapSettings: {
        url: process.env.VUE_APP_MAP_PROVIDER_URL,
        attribution: 'Map tiles by <a href="//stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        zoom: 12,
        options: {
          zoomSnap: 0.5
        },
        iconLed: icon({
          iconUrl: require('@/assets/pin-led.png'),
          shadowUrl: require('@/assets/shadow.png'),
          iconSize: [30, 45],
          iconAnchor: [0, 42],
          popupAnchor: [15, -20]
        }),
        iconPrivate: icon({
          iconUrl: require('@/assets/pin-private.png'),
          iconSize: [30, 45],
          iconAnchor: [0, 42],
          popupAnchor: [15, -20]
        }),
        iconLcd: icon({
          iconUrl: require('@/assets/pin-lcd.png'),
          shadowUrl: require('@/assets/shadow.png'),
          iconSize: [30, 45],
          iconAnchor: [0, 42],
          popupAnchor: [15, -20]
        })
      },
      mapCenter: latLng(0, 0),
      selectedDisplay: {
        baselinePrice: {
          price_per_second: ''
        },
        blockTime: ''
      },
      selectedCampaign: {},
      campaigns: [],
      daterange: "",
      skippedWeeks: 'Do Not Skip',
      filteredDisplays: [],
      loading: false,
      searchedForBookings: false,
      type: "All",
      flatpickrOptions: {
        disableMobile: true,
        allowInput: true,
        mode: 'range',
        minDate: moment().format('YYYY-MM-DD')
      },
      times: [0,24],
      modalDetails: false
    }
  },
  computed: {
    dayCount () {
      return this.buttons.filter(button => button.state).length
    },
    ready () {
      return (this.dayCount && this.type && this.selectedCampaign.campaignId && this.daterange.search(" to ") && this.times[0] && this.times[1])
    },
    previewMedia () {
      if (this.selectedCampaign.media !== undefined)
        return this.selectedCampaign.media.data
      else 
        return []
    }
  },
  mounted() {
    this.fetchCampaigns()
    this.getLocation()
    this.$watch('displays', function () {
      this.filterDisplays()
    })
    this.$watch('type', function () {
      this.filterDisplays()
    })
    this.$watch('sort', function () {
      if (this.searchedForBookings) {
        this.filterDisplays()
      }
    })
    this.$watch('cart', function () {
      this.$forceUpdate()
    })
    this.$watch('daterange', function () {
      this.getDays()
    })
    this.$watch('activeTeam', function () {
      this.fetchCampaigns()
    })
  },
  methods: {
    getLocation() {
      if (!window.navigator.geolocation) {
        this.mapCenter = latLng(-34.98385, 138.57395)
      }
      let success = (position) => {
        this.mapCenter = latLng(position.coords.latitude, position.coords.longitude)
      }
      let error = () => {
        this.mapCenter = latLng(-34.98385, 138.57395)
      }
      window.navigator.geolocation.getCurrentPosition(success, error)
    },
    formatMoney(value){
      return Number(value).toLocaleString(undefined, {
      style: 'currency',
      currency: 'AUD', 
      minimumFractionDigits: 2
    });

    },
    validateSearch() {
      if (this.type && this.selectedCampaign.campaignId && this.daterange.search(" to ") && this.times[0] && this.times[1] && this.getDaysOfWeek() != 0) {
        let dates = this.daterange.split(" to ")
        let today = moment().format('YYYY-MM-DD')
        if ((dates[1] >= dates[0] || !dates[1]) && dates[0] >= today) {
          this.loading = true
          return true
        } else {
          this.$notifications.add({
            title: 'Error',
            type: 'danger',
            body: 'Dates invalid',
            timeout: true
          })
          this.searchedForBookings = false
          return false
        }
      } else {
        this.$notifications.add({
          title: 'Error',
          type: 'danger',
          body: 'Please enter all information',
          timeout: true
        })
        this.searchedForBookings = false
        return false
      }

    },
    fetchCampaigns() {
      let url = 'v1/campaigns?include=tags,media&limit=all&team=' + parseInt(this.activeTeam.id)
      this.$axios.get(url).then(
        (response) => {
          let array = response.data.data
          array.sort(function (a, b) {
            if (a.campaignId < b.campaignId) {
              return 1
            } else {
              return -1
            }
          })
          array = array.filter((campaign) => {
            if (campaign.media.data.length > 0) {
              return true
            }
            return false
          })
          let formattedArray = []
          for (let campaign of array) {
            let duration = 0
            for (let item of campaign.media.data) {
              duration = parseInt(item.end) > duration ? parseInt(item.end) : duration
            }
            campaign.duration = duration
            formattedArray.push({
              text: campaign.name + ' (' + duration + ' sec)',
              value: campaign
            })
          }
          this.selectedCampaign = array[0]
          this.campaigns = formattedArray
        },
        () => {}
      )
    },
    getDisplays(bounds) {
      this.$axios.get('v1/displays/private?southlng=' + (bounds._southWest.lng - 1) + '&northlng=' + (bounds._northEast.lng + 1) + '&southlat=' + (bounds._southWest.lat - 1) + '&northlat=' + (bounds._northEast.lat + 1) + '&limit=all').then(
        (response) => {
          this.displaysPrivate = response.data.data
        },
        (response) => {
          if (response.status === 404) {
            this.displaysPrivate = []
          }
        },
        () => {
          this.$notifications.add({
            title: 'Error',
            type: 'warning',
            body: "Unable to find displays",
            timeout: true
          })
        }
      )
      this.$axios.get('v1/displays?southlng=' + (bounds._southWest.lng - 1) + '&northlng=' + (bounds._northEast.lng + 1) + '&southlat=' + (bounds._southWest.lat - 1) + '&northlat=' + (bounds._northEast.lat + 1) + '&public=true&limit=all&include=team').then(
        (response) => {
          this.displays = response.data.data
        },
        (response) => {
          if (response.status === 404) {
            this.displays = []
          }
        },
        () => {
          this.$notifications.add({
            title: 'Error',
            type: 'warning',
            body: "Unable to find displays",
            timeout: true
          })
        }
      )
    },
    filterDisplays() {
      let displayArray = this.displays

      if (this.type === 'LCD') {
        displayArray = displayArray.filter(display => display.type === 'LCD' && display.pixelHeight === 0 && display.pixelWidth === 0)
      } else if (this.type === 'LED') {

        displayArray = displayArray.filter(display => {
          if (display.type === 'LED Outdoors' || display.type === 'LED Indoors') {
            return true
          } else if (display.type === 'LCD' && display.pixelHeight > 0 && display.pixelWidth > 0) {
            return true
          }
        })
      }

      if (this.searchedForBookings && this.validateSearch()) {
        let dates = this.daterange.split(" to ")
        let tempend = this.times[1]
        if (this.times[1] === '24:00:00') {
          tempend = '23:59:59'
        }
        if (!dates[1]) {
          dates[1] = dates[0]
        }
        this.filterRemainingTime(dates[0], dates[1], this.times[0], tempend, displayArray, this.selectedCampaign.duration)
          .then((onlyAvailable) => this.getQuotes(dates[0], dates[1], this.times[0], tempend, onlyAvailable, this.selectedCampaign.campaignId, this.getDaysOfWeek(), this.getSkippedWeeks(this.skippedWeeks)))
          .then((output) => {
            this.filteredDisplays = output.filter(display => {
              if ((this.$auth.user.hasAccessInTeam(display.teamId, 'owner') ||
                  this.$auth.user.hasAccessInTeam(display.teamId, 'campaign') ||
                  this.$auth.user.hasAccessInTeam(display.teamId, 'display') ||
                  this.$auth.user.admin)) {
                return false
              } else {
                return true
              }

            }) //.sort((a, b) => b.price - a.price )         this runs an infinite loop when you use it idk why
            this.loading = false
          })
          .catch((e) => {
            this.$notifications.add({
              title: 'Error',
              type: 'warning',
              body: "Unable to find suitable displays",
              timeout: true
            })
            console.log("caught error: " + e.message);
            this.searchedForBookings = false
            this.loading = false
          })
      } else {
        this.filteredDisplays = displayArray
      }
    },
    filterRemainingTime(startDate, endDate, startTime, endTime, displays, campaignDuration) {
      var scope = this;
      //filter for maxtimepurchasable
      displays = displays.filter(display => display.maxTimePurchasable >= campaignDuration)
      let displayIds = []
      for (let display of displays) {
        displayIds.push(display.displayId)
      }
      return new Promise(function (resolve, reject) {
        scope.$axios.post('v1/displays/time', {
          startDate: startDate,
          endDate: endDate,
          startTime: startTime,
          endTime: endTime,
          displayIds: displayIds
        }).then(
          (response) => {
            let displayTimes = response.data.data
            if (!displayTimes) {
              reject("Unable to filer remaining time")
            }
            for (let [id, time] of Object.entries(displayTimes)) {
              if (time < campaignDuration) {
                displays = displays.filter(display => display.displayId != id)
                delete displayTimes[id]
              }
            }
            if (displays.length) {
              resolve(displays)
            } else {
              resolve([])
            }
          },
          () => {
            reject("Unable to filer remaining time")
          }
        )
      })
    },
    getQuotes(startDate, endDate, startTime, endTime, displays, campaignId, daysEnabled, skippedWeeks) {
      var scope = this;
      let displayIds = []
      for (let display of displays) {
        displayIds.push(display.displayId)
      }
      return new Promise(function (resolve, reject) {
        scope.$axios.post('v1/scheduling/bulkquote', {
          startDate: startDate,
          endDate: endDate,
          startTime: startTime,
          endTime: endTime,
          campaignId: campaignId,
          displayIds: displayIds,
          daysEnabled: daysEnabled,
          skippedWeeks: skippedWeeks
        }).then(
          (response) => {
            let displayCosts = response.data.data
            if (!displayCosts) {
              reject("Unable to get quotes")
            }
            displays.forEach(function (display) {
              display.price = displayCosts[display.displayId]; // add where displayid = displaycostsid
            });
            resolve(displays)
          },
          () => {
            reject("Unable to get quotes")
          }
        )
      })
    },
    addToCart() {
      let dates = this.daterange.split(" to ")
      let tempend = this.times[1]
      if (tempend === '24:00:00') {
        tempend = '23:59:59'
      }
      if (!dates[1]) {
        dates[1] = dates[0]
      }
      let bookingData = {
        startTime: this.times[0],
        endTime: tempend,
        startDate: dates[0],
        endDate: dates[1],
        displayId: this.selectedDisplay.displayId,
        campaignId: this.selectedCampaign.campaignId,
        total: this.selectedDisplay.price,
        cost: this.selectedDisplay.price,
        discount: 0,
        daysEnabled: this.getDaysOfWeek(),
        skippedWeeks: this.getSkippedWeeks(this.skippedWeeks),
        displayName: this.selectedDisplay.name,
        campaignName: this.selectedCampaign.name,
        validCoupon: false
      }
      if (this.$cart.add(bookingData)) {
        this.$notifications.add({
          title: 'Success',
          type: 'success',
          body: this.$t('notifications.cartAdd'),
          timeout: true
        })
      } else {
        this.$notifications.add({
          title: 'Error',
          type: 'danger',
          body: this.$t('notifications.cartAddError'),
          timeout: true
        })
      }
    },
    getSkippedWeeks (weeks) {
      if (weeks == "Do Not Skip") {
        return 0
      }
      else if (weeks == "Second Week") {
        return 1
      }
      else {
        return 2
      }
    },
    getDaysOfWeek () {
      let daysEnabled = []
      for (let days of this.buttons) {
        if (days.state === true) {
          daysEnabled.unshift(1)
        }
        else {
          daysEnabled.unshift(0)
        }
      }
      daysEnabled.unshift(0)
      return daysEnabled.join('')
    },
    getDays () {
      for (let days of this.buttons) {
        days.state = false
        days.visible = true
      }

      if (this.daterange.length < 15) {
        let day = moment(this.daterange).format('dddd')
        for (let days in this.buttons) {
          if (this.buttons[days].full === day) {
            this.buttons[days].state = true
          }
        }
      }
      else {
        let dates = this.daterange.split(' to ')
        let start = moment(dates[0]).format('dddd')
        let difference = moment(dates[1]).diff(moment(dates[0]), 'days')

        if (difference > 6) {
          for (let days of this.buttons) {
            days.state = true
          }
          return true
        }
        else {
          let startDay
          for (let days in this.buttons) {
            if (this.buttons[days].full === start) {
              startDay = days
              this.buttons[days].state = true
              break
            }
          }
          startDay++
          for (let i = 0; i < difference; i++) {
            if (startDay > 6) {
              startDay = 0
            }
            this.buttons[startDay].state = true
            startDay++
          }
        }
      }
      for (let days of this.buttons) {
        if (!days.state) {
          days.visible = false
        }
      }
    },
    hover (status, button) {
      if (status === true) {
        button.variant = "bg-outline-primary"
      }
      else {
        button.variant = "outline-primary"
      }
    },
  moneyFormat(value){
    return Number(value).toLocaleString(undefined, {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2
  });
  },
  }
}
</script>

<style lang="scss">
.map-container {
  max-height: 100%;
  height: 100%;
  overflow-y: hidden;
}

.list-view {
  max-height: 295px;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar {
  height: 100%;
  overflow-y: auto;
}
</style>


