<template>
  <div class="h-100 home-main">
    <BContainer>
<!-- Hero Section -->
<BRow class="top-margin align-items-center">
  <!-- Left Column: Text Content -->
  <BCol lg="7" cols="12" class="d-flex">
    <div class="hero-text">
      <h2>{{ $t('home.heroHeader') }}</h2>
      <p>{{ $t('home.heroText') }}</p>
      <BButton class="buttons button-red mt-3" @click="showRegisterModal">
        {{ $t('home.signUp') }}
      </BButton>

      <BModal ref="registerModal" id="register" title="Register">
        <Register />
      </BModal>
    </div>
  </BCol>

  <!-- Right Column: Hero Image -->
  <BCol lg="5" cols="12">
    <img src="/static/ad02.jpg" class="photo img-fluid" alt="Hero Image" />
  </BCol>
</BRow>


      <!-- Map Section -->
      <div>
        <h2>{{ $t('home.mapHeader') }}</h2>
        <p>{{ $t('home.mapText') }}</p>
        <BCol cols="12" md="12" class="static-map pb-3 pt-3">
          <static-map />
        </BCol>
        <p>
          <span class="red-text">{{ $t('home.mapRed') }}</span>
          {{ $t('home.mapCaption') }}
        </p>
      </div>

      <!-- Steps Section -->
      <div class="top-margin">
        <h2>{{ $t('home.stepHeader') }}</h2>
        <BRow>
          <BCol lg="6" cols="12">
            <div class="step-padding">
              <img src="/static/ad06.svg" class="step-image" />
              <h5>{{ $t('home.step1Header') }}</h5>
              <p class="small-text">{{ $t('home.step1Text') }}</p>
            </div>
          </BCol>
          <BCol lg="6" cols="12">
            <div class="step-padding right-padding">
              <img src="/static/ad05.svg" class="step-image" />
              <h5>{{ $t('home.step2Header') }}</h5>
              <p class="small-text">{{ $t('home.step2Text') }}</p>
            </div>
          </BCol>
        </BRow>
        <BRow>
          <BCol lg="6" cols="12">
            <div class="step-padding">
              <img src="/static/ad04.svg" class="step-image" />
              <h5>{{ $t('home.step3Header') }}</h5>
              <p class="small-text">{{ $t('home.step3Text') }}</p>
            </div>
          </BCol>
          <BCol lg="6" cols="12">
            <div class="step-padding right-padding">
              <img src="/static/ad03.svg" class="step-image" />
              <h5>{{ $t('home.step4Header') }}</h5>
              <p class="small-text">{{ $t('home.step4Text') }}</p>
            </div>
          </BCol>
        </BRow>
      </div>

      <!-- Call-to-Action Bar -->
      <div class="red-bar">
        <BRow class="red-bar-contents">
          <BCol lg="9" cols="12">
            <h1>{{ $t('home.barHeader') }}</h1>
            <p>{{ $t('home.barText') }}</p>
          </BCol>
          <BCol lg="3" cols="12">
            <BButton
              class="buttons button-white float-middle"
              @click="showRegisterModal"
            >
              {{ $t('home.signUp') }}
            </BButton>
            <BModal
              ref="registerModal"
              id="register"
              title="Register"
            >
              <Register />
            </BModal>
          </BCol>
        </BRow>
      </div>

<!-- Owner Section -->
<BRow class="top-margin align-items-center">
  <!-- Left Column: Owner Text -->
  <BCol lg="7" cols="12" class="d-flex">
    <div class="owner-text">
      <h2>{{ $t('home.ownerHeader') }}</h2>
      <p>{{ $t('home.ownerText') }}</p>
      <BButton class="buttons button-red mt-3" @click="showRegisterModal">
        {{ $t('home.signUp') }}
      </BButton>

      <BModal ref="registerModal" id="register" title="Register">
        <Register />
      </BModal>
    </div>
  </BCol>

  <!-- Right Column: Image -->
  <BCol lg="5" cols="12">
    <img
      src="/static/ad07.jpg"
      class="photo img-fluid"
      alt="Owner Section Image"
    />
  </BCol>
