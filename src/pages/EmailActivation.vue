<template>
  <div class="h-100 w-100">
    <div class="centered">
      <h4 v-if="activated">
        {{ $t('user.accountActivated') }}
      </h4>
      <h4 v-else>
        {{ $t('user.activationProblem') }}
      </h4>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      activated: false
    }
  },
  mounted () {
    this.activate()
  },
  methods: {
    activate () {
      if ((this.$route.params.userId !== undefined) && (this.$route.params.hash !== undefined))
      {
        this.$axios.get('auth/activate/' + this.$route.params.userId + '/' + this.$route.params.hash).then(
        () => {
          this.activated = true
        },
        () => {
          this.$notifications.add({
            title: 'Alert',
            type: 'warning',
            body: this.$t('notifications.accountActivateError'),
            timeout: true
          })
        })
      }
    }
  }
}

</script>
<style scoped>
.centered {
    text-align: center;
    position: relative;
    top: 50%;
    margin: auto;
    margin-top: -1em;
}
</style>
