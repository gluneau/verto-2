<template>
  <q-page class="flex flex-center text-white bg-black">
    <q-card flat class="bg-black" style="width: 100%; max-width: 700px;">
      <q-card-section class="text-weight-bold text-white text-center text-uppercase">
        <div class="q-pa-sm items-center flex no-wrap justify-between">
          <q-icon class="" name="help_outline" size="2.5rem" color="white" @click.native="$documentationManger.openDocumentation('getvtx/index')">
            <q-tooltip>{{ $t('SettingsView.help') }}</q-tooltip>
          </q-icon>
          <big class="titillium q-pa-md">VTX TOKEN DISTRIBUTION</big>
          <q-icon class="" name="close" size="2.5rem" color="white" @click.native="$router.push('/wallet')"/>
        </div>
        <!--

        -->
        <div class="row ">
            <span class="col text-center">
              <span class="text-h2 text-green">
                {{ data.usd_price }}
              </span>
              USD / VTX
            </span>
          </div>

        <div class="row q-pa-md">
          <span class="col text-center text-uppercase">
            ROUND
            <span class="text-h3">
              &nbsp;{{ data.current_round.number }}
            </span>
            ends in
          </span>
          <span class="col text-center">
            <div class="text-h4">
              <div class="col-6  text-h3">
                <div class="text-h3">
                  <countdown :time="timeremaining" :transform="transform">
                    <template slot-scope="props">
                      <div>
                        {{ props.days }}:
                        {{ props.hours }}:
                        {{ props.minutes }}:
                        {{ props.seconds }}
                      </div>
                    </template>
                  </countdown>
                </div>
              </div>
            </div>
          </span>
        </div>

        <div class="row q-pa-md">
          <div class="col-6 text-center">
              <span class="text-h4">
                {{ data.crowdsale.total_claimed | numFormat }}
              </span>
              CLAIMED
          </div>
          <div class="col-6 text-center">
              <span class="text-h4">
              {{ data.crowdsale.maximum_allocation - data.crowdsale.total_claimed | numFormat}}
            </span>
            REMAINING
          </div>
        </div>

      </q-card-section>

      <q-card-section class="text-weight-bold text-white text-center text-uppercase">

        <!--
                STATUS!!!!!!
        -->
        <div v-if="walletStatus === 'crowdfund_over'">
          <div class="text-h2 animate-blink text-red q-pa-sm" style='border-style: solid;'>
            {{ $t('BeginGetVtx.paused') }}
          </div>
          <br>
        </div>
        <div style='border-style: solid;  border-width: 0.1em'>
          <div v-show="walletStatus === 'purchase_not_allowed'">
            <div  class="q-pa-md text-h6 text-uppercase">
              <div class="text-h4">
              Awaiting Investor Approval
              </div>
              <q-tooltip v-model="showingTooltip.awaiting" content-style="font-size: 16px">
                You will be notified by Blocktopus upon successful completion of the process.
              </q-tooltip>
              <q-icon class="" name="help_outline" size="1.5rem" color="white" @click.native="showingTooltip.awaiting != showingTooltip.awaiting">
              </q-icon>
            </div>
          </div>
          <div v-show="walletStatus === 'wallet_not_whitelisted'">
            <div  class="q-pa-md text-h6 text-uppercase">
              <div class="text-h4">
              {{ $t('BeginGetVtx.not_whitelisted') }}
              </div>
              <q-tooltip v-model="showingTooltip.notRegistered" content-style="font-size: 16px">
                  {{ $t('BeginGetVtx.register_message') }}
              </q-tooltip>
              <q-icon class="" name="help_outline" size="1.5rem" color="white" @click.native="showingTooltip.notRegistered != showingTooltip.notRegistered">
              </q-icon>

                <div class="q-mt-md q-mb-md">
                  <q-btn class=" q-mr-sm" outline color="white" v-close-popup size="md" :label="$t('WalletManager.associations')" to="/associations" />
                </div>
            </div>
          </div>

          <div v-show="walletStatus === 'waiting_for_kyc'">
            <div  class="q-pa-md text-h6 text-uppercase">
              <div class="text-h4">
              Awaiting KYC Approval
              </div>
              <q-tooltip v-model="showingTooltip.waiting_kyc" content-style="font-size: 16px">
                You will be notified by Blocktopus upon successful completion of the process.
              </q-tooltip>
              <q-icon class="" name="help_outline" size="1.5rem" color="white" @click.native="showingTooltip.waiting_kyc != showingTooltip.waiting_kyc">
              </q-icon>
            </div>
          </div>

          <div v-show="walletStatus === 'wallet_not_allocated' || walletStatus === 'wallet_allocated'">
            <div class="q-pa-lg row">
              <div class='col-6'>
                <q-btn
                  color="green"
                  outline
                  dense style="min-width: 150px;"
                  @click="$router.push({path: 'coinswitch-get-vtx'})"
                >
                  <div class="q-pa-sm text-white">
                    Get VTX With Crypto
                  </div>
                </q-btn>
              </div>
              <div class='col-6'>
                <q-btn
                  color="green"
                  outline
                  dense
                  style="min-width: 150px;"
                  @click="$router.push({path: 'zixipay-get-vtx'})"
                >
                  <div class="q-pa-sm text-white">
                  Get VTX With FIAT
                  </div>
                </q-btn>
              </div>
            </div>
          </div>
        <div class="text-center text-weight-bold text-uppercase q-pa-lg">
                <div class="q-pa-sm row">
                    <div class="col-6 uppercase">
                        Transaction STAtUS
                    </div>
                    <div class="col-6">
                    <q-select
                      dark
                      separator
                      v-model="status"
                      :options="statuses"
                      @input="refreshContent"
                    />
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
            </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import countdown from '@chenfengyuan/vue-countdown'
