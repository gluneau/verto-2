<template>
  <div class="layout-padding">
    <q-page class="column flex-center text-white bg-black  text-white">
      <q-card flat class="bg-black" style="width: 100%; max-width: 750px;">
        <q-card-section class="text-weight-bold text-center text-uppercase">
            <q-icon class="float-left" name="help_outline" size="2.5rem" color="white" @click.native="$documentationManger.openDocumentation('addwallets/addLedger')">
            <q-tooltip>{{ $t('SettingsView.help') }}</q-tooltip>
            </q-icon>
            <big class="titillium q-pa-xl">{{ statusLabel }}</big>
            <q-icon class="float-right" name="close" size="2.5rem" color="white" @click.native="$router.push('cs-get-vtx-transactions')"/>
        </q-card-section>
        <q-card-section>
          <div class="text-center text-uppercase">
            <div v-show="orderInformation.status !== 'no_deposit'">
              <div class="col-6 text-h6 text-center q-pa-md">
                    {{ statusDesc }}
                </div>
            </div>
            <div v-show="orderInformation.status === 'no_deposit'">
              <div class="row">
                <div class="col-6 text-center q-pa-md">
                  <qrcode :value="orderInformation.exchangeAddress.address" :options="{size: 280}" class="q-mt-sm"></qrcode>
                </div>
                <div class="col-6 text-h6 text-center q-pa-md">
                    {{ statusDesc }}
                    <br>
                    <br>
                    <q-btn flat round dense  icon="file_copy" class="text-h6" @click="copyAddress(nativeChainAddress)" >Copy</q-btn>
                </div>
              </div>
              <br>
              <div class="row" v-if="timeremaining">
                <div class="col-6 text-center q-pa-md">
                  <div class="text-h3">
                    <countdown :time="timeremaining" :transform="transform" class="text-h5">
                      <template slot-scope="props">
                        <div class="text-h3">
                          {{ props.hours }}:{{ props.minutes }}:{{ props.seconds }}
                        </div>
                      </template>
                    </countdown>
                  </div>
                  <div class="q-pa-sm">
                    Time Remaining
                  </div>
                </div>
                <div class="col-6 text-center  q-pa-md">
                  <div class="text-h3">
                    {{ orderInformation.expectedDepositCoinAmount }}
                  </div>
                  <div class="q-pa-sm">
                    Amount
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
      <br>
    </q-page>
  </div>
</template>

<script>
import { userError } from '@/util/errorHandler'
import qrcode from '@chenfengyuan/vue-qrcode'
import countdown from '@chenfengyuan/vue-countdown'

export default {
  data () {
    return {
      orderId: '',
      createTime: null,
      coinswitchUrl: null,
      headers: {},
      statusLabel: 'Getting INformation',
      statusDesc: '',
      timeremaining: 0,
      underOneMinuteLeftInTimer: false,
      crowdfundData: {
        status: 'open'
      },
      orderInformation: {
        exchangeAddress: {
          address: ''
        },
        destinationAddress: {
          address: ''
        },
        expectedDepositCoinAmount: 0
      }
    }
  },
  components: {
    countdown,
    qrcode
  },
  created () {
  },
  mounted () {
    this.coinswitchUrl = process.env[this.$store.state.settings.network].COINSWITCH_URL
    this.headers = {
      'x-api-key': process.env[this.$store.state.settings.network].COINSWITCH_APIKEY
    }

    this.orderId = this.$route.query.order_id
    this.createTime = this.$route.query.create_time
    this.getOrderInformation()
  },
  methods: {
    transform (props) {
      Object.entries(props).forEach(([key, value]) => {
        let digits = value < 10 ? `0${value}` : value
        if (key === 'totalMinutes' && value <= 0) {
          this.underOneMinuteLeftInTimer = true
        } else if (key === 'totalSeconds' && value <= 0) {
          this.doneCountdown = true
        }
        props[key] = `${digits}`
      })

      return props
    },
    async getOrderInformation () {
      this.getOrderInformationFromCrowdfund()
      this.getOrderInformationFromCoinswitch()
    },
    async getOrderInformationFromCrowdfund () {
      const transactionDetailsUrl = process.env[this.$store.state.settings.network].CROWDFUND_URL + '/public/api/coinswitch-transaction-details/?order_id=' + this.orderId
      let results = await this.$axios.get(transactionDetailsUrl)

      if (!results.data.success) {
        // TODO: Error message
        userError('Problems retreiving details from Crowdfund')
        return
      }
      this.crowdfundData = results.data.data
      this.crowdfundData.status = 'open'
      if (this.crowdfundData.failed_time) {
        this.crowdfundData.status = 'failed'
      } else if (this.crowdfundData.verified_time) {
        this.crowdfundData.status = 'verified'
      } else if (this.crowdfundData.cf_convert_vtx_time) {
        this.crowdfundData.status = 'converted'
      } else if (this.crowdfundData.complete_time) {
        this.crowdfundData.status = 'complete'
      }

      console.log(JSON.stringify(this.crowdfundData, null, 4))

      /*
      {
    "verto_public_address": "EOS6pq8C2bn921FK98fdsBGHkDnvb2QXokW9c6pxgKbkRLnvjqox9",
    "note": null,
    "create_time": "2019-05-27T23:02:08.161787Z",
    "complete_time": null,
    "cf_convert_vtx_time": null,
    "verified_time": null,
    "failed_time": null
}
*/
    },
    async getOrderInformationFromCoinswitch () {
      let results = await this.$axios.get(this.coinswitchUrl + '/v2/order/' + this.orderId, { 'headers': this.headers })
      if (!results.data.success) {
        userError('Getting Information for the order. Please contact support.')
        return
      }
      this.orderInformation = results.data.data
      this.setStatus()
      const potentialTimeRemaining = new Date(this.orderInformation.validTill) - Date.now()
      if (potentialTimeRemaining > 0) {
        this.timeremaining = potentialTimeRemaining
      }
      console.log('TimeRemaining: ' + potentialTimeRemaining)
    },
    copyAddress () {
      this.$clipboardWrite(this.orderInformation.exchangeAddress.address)
      this.$q.notify({ color: 'positive', message: this.$t('DisplayKey.copied') })
    },
    setStatus () {
      const statusDict = {
        no_deposit: {
          label: 'No Deposit Made',
          desc: 'Use the QR code to send a transaction and get VTX!'
        },
        confirming: {
          label: 'Confirming',
          desc: 'Your transaction is waiting to be confirmed on blockchain.'
        },
        exchanging: {
          label: 'Exchanging',
          desc: 'Your payment is received and being exchanged via our partner.'
        },
        sending: {
          label: 'Sending',
          desc: 'Destination Coin is sending to the destination address.'
        },
        complete: {
          label: 'Complete',
          desc: ':Destination Coin is successfully sent to the destination .'
        },
        failed: {
          label: 'Failed',
          desc: 'Transaction has failed. Feel free to reach out to api-support@coinswitch.co'
        },
        refunded: {
          label: 'Refund',
          desc: 'Exchange was failed and coins were refunded to user\'s wallet.'
        },
        timeout: {
          label: 'Timeout',
          desc: 'No deposit was detected for the order with in validity period.'
        }
      }
      this.statusLabel = statusDict[this.orderInformation.status].label
      this.statusDesc = statusDict[this.orderInformation.status].desc
    }
  }
}
</script>

<style>
</style>
