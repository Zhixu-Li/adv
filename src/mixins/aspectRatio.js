/*
just some stuff to make handling wide viewports easier
consider:
- add a watcher for viewport in your component to handle resizing properly
*/

export default {
  data () {
    return {
      /* values:
      9:16
      10:16
      3:4
      
      16:9 -> 85 x 48
      16:10 -> 77 x 48
      4:3 -> 64 x 48
      1:1 -> 48 x 48
      */
      aspects: {
        '16:10':  {width: 77, height: 48},
        '16:9':   {width: 85, height: 48},
        '5:3':    {width: 80, height: 48},
        '4:3':    {width: 64, height: 48},
        '3:2':    {width: 72, height: 48},
        '2:1':    {width: 96, height: 48},
        '1:1':    {width: 48, height: 48},
      },
      isRotated: false,
      selectedAspect: '16:9', // just a default
    }
  },
  mounted () {
  },
  methods: {
    getAspect(media) {
      function gcd(a, b) {
        return (b == 0) ? a : gcd (b, a%b);
      }

      let max_w = media.data.reduce((a,c) => Math.max(a,c.width), 0)
      let max_h = media.data.reduce((a,c) => Math.max(a,c.height), 0)

      if (max_w !== 0 && max_h !== 0) {
        let r = gcd(max_w, max_h)
        let aspect = max_w/r + ':' + max_h/r
        return aspect
      }
    },
    detectAspect(media) {
      function gcd(a, b) {
        return (b == 0) ? a : gcd (b, a%b);
      }

      let max_w = media.data.reduce((a,c) => Math.max(a,c.width), 0)
      let max_h = media.data.reduce((a,c) => Math.max(a,c.height), 0)

      if (max_w !== 0 && max_h !== 0) {
        let r = gcd(max_w, max_h)
        let aspect = max_w/r + ':' + max_h/r

        console.log(aspect)
        if (this.aspects[aspect]) {
          return aspect
        }
        else {
          return '16:9'
        }
      }
      // otherwise just use default value (16:9)
    },
    scaleToVmax(target, ...vals) {
      console.log(target, vals)
      return ''
    }
  },
}
