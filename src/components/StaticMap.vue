<template>
  <b-row class="h-100">
    <b-modal
      id="pinconfirm"
      :title="selectedDisplay.name"
      size="md"
      hide-footer
    >
      <display-gallery :display-id="Number(selectedDisplay.displayId)" />
      <b-card class="mt-1">
        <b-table-simple
          v-if="selectedDisplay"
          borderless
          fixed
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
               
              ${{ formatMoney((selectedDisplay.baselinePrice.price_per_second) * 15 * (86400 / selectedDisplay.blockTime)) }}
            </b-td>
            <b-td>
              <!-- ${{((selectedDisplay.baselinePrice.price_per_second))*15*(86400*7/selectedDisplay.blockTime) | money}} -->
              ${{ formatMoney((selectedDisplay.baselinePrice.price_per_second) * 15 * (86400*7/ selectedDisplay.blockTime)) }} 
            </b-td>
            <b-td>
              <!-- ${{((selectedDisplay.baselinePrice.price_per_second))*15*(86400*30/selectedDisplay.blockTime) | money}} -->
              ${{ formatMoney((selectedDisplay.baselinePrice.price_per_second) * 15 * (86400*30 / selectedDisplay.blockTime)) }}
            </b-td>
          </b-tr>
        </b-table-simple>
        <p>{{ selectedDisplay.description }}</p>
        <hr>
        <small>
          <p><em>Display Contact: {{ selectedDisplay.contact_email }}</em> <br>
            <em>Maximum Campaign Length: {{ selectedDisplay.maxTimePurchasable }}s</em></p>
        </small>
      </b-card>
      <b-button
        class="mt-1"
        @click="$bvModal.hide('pinconfirm');$root.$children[0].$bvModal.show('login')"
      >
        Log in to Adverpost
      </b-button>
      <b-button
        variant="primary"
        class="float-right mt-1"
        @click="$bvModal.hide('pinconfirm');$root.$children[0].$bvModal.show('register')"
      >
        Register for Adverpost
      </b-button>
    </b-modal>
    <b-col class="h-100 p-0">
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
        <l-marker
          v-for="display in displaysPrivate"
          :key="display.displayId"
          :icon="mapSettings.iconPrivate"
          :lat-lng="{lat: display.latitude, lng: display.longitude}"
          :z-index-offset="-10"
          opacity="0"
        />
        <l-marker
          v-for="display in displays"
          :key="display.displayId"
          :icon="display.type==='LCD'&& display.pixelHeight===0 && display.pixelWidth===0 ? mapSettings.iconLcd : mapSettings.iconLed"
          :lat-lng="{lat: display.latitude, lng: display.longitude}"
          @click="selectedDisplay = display;$bvModal.show('pinconfirm')"
        />
      </l-map>
    </b-col>
  </b-row>
</template>

<script>
import { latLng, icon } from 'leaflet'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import DisplayGallery from '@/components/DisplayGallery.vue'
require('leaflet/dist/leaflet.css')

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    DisplayGallery,
  },
  data() {
    return {
      displays: [],
      displaysPrivate: [],
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
        }),
      },
      mapCenter: latLng(0, 0),
      selectedDisplay: {
        baselinePrice: {
          price_per_second: ''
        },
        blockTime: ''
      },
    }
  },
  mounted() {
    this.getLocation()
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
    formatMoney(value) {
    return Number(value).toLocaleString(undefined, {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2
    });
  }
  }
}
</script>

<style lang="scss">
.map-container {
  max-height: 100%;
  height: 100%;
  overflow-y: hidden;
}
</style>


