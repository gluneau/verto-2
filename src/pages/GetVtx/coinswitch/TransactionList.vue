<template>
    <q-page class="column flex-center text-white bg-black  text-white">
        <q-card flat class="bg-black" style="width: 100%; max-width: 750px;">
        <q-card-section class="text-weight-bold text-center text-uppercase">
            <q-icon class="float-left" name="help_outline" size="2.5rem" color="white" @click.native="$documentationManger.openDocumentation('addwallets/addLedger')">
            <q-tooltip>{{ $t('SettingsView.help') }}</q-tooltip>
            </q-icon>
            <big class="titillium q-pa-xl">Get VTX Transacion List</big>
            <q-icon class="float-right" name="close" size="2.5rem" color="white" @click.native="$router.push('wallet')"/>
        </q-card-section>
        </q-card>
        <q-card flat class="bg-black" style="width: 100%; max-width: 750px;">
            <div class="text-center text-weight-bold text-uppercase q-pa-lg ">
                GET MORE VTX &nbsp;
                <q-icon class="float-center" @click.native="$router.push('coinswitch-get-vtx')" name="add_circle_outline" color="green" size="1.5rem">
                    <q-tooltip>Get More VTX</q-tooltip>
                </q-icon>
            </div>
            <div class="text-center text-weight-bold text-uppercase q-pa-lg settings-border">
                <div class="q-pa-sm ">
                    <div class="">
                        Transaction STAtUS
                    </div>
                    <div class="col-4">
                    <q-select
                      dark
                      separator
                      v-model="status"
                      :options="statuses"
                      @input="refreshContent"
                    />
                    </div>
                </div>
            </div>
            <q-table
            class="bg-black"
            :dark='dark'
            :data="tableData"
            :columns="columns"
            row-key="key"
            >
                <q-tr
                  :id="props.row.id"
                  slot="body"
                  slot-scope="props"
                  :props="props" class="cursor-pointer"
                  @click.native="showRowStatus(props.row)">
                    <q-td
                        v-for="col in props.cols"
                        :key="col.name"
                        :props="props"
                        >
                        <div v-if="col.name === 'token_image'" class="text-center text-white">
                        <img
                            :src="col.value"
                            style="max-width:50px;"
                        />
                        </div>
                        <div v-if="col.name === 'token_name'" class="text-center text-white">
                          <big>{{ col.value }}</big>
                          </div>
                          <div v-if="col.name === 'created'" class="text-center text-white">
                          <div class="">
                            {{ col.value  | formatDate }}
                          </div>
                          <div class="text-h6">
                            {{ col.value  | formatTime }}
                          </div>
                        </div>
                    </q-td>
                </q-tr>
            </q-table>
        </q-card>
    </q-page>
</template>

<script>
import { userError } from '@/util/errorHandler'
import imageUrls from './currencyImageUrls.json'

export default {
  data () {
    return {
      status: null,
      tableData: [],
      dark: true,
      columns: [
        {
          name: 'token_image',
          label: '',
          required: false,
          align: 'center',
          field: 'logoUrl',
          sortable: false,
          classes: 'text-h6'
        }, {
          name: 'token_name',
          label: 'Deposit Token',
          required: true,
          align: 'center',
          field: 'name',
          sortable: false,
          classes: 'my-class'
        }, {
          name: 'created',
          label: 'Created',
          required: true,
          align: 'center',
          field: 'create_time',
          sortable: false,
          classes: 'my-class'
        }
      ],
      statuses: [
        {
          label: 'Open',
          value: 'open'
        },
        {
          label: 'Complete',
          value: 'complete'
        },
        {
          label: 'Verified',
          value: 'verified'
        },
        {
          label: 'Fail',
          value: 'fail'
        }
      ]
    }
  },
  mounted () {
    this.getTransactionHistory()
  },
  methods: {
    showRowStatus (row) {
      this.$router.push(
        '/coinswitch-status?' +
        'order_id=' + row.order_id +
        '&create_time=' + row.create_time
      )
    },
    async refreshContent () {
      console.log('REFRESHIG:::: ' + JSON.stringify(this.status))
      this.getTransactionHistory()
    },
    async getTransactionHistory () {
      // &status= this.status
      let url = process.env[this.$store.state.settings.network]
        .CROWDFUND_URL +
        '/public/api/coinswitch-transaction-list?verto_public_address=' +
        this.$store.state.currentwallet.wallet.key
      if (this.status) {
        url += '&status=' + this.status.value
      }
      console.log(url)
      let results = await this.$axios.get(url)
      this.tableData = results.data.data
      if (!results.data.success) {
        // TODO: Error message
        userError('Error retreiving the transactions from the server.')
        return
      }
      let i
      for (i in this.tableData) {
        const coinInList = imageUrls.filter(c => c.symbol === this.tableData[i].deposit_coin)[0]
        if (coinInList) {
          this.tableData[i]['logoUrl'] = coinInList.logoUrl
          this.tableData[i]['name'] = coinInList.name
        }
      }
      console.log(JSON.stringify(this.tableData, null, 4))
    }
  }
}
</script>

<style scoped>
.settings-border {
  border: solid thin white !important;
  border-style: solid;
  border-width: thin;
}
</style>
