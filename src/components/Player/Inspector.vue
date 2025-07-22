<template lang="html">
  <div>
    <BRow>
      <BCol cols="6" class="pb-4">
        <div v-if="validSchedule">
          <schedule-player
            width="100%"
            height="20em"
            :uri="uri"
            :params="e2v"
          />
        </div>
        <div v-else>
          <BPlaceholder
            class="w-100"
            style="height: 25vw;"
          />
        </div>
      </BCol>

      <BCol cols="6">
        <BRow>
          <BCol cols="12">
            <h4>
              E2V Stream Options
              <BButton
                v-if="parametersLoaded !== true"
                variant="primary"
                disabled
              >
                <BSpinner small type="grow" />
                Retrieving parameter list
              </BButton>
            </h4>

            <div v-if="parameters.length === 0">
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
                <BFormText v-if="selectCheck">
                  {{ parameter.desc }}
                </BFormText>
              </div>
              <div v-else>
                <BFormInput
                  :id="`e2v_${parameter.slug}`"
                  v-model="e2v[parameter.slug]"
                  :state="validSchedule"
                  :placeholder="parameter.name"
                  aria-describedby="input-live-feedback"
                  trim
                />
                <BFormInvalidFeedback id="input-live-feedback">
                  {{ errors[parameter.slug] }}
                </BFormInvalidFeedback>
                <BFormText :id="`e2v_${parameter.slug}`">
                  {{ parameter.desc }}
                </BFormText>
              </div>
            </div>
          </BCol>

          <BCol cols="12">
            <hr class="border" />
            <h4>Campaign Stats</h4>
            <BRow>
              <BCol>Matched Campaigns</BCol>
              <BCol><label>{{ totalCampaigns }}</label></BCol>
            </BRow>
            <BRow>
              <BCol>Shortest Campaign</BCol>
              <BCol><label>{{ minimumDuration }} seconds</label></BCol>
            </BRow>
            <BRow>
              <BCol>Longest Campaign</BCol>
              <BCol><label>{{ maximumDuration }} seconds</label></BCol>
            </BRow>

            <hr class="border" />
            <slot />
          </BCol>
        </BRow>
      </BCol>
    </BRow>
  </div>
</template>


<script>
import {
  BRow,
  BCol,
  BButton,
  BSpinner,
  BPlaceholder,
  BFormText,
  BFormInput,
  BFormInvalidFeedback
} from 'bootstrap-vue-next'

import axios from 'axios'
import { debounce } from 'lodash'
import SchedulePlayer from '@/components/Player/SchedulePlayer.vue'
import Multiselect from 'vue-multiselect'

// emit on change parameters? how do we get the settings up higher?

export default {
    components: {
      SchedulePlayer,
      Multiselect,
      BRow,
      BCol,
      BButton,
      BSpinner,
      BPlaceholder,
      BFormText,
      BFormInput,
      BFormInvalidFeedback,
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
