<template lang="html">
  <BContainer id="verge">
    <!-- Aspect & Rotate Controls (desktop only) -->
    <BRow class="d-none d-md-block">
      <BCol class="m-2 d-flex justify-content-center">
        <div class="m-1">
          <BButtonGroup class="m-1">
            <BButton
              v-for="aspect in Object.keys(aspects)"
              :key="aspect"
              class="font-weight-bold"
              size="sm"
              :variant="selectedAspect === aspect ? 'dark' : 'outline-dark'"
              @click="selectedAspect = aspect"
            >
              {{ aspect }}
            </BButton>
          </BButtonGroup>
          <BButtonGroup class="m-1">
            <BButton
              class="font-weight-bold"
              size="sm"
              :variant="isRotated ? 'secondary' : 'outline-secondary'"
              @click="isRotated = !isRotated"
            >
              Rotate
              <!-- <BIcon
                :icon="isRotated ? 'check-square' : 'square'"
                :variant="isRotated ? 'light' : 'dark'"
              /> -->
              <font-awesome-icon
                :icon="isRotated ? 'check-square' : 'square'"
                  :class="isRotated ? 'text-light' : 'text-dark'"
                :size="'lg'"
                />
            </BButton>
          </BButtonGroup>
        </div>
      </BCol>
    </BRow>

    <!-- Player -->
    <BRow>
      <BCol>
        <prop-player
          :no-controls="false"
          class="m-0 p-0 mx-auto mb-4"
          :style="computedAspectStyle"
          :media="computedMedia"
        />
      </BCol>
    </BRow>

    <!-- Tags & Scheduled On -->
    <BRow>
      <BCol cols="12" sm="6">
        <BCard :header="$t('common.tags')">
          <BCardText>
            <BFormGroup :description="$t('campaigns.campaignTagDesc')">
              <multiselect
                :options="alltags"
                :value="selected"
                multiple
                taggable
                :placeholder="$t('message.addTag')"
                @tag="addTag"
                @select="chooseTag"
                @remove="removeTag"
              />
            </BFormGroup>
            <BButton variant="primary" @click="saveTags()">
              {{ $t('buttons.save') }}
            </BButton>
          </BCardText>
        </BCard>
      </BCol>

      <BCol cols="12" sm="6">
        <BCard :header="$t('campaigns.scheduledOn')">
          <BCardText>
            <dl>
              <dd v-for="display in campaign.displays" :key="display.id">
                <BLink :to="{ name: 'display-view', params: { displayId: display.id } }">
                  {{ display.name }}
                </BLink>
              </dd>
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
  BButtonGroup,
  BButton,
  // BIcon,
  BCard,
  BCardText,
  BFormGroup,
  BLink
} from 'bootstrap-vue-next'
import Multiselect from 'vue-multiselect'
import PropPlayer from '@/components/Player/PropPlayer.vue'
import teamContext from '@/mixins/teamContext'
import verge from 'verge'
import _ from 'lodash'

