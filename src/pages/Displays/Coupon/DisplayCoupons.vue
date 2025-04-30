<template>
  <b-row class="pt-3">
    <b-col cols="12">
      <b-button
        variant="primary"
        @click="$bvModal.show('create-modal')"
      >
        {{ $t('buttons.create') }}
      </b-button>
    </b-col>
    <b-col cols="12 pt-3">
      <b-table-simple>
        <b-thead>
          <b-tr>
            <b-th>{{ $t('displayCoupon.code') }}</b-th>
            <b-th>{{ $t('displayCoupon.expiry') }}</b-th>
            <b-th class="hidden-sm-down">
              {{ $t('displayCoupon.price') }}
            </b-th>
            <b-th class="hidden-sm-down">
              {{ $t('displayCoupon.percentage') }}
            </b-th>
            <b-th class="hidden-sm-down">
              {{ $t('displayCoupon.quantity') }}
            </b-th>
            <b-th>{{ $t('actions.actions') }}</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr
            v-for="coupon in coupons"
            :key="coupon.code"
          >
            <b-td>{{ coupon.code }}</b-td>
            <b-td>{{ coupon.expiry }}</b-td>
            <b-td
              v-if="coupon.price !== undefined"
              class="hidden-sm-down"
            >
              {{ '$' + (coupon.price / 100) }}
            </b-td>
            <b-td
              v-else
              class="hidden-sm-down"
            />
            <b-td
              v-if="coupon.percent !== undefined"
              class="hidden-sm-down"
            >
              {{ Math.round(coupon.percent * 100, 2) + '%' }}
            </b-td>
            <b-td
              v-else
              class="hidden-sm-down"
            />
            <b-td
              v-if="coupon.unlimited"
              class="hidden-sm-down"
            >
              {{ $t('displayCoupon.unlimited') }}
            </b-td>
            <b-td
              v-else
              class="hidden-sm-down"
            >
              {{ coupon.quantity }}
            </b-td>
            <b-td class="actions">
              <b-button
                class="padbuttons"
                variant="primary"
                @click="editCoupon(coupon)"
              >
                {{ $t('buttons.edit') }}
              </b-button>
              <b-button
                class="padbuttons"
                variant="danger"
                @click="showDeleteModal(coupon)"
              >
                {{ $t('buttons.delete') }}
              </b-button>
            </b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
    </b-col>
    <b-modal id="delete-coupon-modal">
      <h3>Are you sure you want to delete this coupon?</h3>
      <template #modal-footer>
        <button
          type="button"
          class="btn btn-primary"
          @click="$bvModal.hide('delete-coupon-modal')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="deleteCoupon(selected)"
        >
          Delete
        </button>
      </template>
    </b-modal>
    <b-modal
      id="create-modal"
      :title="$t('displayCoupon.new')"
      size="lg"
      hide-footer
    >
      <create-coupon @update="fetchCoupons();$bvModal.hide('create-modal')" />
    </b-modal>
    <b-modal
      id="edit-modal"
      :title="$t('common.edit')"
      size="lg"
      hide-footer
    >
      <edit-coupon
        :coupon="selected"
        @update="fetchCoupons();$bvModal.hide('edit-modal')"
      />
    </b-modal>
  </b-row>
</template>

<script>
import CreateCoupon from './CreateCoupon.vue'
import EditCoupon from './EditCoupon.vue'

export default{
  components: {
    CreateCoupon,
    EditCoupon
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