import { userError } from '@/util/errorHandler'
import getVtxHelper from '../../util/GetVtxHelper'
import Vue from 'vue'
import numFormat from 'vue-filter-number-format'
import configManager from '../../util/ConfigManager'
import imageUrls from './coinswitch/currencyImageUrls.json'

Vue.filter('numFormat', numFormat)

export default {
  // name: 'PageName',
  data () {
    return {
      spinnervisible: false,
      progress: 0,
      progressBuffer: 41,
      vertopassword: '',
      showingTooltip: {
        notRegistered: false,
        awaiting: false,
        waiting_kyc: false
      },
      buffer: 17,
      data: {
        crowdsale: {},
        current_round: {}
      },
      timeremaining: 0,
      walletStatus: '',
      venueIsAssociated: false,
      walletName: '',
      round: 0,
      showGetVTX: false,
      status: 'open',
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
  components: {
    countdown: countdown
  },
  mounted () {
    const self = this
    this.walletName = this.$store.state.currentwallet.wallet.name
    this.setUpWalletStatus()
    this.venueIsAssociated = configManager.checkIfAssociatedWithVenue()
    this.$axios.get(process.env[this.$store.state.settings.network].CROWDFUND_URL + '/public/api/summary/').then(function (result) {
      self.data = result.data
      self.calculateValues()
    }).catch(() => {
      userError('There was a problem reaching the server')
    })
    this.getTransactionHistory()
  },
  methods: {
    showRowStatus (row) {
      this.$router.push(
        '/coinswitch-status?' +
        'order_id=' + row.order_id
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
    },
    async calculateValues () {
      // smaller number by the larger number
      if (this.data.crowdsale.total_claimed <= 0) {
        this.progress = 0
      } else if (this.data.crowdsale.total_claimed >= this.data.crowdsale.maximum_allocation) {
        this.progress = 0
      } else {
        this.progress = ((this.data.crowdsale.total_claimed / this.data.crowdsale.maximum_allocation) * 100)
      }
      this.timeremaining = Date.parse(this.data.current_round.end_date) - Date.now()
    },
    transform (props) {
      Object.entries(props).forEach(([key, value]) => {
        let digits = value < 10 ? `0${value}` : value
        if (key === 'totalSeconds' && value <= 0) {
          this.doneCountdown = true
        }
        props[key] = `${digits}`
      })
      return props
    },
    setUpWalletStatus () {
      const self = this
      getVtxHelper.getWalletStatus(this.$store.state.currentwallet.wallet.key, function (response) {
        let tempstatus = response.message
        if (tempstatus === 'wallet_not_whitelisted') {
          if (configManager.checkIfAssociatedWithBlocktopus()) {
            tempstatus = 'waiting_for_kyc'
          }
        }
        self.walletStatus = tempstatus
        self.showGetVTX = false
        if (
          self.zixipayenabled ||
          self.walletStatus === 'wallet_not_allocated' ||
          self.walletStatus === 'wallet_allocated' ||
          self.walletStatus === 'waiting_for_kyc' ||
          self.walletStatus === 'wallet_not_whitelisted' ||
          self.walletStatus === 'purchase_not_allowed'
        ) {
          self.showGetVTX = true
        }
      })
    }
  }
}
</script>
<style scoped>
.infoheader {
  font-size: 10.5em;
}
.timestandard {
  font-size: 1.5em;
}
.minutesleft {
  color: red;
  font-size: 2.5em;
}
.secondsleft {
  color: red;
  font-size: 5em;
}
</style>
