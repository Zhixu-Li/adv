<template lang="html">
  <BRow class="p-0 m-0">
    <BCol class="m-2">
      <multiselect
        v-model="selectedTeam"
        :placeholder="'🔍 ' + $t('type to search')"
        :options="transformedTeams"
        track-by="teamId"
        label="name"
        :allow-empty="false"
        @input="getTeamID"
      />
    </BCol>
  </BRow>
</template>

<script>
import Multiselect from 'vue-multiselect'
import { BCol, BRow } from 'bootstrap-vue-next'
export default {
  components: {
    Multiselect,
    BCol,
    BRow,
  },
  props: {
    resetTeamsTrigger: {
      type: Number,
      required: true
    },
  },
  data() {
    return {
      selectedTeam: {name: 'No Team Selected', teamId: 0 },
      selectedTeamId: 0,
    }
  },
  computed: {
    transformedTeams: function() {
      // this is to force updating because $auth teams is not observable
      this.resetTeamsTrigger;
      return this.getAuthTeams()
    },
  },
  watch: {
    resetTeamsTrigger: function() {
      let teams = this.getAuthTeams()
      if (teams.length > 0) {
        let previously_saved = this.savedTeamExists(teams)
        if (previously_saved) {
          this.selectedTeam   = previously_saved
          this.selectedTeamId = previously_saved.teamId
        }
        else {
          this.selectedTeam   = teams[0]
          this.selectedTeamId = teams[0].teamId
        }
      }
      else {
        this.selectedTeam = { name: 'No Team Selected', teamId: 0 }
        this.selectedTeamId = 0
      }
    },
    selectedTeamId: function() {
      if (this.selectedTeamId === 0) {
        this.$emit('updateTeam', { name: 'No Team Selected', id: this.selectedTeamId })
      }
      else {
        this.$emit('updateTeam', { name: this.$auth.user.teams[this.selectedTeamId].name, id: this.selectedTeamId })
        localStorage.setItem('saved_team', JSON.stringify(this.selectedTeam))
      }
    },
  },
  mounted () {
  },
  methods: {
    getTeamID(obj) {
      this.selectedTeamId = obj ? obj.teamId : 0
    },
    getAuthTeams() {
      return Object.keys(this.$auth.user.teams).map((id => ({
            teamId: id,
            name: this.$auth.user.teams[id].name
      }))).sort(function(a,b){if(a.name.localeCompare(b.name) > 0){return 1} else {return -1}})
    },
    savedTeamExists(teams) {
      let maybeTeam = JSON.parse(localStorage.getItem('saved_team'))
      if (maybeTeam && teams.findIndex(t => (maybeTeam.teamId === t.teamId)) !== -1) {
        return maybeTeam
      }
      else {
        return false
      }
    }
  },
}
</script>

<style scoped lang="scss">

@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/bootstrap";
</style>
