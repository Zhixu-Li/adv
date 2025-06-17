<template lang="html">
  <div>
    <div
      v-if="errors.length > 0"
      class="alert alert-danger"
    >
      <ul>
        <li v-for="(error, index) in errors" :key="index">
          {{ error }}
        </li>
      </ul>
    </div>

    <BContainer class="mt-3">
      <!-- Row 1: Info & Gallery -->
      <BRow class="mb-3">
        <BCol cols="12" lg="6">
          <BCard :header="$t('common.information')">
            <BCardText>
              <BFormGroup
                :label="$t('common.name')"
                label-for="name"
              >
                <BFormInput
                  id="name"
                  v-model="editDisplay.name"
                  :placeholder="$t('common.name')"
                />
              </BFormGroup>

              <BFormGroup
                :label="$t('common.description')"
                label-for="description"
              >
                <BFormInput
                  id="description"
                  v-model="editDisplay.description"
                  type="text"
                  :placeholder="$t('common.description')"
                />
              </BFormGroup>

              <BFormGroup
                :label="$t('displays.type')"
                label-for="display-type"
              >
                <BFormSelect
                  id="display-type"
                  v-model="editDisplay.type"
                  :options="options.types"
                />
              </BFormGroup>

              <BFormGroup
                :label="$t('privacy.private')"
                label-for="private"
              >
                <BFormCheckbox
                  id="private"
                  v-model="editDisplay.private"
                />
              </BFormGroup>

              <BFormGroup
                v-if="!editDisplay.private"
                :label="$t('displays.publicUrl')"
                label-for="slug"
              >
                <p>https:{{ publicUrl }}</p>
                <BFormInput
                  id="slug"
                  v-model="editDisplay.slug"
                  :placeholder="$t('Enter public URL here')"
                />
              </BFormGroup>
            </BCardText>
          </BCard>
        </BCol>

        <BCol cols="12" lg="6">
          <BCard>
            <BCardText>
              <DisplayGallery
                :display-id="Number(editDisplay.displayId)"
                :edit="true"
              />
            </BCardText>
          </BCard>
        </BCol>
      </BRow>

      <!-- Row 2: Dimensions & Location -->
      <BRow class="mb-3">
        <BCol cols="12" lg="6">
          <BCard :header="$t('common.dimensions')">
            <BCardText>
              <BFormGroup
                :label="$t('displays.physicalWidth')"
                label-for="physical-width"
              >
                <BFormInput
                  id="physical-width"
                  v-model="editDisplay.physicalWidth"
                  :placeholder="$t('displays.physicalWidth')"
                />
              </BFormGroup>

              <BFormGroup
                :label="$t('displays.physicalHeight')"
                label-for="physical-height"
              >
                <BFormInput
                  id="physical-height"
                  v-model="editDisplay.physicalHeight"
                  :placeholder="$t('displays.physicalHeight')"
                />
              </BFormGroup>

              <BFormGroup
                :label="$t('displays.pixelWidth')"
                label-for="pixel-width"
              >
                <BFormInput
                  id="pixel-width"
                  v-model="editDisplay.pixelWidth"
                  :placeholder="$t('displays.pixelWidth')"
                />
              </BFormGroup>

              <BFormGroup
                :label="$t('displays.pixelHeight')"
                label-for="pixel-height"
              >
                <BFormInput
                  id="pixel-height"
                  v-model="editDisplay.pixelHeight"
                  :placeholder="$t('displays.pixelHeight')"
                />
              </BFormGroup>

              <BFormGroup
                :label="$t('displays.rotation')"
                label-for="rotation"
              >
                <BFormSelect
                  id="rotation"
                  v-model="editDisplay.rotate"
                  :options="options.rotations"
                />
              </BFormGroup>
            </BCardText>
          </BCard>
        </BCol>

        <BCol cols="12" lg="6">
          <BCard :header="$t('displays.location')">
            <BCardText>
              <BFormGroup
                :label="$t('displays.mobile')"
                label-for="mobile"
              >
                <BFormCheckbox
                  id="mobile"
                  v-model="editDisplay.mobile"
                />
              </BFormGroup>

              <BFormGroup
                id="location"
                :label="$t('displays.location')"
                label-for="location"
              >
                <BFormRadio
                  id="displayAddress"
                  v-model="locationSelect"
                  value="Address"
                >
                  {{ $t('displays.byAdd') }}
                </BFormRadio>
                <BFormRadio
                  id="displayLatLong"
                  v-model="locationSelect"
                  value="LatLong"
                >
                  {{ $t('displays.byLatLn') }}
                </BFormRadio>
              </BFormGroup>

              <BFormGroup
                v-if="locationSelect === 'Address'"
                :label="$t('displays.address')"
                label-for="address"
              >
                <BFormInput
                  id="address"
                  v-model="address"
                />
                <BButton @click="fetchLocationFromAddress">
                  Search
                </BButton>
              </BFormGroup>

              <div v-else>
                <BFormGroup
                  :label="$t('displays.latitude')"
                  label-for="latitude"
                >
                  <BFormInput
                    id="latitude"
                    v-model.number="coords.latitude"
                  />
                </BFormGroup>
                <BFormGroup
                  :label="$t('displays.longitude')"
                  label-for="longitude"
                >
                  <BFormInput
                    id="longitude"
                    v-model.number="coords.longitude"
                  />
                </BFormGroup>
              </div>

              <div class="map">
                <v-map
                  :zoom="zoom"
                  :center="[coords.latitude, coords.longitude]"
                  @l-zoom="zoomChange"
                  @l-dblclick="dblclicked"
                >
                  <v-tilelayer
                    :options="{ maxZoom: 13 }"
                    :url="mapUrl"
                  />
                  <v-marker
                    :lat-lng="[coords.latitude, coords.longitude]"
                    :icon="icon"
                    draggable
                    @dragend="moved"
                  />
                </v-map>
              </div>
            </BCardText>
          </BCard>
        </BCol>
      </BRow>

      <!-- Row 3: Timezone & Tags -->
      <BRow class="mb-3">
        <BCol cols="12" lg="6">
          <BCard :header="$t('displays.timezoneCurrency')">
            <BCardText>
              <BFormGroup
                :label="$t('displays.timezone')"
                label-for="timezone"
              >
                <BFormSelect
                  id="timezone"
                  v-model="editDisplay.timezone"
                  :options="options.timezones"
                />
              </BFormGroup>

              <BFormGroup
                :label="$t('displays.currency')"
                label-for="currency"
              >
                <BFormSelect
                  id="currency"
                  v-model="editDisplay.currency"
                  :options="options.currencies"
                />
              </BFormGroup>
            </BCardText>
          </BCard>
        </BCol>

        <BCol cols="12" lg="6">
          <BCard :header="$t('common.tags')">
            <BCardText>
              <Multiselect
                :options="alltags"
                :value="selected"
                :multiple="true"
                :taggable="true"
                :placeholder="$t('displays.addTags')"
                @tag="addTag"
                @select="chooseTag"
                @remove="removeTag"
              />
            </BCardText>
          </BCard>
        </BCol>
      </BRow>

      <!-- Row 4: Brightness -->
      <BRow class="mb-3">
        <BCol cols="12">
          <BCard :header="$t('displays.brightness')">
            <BCardText>
              <BFormGroup
                :label="$t('displays.brightnessControl')"
                label-for="brightness-control"
              >
                <BFormSelect
                  id="brightness-control"
                  v-model="editDisplay.brightnessControl"
                  :options="options.brightnessControls"
                />
              </BFormGroup>

              <div v-if="editDisplay.brightnessControl === 'scheduled'">
                <label for="timed-brightness">{{ $t('displays.brightnessCurve') }}</label>
                <Curve
                  id="curve"
                  v-model="editDisplay.brightnessCurve"
                />
              </div>
            </BCardText>
          </BCard>
        </BCol>
      </BRow>

      <!-- Row 5: Admin Settings -->
      <BRow class="mb-3" v-if="$auth.user.admin">
        <BCol cols="12">
          <BCard :header="$t('common.admin')">
            <BCardText>
              <BFormGroup
                :label="$t('displays.acid')"
                label-for="acid"
              >
                <BFormInput
                  id="acid"
                  v-model.trim="editDisplay.acid"
                  :placeholder="$t('displays.acid')"
                />
              </BFormGroup>

              <BFormGroup
                :label="$t('displays.hwid')"
                label-for="hwid"
              >
                <BFormInput
                  id="hwid"
                  v-model.trim="editDisplay.hardwareId"
                  :placeholder="$t('displays.hwid')"
                />
              </BFormGroup>

              <BFormGroup
                id="approval"
                :label="$t('common.approval')"
                label-for="approval"
              >
                <BFormRadio id="pending"   v-model="editDisplay.approval" value="pending">
                  {{ $t('approval.pending') }}
                </BFormRadio>
                <BFormRadio id="approved"  v-model="editDisplay.approval" value="approved">
                  {{ $t('approval.approved') }}
                </BFormRadio>
                <BFormRadio id="denied"    v-model="editDisplay.approval" value="denied">
                  {{ $t('approval.denied') }}
                </BFormRadio>
              </BFormGroup>

              <label for="team">{{ $t('common.team') }}</label>
              <Multiselect
                v-model="selectedTeam"
                :options="multiselectTeams"
                track-by="teamId"
                label="name"
                :placeholder="editDisplay.teamName"
                @input="setTeamID"
              />

              <BFormGroup
                :label="$t('displays.demoMode')"
                label-for="demo"
              >
                <BFormCheckbox
                  id="demo"
                  v-model="editDisplay.demoMode"
                />
              </BFormGroup>
            </BCardText>
          </BCard>
        </BCol>
      </BRow>

      <!-- Save Button -->
      <div id="displayCreateButton" class="form-group save">
        <BButton variant="primary" @click="updateDisplay()">
          {{ $t('buttons.save') }}
        </BButton>
      </div>
    </BContainer>
  </div>