export default {
  name: 'EditCampaign',
  components: {
    Multiselect,
    PropPlayer,
    BContainer,
    BRow,
    BCol,
    BButtonGroup,
    BButton,
    // BIcon,
    BCard,
    BCardText,
    BFormGroup,
    BLink,
  },
  mixins: [teamContext],
  props: {
    campaign: {
      type: Object,
      required: true
    },
  },
  data () {
    return {
      // tags
      tags: [{
        tagId: '',
        tag: ''
      }],
      alltags: [],
      oldtags: [],
      newtags: [],
      rect: {},
      selectedTeam: '',
      currentTeam: '',
      selected: [],
      displays: {},
      /* values:
        9:16
        10:16
        3:4

        16:9 -> 85 x 48
        16:10 -> 77 x 48
        4:3 -> 64 x 48
        1:1 -> 48 x 48
      */
      aspects: {
        '16:10':  {width: 77, height: 48},
        '16:9':   {width: 85, height: 48},
        '5:3':    {width: 80, height: 48},
        '4:3':    {width: 64, height: 48},
        '3:2':    {width: 72, height: 48},
        '2:1':    {width: 96, height: 48},
        '1:1':    {width: 48, height: 48},
      },
      isRotated: false,
      selectedAspect: '16:9', // just a default
      // selectedWidth: '48vh',
      // selectedHeight: '77vh',
    }
  },
  computed: {
    // i realise that this could probably just be done with v-if but... eh
    // [Vue warn]: Error in render: "TypeError: Cannot read property 'data' of undefined"
    computedMedia() {
      if (this.campaign.media && this.campaign.media.data) {
        return this.campaign.media.data
      }
      else {
        return []
      }
    },
    computedAspectStyle() {
      if (this.isRotated == true) {
        return {
          width: this.rect.width * Number('0.'+this.aspects[this.selectedAspect].height) +'px',
          height: (this.rect.width * 1.111) * Number('0.'+this.aspects[this.selectedAspect].width) +'px',
        }
      }
      else {
        return {
          width: this.rect.width * Number('0.'+this.aspects[this.selectedAspect].width) +'px',
          height: (this.rect.width * 1.111) * Number('0.'+this.aspects[this.selectedAspect].height) +'px',
        }
      }
    }
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.handlePreview)
  },
  mounted () {
    this.fetchCampaignTags()
    this.handlePreview()
    window.addEventListener('resize', this.handlePreview)
    this.detectAspect()
  },
  methods: {
    handlePreview: _.debounce(
      function () {
        this.rect = verge.rectangle(document.querySelector('#verge'))
    }, 200),
    detectAspect() {
      function gcd(a, b) {
        return (b == 0) ? a : gcd (b, a%b);
      }

      let max_w = this.campaign.media.data.reduce((a,c) => Math.max(a,c.width), 0)
      let max_h = this.campaign.media.data.reduce((a,c) => Math.max(a,c.height), 0)

      if (max_w !== 0 && max_h !== 0) {
        let r = gcd(max_w, max_h)
        let aspect = max_w/r + ':' + max_h/r

        if (this.aspects[aspect]) {
          this.selectedAspect = aspect
        }
      }
      // otherwise just use default value (16:9)
    },
    fetchCampaignTags () {
      var scope = this
      this.$axios.get('v1/campaigns/' + this.campaign.campaignId + '/tags').then(
      (response) => {
        this.tags = response.data.data
        this.meta = response.data.meta
        for (var t in this.tags) {
          this.alltags.push(this.tags[t].tag)
          this.selected.push(this.tags[t].tag)
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
    saveTags () {
      // get ids of removed tags - then remove
      for (var r = 0; r < this.oldtags.length; r++) {
        for (var t = 0; t < this.tags.length; t++) {
          if (this.tags[t].tag === this.oldtags[r]) {
            this.$axios.delete('v1/campaigns/' + this.campaign.campaignId + '/tags/' + this.tags[t].tagId).then(
            () => {
              this.$notifications.add({
                title: 'Success',
                type: 'success',
                body: this.tags[t].tag + ' ' + this.$t('notifications.tagRemove'),
                timeout: true
              })
            },
            (response) => {
              this.$notifications.add({
                title: 'Error',
                type: 'danger',
                body: JSON.stringify(response),
                timeout: true
              })
            })
            break
          }
        }
      }
      // create new tags
      for (var n in this.newtags) {
        // doing the adding
        if (this.newtags[n].length > 255) {
          this.$notifications.add({
            title: 'Error',
            type: 'danger',
            body: this.$t('notifications.tagLengthError'),
            timeout: true
          })
        } else {
          this.$axios.post('v1/campaigns/' + this.campaign.campaignId + '/tags', {tag: this.newtags[n].trim()}).then(
          () => {
            this.$notifications.add({
              title: 'Success',
              type: 'success',
              body: this.newtags[n].trim() + ' ' + this.$t('notifications.tagAdded'),
              timeout: true
            })
          },
          (response) => {
            this.$notifications.add({
              title: 'Error',
              type: 'danger',
              body: JSON.stringify(response),
              timeout: true
            })
          })
        }
      }
    },
    // add new tag to tags and selections
    addTag (newTag) {
      this.alltags.push(newTag)
      this.selected.push(newTag)
      this.newtags.push(newTag)
    },
    // select a tag
    chooseTag (newTag) {
      this.selected.push(newTag)
      var index = this.oldtags.indexOf(newTag)
      if (index > -1) {
        this.oldtags.splice(index, 1)
      }
    },
    // remove tag from selections
    removeTag (oldTag) {
      var index = this.selected.indexOf(oldTag)
      if (index > -1) {
        this.selected.splice(index, 1)
      }
      this.oldtags.push(oldTag)
    }
  }
}
</script>

<style>

.preview {
  width: 99%;
  text-align: center;
}

.thick-border {
  border-width: 2px;
}

</style>
