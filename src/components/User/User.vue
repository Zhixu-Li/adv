<template lang="html">
  <div>
    <BModal id="showedit" hide-footer>
      <edit-user :user="user" />
    </BModal>

    <BCard :header="$t('user.accountDetails')">
      <BCardText>
        <div v-if="errors.length > 0" class="alert alert-danger">
          <ul>
            <li v-for="(error, index) in errors" :key="index">
              {{ error }}
            </li>
          </ul>
        </div>

        <dl class="row">
          <dt class="col-3">{{ $t('user.username') }}</dt>
          <dd class="col-9">{{ user.username }}</dd>

          <dt class="col-3">{{ $t('user.email') }}</dt>
          <dd class="col-9">{{ user.email }}</dd>

          <dt class="col-3">{{ $t('user.emailVerified') }}</dt>
          <dd class="col-9">{{ user.verified }}</dd>

          <dt class="col-3">{{ $t('user.created') }}</dt>
          <dd class="col-9">{{ user.createdOn }}</dd>

          <dt class="col-3">{{ $t('user.lastLogin') }}</dt>
          <dd class="col-9">{{ user.lastLogin }}</dd>

          <dt class="col-3">{{ $t('user.lastModified') }}</dt>
          <dd class="col-9">{{ user.lastModified }}</dd>
        </dl>

        <BButton variant="primary" @click="$bvModal.show('showedit')">
          {{ $t('buttons.update') }}
        </BButton>
      </BCardText>
    </BCard>
  </div>
</template>

<script>
import {
  BModal,
  BCard,
  BCardText,
  BButton
} from 'bootstrap-vue-next'
import EditUser from '../../pages/Users/EditUser.vue'
export default {
  name: 'User',
  components: {
    EditUser,
    BModal,
    BCard,
    BCardText,
    BButton,
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
