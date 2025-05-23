<template>
  <BRow class="pt-3">
    <BCol cols="12">
      <BButton variant="primary" @click="$bvModal.show('create-modal')">
        {{ $t('buttons.create') }}
      </BButton>
    </BCol>

    <BCol cols="12" class="pt-3">
      <BTableSimple>
        <BThead>
          <BTr>
            <BTh>{{ $t('displayCoupon.code') }}</BTh>
            <BTh>{{ $t('displayCoupon.expiry') }}</BTh>
            <BTh class="hidden-sm-down">{{ $t('displayCoupon.price') }}</BTh>
            <BTh class="hidden-sm-down">{{ $t('displayCoupon.percentage') }}</BTh>
            <BTh class="hidden-sm-down">{{ $t('displayCoupon.quantity') }}</BTh>
            <BTh>{{ $t('actions.actions') }}</BTh>
          </BTr>
        </BThead>
        <BTbody>
          <BTr v-for="coupon in coupons" :key="coupon.code">
            <BTd>{{ coupon.code }}</BTd>
            <BTd>{{ coupon.expiry }}</BTd>
            <BTd v-if="coupon.price !== undefined" class="hidden-sm-down">
              {{ '$' + (coupon.price / 100) }}
            </BTd>
            <BTd v-else class="hidden-sm-down" />
            <BTd v-if="coupon.percent !== undefined" class="hidden-sm-down">
              {{ Math.round(coupon.percent * 100) + '%' }}
            </BTd>
            <BTd v-else class="hidden-sm-down" />
            <BTd v-if="coupon.unlimited" class="hidden-sm-down">
              {{ $t('displayCoupon.unlimited') }}
            </BTd>
            <BTd v-else class="hidden-sm-down">
              {{ coupon.quantity }}
            </BTd>
            <BTd class="actions">
              <BButton class="padbuttons" variant="primary" @click="editCoupon(coupon)">
                {{ $t('buttons.edit') }}
              </BButton>
              <BButton class="padbuttons" variant="danger" @click="showDeleteModal(coupon)">
                {{ $t('buttons.delete') }}
              </BButton>
            </BTd>
          </BTr>
        </BTbody>
      </BTableSimple>
    </BCol>

    <BModal id="delete-coupon-modal">
      <h3>Are you sure you want to delete this coupon?</h3>
      <template #modal-footer>
        <BButton variant="secondary" @click="$bvModal.hide('delete-coupon-modal')">
          {{ $t('buttons.cancel') }}
        </BButton>
        <BButton variant="danger" @click="deleteCoupon(selected)">
          {{ $t('buttons.delete') }}
        </BButton>
      </template>
    </BModal>

    <BModal id="create-modal" :title="$t('displayCoupon.new')" size="lg" hide-footer>
      <CreateCoupon @update="fetchCoupons(); $bvModal.hide('create-modal')" />
    </BModal>

    <BModal id="edit-modal" :title="$t('common.edit')" size="lg" hide-footer>
      <EditCoupon
        :coupon="selected"
        @update="fetchCoupons(); $bvModal.hide('edit-modal')"
      />
    </BModal>
  </BRow>
</template>

<script>
import CreateCoupon from './CreateCoupon.vue'
import EditCoupon from './EditCoupon.vue'
import {
  BRow,
  BCol,
  BButton,
  BTableSimple,
  BThead,
  BTr,
  BTh,
  BTbody,
  BTd,
  BModal
} from 'bootstrap-vue-next'
export default{
  components: {
    CreateCoupon,
    EditCoupon,
     BRow,
    BCol,
    BButton,
    BTableSimple,
    BThead,
    BTr,
    BTh,
    BTbody,
    BTd,
    BModal,
  },
  data () {
    return {
      showCreate: false,
      showEdit: false,
      showDelete: false,
      coupons: [],
      selected: {},
      meta: {},
      currentPage: 1
    }
  },
  mounted () {
    this.fetchCoupons(1)
  },
  methods: {
    fetchCoupons () {
      var scope = this
      this.$axios.get('v1/displays/' + this.$route.params.displayId + '/coupons').then(
        (response) => {
          this.coupons = response.data.data
          this.meta = response.data.meta
        }).catch(
        function (error) {
          if (!error.response) {
            scope.$notifications.add({
              title: 'Error',
              type: 'warning',
              body: error.message,
              timeout: true
            })
          } else if (error.response.status !== 404) {
            scope.$notifications.add({
              title: 'Error',
              type: 'warning',
              body: error.response.data.message,
              timeout: true
            })
          }
        }
      )
    },
    closeCouponCreate () {
      this.showCreate = false
      this.fetchCoupons(this.currentPage)
    },
    editCoupon (coupon) {
      this.selected = coupon
      this.$bvModal.show('edit-modal')
    },
    closeCouponEdit () {
      this.showEdit = false
      this.fetchCoupons(this.currentPage)
    },
    showDeleteModal (coupon) {
      this.selected = coupon
      this.$bvModal.show('delete-coupon-modal')
    },
    deleteCoupon (coupon) {
      this.$axios.delete('v1/displays/' + this.$route.params.displayId + '/coupons/' + coupon.couponId).then(
        () => {
          this.$notifications.add({
            title: 'Success',
            type: 'success',
            body: this.$t('notifications.couponDelete'),
            timeout: true
          })
          this.$bvModal.hide('delete-coupon-modal')
          this.fetchCoupons(this.currentPage)
        },
        () => {
          this.$notifications.add({
            title: 'Error',
            type: 'danger',
            body: this.$t('notifications.couponDeleteError'),
            timeout: true
          })
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
  .actions {
    min-width: 120px;
  }

  .buttons {
    margin: 5px;
  }

  .controls {
    padding: 15px;
  }
  .padbuttons {
    margin: 5px;
  }
</style>
