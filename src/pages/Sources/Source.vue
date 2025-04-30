<template>
  <div class="row mt-2">
    <b-modal
      id="delete-modal"
      :title="$t('actions.delete') + ' ' + source.name"
    >
      {{ $t('message.sourceDelete') }}
      <!-- <div slot="modal-footer">
      <button type="button" class="btn delete-button btn-primary left" @click="deleteSource(); $bvModal.hide('delete-modal')">
      {{$t('answers.yes')}}</button>
      <button type="button" class="btn delete-button btn-primary right" @click="$bvModal.hide('delete-modal')">
      {{$t('answers.no')}}</button>
    </div> -->
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
    </b-modal>
    <b-modal
      id="edit-modal"
      size="xl"
      hide-footer
    >
      <template #modal-title>
        <input
          v-model="editSource.name"
          class="modal-title h4"
          :placeholder="$t('sources.sourceNamePH')"
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
    </b-modal>
    <b-col
      cols="12"
      class="source-nav"
    >
      <b-row>
        <b-col>
          <h1 class="source-name">
            {{ source.name }}
          </h1>
        </b-col>
        <b-col class="text-right">
          <b-button
            variant="danger"
            @click="$bvModal.show('delete-modal')"
          >
            {{ $t('buttons.delete') }}
          </b-button>
          &nbsp; <!-- is there a better way to do this? -->
          <b-button
            variant="primary"
            @click="updateSource()"
          >
            {{ $t('buttons.save') }}
          </b-button>
        </b-col>
      </b-row>
    </b-col>
    <b-col
      cols="12"
      class="h-100 source-main"
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
      <!-- main content -->
      <b-row class="mt-3">
        <b-col cols="12">
          <inspector :uri="editSource.uri" />

        <!-- <schedule-player
          :width=""
          :uri="'https://api.carswap.me/e2v/themoviedb.php'"
          :params='{"api_key": "e02189628c1b384fd99c3c8b4624dc1b", "duration": "10"}'
        ></schedule-player> -->
        </b-col>
        <b-col cols="6">
          <b-card
            class="mb-2"
            :header="$t('sources.editDetail')"
          >
            <b-card-text>
              <b-form-group
                :label="$t('sources.name')"
                :description="$t('sources.nameDesc')"
              >
                <b-form-input
                  v-model="editSource.name"
                  required
                />
              </b-form-group>
              <b-form-group
                :label="$t('sources.team')"
                :description="$t('sources.teamDesc')"
              >
                <b-form-input
                  v-model="activeTeam.name"
                  required
                  disabled
                />
              </b-form-group>
              <b-form-group
                :label="$t('sources.uri')"
                :description="$t('sources.uriDesc')"
              >
                <b-form-input
                  v-model="editSource.uri"
                  required
                  disabled
                />
              </b-form-group>
              <b-form-group
                :label="$t('sources.apiKey')"
                :description="$t('sources.apiDesc')"
              >
                <b-form-input v-model="editSource.api_key" />
              </b-form-group>
            </b-card-text>
          </b-card>
        </b-col>
        <b-col cols="6">
          <source-status :source="source" />
        </b-col>
      </b-row>
    </b-col>
  </div>
</template>

<script>
import SourceStatus from '@/components/Source/Status.vue'
import teamContext from '@/mixins/teamContext'
import Inspector from '@/components/Player/Inspector.vue'

export default {
  name: 'SourceComponent',
  components: {
      SourceStatus,
      Inspector
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
