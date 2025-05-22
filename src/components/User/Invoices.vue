<template>
  <BCard :header="$t('invoices.invoices')">
    <BCardText>
      <div v-show="loading" class="loader">
        <div class="spinner" />
      </div>
      <div v-if="invoices.length > 0">
        <BTableSimple striped>
          <BThead>
            <BTr>
              <BTh>{{ $t('dateTime.date') }}</BTh>
              <BTh>{{ $t('permissions.invoice') }} #</BTh>
              <BTh>{{ $t('permissions.campaign') }}</BTh>
              <BTh>{{ $t('permissions.display') }}</BTh>
              <BTh>{{ $t('invoices.subtotal') }}</BTh>
              <BTh>{{ $t('invoices.discount') }}</BTh>
              <BTh>{{ $t('common.total') }}</BTh>
            </BTr>
          </BThead>
          <BTbody>
            <BTr v-for="invoice in invoices" :key="invoice.id">
              <BTd>{{ invoice.date }}</BTd>
              <BTd>{{ invoice.invoiceNumber }}</BTd>
              <BTd>{{ invoice.campaignName }}</BTd>
              <BTd>{{ invoice.displayName }}</BTd>
              <BTd>{{ (invoice.total - invoice.discount) / 100 }}</BTd>
              <BTd>{{ invoice.discount / 100 }}</BTd>
              <BTd>{{ invoice.total / 100 }}</BTd>
            </BTr>
          </BTbody>
        </BTableSimple>
      </div>
      <div v-else>
        <span>{{ $t('message.noInvoice') }}</span>
      </div>
    </BCardText>
    <div v-if="invoicesMeta.totalPages > 1" class="card-footer">
      <BButtonGroup>
        <BButton
          v-if="currentPage > 1"
          variant="outline-secondary"
          @click="fetchInvoices(invoicesMeta.previousPage)"
        >
          {{ $t('buttons.previous') }}
        </BButton>
        <BButton
          v-if="currentPage < invoicesMeta.totalPages"
          variant="outline-secondary"
          @click="fetchInvoices(invoicesMeta.nextPage)"
        >
          {{ $t('buttons.next') }}
        </BButton>
      </BButtonGroup>
    </div>
  </BCard>
</template>
<script>
import {
  BCard,
  BCardText,
  BTableSimple,
  BThead,
  BTr,
  BTh,
  BTbody,
  BTd,
  BButtonGroup,
  BButton
} from 'bootstrap-vue-next'
export default{
  name: 'Invoices',
  components:{  
    BCard,
    BCardText,
    BTableSimple,
    BThead,
    BTr,
    BTh,
    BTbody,
    BTd,
    BButtonGroup,
    BButton

  },
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