</template>


<script>
import {
  BContainer,
  BRow,
  BCol,
  BCard,
  BCardText,
  BFormGroup,
  BFormInput,
  BFormSelect,
  BFormCheckbox,
  BFormRadio,
  BButton
} from 'bootstrap-vue-next'
import moment from "moment-timezone";
import Curve from "./Components/BrightnessCurve.vue";
import Multiselect from "vue-multiselect";
import DisplayGallery from "@/components/DisplayGallery.vue";
import L from "leaflet";
import teamContext from '@/mixins/teamContext'
require("leaflet/dist/leaflet.css");

export default {
  name: "EditDisplay",
  components: {
    Curve,
    Multiselect,
    DisplayGallery,
      BContainer,
    BRow,
    BCol,
    BCard,
    BCardText,
    BFormGroup,
    BFormInput,
    BFormSelect,
    BFormCheckbox,
    BFormRadio,
    BButton,
  },
  mixins: [teamContext],
  props: {
    display: {
      type: Object,
      required: true
    }
  },
  data: function() {
    return {
      mapUrl: process.env.VUE_APP_MAP_PROVIDER_URL,
      selectedTeam: null,
      // tags
      tags: [
        {
          tagId: "",
          tag: ""
        }
      ],
      alltags: [],
      oldtags: [],
      newtags: [],
      selected: [],
      tempTeam: "",
      // options
      options: {
        types: [
          { text: this.$t("screenType.LCD"), value: "LCD" },
          { text: this.$t("screenType.LEDIndoors"), value: "LED Indoors" },
          { text: this.$t("screenType.LEDOutdoors"), value: "LED Outdoors" }
        ],
        timezones: moment.tz.names(),
        brightnessControls: [
          { text: this.$t("brightnessControl.maximum"), value: "maximum" },
          { text: this.$t("brightnessControl.sensor"), value: "sensor" },
          { text: this.$t("brightnessControl.scheduled"), value: "scheduled" }
        ],
        countries: [
          { text: this.$t("countries.aus"), value: "Australia" },
          { text: this.$t("countries.cn"), value: "China" }
        ],
        currencies: [
          { text: this.$t("currency.fullAud"), value: "AUD" },
          { text: this.$t("currency.fullCny"), value: "CNY" }
        ],
        rotations: [
          { text: "0°", value: 0 },
          { text: "90°", value: 90 },
          { text: "180°", value: 180 },
          { text: "270°", value: 270 }
        ]
      },
      locationSelect: "LatLong",
      errors: [],
      validated: true,
      coords: {
        latitude: 0,
        longitude: 0
      },
      address: "",
      icon: {},
      zoom: 13,
      publicUrl: "",
      editDisplay: {...this.display}
    };
  },
  computed: {
  },
  mounted() {
    this.fetchDisplayTags();
    this.selectedTeam = this.$auth.user.teams[this.editDisplay.teamId]
    this.coords.latitude = this.editDisplay.latitude;
    this.coords.longitude = this.editDisplay.longitude;

    if (!this.editDisplay.slug) {
      this.editDisplay.slug = this.editDisplay.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "")
        .substring(0, 32);
    }

    this.icon = L.icon({
      iconUrl: require("@/assets/pin.png"),
      iconSize: [30, 45],
      iconAnchor: [0, 42],
      popupAnchor: [15, -20]
    });

    this.publicUrl = process.env.VUE_APP_PUBLIC_URL + "d/";
  },
  methods: {
    setTeamID() {
      this.editDisplay.teamId = this.selectedTeam.teamId
    },
    fetchDisplayTags() {
      var scope = this
      this.$axios.get("v1/displays/" + this.editDisplay.displayId + "/tags").then(
        response => {
          this.tags = response.data.data;
          this.meta = response.data.meta;
          for (var t in this.tags) {
            this.alltags.push(this.tags[t].tag);
            this.selected.push(this.tags[t].tag);
          }
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
        }
      )
    },
    fetchTeams() {
      var scope = this
      this.$axios.get("v1/teams?limit=all").then(
        response => {
          this.teams = response.data.data;
          let team = this.teams.find(team => {
            return team.teamId === this.editDisplay.teamId;
          });
          this.editDisplay.teamName = team.name;
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
        }
      )
    },
    saveTags() {
      // get ids of removed tags - then remove
      for (var r = 0; r < this.oldtags.length; r++) {
        for (var t = 0; t < this.tags.length; t++) {
          if (this.tags[t].tag === this.oldtags[r]) {
            this.$axios
              .delete(
                "v1/displays/" +
                  this.editDisplay.displayId +
                  "/tags/" +
                  this.tags[t].tagId
              )
              .then(
                () => {
                  // success
                  this.$notifications.add({
                    title: "Success",
                    type: "success",
                    body:
                      this.tags[t].tag +
                      " " +
                      this.$t("notifications.displayTagRemove"),
                    timeout: true
                  });
                },
                () => {
                  // error
                  this.$notifications.add({
                    title: "Error",
                    type: "danger",
                    body:
                      this.$t("notifications.displayTagRemoveError") +
                      " " +
                      this.tags[t].tag,
                    timeout: true
                  });
                }
              );
            break;
          }
        }
      }
      // create new tags
      for (var n in this.newtags) {
        // doing the adding
        if (this.newtags[n].length > 255) {
          this.$notifications.add({
            title: "Error",
            type: "danger",
            body: this.$t("notifications.tagLengthError"),
            timeout: true
          });
        } else {
          this.$axios
            .post("v1/displays/" + this.editDisplay.displayId + "/tags", {
              tag: this.newtags[n].trim()
            })
            .then(
              () => {
                // success
                this.$notifications.add({
                  title: "Success",
                  type: "success",
                  body:
                    this.newtags[n].trim() +
                    " " +
                    this.$t("notifications.displayTagAdd"),
                  timeout: true
                });
              },
              () => {
                // error
                this.$notifications.add({
                  title: "Error",
                  type: "danger",
                  body:
                    this.$t("notifications.displayTagAddError") +
                    " " +
                    this.newtags[n].trim(),
                  timeout: true
                });
              }
            );
        }
      }
    },
    // add new tag to tags and selections
    addTag(newTag) {
      this.alltags.push(newTag);
      this.selected.push(newTag);
      this.newtags.push(newTag);
    },
    // select a tag
    chooseTag(newTag) {
      this.selected.push(newTag);
      var index = this.oldtags.indexOf(newTag);
      if (index > -1) {
        this.oldtags.splice(index, 1);
      }
    },
    // remove tag from selections
    removeTag(oldTag) {
      var index = this.selected.indexOf(oldTag);
      if (index > -1) {
        this.selected.splice(index, 1);
      }
      this.oldtags.push(oldTag);
    },
    updateDisplay() {
      this.saveTags();
      if (
        this.editDisplay.brightnessControl === "maximum" ||
        this.editDisplay.brightnessControl === "sensor"
      ) {
        for (let key in this.editDisplay.brightnessCurve) {
          this.editDisplay.brightnessCurve[key] = 100;
        }
      }
      this.editDisplay.latitude = this.coords.latitude;
      this.editDisplay.longitude = this.coords.longitude;
      this.editDisplay.slug = encodeURIComponent(this.editDisplay.slug);
      this.validateMe();
      if (this.validation) {
        this.$axios
          .post("v1/displays/" + this.editDisplay.displayId, this.editDisplay)
          .then(
            () => {
              // success
              this.$emit('refreshDisplays')
              this.$router.push({ name: 'display-view', params: { displayId: this.editDisplay.displayId } })
              this.$notifications.add({
                title: "Updated",
                type: "success",
                body: this.$t("notifications.displayUpdate"),
                timeout: true
              });
            },
            () => {
              // error
              this.$notifications.add({
                title: "Error",
                type: "danger",
                body: this.$t("notifications.displayUpdateError"),
                timeout: true
              });
            }
          );
      }
    },
    validateMe() {
      this.validation = true;
      this.errors = [];
      this.stringTest(this.editDisplay.name, "name", 255);
      this.stringTest(this.editDisplay.description, "description", 255);
      this.lengthTest(this.editDisplay.blockTime, "loop time", 10);
      this.lengthTest(
        this.editDisplay.maxTimePurchasable,
        "max time purchasable",
        0
      );
      this.lengthTest(this.editDisplay.longitude, "longitude", -180, 180);
      this.lengthTest(this.editDisplay.latitude, "latitude", -90, 90);
      this.lengthTest(this.editDisplay.physicalWidth, "physical width", 1);
      this.lengthTest(this.editDisplay.physicalHeight, "physical height", 1);
      this.lengthTest(this.editDisplay.pixelWidth, "pixel width", 0);
      this.lengthTest(this.editDisplay.pixelHeight, "pixel height", 0);
      this.lengthTest(this.editDisplay.rotation, "rotation", 0, 359);
      this.integerTest(this.editDisplay.blockTime, "loop time");
      this.integerTest(this.editDisplay.maxTimePurchasable, "max time purchasable");
      for (var key in this.editDisplay.brightnessCurve) {
        if (this.editDisplay.brightnessCurve[key]) {
          this.lengthTest(
            this.editDisplay.brightnessCurve[key],
            "brightness curve",
            0,
            100
          );
          this.integerTest(
            this.editDisplay.brightnessCurve[key],
            "brightness curve"
          );
        }
      }
    },
    stringTest(value, input, max) {
      if (!value) {
        this.errors.push(input + " is a required input");
        this.validation = false;
      } else if (value.length > max) {
        this.errors.push(
          input + " can only be a maxiumum of " + max + " characters"
        );
        this.validation = false;
      }
    },
    lengthTest(value, input, min, max) {
      if (min !== undefined) {
        if (value < min) {
          this.errors.push(input + " has to be a minimum of " + min);
          this.validation = false;
          return;
        }
      }
      if (max !== undefined) {
        if (value > max) {
          this.errors.push(input + " can only be a maximum of " + max);
          this.validation = false;
          return;
        }
      }
    },
    integerTest(value, input) {
      if (value % 1 !== 0) {
        this.errors.push(input + " can only be a whole number");
        this.validation = false;
      }
    },
    fetchLocationFromAddress() {
      let params = {
        address: this.address
      };
      this.$axios.get("v1/location", { params: params }).then(
        response => {
          this.coords.latitude = response.data.latitude;
          this.coords.longitude = response.data.longitude;
        },
        () => {}
      );
    },
    moved(e) {
      let coords = e.target.getLatLng();
      this.coords.latitude = coords.lat;
      this.coords.longitude = coords.lng;
    },
    zoomChange(e) {
      this.zoom = e.target.getZoom();
    },
    dblclicked(e) {
      let coords = e.latlng;
      this.coords.latitude = coords.lat;
      this.coords.longitude = coords.lng;
    },
    setBrightnessControl(value) {
      this.kludgeBrightness = value
    }
  }
};
</script>

<style>
.save {
  position: fixed;
  right: 0;
  bottom: 0;
  padding-right: 45px;
  z-index: 1001;
}
</style>
