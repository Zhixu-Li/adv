<template>
  <div>
    <b-row>
      <b-col
        cols="6"
        class="pb-4"
      >
        <div v-if="validSchedule">
          <!-- <b-aspect :aspect="'1:1'"> -->
          <schedule-player
            :width="'100%'"
            :height="'20em'"
            :uri="uri"
            :params="e2v"
          />
          <!-- </b-aspect> -->
        </div>
        <div v-else>
          <b-skeleton-img
            width="100%"
            height="25vw"
          />
        </div>
      </b-col>
      <b-col cols="6">
        <b-row>
          <b-col cols="12">
            <b-col>
              <h4>
                E2V Stream Options
                <b-button
                  v-if="parametersLoaded !== true"
                  variant="primary"
                  disabled
                >
                  <b-spinner
                    small
                    type="grow"
                  />
                  {{ 'Retrieving parameter list' }}
                </b-button>
              </h4>
              <div v-if="parameters.length == 0">
                No parameters required.
              </div>
              <div
                v-for="parameter in parameters"
                :key="parameter.slug"
              >
                <div v-if="parameter.opts">
                  <multiselect
                    v-model="selector[parameter.slug]"
                    placeholder="Select"
                    :options="parameter.opts"
                    track-by="id"
                    label="name"
                    :preselect-first="true"
                    @select="(opt, id) => { e2v[parameter.slug] = opt.id }"
                  />
                  <b-form-text v-if="selectCheck=true">
                    {{ parameter.desc }}
                  </b-form-text>
                </div>
                <div v-else>
                  <b-form-input
                    :id="'e2v_'+parameter.slug"
                    v-model="e2v[parameter.slug]"
                    :state="validSchedule"
                    :placeholder="parameter.name"
                    aria-describedby="input-live-feedback"
                    trim
                  />
                  <b-form-invalid-feedback id="input-live-feedback">
                    {{ errors[parameter.slug] }}
                  </b-form-invalid-feedback>
                  <b-form-text :id="'e2v_'+parameter.slug">
                    {{ parameter.desc }}
                  </b-form-text>
                </div>
              </div>
            </b-col>
          </b-col>
          <b-col cols="12">
            <b-col>
              <hr class="border">
              <h4>Campaign Stats</h4>
              <b-row>
                <b-col>Matched Campaigns</b-col>
                <b-col><label>{{ totalCampaigns }}</label></b-col>
              </b-row>
              <b-row>
                <b-col>Shortest Campaign</b-col>
                <b-col><label>{{ minimumDuration }} seconds</label></b-col>
              </b-row>
              <b-row>
                <b-col>Longest Campaign</b-col>
                <b-col><label>{{ maximumDuration }} seconds</label></b-col>
              </b-row>
            </b-col>
            <b-col>
              <hr class="border">
              <!-- DEFAULT SLOT IS HERE -->
              <slot />
            </b-col>
          </b-col>
        </b-row>
      </b-col>
    </b-row>

    <!-- :params='{"api_key": "e02189628c1b384fd99c3c8b4624dc1b", "duration": "10"}' -->
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
/* eslint-disable vue/no-unused-components */
/* eslint-disable no-mixed-spaces-and-tabs */

import axios from 'axios'
import { debounce } from 'lodash'
import SchedulePlayer from '@/components/Player/SchedulePlayer.vue'
import Multiselect from 'vue-multiselect'

// emit on change parameters? how do we get the settings up higher?

export default {
    components: {
      SchedulePlayer,
      Multiselect,
    },
    props: {
      uri: {
        type: String,
        required: true
      },
    },
    data() {
      return {
        parameters: [],
        parametersLoaded: false,
        validSchedule: false,
        e2v: {},
        selector: {},
        errors: {},
        schedule: {},
        totalCampaigns: 0,
        minimumDuration: 0,
        maximumDuration: 0,
        updateHack: 0,
      }
    },
    computed: {
    },
    mounted() {
      this.fetchParams()
      this.testSchedule()
    },
    beforeUnmount() {
    },
    methods: {
      fetchParams() {
        axios.get(this.uri, {
          params: {
            '_path': '/parameters'
          }
        })
        .then((response) => {
          if (typeof(response.data) === 'object') {
            this.parameters = response.data
            for (let param of this.parameters) {
              // this.$set(this.e2v, param.slug, '')
              this.e2v[param.slug]=''
            }
            this.parametersLoaded = true
          }
          else {
            // it's empty, do nothing
            // console.log()
            this.parametersLoaded = true
          }
        })
        .catch((response) => {
          console.log('failed', response)
        })
      },
      testSchedule() {
        axios.post(this.uri+'?_path=/getSchedule', this.e2v).then(
          (response) => {
            if (response.data != '0') {
              if (response.data.errors) {
                this.validSchedule = false
                this.errors = response.data.errors
              }
              else if (response.data?.DisplayGroup?.Sequence) {
                this.validSchedule = true
                let campaigns = response.data.DisplayGroup.Sequence[0].Campaign
                this.totalCampaigns = campaigns.length
                this.minimumDuration = campaigns.reduce((a,c) => Math.min(a, c.duration), Number.MAX_SAFE_INTEGER)
                this.maximumDuration = campaigns.reduce((a,c) => Math.max(a, c.duration), 0)
              }
            }
          },
          () => {
            console.log('retrieving failed')
          }
        )
      },
    },
    watch: {
      uri() {
        this.fetchParams()
        this.testSchedule()
      },
      e2v: {
        deep: true,
        handler: debounce(function() {
          this.testSchedule()
          this.$emit('changed', this.e2v)
        }, 500)
      },
    },
}

</script>

<style scoped>
.player-wrapper {
  resize: both;
}
</style>
