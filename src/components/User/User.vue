<template lang="html">
  <div>
    <b-modal
      id="showedit"
      hide-footer
    >
      <edit-user :user="user" />
    </b-modal>
    <b-card :header="$t('user.accountDetails')">
      <b-card-text>
        <div
          v-if="errors.length > 0"
          class="alert alert-danger"
        >
          <ul>
            <li
              v-for="(error, index) in errors"
              :key="index"
            >
              {{ error }}
            </li>
          </ul>
        </div>
        <dl class="row">
          <dt class="col-3">
            {{ $t('user.username') }}
          </dt>
          <dd class="col-9">
            {{ user.username }}
          </dd>
          <dt class="col-3">
            {{ $t('user.email') }}
          </dt>
          <dd class="col-9">
            {{ user.email }}
          </dd>
          <dt class="col-3">
            {{ $t('user.emailVerified') }}
          </dt>
          <dd class="col-9">
            {{ user.verified }}
          </dd>
          <dt class="col-3">
            {{ $t('user.created') }}
          </dt>
          <dd class="col-9">
            {{ user.createdOn }}
          </dd>
          <dt class="col-3">
            {{ $t('user.lastLogin') }}
          </dt>
          <dd class="col-9">
            {{ user.lastLogin }}
          </dd>
          <dt class="col-3">
            {{ $t('user.lastModified') }}
          </dt>
          <dd class="col-9">
            {{ user.lastModified }}
          </dd>
        </dl>
        <b-button
          variant="primary"
          @click="$bvModal.show('showedit')"
        >
          {{ $t('buttons.update') }}
        </b-button>
      </b-card-text>
    </b-card>
  </div>
</template>

<script>
import EditUser from '../../pages/Users/EditUser.vue'
export default {
  name: 'User',
  components: {
    EditUser
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      showEdit: false,
      errors: []
    }
  },
  methods: {
  }
}
</script>

<style lang="css">
dl {
  text-align: left;
}
</style>
