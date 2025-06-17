// this can't be added as a global mixin since not all components get activeTeam passed as a prop

export default {
    props: {
        activeTeam: {
            type: Object,
            required: true,
        },
    },
    methods: {
        getTeamName(id) {
            return this.$auth.user.teams[id].name
        },
    },
    computed: {
        multiselectTeams: function() {
            return Object.keys(this.$auth.user.teams).map((id => 
            {
            return {
                teamId: id,
                name: this.$auth.user.teams[id].name
            }
            }))
        },
    }
}