</BRow>
    </BContainer>

    <!-- Footer -->
    <BRow class="footer">
      <BContainer>
        <BRow class="mb-3">
          <BCol lg="4" cols="12">
            <img
              :src="'/static/adverpost-white.svg'"
              height="34"
              class="mb-3"
            />
            <p>One World LED Pty Ltd ABN 33 161 705 068</p>
          </BCol>
          <BCol lg="4" cols="6">
            <ul>
              <li>
                <BLink :href="supportUrl">
                  {{ $t('home.footer.contact') }}
                </BLink>
              </li>
              <li>
                <BLink :href="supportUrl">
                  {{ $t('home.footer.support') }}
                </BLink>
              </li>
              <li>
                <BLink @click="$router.push({ path: '/owners' })">
                  {{ $t('home.footer.owners') }}
                </BLink>
              </li>
            </ul>
          </BCol>
          <BCol lg="4" cols="6">
            <ul>
              <li>
                <BLink @click="$router.push({ path: '/terms' })">
                  {{ $t('home.footer.tos') }}
                </BLink>
              </li>
              <li>
                <BLink @click="$router.push({ path: '/privacy' })">
                  {{ $t('home.footer.privacy') }}
                </BLink>
              </li>
              <li>
                <BLink @click="$router.push({ path: '/ip' })">
                  {{ $t('home.footer.ip') }}
                </BLink>
              </li>
            </ul>
          </BCol>
        </BRow>
      </BContainer>
    </BRow>
  </div>
</template>


<script>
// import 'vue-awesome/icons/user-plus'
// import 'vue-awesome/icons/cogs'
// import 'vue-awesome/icons/map-marker'
// import 'vue-awesome/icons/sitemap'
// import 'vue-awesome/icons/credit-card'

import StaticMap from '@/components/StaticMap.vue'

import "@fontsource/poppins"

import Register from '@/lib/auth/components/Register.vue'

import {
  BContainer,
  BRow,
  BCol,
  BButton,
  BModal,
  BLink
} from 'bootstrap-vue-next'

export default {
    name: 'Home',
    components: {
        StaticMap,
        Register,
        BContainer,
        BRow,
        BCol,
        BButton,
        BModal,
        BLink,

    },
    data: function () {
        return {
            publicUrl: process.env.VUE_APP_PUBLIC_URL,
            supportUrl: process.env.VUE_APP_SUPPORT_URL,
            navColour: process.env.VUE_APP_NAV_COLOUR,
            navText: process.env.VUE_APP_NAV_TEXT,
            logoName: process.env.VUE_APP_LOGO,
        }
    },
    methods: {
    showRegisterModal(){
      this.$refs.registerModal.show()
    }
    
    }
}
</script>

<style lang="scss">
.static-map {
    padding-left: 15px;
    padding-right: 15px;
}

.home-main {
    overflow-y: auto;
    overflow-x: hidden;
    font-family: 'Poppins', sans-serif;

    .photo {
        border-radius: 25px;
    }

    .buttons {
        border: 0px;
        padding-top: 15px;
        padding-bottom: 15px;
        padding-right: 50px;
        padding-left: 50px;
        border-radius: 25px;
    }

    .buttons:hover {
        background-color: #6f0100;
    }

    .button-red {
        background-color: #cb0100;
    }

    .button-white {
        background-color: white;
        color: black;

    }

    .red-text {
        color: #cb0100;
    }

    .red-bar {
        background-color: #cb0100;
        color: white;
        margin-left: -15px;
        margin-right: -15px;
        padding-top: 20px;
        padding-bottom: 20px;
    }

    .footer {
        background-color: #343a40;
        color: white;

        a {
            color: white;
        }
    }

    ul {
        list-style: none;
    }

    .small-text {
        font-size: 14px;
    }

    .step-image {
        display: block;
        margin: auto;
        margin-bottom: 25px;
    }

    @media (min-width: 992px) {

        .static-map {
            height: 40em;
        }

        .float-middle {
            top: 40%;
            transform: translate(0, -40%);
            position: absolute;
        }

        .top-margin {
            margin-top: 100px;
            margin-bottom: 100px;

        }

        .right-padding {
            margin-top: 100px;
        }

        .step-padding {
            padding: 50px;
            padding-left: 100px;
            padding-right: 100px;
        }

        .red-bar-contents {
            margin: 50px;
        }

        .step-image {
            height: 200px;
        }

        .footer {
            padding: 150px;
        }

    }

    @media (max-width: 992px) {

        .static-map {
            height: 30em;
        }

        .photo {
            margin-top: 25px;
        }

        .top-margin {
            margin-top: 50px;
            margin-bottom: 50px;
        }

        .step-padding {
            margin-top: 50px;
            padding-left: 25px;
            padding-right: 25px;
        }

        .red-bar-contents {
            padding-left: 15px;
            padding-right: 15px;

        }

        .step-image {
            height: 150px;
        }

        .footer {
            padding: 25px;
        }

    }
}
</style>