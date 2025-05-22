<template lang="html">
  <div>
    <div v-if="errors.length > 0">
      <BAlert
        v-for="(error, index) in errors"
        :key="index"
        show
        variant="danger"
      >
        {{ error }}
      </BAlert>
    </div>

    <BFormGroup label="Name" label-for="name">
      <BFormInput
        id="name"
        v-model="name"
        :placeholder="Name"
      />
    </BFormGroup>

    <BFormGroup class="pt-1" label="Credit Card" label-for="card">
      <div id="card" class="form-control" />
    </BFormGroup>

    <BButton class="mt-2" variant="warning" @click="createToken">
      {{ submitText }}
    </BButton>
  </div>
</template>


<script>
import {
  BAlert,
  BFormGroup,
  BFormInput,
  BButton
} from 'bootstrap-vue-next'
var stripe = window.Stripe(process.env.VUE_APP_STRIPE_PUBLIC_KEY)
var elements = stripe.elements()
let options = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
}

// Create an instance of the card Element
var card = elements.create('card', options)

export default {
  components:{
     BAlert,
    BFormGroup,
    BFormInput,
    BButton,
  },
  props: {
    submitText: {
      type: String,
      required: false,
      default: 'Add'
    }
  },
  data () {
    return {
      errors: [],
      success: false,
      name: ''
    }
  },
  mounted () {
    card.mount('#card')
  },
  beforeUnmount () {
    card.unmount()
  },
  methods: {
    createToken () {
      stripe.createToken(card, { name: this.name }).then(
        (result) => {
          if (result.token) {
            this.$emit('tokenCreated', result.token)
            this.success = true
            setTimeout(() => {
              this.success = false
              card.clear()
              this.name = ''
            }, 2000)
          } else {
            this.errors = []
            let error = result.error.message || 'There was an error verifying this card'
            this.errors.push(error)
          }
        }
      )
    }
  }
}
</script>

<style lang="css">
</style>
