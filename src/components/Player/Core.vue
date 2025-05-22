<template lang="html">
  <div
    :id="instance_id"
    ref="instance"
    class="player"
  >
    <!-- i think this gets trashed when we call reset() -->
    <template v-if="$slots.default">
      <slot />
    </template>
    <template v-else>
      <div
        v-if="queue[0] && queue[0].media.length === 0"
        class="h-100 w-100 h5 text-center mt-4"
      >
        No Media
      </div>
      <div ref="custom" class="custom" />
      <div
        ref="target"
        class="target"
        :style="{ background: backgroundStyle }"
      >
        <!-- render target -->
      </div>

      <template v-if="!hideControls">
        <div ref="controls" class="player-controls">
          <BFormInput
            v-model="context_progress"
            class="player-slider"
            type="range"
            step="1"
            :max="context_duration"
            @mousedown="pause"
            @mouseup="resume"
          />
          <div ref="counter" class="player-counter">
            {{ context_progress }}/{{ context_duration }}
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import {BFormInput} from 'bootstrap-vue-next'
export default {
  components: {
    BFormInput
  },
  props: {
    /* format of queue[] items:
      {
        context: campaignId
        media: [ image[], text[], video[], audio[] ]
      }
    */
    aspect: {
      type: Object,
      required: false,
    },
    queue: {
      type: Array,
      required: true
    },
    cache: {
      type: Object,
      required: true
    },
    background: {
      type: String,
      required: false
    },
    hideControls: {
      type: Boolean,
      required: false
    },
    // we can use this to set the initial/current seek offset
    setSeek: {
      type: Number,
      required: false
    },
  },
  data() {
    return {
      instance_id: 'h_'+Math.floor(Math.random() * Date.now()),

      pretty_duration: 0,

      // the epoch of the rAF callback
      epoch: null,

      // the current rAF timestamp
      current_ts: null,

      slow_counter: 0,

      // max campaigns to sample at once for queuing (must be > 1)
      sample_max: 1,

      // the current context (campaignId)
      context: 0,
      context_start: 0,
      context_progress: 0,
      context_duration: 0,

      // is paused? from what time?
      pause_start: 0,

      // the id of the current rAF tick
      raf: 0,

      // timer format is [execution_start, action_type, context (campaign), identity (media id)]
      timers: [],

      // item format is { id, body, type, frame, props, custom }
      items: {},

      // definition of a second in ms
      second: 1000,

      // definition of a frame in ms for debugging help
      FRAME: 16.6,

      // the end trigger for the last scheduled item, used to calculate the next start event trigger
      last_end: 0,

      // should probably split this into debug_timer_triggers and debug_timer_lag
      DEBUG_LAG:    0,
      DEBUG_TIMERS: 0,
      DEBUG_RESETS: 0,
      DEBUG_CALLS:  0,
      DEBUG_LAST:   0,
      DEBUG_FRAME:  0,
      DEBUG_SEEK:   0,
      DEBUG_QUEUE:  0,
      DEBUG_CTX:    0,
      DEBUG_RESIZE: 0,
      DEBUG_CACHE:  0,
      DEBUG_SAMPLE: 0,

      old_width: 0,
      old_height: 0,

      CACHE_PREFIX: 'http://127.0.0.1/cache/media/',

      reset_debouncer: 0,
      resize_debouncer: 0,
      queue_debouncer: 0,
      cache_debouncer: 0,

      resizeCheck: new ResizeObserver(() => {
        clearTimeout(this.resize_debouncer)
        this.resize_debouncer = setTimeout(() => {
          // this is wrapped because the callback can run after $instance is destroyed!
          if (this.$refs.instance) {
            this.DEBUG_RESIZE && console.log(this.oldWidth, '==', this.$refs.instance.clientWidth,
                                      'AND', this.oldHeight, '==', this.$refs.instance.clientHeight)
            if (this.oldWidth !== this.$refs.instance.clientWidth
            && this.oldHeight !== this.$refs.instance.clientHeight)
            this.reset(this.context)
          }
        }, 250)
      }),
    }
  },
  computed: {
    backgroundStyle() {
      return this.background ? this.background : 'repeating-conic-gradient(#CCC 0% 25%, #fff 0% 50%) 50% / 20px 20px'
    }
  },
  watch: {
    timers() {
      // console.log(this.current_ts)
      // console.table(this.timers.filter(t => t[1] === 'find_ads'))
      this.DEBUG_TIMERS && console.log(this.current_ts)
      this.DEBUG_TIMERS && console.table(this.timers)
    },
    context_progress() {
      // this.DEBUG_CTX && console.log('current progress is', this.context_progress)
    },
    context() {
      this.DEBUG_CTX && console.log('new context is', this.context)
    },
    context_start() {
      this.DEBUG_CTX && console.log('new context start is', this.context_start)
    },
    cache: {
      // console.log(this.cache)
      deep: true,
      handler() {
        // TODO: put a debouncer on this shit
        clearTimeout(this.cache_debouncer)
        this.cache_debouncer = setTimeout(() => {
          // console.log('cache changed')
          this.rebuild_items()
        }, 250)
        // TOOD: smart check if the cache item changed was for the current context?
      }
    },
    queue: {
      deep: true,
      handler(new_queue, old_queue)
      {
        clearTimeout(this.queue_debouncer)
        this.queue_debouncer = setTimeout(() => 
        {
          // console.log('queue watcher triggered')
          if (this.queue.length === 0)
          {
            this.DEBUG_QUEUE && console.log('queue empty, resetting all')
            this.reset()
          }
          else if (this.context != 0 && JSON.stringify(new_queue) !== JSON.stringify(old_queue))
          {
            if (this.queue.findIndex(c => c.campaignId === this.context) !== -1)
            {
              this.DEBUG_QUEUE && console.log('continuing from existing item', this.context)
              // do nothing!
              this.rebuild_items()
            }
            else
            {
              this.DEBUG_QUEUE && console.log('current context missing, purging..')
              this.reset()
            }
          }
          else
          {
            this.DEBUG_QUEUE && console.log('weird edge case?')
            // this.reset()
          }
        }, 100)
      }
    }
  },
  beforeUnmount() { 
    document.removeEventListener("visibilitychange", this.checkHidden)
    this.resizeCheck.disconnect();
    window.removeEventListener("resize", this.resize)
    window.cancelAnimationFrame(this.raf)
  },
  mounted() {
    // console.log(this.instance_id)
    this.DEBUG_QUEUE && console.log(this.queue)
    this.DEBUG_CACHE && console.log('cache', this.cache)

    this.rebuild_items()
    this.timers.unshift([0, 'find_ads'])

    this.raf = window.requestAnimationFrame(this.tick)

    // give it a second to handle painting
    // check if instance exists to prevent the race condition
    setTimeout(() => {
      if (this.$refs.instance) {
        this.oldWidth = this.$refs.instance.clientWidth
        this.oldHeight = this.$refs.instance.clientHeight
        document.addEventListener("visibilitychange", this.checkHidden)
        window.addEventListener("resize", this.resize)
        this.resizeCheck.observe(this.$refs.instance)
      }
    }, 500)
  },
  methods: {
    // this can't be put into the rAF loop
    reset(start_id = 0) {
      clearTimeout(this.reset_debouncer)
      this.reset_debouncer = setTimeout(() => this.reset_immediate(start_id), 250)
    },
    reset_immediate(start_id = 0, shift = 0) {
      this.DEBUG_CALLS && console.log('reset_immediate')
      this.DEBUG_RESETS && console.log('resetting!')
      this.$refs.custom.replaceChildren()
      this.$refs.target.replaceChildren()
      this.context_start = this.current_ts
      this.context_duration = 0
      this.items = {}
      this.timers = []
      this.last_end = this.current_ts
      this.rebuild_items()
      this.find_ads(start_id, shift)
    },
    tick: function(elapsed) {
      if (!this.epoch) this.epoch = elapsed;

      let old = this.current_ts
      this.current_ts = elapsed - this.epoch;

      if (this.pause_start === 0) {
        const START = 0;
        const ACTION = 1;
        const CONTEXT = 2;
        const IDENT = 3;

        // var start = performance.now()

        if (this.context_duration > 0 && this.current_ts > this.context_start) {
          // only increment every frame
          if (this.current_ts - this.slow_counter > this.FRAME) {
            this.slow_counter = this.current_ts
            this.context_progress = Number(0)+Number(((this.current_ts - this.context_start) / this.second).toFixed(0))
          }
        }
        else {
          this.slow_counter = 0
        }

        if (this.current_ts - old > (this.second)) {
          let delta = (this.current_ts-old)
            this.DEBUG_LAG && console.log(delta)
            this.DEBUG_LAG && console.log('ALERT! '+this.current_ts+' '+(this.current_ts-old)+' longer than '+this.second+' . Resetting...')
            // what should we do now? reinitialize the component?
            // we definitely should not be trying to execute all the timers missed.. best option is to run the "time skip"
            this.reset(this.context)
        }
        else {
          if (this.DEBUG_LAG)
            if (this.current_ts - old > 17.7)
              console.log(Number(this.current_ts.toFixed(2)),'last rAF took '+(this.current_ts-old).toFixed(2)+'ms!')

          for (let timer_i = this.timers.length - 1; timer_i >= 0; timer_i--) {
            const t = this.timers[timer_i]
            if (parseInt(this.current_ts) > parseInt(t[START])) {
              if (this.DEBUG_LAG) {
                const sched = parseInt(t[START])
                const actual = parseInt(this.current_ts)
                if (sched === actual) {
                    console.log(this.current_ts, 'perfect', sched, t[ACTION], t[IDENT])
                }
                else {
                    console.log(['missed by', (actual-sched), 'for', sched, 'at', actual, t[ACTION], t[IDENT]])
                }
              }
              // rather than doing all this business of trashing the items queue, we just hide the elements
              if (t[ACTION] === 'setcontext') {
                this.context = t[CONTEXT]
                this.DEBUG_CTX && console.log('setting new context', t[CONTEXT], 'at', this.current_ts, t[IDENT].start, t[IDENT].duration)
                this.context_start = t[IDENT].start
                this.context_duration = t[IDENT].duration
                this.$emit('setcontext', this.context)
                // console.log(this.timers)
                this.timers.splice(timer_i, 1)
              }
              else if (t[ACTION] === 'prep') {
                this.timers.splice(timer_i, 1)
              }
              else if (t[ACTION] === 'show') {
                this.DEBUG_TIMERS && console.log(this.items[t[IDENT]])
                this.$refs.target.appendChild(this.items[t[IDENT]].frame)

                // console.log(this.$refs.target)
                // can this be moved up higher?
                // let dom_elem = this.$refs.target.querySelector('#'+t[IDENT])
                let dom_elem = [...this.$refs.target.childNodes].find(n => n.id).firstChild
                if (dom_elem.classList.contains('middle') && dom_elem.classList.contains('center'))
                {
                    dom_elem.style.top = this.$refs.target.clientHeight / 2
                    dom_elem.style.marginTop = Math.ceil(dom_elem.clientHeight/2*-1)
                    dom_elem.style.zIndex = 99;
                }
                // i am sure this will break in new and exciting ways
                if (dom_elem.nodeName === 'VIDEO') {
                    // unfortunately when spawning chromium vaapi or whatever can be too slow for this
                    dom_elem.play()
                }
                // console.log('start trigger: ',this.start_trigger,'current item:',t[IDENT])
                this.timers.splice(timer_i, 1)
              }
              else if (t[ACTION] === 'hide') {
                for (let node of this.$refs.target.childNodes) {
                  if (node.id === t[IDENT]+'_body') {
                    this.items[t[IDENT]].frame = this.$refs.target.removeChild(node)
                  }
                }
                this.timers.splice(timer_i, 1)
              }
              else if (t[ACTION] === 'find_ads') {
                setTimeout(() => {
                  this.find_ads(t[CONTEXT])
                }, 0)
                this.timers.splice(timer_i, 1)
              }
              else {
                console.error('unimplemented', t)
                this.timers.splice(timer_i, 1)
              }
            }
          }
        }
      }

      this.raf = window.requestAnimationFrame(this.tick)
    },
    checkHidden() {
      this.DEBUG_CALLS && console.log('checkHidden')
      if (document.hidden) {
        this.pause()
      }
      else {
        this.resume()
      }
    },
    warp(ctx) {
      if (this.context !== ctx) {
        this.DEBUG_CALLS && console.log('warp!', ctx)
        this.reset_immediate(ctx, 0)

        // this.$refs.custom.replaceChildren()
        // this.$refs.target.replaceChildren()
        // this.context_start = this.current_ts
        // this.context_duration = this.queue.find(q => q.campaignId == ctx).duration
        // this.context = ctx
        // this.items = {}
        // this.timers = []
        // this.last_end = this.current_ts
        // this.rebuild_items()
        // this.resume()
      }
    },
    pause() {
      this.DEBUG_CALLS && console.log('pause')
      this.DEBUG_SEEK && console.log('paused at', this.current_ts)
      this.pause_start = this.current_ts
      let current_progress = this.current_ts - this.context_start
      let videos = Object.values(this.items).filter(i => i.type === 'video')
      let playing = videos.filter(v => current_progress < v.props.end*this.second && current_progress > v.props.start*this.second)
      for (let video of playing) {
        video.body.pause()
      }
    },
    resize() {
      clearTimeout(this.resize_debouncer)
      this.resize_debouncer = setTimeout(() => {
        this.DEBUG_RESIZE && console.log('layout size changed')
        this.reset(this.context)
      }, 250)
    },
    // TODO: make resume correctly call from NEXT context when we hit the last second of the advert
    resume() {
      this.DEBUG_CALLS && console.log('resume')
      this.DEBUG_SEEK && console.log('resume started at', this.current_ts, 'paused at', this.pause_start)
      this.DEBUG_SEEK && console.table(this.timers)
      this.DEBUG_SEEK && console.log(this.context, this.context_start, this.context_duration, this.context_progress)
      if (this.context_start === 0 || this.context_duration === 0) {
        this.DEBUG_RESETS && console.log('pause time exceeded playback time during window defocus, resetting')
        this.reset(this.context)
      }
      let delta = this.current_ts - this.pause_start

      // before we do anything else, shift all timers by the current delta
      this.timers.forEach(t => {
        t[0] += delta
        if (t[1] === 'setcontext')
          t[3].start += delta
      })

      this.context_start += delta
      this.last_end += delta

      let current_progress = this.current_ts - this.context_start
      let real_progress = Number(0)+Number(((this.current_ts - this.context_start) / this.second).toFixed(0))

      // do not attempt to rebuild the timers if there was no seek-type action
      if (this.context_progress !== real_progress) {

        // first, determine the new insertion point
        let desired_progress = this.context_progress / this.context_duration
        let duration = this.context_duration*this.second

        // set the seek offset (time difference between current duration and desired seek
        let seek = current_progress - (duration * desired_progress)

        this.DEBUG_SEEK && console.log(this.current_ts, this.context_start, seek)
        let new_progress = this.current_ts - this.context_start - seek

        // delete all timers for active context and requeuing
        for (let timer_i = this.timers.length - 1; timer_i >= 0; timer_i--) {
          if (this.timers[timer_i][2] === this.context || this.timers[timer_i][1] === 'find_ads')
            this.timers.splice(timer_i, 1)
        }

        // console.table(this.timers)

        // this whole function can be abstracted to build_timers(context_start) I think
        for (let key in this.items) {
          let i = this.items[key]
          // this.DEBUG_SEEK && console.log(i.props.name)
          if (i.context === this.context) {
            let start = i.props.start*this.second
            let end = i.props.end*this.second

            // from the current point in time (which is going to be current_ts)
            // for the start (which is the current_ts minus new "current" progress)

          this.DEBUG_SEEK && console.log([i.id, String(new_progress), start, end, duration])
          // figure out which timers need prep/show/hide re-firing or skipping

          if (new_progress >= start && new_progress <= end) {
              // this item should currently be active
              let node = [...this.$refs.target.childNodes].find(n => n.id == i.id+'_body')
              // let node = this.$refs.target.childNodes.find(n => n.id = i.id+'_body')
              // check if we are on the exact end time
              if (node == null) { // loose comparison for null also == undefined
                if (new_progress === end) {
                  this.DEBUG_SEEK && console.log(i.props.name, 'is finishing now and needs .hide')
                  this.timers.unshift([this.current_ts, 'hide', this.context, i.id])
                }
                else {
                  this.DEBUG_SEEK && console.log('seek', i.props.name, 'is MEANT to be playing right now but isnt')
                  if (i.type === 'video')
                    i.body.currentTime = 0
                  this.timers.unshift([this.current_ts - this.FRAME, 'prep', this.context, i.id])
                  this.timers.unshift([this.current_ts, 'show', this.context, i.id])
                  this.timers.unshift([this.current_ts + end - new_progress, 'hide', this.context, i.id])
                }
              }
              else {
                this.DEBUG_SEEK && console.log('seek', i.props.name, 'playing as expected')
                this.timers.unshift([this.current_ts + end - new_progress, 'hide', this.context, i.id])
              }
            }
            else {
              // detach any existing dom elements
              // let node = this.$refs.target.childNodes.find(n => n.id = i.id+'_body')
              let node = [...this.$refs.target.childNodes].find(n => n.id == i.id+'_body')
              if (node == null) { // loose comparison for null also == undefined
                this.DEBUG_SEEK && console.log('seek', i.props.name, 'hidden as expected')
                this.timers.unshift([this.current_ts+start - new_progress - (this.second / 4), 'prep', this.context, i.id])
                this.timers.unshift([this.current_ts+start - new_progress, 'show', this.context, i.id])
                this.timers.unshift([this.current_ts+end - new_progress, 'hide', this.context, i.id])
              }
              else {
                this.DEBUG_SEEK && console.log(i.props.name, 'is NOT meant to be playing right now but is')
                // we are really fucked if this isn't here for some reason
                if (i.type === 'video')
                  i.body.currentTime = 0
                i.frame = this.$refs.target.removeChild(node)
                this.timers.unshift([this.current_ts+start - new_progress - (this.second / 4), 'prep', this.context, i.id])
                this.timers.unshift([this.current_ts+start - new_progress, 'show', this.context, i.id])
                this.timers.unshift([this.current_ts+end - new_progress, 'hide', this.context, i.id])
              }
            }
          }
        }

        console.groupEnd()

        this.context_start += seek
        this.last_end += seek

        // and shift the other contexts by this seek too
        this.timers.forEach(t => {
          if (t[2] !== this.context) {
            t[0] += seek
            if (t[1] === 'setcontext')
              t[3].start += seek
          }
        })

        // find the last context
        let real_offset = this.queue.findIndex(c => c.campaignId === this.context)
        let next_ad = this.sample_ads(real_offset, 1).campaignId
        this.timers.unshift([this.last_end, 'find_ads', next_ad])

        // console.table(this.timers)

        // // seek the active videos to their correct position
        // // take the video items with no show events in the timer queue
        // // for their respective start times, set the seek offset to a clamped value
        // // also only do this if context_progress has actually changed otherwise things will look jumpy

        let videos = Object.values(this.items).filter(i => i.type === 'video')
        let playing = videos.filter(v => new_progress <= v.props.end*this.second && new_progress >= v.props.start*this.second)
        for (let video of playing) {
          // we want to figure out what the video's current progress will be if we start from a specified seek point
          let seek_point = (new_progress - video.props.start*this.second) / this.second
          // console.log('seeking to', seek_point)
          video.body.currentTime = seek_point
          video.body.play()
        }
      }
      else {
        // console.log('resume')
        let videos = Object.values(this.items).filter(i => i.type === 'video')
        let playing = videos.filter(v => current_progress < v.props.end*this.second && current_progress > v.props.start*this.second)
        for (let video of playing) {
          video.body.play()
        }
      }


      // resume timer processing
      this.pause_start = 0
    },
    get_now: function() {
        return this.current_ts
    },
    from_now: function(time) {
        return this.current_ts + time
    },
    sample_ads: function(start, shift) {
      // 1 mod n > 1 will always be 1
      const qlen = this.queue.length
      if (this.sample_max == 1) {
        const real_start = ((start+shift % qlen + qlen) % qlen)
        this.DEBUG_SAMPLE && console.table(
          [
              `start: ${start} len: ${qlen} max: ${this.sample_max}`,
              this.queue.map(c => c.campaignId).join(','),
              this.queue.slice(real_start, real_start+1).map(c => c.campaignId).join(',')
          ])
        return this.queue.slice(real_start, real_start+1)
      }
      else {
        const offsets = [...Array(qlen).keys()].map(k => k + start + shift)
        const candidates = offsets.map(i => this.queue[(Number(i) % qlen + qlen) % qlen])
        this.DEBUG_SAMPLE && console.table(
          [
              `start: ${start} len: ${qlen} max: ${this.sample_max}`,
              offsets.join(','),
              candidates.map(c => c.campaignId).join(','),
              candidates.slice(0, this.sample_max).map(c => c.campaignId).join(',')
          ])
        return candidates.slice(0, this.sample_max)
      }
    },
    find_ads: function(start_id = 0, shift = 1) {
      this.DEBUG_CALLS && console.log('find_ads', start_id)
      if (this.queue.length > 0 && this.queue[0].media.length > 0) {
        let start = 0
        if (start_id === 0) {
          // no start supplied, resume from context if it exists
          let maybeStart = this.queue.findIndex(q => q.campaignId == this.context)
          if (maybeStart !== -1) {
            start = maybeStart
          }
          else {
            // start offset not found, do not jump to next item from 0
            start = 0
            shift = 0
          }
        }
        else {
          // start supplied, resume from that
          start = this.queue.findIndex(q => q.campaignId === start_id)
        }

        let sampled = this.sample_ads(start, shift)

        for (let campaign of sampled) {
          this.push_timers(campaign)
        }

        // remove other find_ad events
        // this is a workaround for the find_ads function in mounted(), it could be replaced by something neater
        for (let timer_i = this.timers.length - 1; timer_i >= 0; timer_i--) {
          if (this.timers[timer_i][1] === 'find_ads')
            this.timers.splice(timer_i, 1)
        }

        let last_pushed = sampled[sampled.length - 1].campaignId
        // console.log('calling again after', last_pushed)
        this.timers.unshift([this.last_end - (1 * this.second /4), 'find_ads', last_pushed])
      }
      else {
        console.log('trying to find_ads, empty .media?')
      }
      // console.table(this.timers)
    },
    // make sure there are no timer events pending when you call this
    rebuild_items() {
      this.DEBUG_CALLS && console.log('rebuild_items')
      // this.items = {}
      for (const blob of this.queue) {
        blob.media.forEach((object, index) => {
          let type = object.mimeType.split('/')[0] // sure hope this is defined
          let identity = '_'+blob.campaignId+'_'+index+'_'+object.id

          const doc_type = {
            'video': 'video',
            'image': 'img',
            'text': 'span'
          }

          this.items[identity] = {
            type: type,
            id: identity,
            context: blob.campaignId,
            props: object,
          }

          let item = this.items[identity]
          // setup any css
          // surely this can be cleaned up more somehow
          let custom = document.createElement('style')
          custom.id = identity + '_css'
          this.items[identity].css = '#' + this.instance_id + " #" + identity + ' { ' + object.custom + ' }';

          // create the media frame
          item.frame = document.createElement('div')
          item.frame.id = identity + '_body'

          // create the main content
          item.body = document.createElement(doc_type[type])

          item.body.id = item.id
          item.body.classList.add('player-'+type, ...object.position.split(',').map(p => 'player-'+p))
          item.body.alt = object.name

            // mime specific shit

          if (type === 'video') {
            const blob_type = typeof this.cache[blob.campaignId][object.id]
            if (blob_type === 'undefined') {
              console.log('UH OH')
              return
            }
            else {
              item.body.controls = false
              item.body.src = URL.createObjectURL(this.cache[blob.campaignId][object.id])
            }
          }

          if (type === 'image') {
            // if image
            const blob_type = typeof this.cache[blob.campaignId][object.id]
            if (blob_type === 'undefined') {
              console.log('UH OH')
              return
            }
            else if (blob_type === 'string') {
              item.body.src = this.cache[blob.campaignId][object.id]
            }
            else {
              item.body.src = URL.createObjectURL(this.cache[blob.campaignId][object.id])
            }
            item.body.decoding = 'sync'
          }

          if (type === 'text') {
            item.body.innerHTML = object.string
            item.body.id = item.id
            item.body.classList.add('player-text', ...object.position.split(',').map(p => 'player-'+p))
            item.body.alt = object.name

            item.body.style.zIndex = '99999999'
            item.body.style.fontFamily = object.font_family
            item.body.style.fontSize = this.fixSize(object.font_size)
            item.body.style.fontStyle = object.font_style
            item.body.style.fontWeight = object.font_weight
          }

          // handle other style shit

          if (blob.campaignId === 0) {
            if (type === 'video' || type === 'image') {
              item.body.style.width = '100%'
              item.body.style.height = '100%'

              item.body.style.zIndex = 999
              item.body.style.objectFit = 'cover'
            }
          }
          else {
            if (type === 'video' || type === 'image') {
              item.body.style.width = this.fixSize(object.width)
              item.body.style.height = this.fixSize(object.height)
              item.body.style.objectFit = 'cover'
            }

            let positions = object.position.split(',')
            if (positions.includes('middle') && positions.includes('center')) {
              item.body.style.zIndex = 99;
            }
            else {
              item.body.style.zIndex = 999;
            }

            if (object.custom) {
              this.items[identity].css = this.fixSize(this.items[identity].css)
              custom.innerText = this.items[identity].css
              this.$refs.custom.appendChild(custom)
            }
          }

            // insert the body
          this.items[identity].frame.appendChild(this.items[identity].body)
        })
      }
      // console.log(this.items)
    },
    fixSize(str) {
      /* eslint-disable no-unused-vars */
      let sizes = {}
      sizes['vw'] = this.$refs.target.clientWidth
      sizes['vh'] = this.$refs.target.clientHeight
      sizes['vmin'] = Math.min(sizes.vw, sizes.vh)
      sizes['vmax'] = Math.max(sizes.vw, sizes.vh)
      const scaler = function(match, p1, p2, p3, offset, string) {
        const newScale = (p1 * 0.01).toPrecision(2);
        return `calc(${newScale} * ${sizes[p3]}px)`
      }
      str = str.replaceAll(/((\d+\.)?\d+)(vmin|vmax|vh|vw)/g, scaler)
      /* eslint-enable no-unused-vars */
      return str
    },
    // push_timers performs append-only operations on timers[]
    push_timers: function(blob)
    {
      this.DEBUG_CALLS && console.log('push_timers for', blob.campaignId)
      let now = this.get_now()
      if (this.last_end !== 0) {
        now = this.last_end
      }

      blob.media.forEach((object,index) => {
        let identity = '_'+blob.campaignId+'_'+index+'_'+object.id
        this.timers.unshift([now + (object.start * this.second) - (this.second/4), 'prep', blob.campaignId, identity])
        this.timers.unshift([now + (object.start * this.second), 'show', blob.campaignId, identity])
        this.timers.unshift([now + (object.end * this.second), 'hide', blob.campaignId, identity])
        if (now + (object.end * this.second) > this.last_end) {
          if (this.DEBUG_LAST)
            console.log('LAST IS',now + (object.end * this.second))
          this.last_end = now + (object.end * this.second)
        }
      })

      if (blob.media.length > 0) {
        /* this takes the first show instance for the matching context,
        if you have two identical contexts it won't matter because this
        only gets called (theoretically) when no more show events are happening */
        this.timers.unshift([now, 'setcontext', blob.campaignId, { start: now, duration: Math.max(...blob.media.map(m => m.end)) }])
      }
      else {
        console.log('resetting context_start and context_duration')
        this.context_start = 0
        this.context_duration = 0
      }
    }
  }
}
</script>

