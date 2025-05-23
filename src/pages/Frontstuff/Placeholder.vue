<template>
  <BContainer>
    <h2>Coming Soon</h2>
    <BButton @click="$router.push({ path: '/' })">
      Back
    </BButton>
  </BContainer>
</template>

<script>

import {BContainer, BButton} from 'bootstrap-vue-next'
export default {
  components: {
    BContainer,
    BButton

}
}
</script>

<style lang="scss">

</style>
