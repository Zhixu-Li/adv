<template>
  <BContainer class="mt-3">
    <!-- Info & Gallery -->
    <BRow class="mb-3">
      <BCol cols="12" lg="6">
        <BCard :header="$t('common.information')">
          <BCardText>
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
              <dt v-if="localDisplay.private == 0">{{ $t('displays.publicUrl') }}</dt>
              <dd v-if="localDisplay.private == 0">{{ publicUrl }}</dd>
            </dl>
          </BCardText>
        </BCard>
      </BCol>

      <BCol cols="12" lg="6">
        <BCard>
          <BCardText>
            <DisplayGallery :display-id="Number(localDisplay.displayId)" />
          </BCardText>
        </BCard>
      </BCol>
    </BRow>

    <!-- Dimensions & Map -->
    <BRow class="mb-3">
      <BCol cols="12" lg="6">
        <BCard :header="$t('common.dimensions')">
          <BCardText>
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
          </BCardText>
        </BCard>
      </BCol>

      <BCol cols="12" lg="6">
        <BCard :header="$t('displays.location')">
          <BCardText>
            <BTableSimple small borderless>
              <BTr>
                <BTh>{{ $t('displays.mobility') }}</BTh>
                <BTh>{{ $t('displays.coordinates') }}</BTh>
              </BTr>
              <BTr>
                <BTd>
                  <span v-if="localDisplay.mobile == 1">{{ $t('displays.mobile') }}</span>
                  <span v-else>{{ $t('displays.stationary') }}</span>
                </BTd>
                <BTd>
                  Lat: {{ localDisplay.latitude }}, Lng: {{ localDisplay.longitude }}
                  <BButton size="sm" variant="link" @click="externalMap">
                    Find on Google
                  </BButton>
                </BTd>
              </BTr>
            </BTableSimple>
            <div class="map">
              <v-map :zoom="13" :center="[localDisplay.latitude, localDisplay.longitude]">
                <v-tilelayer :options="{ maxZoom: 13 }" :url="mapUrl" />
                <v-marker :lat-lng="[localDisplay.latitude, localDisplay.longitude]" :icon="icon" />
              </v-map>
            </div>
          </BCardText>
        </BCard>
      </BCol>
    </BRow>

    <!-- Timezone & Tags -->
    <BRow class="mb-3">
      <BCol cols="12" lg="6">
        <BCard :header="$t('displays.timezoneCurrency')">
          <BCardText>
            <dl>
              <dt>{{ $t('displays.timezone') }}</dt>
              <dd>{{ localDisplay.timezone }}</dd>
              <dt>{{ $t('displays.currency') }}</dt>
              <dd>{{ $t('currency.' + localDisplay.currency) }}</dd>
            </dl>
          </BCardText>
        </BCard>
      </BCol>

      <BCol v-if="localDisplay.tags" cols="12" lg="6">
        <BCard :header="$t('common.tags')">
          <BCardText>
            <dl>
              <dd>
                <span v-for="tagData in localDisplay.tags.data" :key="tagData.id">
                  {{ tagData.tag }}<br />
                </span>
              </dd>
            </dl>
          </BCardText>
        </BCard>
      </BCol>
    </BRow>

    <!-- Brightness -->
    <BRow class="mb-3">
      <BCol cols="12" lg="12">
        <BCard :header="$t('displays.brightness')">
          <BCardText>
            <dl>
              <dt>{{ $t('displays.brightnessControl') }}</dt>
              <dd>{{ $t('brightnessControl.' + localDisplay.brightnessControl) }}</dd>
              <dt v-show="localDisplay.brightnessControl === 'scheduled'">
                {{ $t('displays.brightnessSchedule') }}
              </dt>
              <dd v-if="localDisplay.brightnessControl === 'scheduled'">
                <Curve
                  v-model="localDisplay.brightnessCurve"
                  :inputs="false"
                />
              </dd>
            </dl>
          </BCardText>
        </BCard>
      </BCol>
    </BRow>

    <!-- Admin -->
    <BRow class="mb-3">
      <BCol cols="12" lg="12">
        <BCard :header="$t('common.admin')">
          <BCardText>
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
          </BCardText>
        </BCard>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
import {
  BContainer,
  BRow,
  BCol,
  BCard,
  BCardText,
  BTableSimple,
  BTr,
  BTh,
  BTd,
  BButton
} from 'bootstrap-vue-next'
import Curve from "./Components/BrightnessCurve.vue";
import DisplayGallery from "@/components/DisplayGallery.vue";
import L from "leaflet";
require("leaflet/dist/leaflet.css");

export default {
  name: "ViewDisplay",
  components: {
    Curve,
    DisplayGallery,
    BContainer,
    BRow,
    BCol,
    BCard,
    BCardText,
    BTableSimple,
    BTr,
    BTh,
    BTd,
    BButton,
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
