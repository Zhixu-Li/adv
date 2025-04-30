import verge from 'verge'
import { debounce } from 'lodash'

/*
    just some stuff to make handling wide viewports easier
    consider:
        - add a watcher for viewport in your component to handle resizing properly
*/

export default {
    data () {
      return {
        viewport: '',
      }
    },
    mounted () {
        this.handleViewport()
        window.addEventListener('resize', this.handleViewport)
    },
    beforeDestroy: function () {
        window.removeEventListener('resize', this.handleViewport)
    },
    methods: {
        handleViewport: debounce(function () {
            let width = verge.viewportW()
            if      (width > 1900) { this.viewport = 'xl' }
            else if (width > 1200) { this.viewport = 'lg' }
            else if (width > 992)  { this.viewport = 'md' }
            else if (width > 768)  { this.viewport = 'sm' }
            else if (width > 480)  { this.viewport = 'xs' }
            else                   { this.viewport = 'xs' }
        }, 200)
    }
  }
  