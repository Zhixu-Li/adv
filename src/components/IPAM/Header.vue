<template lang="html">
  <b-th>
    <div class="ipam-header text-center">
      <b-link
        class="text-dark"
        :to="{ name: 'display-view', params: { displayId: display.displayId } }"
      >
        {{ display.name }}
      </b-link>
    </div>
  </b-th>
</template>

<script>
export default {
    name: 'IpamHeader',
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