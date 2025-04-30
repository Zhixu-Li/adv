<template>
  <b-row>
    <b-modal
      id="delete-modal"
      :title="$t('actions.delete') + ' ' + localCampaign.name"
    >
      {{ $t('message.campaignDelete') }}
      <template #modal-footer>
        <button
          type="button"
          class="btn delete-button btn-primary left"
          @click="deleteCampaign(); $bvModal.hide('delete-modal')"
        >
          {{ $t('answers.yes') }}
        </button>
        <button
          type="button"
          class="btn delete-button btn-primary right"
          @click="$bvModal.hide('delete-modal')"
        >
          {{ $t('answers.no') }}
        </button>
      </template>
    </b-modal>

    <b-modal
      id="edit-modal"
      no-close-on-backdrop
      size="xl"
      hide-footer
    >
      <template #modal-title>
        <input
          v-model="localCampaign.name"
          class="form-control w-50"
          placeholder="Campaign Name"
        >
      </template>
      <div
        v-if="errors.length > 0"
        class="alert alert-danger"
      >
        <ul>
          <li
            v-for="(error, index) in errors"
            :key="index"
          >
            {{ error }}
          </li>
        </ul>
      </div>
      <campaign-editor
        v-if="Object.keys(localCampaign).length > 0"
        :active-team="activeTeam"
        :campaign="localCampaign"
        @saved="$emit('close')"
      />
    </b-modal>

    <b-col
      cols="12"
      class="campaign-nav w-100"
    >
      <div class="d-flex justify-content-center align-items-center">
        <h1 class="campaign-name d-none d-md-block">
          {{ localCampaign.name }}
        </h1>
        <b-button-toolbar>
          <b-button
            v-b-modal.edit-modal
            class="m-1 border-primary text-primary"
            variant="light"
          >
            <font-awesome-icon
              icon="list"
              class="me-2"
            />Edit Campaign
          </b-button>
          <b-button
            v-b-modal.delete-modal
            class="m-1 border-danger text-danger"
            variant="light"
          >
            <font-awesome-icon icon="circle-xmark" />{{ $t('buttons.delete') }}
          </b-button>
        </b-button-toolbar>
      </div>
    </b-col>

    <b-col
      cols="12"
      class="h-100 campaign-main"
    >
      <div
        v-if="errors.length > 0"
        class="mt-2 mb-2 alert alert-danger"
      >
        <ul>
          <li
            v-for="(error, index) in errors"
            :key="index"
          >
            {{ error }}
          </li>
        </ul>
      </div>
      <transition name="fade">
        <edit-campaign
          :active-team="activeTeam"
          :campaign="localCampaign"
          @update="$emit('update', localCampaign)"
        />
      </transition>
    </b-col>
  </b-row>
</template>

<script>
import EditCampaign from './EditCampaign.vue'
import CampaignEditor from '@/components/CampaignEditor/CampaignEditor.vue'
import teamContext from '@/mixins/teamContext'

export default {
  name: 'Campaign',
  components: {
    EditCampaign,
    CampaignEditor
  },
  mixins: [teamContext],
  props: {
    campaign: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      localCampaign: {},
      errors: [],
      dropdownOpen: false,
      created: false,
    }
  },
  watch: {
    campaign: {
      handler(newVal) {
        this.localCampaign = { ...newVal }
      },
      immediate: true,
      deep: true
    }
  },
  beforeUnmounted () {
    this.$emit('refresh')
  },
  methods: {
    deleteCampaign () {
      this.$axios.delete('v1/campaigns/' + this.localCampaign.campaignId).then(
        () => {
          this.$notifications.add({
            title: 'Success',
            type: 'success',
            body: this.$t('notifications.campaignDelete'),
            timeout: true
          })
          this.$emit('delete', this.localCampaign)
        },
        () => {
          this.$notifications.add({
            title: 'Error',
            type: 'danger',
            body: this.$t('notifications.campaignDeleteError'),
            timeout: true
          })
        }
      )
    }
  }
}
</script>

<style scoped lang="scss">
.wvh-50 {
  width: 50vw;
}

.campaign-nav {
  z-index: 1001;
}

.campaign-main {
  z-index: 1000;
}

.campaign-name {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/bootstrap";
</style>
