<template lang="html">
  <BTh>
    <div class="ipam-header text-center">
      <BLink
        class="text-dark"
        :to="{ name: 'display-view', params: { displayId: display.displayId } }"
      >
        {{ display.name }}
      </BLink>
    </div>
  </BTh>
</template>


<script>
import { BTh, BLink } from 'bootstrap-vue-next'
export default {
    name: 'IpamHeader',
    components:{
      BTh,
      BLink
    },
    props: {
        display: {
        type: Object,
        required: true
        },
        
    },
    methods: {
        
    }
}
</script>

<style>
.ipam-header {
    line-height: 1em;
    max-height: 4em;
    white-space: wrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
a {
    display: block;
}
</style>