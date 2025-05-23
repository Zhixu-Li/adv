<template>
  <div class="row mt-2">
    <BModal
      id="delete-modal"
      :title="$t('actions.delete') + ' ' + source.name"
    >
      {{ $t('message.sourceDelete') }}
      <template #modal-footer>
        <button
          type="button"
          class="btn delete-button btn-primary left"
          @click="deleteSource(); $bvModal.hide('delete-modal')"
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
    </BModal>

    <BModal
      id="edit-modal"
      size="xl"
      hide-footer
    >
      <template #modal-title>
        <input
          v-model="editSource.name"
          class="modal-title h4"
          :placeholder="$t('sources.sourceNamePH')"
        />
      </template>
      <div v-if="errors.length" class="alert alert-danger">
        <ul>
          <li v-for="(error, i) in errors" :key="i">{{ error }}</li>
        </ul>
      </div>
    </BModal>

    <BCol cols="12" class="source-nav">
      <BRow>
        <BCol>
          <h1 class="source-name">{{ source.name }}</h1>
        </BCol>
        <BCol class="text-right">
          <BButton variant="danger" @click="$bvModal.show('delete-modal')">
            {{ $t('buttons.delete') }}
          </BButton>
          &nbsp;
          <BButton variant="primary" @click="updateSource()">
            {{ $t('buttons.save') }}
          </BButton>
        </BCol>
      </BRow>
    </BCol>

    <BCol cols="12" class="h-100 source-main">
      <div v-if="errors.length" class="mt-2 mb-2 alert alert-danger">
        <ul>
          <li v-for="(error, i) in errors" :key="i">{{ error }}</li>
        </ul>
      </div>
      <BRow class="mt-3">
        <BCol cols="12">
          <Inspector :uri="editSource.uri" />
        </BCol>
        <BCol cols="6">
          <BCard class="mb-2" :header="$t('sources.editDetail')">
            <BCardText>
              <BFormGroup
                :label="$t('sources.name')"
                :description="$t('sources.nameDesc')"
              >
                <BFormInput v-model="editSource.name" required />
              </BFormGroup>
              <BFormGroup
                :label="$t('sources.team')"
                :description="$t('sources.teamDesc')"
              >
                <BFormInput v-model="activeTeam.name" required disabled />
              </BFormGroup>
              <BFormGroup
                :label="$t('sources.uri')"
                :description="$t('sources.uriDesc')"
              >
                <BFormInput v-model="editSource.uri" required disabled />
              </BFormGroup>
              <BFormGroup
                :label="$t('sources.apiKey')"
                :description="$t('sources.apiDesc')"
              >
                <BFormInput v-model="editSource.api_key" />
              </BFormGroup>
            </BCardText>
          </BCard>
        </BCol>
        <BCol cols="6">
          <SourceStatus :source="source" />
        </BCol>
      </BRow>
    </BCol>
  </div>
</template>
<script>
import SourceStatus from '@/components/Source/Status.vue'
import teamContext from '@/mixins/teamContext'
import Inspector from '@/components/Player/Inspector.vue'
import {
  BModal,
  BRow,
  BCol,
  BButton,
  BCard,
  BCardText,
  BFormGroup,
  BFormInput
} from 'bootstrap-vue-next'
export default {
  name: 'SourceComponent',
  components: {
      SourceStatus,
      Inspector,
      BModal,
      BRow,
      BCol,
      BButton,
      BCard,
      BCardText,
      BFormGroup,
      BFormInput
  },
  mixins: [teamContext],
  props: {
    source: {
      type: Object,
      required: true
    },
  },
  data () {
    return {
      errors: [],
      dropdownOpen: false,
      created: false,
      editSource: {...this.source}
    }
  },
  computed: {
  },
  watch: {
    'source': {
      handler () {
        this.editSource = {...this.source}
      },
      deep: true
    }
  },
  beforeUnmount () {
    this.$emit('refresh')
  },
  mounted () {
  },
  methods: {
    updateSource () {
      this.$axios.post('v1/sources/' + this.editSource.sourceId, this.editSource).then(
        () => {
            this.$notifications.add({
            title: 'Success',
            type: 'success',
            body: this.$t('notifications.sourceUpdate'),
            timeout: true
            })
            this.$emit('update')
        },
        () => {
            this.$notifications.add({
            title: 'Error',
            type: 'danger',
            body: this.$t('notifications.sourceError'),
            timeout: true
            })
        })
    },
    deleteSource () {
      this.$axios.delete('v1/sources/' + this.editSource.sourceId).then(
      () => {
        this.$notifications.add({
          title: 'Success',
          type: 'success',
          body: this.$t('notifications.sourceDelete'),
          timeout: true
        })
        this.$emit('update')
      },
      () => {
        this.$notifications.add({
          title: 'Error',
          type: 'danger',
          body: this.$t('notifications.sourceDeleteError'),
          timeout: true
        })
      })
    },
  }
}
</script>


<style scoped lang="scss">
  .fade-enter-active {
    transition: opacity .5s
  }
  .fade-enter {
    opacity: 0
  }

  .source-nav {
    border-bottom: #e9e9e9 solid 1px;
    padding: 0 20px 0 20px;
    // position: fixed;
    // z-index: 1001;
    background-color: white;
  }

  .source-main {
    padding-top: 54px;
    // z-index: 1000;
  }

  .delete-button {
    margin: 5px;
  }

// @import "node_modules/bootstrap/scss/_functions.scss";
// @import "node_modules/bootstrap/scss/_variables.scss";
// @import "node_modules/bootstrap/scss/mixins/_breakpoints.scss";

@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/bootstrap";
  .modal-title {
    border:1px solid #cccfd0
  }

  @include media-breakpoint-up(xs) {
    .dropdown-toggle {
      display: none;

      &.ellipsis {
        display:block;
      }
    }

    .source-name {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  @include media-breakpoint-up(md) {
    .dropdown-toggle {
      display: block;

      &.ellipsis {
        display: none;
      }
    }

    .source-nav {
      position: absolute;
    }
  }

</style>
