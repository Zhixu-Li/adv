<template>
  <b-container class="mt-3">
    <b-row class="mb-3">
      <b-col
        cols="12"
        lg="6"
      >
        <b-card :header="$t('common.information')">
          <b-card-text>
            <dl>
              <dt>{{ $t('common.name') }}</dt>
              <dd>{{ localDisplay.name }}</dd>
              <dt>{{ $t('common.description') }}</dt>
              <dd>{{ localDisplay.description }}</dd>
              <dt>{{ $t('displays.type') }}</dt>
              <dd>{{ $t(computedScreenType) }}</dd>
              <dt>{{ $t('displays.privacy') }}</dt>
              <dd>
                <span v-if="localDisplay.private == 1">{{ $t('privacy.private') }}</span>
                <span v-else>{{ $t('privacy.public') }}</span>
              </dd>
              <dt v-if="localDisplay.private == 0">
                {{ $t('displays.publicUrl') }}
              </dt>
              <dd v-if="localDisplay.private == 0">
                {{ publicUrl }}
              </dd>
            </dl>
          </b-card-text>
        </b-card>
      </b-col>

      <b-col
        cols="12"
        lg="6"
      >
        <b-card>
          <b-card-text>
            <display-gallery :display-id="Number(localDisplay.displayId)" />
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>

    <b-row class="mb-3">
      <b-col
        cols="12"
        lg="6"
      >
        <b-card :header="$t('common.dimensions')">
          <b-card-text>
            <dl>
              <dt>{{ $t('displays.physicalHeight') }}</dt>
              <dd>{{ localDisplay.physicalHeight }}</dd>
              <dt>{{ $t('displays.physicalWidth') }}</dt>
              <dd>{{ localDisplay.physicalWidth }}</dd>
              <dt>{{ $t('displays.pixelHeight') }}</dt>
              <dd>{{ localDisplay.pixelHeight }}</dd>
              <dt>{{ $t('displays.pixelWidth') }}</dt>
              <dd>{{ localDisplay.pixelWidth }}</dd>
              <dt>{{ $t('displays.rotation') }}</dt>
              <dd>{{ localDisplay.rotate }}</dd>
            </dl>
          </b-card-text>
        </b-card>
      </b-col>

      <b-col
        cols="12"
        lg="6"
      >
        <b-card :header="$t('displays.location')">
          <b-card-text>
            <b-table-simple
              small
              borderless
            >
              <b-tr>
                <b-th>{{ $t('displays.mobility') }}</b-th>
                <b-th>{{ $t('displays.coordinates') }}</b-th>
              </b-tr>
              <b-tr>
                <b-td>
                  <span v-if="localDisplay.mobile == 1">{{ $t('displays.mobile') }}</span>
                  <span v-else>{{ $t('displays.stationary') }}</span>
                </b-td>
                <b-td>
                  Lat: {{ localDisplay.latitude }}, Lng: {{ localDisplay.longitude }}
                  <b-button
                    size="sm"
                    variant="link"
                    @click="externalMap"
                  >
                    Find on Google
                  </b-button>
                </b-td>
              </b-tr>
            </b-table-simple>
            <div class="map">
              <v-map
                :zoom="13"
                :center="[localDisplay.latitude, localDisplay.longitude]"
              >
                <v-tilelayer
                  :options="{ maxZoom: 13 }"
                  :url="mapUrl"
                />
                <v-marker
                  :lat-lng="[localDisplay.latitude, localDisplay.longitude]"
                  :icon="icon"
                />
              </v-map>
            </div>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>

    <b-row class="mb-3">
      <b-col
        cols="12"
        lg="6"
      >
        <b-card :header="$t('displays.timezoneCurrency')">
          <b-card-text>
            <dl>
              <dt>{{ $t('displays.timezone') }}</dt>
              <dd>{{ localDisplay.timezone }}</dd>
              <dt>{{ $t('displays.currency') }}</dt>
              <dd>{{ $t('currency.' + localDisplay.currency) }}</dd>
            </dl>
          </b-card-text>
        </b-card>
      </b-col>

      <b-col
        v-if="localDisplay.tags"
        cols="12"
        lg="6"
      >
        <b-card :header="$t('common.tags')">
          <b-card-text>
            <dl>
              <dd>
                <span
                  v-for="tagData in localDisplay.tags.data"
                  :key="tagData.id"
                >
                  {{ tagData.tag }}<br>
                </span>
              </dd>
            </dl>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>

    <b-row class="mb-3">
      <b-col
        cols="12"
        lg="12"
      >
        <b-card :header="$t('displays.brightness')">
          <b-card-text>
            <dl>
              <dt>{{ $t('displays.brightnessControl') }}</dt>
              <dd>{{ $t('brightnessControl.' + localDisplay.brightnessControl) }}</dd>
              <dt v-show="localDisplay.brightnessControl === 'scheduled'">
                {{ $t('displays.brightnessSchedule') }}
              </dt>
              <dd v-if="localDisplay.brightnessControl === 'scheduled'">
                <curve
                  v-if="localDisplay.brightnessControl === 'scheduled'"
                  v-model="localDisplay.brightnessCurve"
                  :inputs="false"
                />
              </dd>
            </dl>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>

    <b-row class="mb-3">
      <b-col
        cols="12"
        lg="12"
      >
        <b-card :header="$t('common.admin')">
          <b-card-text>
            <dl>
              <dt>{{ $t('displays.acid') }}</dt>
              <dd><a :href="computedAcid">{{ localDisplay.acid }}</a></dd>
              <dt>{{ $t('displays.hwid') }}</dt>
              <dd><a :href="computedHwid">{{ localDisplay.hardwareId }}</a></dd>
              <dt>{{ $t('common.approval') }}</dt>
              <dd>{{ $t('approval.' + localDisplay.approval) }}</dd>
              <dt>{{ $t('displays.demoMode') }}</dt>
              <dd>{{ $t('truth.' + localDisplay.demoMode) }}</dd>
            </dl>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import Curve from "./Components/BrightnessCurve.vue";
