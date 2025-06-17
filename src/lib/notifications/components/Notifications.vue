<template lang="html">
  <div class="notifications">
    <transition-group
      name="notifications"
      tag="p"
    >
      <!-- this will not shut up about .body contents not being a good key (duh) -->
      <notification
        v-for="notification in notifications"
        :key="notification.body"
        :notification="notification"
      />
    </transition-group>
  </div>
</template>

<script>
import Notification from './Notification.vue'
export default {
  name: 'Notifications',
  components: {
    Notification
  },
  data () {
    return {
      notifications: this.$notifications.state
    }
  }
}
</script>

<style lang="scss" scoped>
// @import "node_modules/bootstrap/scss/_functions.scss";
// @import "node_modules/bootstrap/scss/_variables.scss";
// @import "node_modules/bootstrap/scss/mixins/_breakpoints.scss";
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/bootstrap";
@include media-breakpoint-down(md) {
  .notifications {
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    width: 80%
  }
}
.notifications {
  pointer-events: none;
  position: fixed;
  right: 35px;
  bottom: 50px;
  z-index: 1050;
}

.notifications-enter-active, .notifications-leave-active {
  transition: all 0.75s;
}
.notifications-enter, .notifications-leave-to /* .list-leave-active for <2.1.8 */ {
  opacity: 0;
}
</style>
