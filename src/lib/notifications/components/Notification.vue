<template lang="html">
  <div
    :class="['alert', 'notification' , type, {'alert-dismissible': notification.dismissable}]"
    role="alert"
  >
    <button
      v-if="notification.dismissable"
      type="button"
      class="close"
      @click="$notifications.remove(notification)"
    >
      <span aria-hidden="true">&times;</span>
    </button>
    <strong>{{ notification.title }}</strong> - {{ notification.body }}
  </div>
</template>

<script>
export default {
  name: 'Notification',
  props: {
    notification: {
      type: Object,
      required: true
    }
  },
  computed: {
    type () {
      if (this.notification.type !== undefined) {
        return 'alert-' + this.notification.type
      } else {
        return 'alert-success'
      }
    }
  },
  mounted () {
    if (this.notification.timeout) {
      let self = this
      setTimeout(() => {
        self.$notifications.remove(self.notification)
      }, 5000)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
