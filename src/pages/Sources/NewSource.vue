<template lang="html">
  <BRow>
    <BCol cols="6">
      <BFormGroup
        :label="$t('sources.name')"
        :description="$t('sources.nameDesc')"
      >
        <BFormInput
          v-model="source.name"
          required
        />
      </BFormGroup>

      <BFormGroup
        :label="$t('sources.team')"
      >
        <BFormInput
          v-model="activeTeam.name"
          disabled
        />
      </BFormGroup>

      <BFormGroup
        :label="$t('sources.uri')"
        :description="$t('sources.uriDesc')"
      >
        <BFormInput
          v-model="source.uri"
          required
          @input="checkURL"
        />
        <BFormInvalidFeedback :state="isGoodURL">
          {{ $t('sources.badUrl') }}
        </BFormInvalidFeedback>
        <BFormValidFeedback :state="isGoodURL">
          {{ $t('sources.goodUrl') }}
        </BFormValidFeedback>
      </BFormGroup>

      <BFormGroup
        :label="$t('sources.apiKey')"
        :description="$t('sources.apiDesc')"
      >
        <BFormInput v-model="source.api_key" />
      </BFormGroup>

      <BFormGroup
        label="API Type"
        description="File type of API data"
        :invalid-feedback="invalidType"
        :state="state"
      >
        <BFormSelect
          v-model="selected"
          :options="typeSelection"
          :state="state"
        />
      </BFormGroup>

      <BButton variant="primary" @click="createSource">
        {{ $t('buttons.save') }}
      </BButton>
    </BCol>

    <BCol cols="6">
      <!-- custom component remains PascalCase -->
      <SourceStatus :source="source" />
    </BCol>

    <BButton
      block
      variant="secondary"
      :disabled="isGoodURL !== true"
      @click="addE2VElement"
    >
      Add API Element
    </BButton>

    <BContainer>
      <BRow />
    </BContainer>
  </BRow>
</template>

<script>
import {
  BRow,
  BCol,
  BContainer,
  BFormGroup,
  BFormInput,
  BFormSelect,
  BFormInvalidFeedback,
  BFormValidFeedback,
  BButton
} from 'bootstrap-vue-next'
import SourceStatus from '@/components/Source/Status.vue'
import _ from 'lodash'
import teamContext from '@/mixins/teamContext'

export default {
    components: {
      SourceStatus,
      BRow,
  BCol,
  BContainer,
  BFormGroup,
  BFormInput,
  BFormSelect,
  BFormInvalidFeedback,
  BFormValidFeedback,
  BButton,
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
