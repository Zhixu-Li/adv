<template>
  <b-card :header="$t('invoices.invoices')">
    <b-card-text>
      <div
        v-show="loading"
        class="loader"
      >
        <div class="spinner" />
      </div>
      <div v-if="invoices.length > 0">
        <div>
          <b-table-simple class="table table-striped">
            <b-thead>
              <b-tr>
                <b-th>{{ $t('dateTime.date') }}</b-th>
                <b-th>{{ $t('permissions.invoice') }} #</b-th>
                <b-th>{{ $t('permissions.campaign') }}</b-th>
                <b-th>{{ $t('permissions.display') }}</b-th>
                <b-th>{{ $t('invoices.subtotal') }}</b-th>
                <b-th>{{ $t('invoices.discount') }}</b-th>
                <b-th>{{ $t('common.total') }}</b-th>
              </b-tr>
            </b-thead>
            <b-tbody>
              <b-tr
                v-for="invoice in invoices"
                :key="invoice.id"
              >
                <b-td>{{ invoice.date }}</b-td>
                <b-td>{{ invoice.invoiceNumber }}</b-td>
                <b-td>{{ invoice.campaignName }}</b-td>
                <b-td>{{ invoice.displayName }}</b-td>
                <b-td>{{ (invoice.total - invoice.discount) / 100 }}</b-td>
                <b-td>{{ invoice.discount / 100 }}</b-td>
                <b-td>{{ invoice.total / 100 }}</b-td>
              </b-tr>
            </b-tbody>
          </b-table-simple>
        </div>
      </div>
      <div v-else>
        <span>{{ $t('message.noInvoice') }}</span>
      </div>
    </b-card-text>
    <div
      v-if="invoicesMeta.totalPages > 1"
      class="card-footer"
    >
      <b-button-group>
        <b-button
          v-if="invoicesMeta.totalPages > 1 && currentPage != 1"
          variant="outline-secondary"
          @click="fetchInvoices(invoicesMeta.previousPage)"
        >
          {{ $t('buttons.previous') }}
        </b-button>
        <b-button
          v-if="invoicesMeta.totalPages > 1 && currentPage != invoicesMeta.totalPages"
          variant="outline-secondary"
          @click="fetchInvoices(invoicesMeta.nextPage)"
        >
          {{ $t('buttons.next') }}
        </b-button>
      </b-button-group>
    </div>
  </b-card>
</template>
<script>
export default{
  name: 'Invoices',
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      invoices: [],
      invoicesMeta: {},
      currentPage: 1,
      loading: true
    }
  },
  watch: {
    fetchInvoices () {
      this.fetchInvoices(this.currentPage)
    },
    userId () {
      this.fetchInvoices(this.currentPage)
    }
  },
  mounted () {
    this.fetchInvoices(1)
  },
  methods: {
    fetchInvoices (page) {
      var scope = this
      this.loading = true
      this.$axios.get('v1/users/' + this.userId + '/invoices?page=' + page).then(
        (response) => {
          this.invoices = response.data.data
          this.invoicesMeta = response.data.meta
          this.currentPage = page
          this.loading = false
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
          scope.loading = false
        }
      )
    }
  }
}
</script>
<style>

</style>
