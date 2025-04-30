/*
    Instructions for use:
     - define an element with id "top-area"
     - define an element with id "content-area"

    The height of the content-area will be subtracted from
    the height of the top-area which is subtracted from
    the height of the navbar.
*/

import verge from 'verge'
import _ from 'lodash'

export default {
    methods: {
        handleResize: _.debounce(
            function () {
              let toparea = document.getElementById('top-area')
              let navbar = document.getElementById('navbar')
              let topheight = verge.rectangle(toparea).height
              let navbarheight = verge.rectangle(navbar).height
              let newheight = parseInt(verge.viewportH() - topheight - navbarheight) + 'px'
              document.getElementById('content-area').style.height = newheight
          }, 200),
    },
    mounted() {
        this.handleResize()
        window.addEventListener('resize', this.handleResize)
    },
    beforeDestroy () {
        window.removeEventListener('resize', this.handleResize)
    },
}
