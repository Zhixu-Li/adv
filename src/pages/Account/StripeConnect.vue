<template lang="html">
  <div class="text-center">
    <div class="loader" />
    <h4>{{ $t('account.stripeCon') }}</h4>
  </div>
</template>

<script>
export default {
  mounted () {
    if (this.$route.query.state) {
      let teamId = this.$route.query.state
      let data = {
        code: this.$route.query.code,
        scope: this.$route.query.scope
      }
      this.$axios.post('v1/teams/' + teamId + '/stripe', data).then(
        () => {
          this.$notifications.add({
            title: 'Success',
            type: 'success',
            body: this.$t('notifications.stripeConnect'),
            timeout: true
          })
          this.$router.push('Account')
        },
        (response) => {
          if (response.status === 401) {
            this.$notifications.add({
              title: 'Error',
              type: 'danger',
              body: this.$t('notifications.stripeUserError'),
              timeout: true
            })
          } else {
            this.$notifications.add({
              title: 'Error',
              type: 'danger',
              body: this.$t('notifications.stripeConnectError'),
              timeout: true
            })
          }
          this.$router.push('Account')
        }
      )
    } else {
      this.$notifications.add({
        title: 'Error',
        type: 'danger',
        body: this.$t('notifications.stripeConnectError'),
        timeout: true
      })
    }
  }
}
</script>

<style lang="css">
</style>
