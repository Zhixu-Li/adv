<template>
  <div>
    <BModal id="showteam" size="xl" hide-footer>
      <team :team-id="teamId" />
    </BModal>

    <BModal id="showleave" :title="$t('actions.leave')" size="md">
      {{ $t('message.leaveTeam') }} {{ team.name }}
      <template #modal-footer>
        <BButton
          type="button"
          variant="danger"
          class="mr-3"
          @click="leaveTeam(team.id)"
        >
          {{ $t('answers.yes') }}
        </BButton>
        <BButton
          type="button"
          variant="primary"
          @click="$bvModal.hide('showleave')"
        >
          {{ $t('answers.no') }}
        </BButton>
      </template>
    </BModal>

    <BModal id="newteam" :title="$t('teams.newTeam')" size="lg" hide-footer>
      <new-team />
    </BModal>

    <BCard>
      <template #header>
        {{ $t('teams.teams') }}
        <BButton
          v-if="showCreate"
          variant="primary"
          size="sm"
          class="float-right pointer"
          @click="$bvModal.show('newteam')"
        >
          &#10010;
        </BButton>
      </template>

      <BCardText>
        <div v-show="loading" class="loader">
          <div class="spinner" />
        </div>
        <div v-show="!loading">
          <div v-if="teams.length > 0">
            <ul class="list-group">
              <li
                v-for="team in teams"
                :key="team.teamId"
                class="list-group-item list-group-item-action justify-content-between pointer"
                @click="viewTeam(team.teamId)"
              >
                {{ team.name }}
                <span
                  class="badge badge-danger"
                  @click.stop="showLeaveTeam(team.name, team.teamId)"
                >
                  {{ $t('actions.leave') }}
                </span>
              </li>
            </ul>
            <BButtonGroup class="mt-2">
              <BButton
                v-if="teamsMeta.totalPages > 1 && currentPage !== 1"
                variant="outline-secondary"
                @click="fetchTeams(teamsMeta.previousPage)"
              >
                {{ $t('buttons.previous') }}
              </BButton>
              <BButton
                v-if="teamsMeta.totalPages > 1 && currentPage !== teamsMeta.totalPages"
                variant="outline-secondary"
                @click="fetchTeams(teamsMeta.nextPage)"
              >
                {{ $t('buttons.next') }}
              </BButton>
            </BButtonGroup>
          </div>
          <div v-else>
            <span>{{ $t('message.noTeam') }}</span>
          </div>
        </div>
      </BCardText>
    </BCard>
  </div>
</template>
<script>
import NewTeam from '@/components/User/NewTeam.vue'
import Team from '@/components/User/Team.vue'
import {
  BModal,
  BCard,
  BCardText,
  BButton,
  BButtonGroup
} from 'bootstrap-vue-next'

export default{
  name: 'Teams',
  components: {
    NewTeam,
    Team,
    BModal,
    BCard,
    BCardText,
    BButton,
    BButtonGroup,
  },
  props: {
    userId: {
      type: Number,
      required: true
    },
    showCreate: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data () {
    return {
      teams: [],
      teamsMeta: {},
      currentPage: 1,
      teamId: 0,
      team: {
        name: '',
        id: 0
      },
      loading: true
    }
  },
  watch: {
    userId () {
      this.fetchTeams(this.currentPage)
    }
  },
  mounted () {
    this.fetchTeams(1)
  },
  methods: {
    fetchTeams (page) {
      var scope = this
      this.loading = true
      this.$axios.get('v1/users/' + this.userId + '/teams?restrict&limit=5&page=' + page).then(
        (response) => {
          this.teams = response.data.data
          this.teamsMeta = response.data.meta
          this.currentPage = page
          this.loading = false
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
          scope.loading = false
        }
      )
    },
    viewTeam (teamId) {
      this.teamId = teamId
      this.$bvModal.show('showteam')
    },
    closeTeam () {
      this.fetchTeams(this.currentPage)
      this.$bvModal.hide('showteam')
    },
    showLeaveTeam (teamName, teamId) {
      this.team.name = teamName
      this.team.id = teamId
      this.$bvModal.show('showleave')
    },
    leaveTeam (teamId) {
      this.$axios.delete('v1/teams/' + teamId + '/users/' + this.userId).then(
        () => {
          this.$notifications.add({
            title: this.$t('message.success'),
            type: 'success',
            body: this.$t('notifications.teamLeave'),
            timeout: true
          })
          this.fetchTeams(this.currentPage)
          this.$bvModal.hide('showleave')
        },
        () => {
          this.$notifications.add({
            title: this.$t('message.error'),
            type: 'danger',
            body: this.$t('notifications.userRemoveError'),
            timeout: true
          })
      this.$bvModal.hide('showleave')
        }
      )
    },
    closeNewTeam () {
      this.fetchTeams(this.currentPage)
      this.$bvModal.hide('newteam')
    }
  }
}
</script>
<style lang="scss">
  .leave-button {
    margin: 5px;
  }
</style>
