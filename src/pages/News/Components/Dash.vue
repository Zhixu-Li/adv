<template lang="html">
  <BRow>
    <BCol cols="12">
      <createNews class="col-12" />
    </BCol>
  </BRow>
</template>

<script>
import createNews from './createNews'
import {BCol, BRow} from 'bootstrap-vue-next'
export default {
  components: {
    createNews,
    BCol,
    BRow
  }
}
</script>

<style lang="css">
</style>
