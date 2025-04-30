<template lang="html">
  <b-row>
    <b-col cols="6">
      <b-form-group
        :label="$t('sources.name')"
        :description="$t('sources.nameDesc')"
      >
        <b-form-input
          v-model="source.name"
          required
        />
      </b-form-group>
      <b-form-group
        :label="$t('sources.team')"
        description=""
      >
        <b-form-input
          v-model="activeTeam.name"
          disabled
        />
      </b-form-group>
      <b-form-group
        :label="$t('sources.uri')"
        :description="$t('sources.uriDesc')"
      >
        <b-form-input
          v-model="source.uri"
          required
          @input="checkURL()"
        />
        <b-form-invalid-feedback :state="isGoodURL">
          {{ $t('sources.badUrl') }}
        </b-form-invalid-feedback>
        <b-form-valid-feedback :state="isGoodURL">
          {{ $t('sources.goodUrl') }}
        </b-form-valid-feedback>
      </b-form-group>
      <b-form-group
        :label="$t('sources.apiKey')"
        :description="$t('sources.apiDesc')"
      >
        <b-form-input v-model="source.api_key" />
      </b-form-group>
      <b-form-group
        label="API Type"
        description="File type of API data"
        :invalid-feedback="invalidType"
        :state="state"
      >
        <b-form-select
          v-model="selected"
          :options="typeSelection"
          :state="state"
        />
      </b-form-group>

      <b-button
        variant="primary"
        @click="createSource()"
      >
        {{ $t('buttons.save') }}
      </b-button>
    </b-col>
    <b-col cols="6">
      <source-status :source="source" />
    </b-col>
    <!-- Button to get and add API elements to E2V campaign. This is so the user will set the logic which is separate between E2V campaigns -->
    <!-- @click="addE2VElement()" :disabled="isGoodURL !== true" -->
    <b-button
      block
      variant="secondary"
      :disabled="isGoodURL !== true"
      @click="addE2VElement()"
    >
      Add API Element
    </b-button>
    <b-container>
      <b-row />
    </b-container>
  </b-row>
</template>

<script>
import SourceStatus from '@/components/Source/Status.vue'
import _ from 'lodash'
import teamContext from '@/mixins/teamContext'

export default {
    components: {
      SourceStatus
    },
    mixins: [teamContext],
    props: {
    },
    data () {
        return {
            selectedTeam: '',
            isGoodURL: false,
            elements: [
                {
                    name: ''
                }
            ],
            source: {
                api_key: null,
                uri: null,
                name: null,
                teamId: null,
            },
            timer: setTimeout( () => { this.checkURL() }, 1000),
            selected: null,
            typeSelection: [
                {value: null, text: '- Please select data input type -'},
                {value: 'json', text: "JSON"},
                {value: 'xml', text: "XML (in progress)", notEnabled: true}
            ],
            invalidType() {
                if (this.typeSelection == null) {
                    return 'Please select API data file type.'
                }
            }
        }
    },
    beforeUnmount() {
        clearTimeout(this.timer)
    },
    methods: {
    emitRefresh() {
        this.$emit('refresh')
    },
    checkURL: _.debounce(
        function() {
            if ((this.source.uri !== null) && (this.source.uri !== '')) {
                this.$axios.get(this.source.uri, {
                params: { _path: '/status' },
                }).then(
                (response) => {
                    if (response.data.campaigns) {
                        this.isGoodURL = true
                    }
                    else {
                        this.isGoodURL = false
                    }
                },
                () => {
                    this.isGoodURL = false
                })
            }
        }, 500),

    createSource() {
        this.source.teamId = this.activeTeam.id

        if (this.isGoodURL === true) {
            this.$axios.post('v1/sources', this.source).then(
                () => {
                    this.$notifications.add({
                    title: 'Success',
                    type: 'success',
                    body: this.$t('notifications.sourceCreate'),
                    timeout: true
                    })
                    this.$emit('refresh')
                    this.$bvModal.hide('new-source')
                },
                () => {
                    this.$notifications.add({
                    title: 'Error',
                    type: 'danger',
                    body: this.$t('notifications.sourceError'),
                    timeout: true
                    })
                })
            }
            else {
                this.$notifications.add({
                title: 'Error',
                type: 'danger',
                body: this.$t('notifications.sourceError'),
                timeout: true
                })
            }
        },
    addE2VElement() {
        // Add 
        if (this.isGoodURL === true) {
            this.element.push({name: ''})
        }
        else {
            this.$notifications.add({
            title: 'Error',
            type: 'danger',
            body: this.$t('notifications.sourceError'),
            timeout: true
            })
        }
    }
    },
}
</script>