import DisplayGallery from "@/components/DisplayGallery.vue";
import L from "leaflet";
require("leaflet/dist/leaflet.css");

export default {
  name: "ViewDisplay",
  components: {
    Curve,
    DisplayGallery
  },
  props: {
    display: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localDisplay: { ...this.display },
      mapUrl: process.env.VUE_APP_MAP_PROVIDER_URL,
      icon: {}
    };
  },
  computed: {
    computedAcid() {
      return process.env.VUE_APP_API_ROOT + '/api/getSchedule/' + this.localDisplay.acid;
    },
    computedHwid() {
      return process.env.VUE_APP_API_ROOT + '/api/getConfig/' + this.localDisplay.hardwareId;
    },
    publicUrl() {
      return process.env.VUE_APP_PUBLIC_URL + "d/" + this.localDisplay.slug;
    },
    computedScreenType() {
      return 'screenType.' + this.localDisplay.type.replace(' ', '');
    }
  },
  watch: {
    display: {
      handler(newVal) {
        this.localDisplay = { ...newVal };
      },
      deep: true
    }
  },
  mounted() {
    this.icon = L.icon({
      iconUrl: require("@/assets/pin.png"),
      iconSize: [30, 45],
      iconAnchor: [0, 42],
      popupAnchor: [15, -20]
    });
  },
  methods: {
    externalMap() {
      window.open(
        `//maps.google.com/maps?ll=${this.localDisplay.latitude},${this.localDisplay.longitude}&q=${this.localDisplay.latitude},${this.localDisplay.longitude}`,
        "_blank"
      );
    }
  }
};
</script>

<style scoped>
.map {
  width: 100%;
  height: 250px;
}
</style>
