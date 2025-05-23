<template>
  <div>
    <!-- Breadcrumb Navigation -->
    <BBreadcrumb>
      <BBreadcrumbItem :active="section === 0" @click="section = 0">
        Hardware Information
      </BBreadcrumbItem>
      <BBreadcrumbItem :active="section === 1" @click="section = 1">
        Display Preferences
      </BBreadcrumbItem>
      <BBreadcrumbItem :active="section === 2" @click="section = 2">
        Scheduling Preferences
      </BBreadcrumbItem>
      <BBreadcrumbItem
        v-if="display.brightnessControl === 'scheduled'"
        :active="section === 4"
        @click="section = 4"
      >
        Brightness
      </BBreadcrumbItem>
      <BBreadcrumbItem :active="section === 3" @click="section = 3">
        Location
      </BBreadcrumbItem>
    </BBreadcrumb>

    <!-- Location Section -->
    <div v-if="section === 3">
      <h3>Location</h3>

      <BFormGroup id="searchset" label-for="search">
        <BInputGroup id="search" size="sm">
          <BFormInput
            v-model="search"
            placeholder="Search for a location"
          />
          <BInputGroupAppend>
            <BButton variant="primary" @click="fetchLocationFromAddress">
              Search
            </BButton>
            <BButton variant="secondary" @click="coordShow = !coordShow">
              {{ coordShow ? "Hide" : "Show" }} Coordinates
            </BButton>
          </BInputGroupAppend>
        </BInputGroup>
      </BFormGroup>

      <div class="mb-2 mt-2" style="height: 300px;">
        <l-map
          :zoom="mapSettings.zoom"
          :center="mapCenter"
          :options="mapSettings.options"
        >
          <l-tile-layer
            :options="{ maxZoom: 13 }"
            :url="mapSettings.url"
            :attribution="mapSettings.attribution"
          />
          <l-marker
            :icon="mapSettings.iconLed"
            :lat-lng="{ lat: display.latitude, lng: display.longitude }"
            draggable
            @dragend="moved"
          />
        </l-map>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
// import { useRouter } from "vue-router";
import axios from "axios"; // Using Vue 3 provide/inject pattern

// import { latLng, icon } from "leaflet";
import { icon, latLng } from "leaflet"; 
import { LMap, LTileLayer, LMarker } from "vue3-leaflet";
import "leaflet/dist/leaflet.css";
import {
  BBreadcrumb,
  BBreadcrumbItem,
  BFormGroup,
  BInputGroup,
  BFormInput,
  BInputGroupAppend,
  BButton
} from 'bootstrap-vue-next'
export default defineComponent({
  components: {
    LMap,
    LTileLayer,
    LMarker,
    BBreadcrumb,
    BBreadcrumbItem,
    BFormGroup,
    BInputGroup,
    BFormInput,
    BInputGroupAppend,
    BButton,
  },
  setup() {
    //const router = useRouter();//this lane is not used
    const { t } = useI18n(); // ✅ Vue 3 i18n handling

    // ✅ State variables (Vue 3 `ref()` & `reactive()`)
    const section = ref(0);
    const search = ref("");
    const coordShow = ref(false);

    const display = reactive({
      displayName: "",
      description: "",
      hardwareId: "",
      latitude: -34.9839,
      longitude: 138.574,
    });

    const mapSettings = reactive({
      zoom: 12,
      url: import.meta.env.VITE_MAP_PROVIDER_URL,
      attribution: 'Map data © OpenStreetMap contributors',
      options: { zoomSnap: 0.5 },
      iconLed: icon({
        iconUrl: require("@/assets/pin-led.png"),
        shadowUrl: require("@/assets/shadow.png"),
        iconSize: [30, 45],
        iconAnchor: [0, 42],
        popupAnchor: [15, -20],
      }),
    });

    const mapCenter = ref(latLng(display.latitude, display.longitude));

    // ✅ Fetch location based on search
    const fetchLocationFromAddress = async () => {
      try {
        const response = await axios.get("v1/location", { params: { address: search.value } });
        display.latitude = response.data.latitude;
        display.longitude = response.data.longitude;
        mapCenter.value = latLng(response.data.latitude, response.data.longitude);
      } catch (error) {
        console.error("Failed to fetch location:", error);
      }
    };

    // ✅ Handle map marker movement
    const moved = (e) => {
      const coords = e.target.getLatLng();
      display.latitude = coords.lat;
      display.longitude = coords.lng;
    };

    // ✅ Lifecycle Hooks (Vue 3 `onMounted()`)
    onMounted(() => {
      console.log("Component mounted in Vue 3!");
    });

    return {
      section,
      search,
      coordShow,
      display,
      mapSettings,
      mapCenter,
      fetchLocationFromAddress,
      moved,
      t, // ✅ Translations
    };
  },
});
</script>

<style scoped>
/* Add your styles here */
</style>