<style>
  .player {
    padding: 0px !important;
    background: #000 !important;
    color:#fff !important;
    overflow: hidden;
    /* font-size: 1vmax;
    line-height: 3vmax; */
    position: relative;
  }

  .player-controls {
    background: white;
    color: black;
    z-index: 999999999;
    height: 2em;
  }

  .player-counter {
    position: absolute;
    z-index: 999999999;
    bottom: 0;
    right: 0;
    font-family: monospace;
    background: white;
    width: 4em;
    height: 2em;
    text-align: center;
    line-height: 2em;
  }

  .player-slider {
    height: 2em;
    width: calc(100% - 5em);
    position: absolute;
    z-index: 999999999;
    bottom: 0;
    left: 1em;
  }

  .target {
    width: 100%;
    height: calc(100% - 2em);
    overflow: hidden;
    box-sizing: content-box;
    position: relative;

    /* -webkit-transform:translateZ(0.1px);
    -moz-transform:translateZ(0.1px);
    -o-transform:translateZ(0.1px);
    -ms-transform:translateZ(0.1px);
    transform:translateZ(0.1px); */
    
    /* border: 1px solid red; */
    /* TODO: this might need to be #000 for e2v campaigns, or the container should be #000 */
  }


  .player-text { position: absolute }
  .player-image { position: absolute; image-rendering: pixelated; }
  .player-video { position: absolute }

  .player-top { top: 0 }
  .player-bottom { bottom: 0 }
  .player-left { left: 0; text-align: left }
  .player-right { right: 0; text-align: right }
  .player-center { width: 100%; text-align: center }
</style>