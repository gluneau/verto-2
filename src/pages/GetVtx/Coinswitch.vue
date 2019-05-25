<template>
    <q-page class="column flex-center text-white bg-black  text-white">
        <q-card flat class="bg-black" style="width: 100%; max-width: 750px;">
        <q-card-section class="text-weight-bold text-center text-uppercase">
            <q-icon class="float-left" name="help_outline" size="2.5rem" color="white" @click.native="$documentationManger.openDocumentation('addwallets/addLedger')">
            <q-tooltip>{{ $t('SettingsView.help') }}</q-tooltip>
            </q-icon>
            <big class="titillium q-pa-xl">Get VTX With Crypto</big>
            <q-icon class="float-right" name="close" size="2.5rem" color="white" @click.native="$router.push('wallet')"/>
        </q-card-section>
        </q-card>
        <q-card flat class="bg-black" style="width: 100%; max-width: 750px;">
            <q-stepper v-model="step" done-color="green" active-color="green" ref="stepper" alternative-labels >
                <q-step :name="1" title="Currency" class="bg-black workflow-step" :done="step>1">
                   <q-inner-loading :showing="spinnervisible">
                        <q-spinner-gears size="50px" color="black" />
                    </q-inner-loading>
                    <q-card-section v-show="!spinnervisible">
                        <q-select
                        dark
                        label="Select Currency"
                        separator
                        v-model="depositCoin"
                        :options="depositCoinOptions"
                    >
                    <template v-slot:option="scope">
                        <q-item
                        v-bind="scope.itemProps"
                        v-on="scope.itemEvents"
                        >
                        <q-item-section avatar>
                            <q-icon :name="`img:${scope.opt.image}`" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label v-html="scope.opt.label" />
                            <q-item-label caption>{{ scope.opt.value }}</q-item-label>
                        </q-item-section>
                        </q-item>
                    </template>
                    <template v-slot:selected>
                        <q-item
                        v-if="depositCoin"
                        >
                        <q-item-section avatar>
                            <q-icon :name="`img:${depositCoin.image}`" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label v-html="depositCoin.label" />
                            <q-item-label caption>{{ depositCoin.value }}</q-item-label>
                        </q-item-section>
                        </q-item>
                        <q-item
                        v-else>
                        </q-item>
                    </template>
                    </q-select>
                    </q-card-section>

                    <div class="q-pa-sm text-center" v-show="depositCoin" @click="$refs.stepper.next()">
                        <q-icon name="navigate_next" size="3.2rem" color="green"   >
                        <q-tooltip>{{ $t('next') }}</q-tooltip>
                        </q-icon>
                    </div>
                </q-step>
                <q-step :name="2" title="Return Information" class="bg-black workflow-step" :done="step>2">
                    <div class="q-py-sm text-uppercase">
                        <q-item class="items-center">
                            <q-item-section  class="col-auto q-mr-md">
                            <q-chip dense color="green"  class="shadow-1">&nbsp;</q-chip>
                            </q-item-section>
                            <q-item-label >Provide A Return Address In Event Of Error</q-item-label>
                        </q-item>
                    </div>
                    <div class="q-py-sm text-uppercase">
                        <q-item class="items-center">
                            <q-item-section  class="col-auto q-mr-md">
                            <q-chip dense color="green"  class="shadow-1">&nbsp;</q-chip>
                            </q-item-section>
                            <q-item-label >Add A Memo</q-item-label>
                        </q-item>
                    </div>
                    <div class="q-py-xs">
                        <q-input
                            v-model="returnAddress"
                            type="text"
                            dark
                            color="green"
                            label="Return Address"
                        />
                    </div>
                    <br>
                    <div class="q-py-xs">
                        <q-input
                            v-model="returnMemo"
                            type="text"
                            dark
                            color="green"
                            label="(Optional) Return Memo"
                        />
                    </div>
                    <div class="q-pa-sm text-center" v-show="returnAddress" @click="$refs.stepper.next()">
                        <q-icon name="navigate_next" size="3.2rem" color="green"   >
                        <q-tooltip>{{ $t('next') }}</q-tooltip>
                        </q-icon>
                    </div>
                </q-step>
                <q-step :name="3" title="Calculate VTX" class="bg-black workflow-step" :done="step>3">
                    <div class="q-py-sm text-uppercase">
                        <q-item class="items-center">
                            <q-item-section  class="col-auto q-mr-md">
                            <q-chip dense color="amber"  class="shadow-1">&nbsp;</q-chip>
                            </q-item-section>
                            <q-item-label >Note that the amount of VTX fluctuates based on market value.</q-item-label>
                        </q-item>
                    </div>
                    <div class="q-py-xs">
                        <q-input
                            v-model="nativeCurrencyAmount"
                            type="number"
                            dark
                            color="green"
                            label="Amount From Selected Currency"
                        />
                    </div>
                    <div class="q-pa-sm text-center" v-show="true" @click="$refs.stepper.next()">
                        <q-icon name="navigate_next" size="3.2rem" color="green"   >
                        <q-tooltip>{{ $t('next') }}</q-tooltip>
                        </q-icon>
                    </div>
                </q-step>
                <q-step :name="4" title="Submit" class="bg-black workflow-step" :done="step>4">

                   <q-inner-loading :showing="submitSpinnervisible">
                        <q-spinner-gears size="50px" color="black" />
                    </q-inner-loading>
                    Does the steps of the submit or something.

                    <div v-show="hasError" class="text-h6 text-uppercase text-red q-pa-md">
                        {{ errorMessage }}
                    </div>

                    <div v-show="mustWait" class="text-h6 text-uppercase text-red q-pa-md">
                    {{ $t('RequestNativeChainAddress.time_remaining_info') }}
                    <countdown :time="timeremaining" :transform="transform" >
                        <template slot-scope="props">
                        <div >
                            <span v-if="props.totalHours > 0" class="timestandard"
                            >{{ props.hours }}:</span>
                            <span v-if="props.totalMinutes > 0"
                            v-bind:class="{ timestandard:  props.totalMinutes > 0, minutesleft: props.totalHours <= 0 }"
                            >
                            {{ props.minutes }}:
                            </span>
                            <span
                            v-bind:class="{ timestandard:  props.totalMinutes > 0, secondsleft:  props.totalMinutes <= 0, minutesleft: props.totalHours <= 0 }"
                            >
                            {{ props.seconds }}
                            </span>
                        </div>
                        </template>
                    </countdown>
                    </div>
                    <div class="q-pa-sm text-center" v-show="!submitSpinnervisible && showSubmit" @click="submit()">
                        <q-icon name="navigate_next" size="3.2rem" color="green"   >
                        <q-tooltip>{{ $t('next') }}</q-tooltip>
                        </q-icon>
                    </div>
                </q-step>
            </q-stepper>
        </q-card>
    </q-page>
</template>

<script>
import store from '@/store'
import { userError } from '@/util/errorHandler'

// TODO: Talk about this... no need for the PROXY
let url = ''
if (process.env.PROD) {
  url = 'https://api.coinswitch.co'
} else {
  // Install this https://www.npmjs.com/package/local-cors-proxy
  console.log('DO NOT forget to install https://www.npmjs.com/package/local-cors-proxy for local dev work')
  url = 'http://localhost:8010/proxy'
}

const headers = {
  'x-api-key': process.env[store.state.settings.network].COINSWITCH_APIKEY
}

export default {
  data () {
    return {
      step: 1,
      contractable: true,
      coins: [],
      depositCoinOptions: [],
      depositCoin: '',
      spinnervisible: false,
      returnAddress: '',
      returnMemo: '',
      nativeCurrencyAmount: 0,
      submitSpinnervisible: false,
      hasError: false,
      errorMessage: '',
      mustWait: false,
      timeremaining: 0,
      showSubmit: true
    }
  },
  mounted () {
    this.spinnervisible = true
    const self = this
    this.$axios.get(url + '/v2/coins', { headers }).then(function (result) {
      // will be using this coins array later with the destination select
      self.coins = result.data.data
      self.getBtcPairs(result.data.data)
    })
  },
  methods: {
    transform (props) {
      Object.entries(props).forEach(([key, value]) => {
        if (key === 'totalSeconds' && value <= 1) {
          this.errors.mustWait = false
          this.showSubmit = true
        }
        let digits = value < 10 ? `0${value}` : value
        props[key] = `${digits}`
      })
      return props
    },
    async allocateBtc () {
      this.hasError = false
      this.errorMessage = ''
      this.submitSpinnervisible = true
      let hashResult = await this.$axios.post(process.env[this.$store.state.settings.network].CROWDFUND_URL + '/public/api/initiate-transaction/', {
        verto_public_address: this.$store.state.currentwallet.wallet.key,
        currency: 'btc'
      })
      const res = await hashResult
      if (res.data.success) {
        this.$router.push({ name: 'begin-get-vtx' })
      } else {
        if (res.data.error_code === 'no_address_available') {
          this.hasError = true
          this.errorMessage = 'No Address Currently Available. Please Try Again Later'
        } else if (res.data.error_code === 'pending_transactions_exist') {
          this.showSubmit = false
          this.hasError = true
          this.errorMessage = 'You Have A Pending Transaction'
        } else if (res.data.error_code === 'investor_must_wait') {
          const waitUntil = res.data.data.next_available_time
          const serverTime = res.data.data.server_time
          this.timeremaining = Date.parse(waitUntil) - Date.parse(serverTime)
          this.mustWait = true
          this.showSubmit = false
        }
      }
      this.submitSpinnervisible = false
    },
    async allocateNonBtc () {
      console.log('** Needs to call the crowdfund server as that is where the BTC address will be added to the Coinswitch request.')
      console.log('** The BTC stuff needs to be on the server else anyone will be able to replace theirs with ours. In this way, we will be able to ensure that the transation makes it to the right place.')
      console.log('** Also need to think about how we will be giving the user status on the transactions themselves.')
    },
    async submit () {
      console.log('Submitting')
      console.log(JSON.stringify(this.depositCoin, null, 4))
      if (this.depositCoin.value === 'btc') {
        this.allocateBtc()
      } else {
        this.allocateNonBtc()
      }
      // TODO: Enable the spinner and disable the button.
      /*

      */
    },
    getBtcPairs (coins) {
      // console.log(JSON.stringify(coins, null, 4))
      console.log(JSON.stringify())
      const self = this
      this.$axios.post(url + '/v2/pairs',
        {
          depositCoin: 'btc'
        },
        { headers })
        .then((response) => {
          const btcCoin = self.coins.filter(c => c.symbol === 'btc')[0]
          console.log('1. ' + JSON.stringify(btcCoin, null, 4))
          response.data.data.push({ depositCoin: 'btc', destinationCoin: 'btc', isActive: true })
          console.log('2. ' + JSON.stringify(response.data.data[0]))

          self.depositCoinOptions = response.data.data.map(function (coin) {
            if (coin.isActive === true) {
              const coinInList = self.coins.filter(c => c.symbol === coin.destinationCoin)[0]
              // console.log('DDDDDDDDD  ' + JSON.stringify(coinInList, null, 4))
              let row = {
                'label': coinInList.name,
                'value': coinInList.symbol,
                'image': coinInList.logoUrl
              }
              // console.log(coin.destinationCoin)
              return row
            } // deal with false, should not create empty option.
          }).filter(function (el) {
            return el != null
          }).sort(function (a, b) {
            if (a.label.toLowerCase() < b.label.toLowerCase()) {
              return -1
            }
            return 1
          })
          self.spinnervisible = false
        })
        .catch((err) => {
          console.log(err)
          self.spinnervisible = false
          userError('There was a problem getting the destination coins')
        })
    }
  }
}
</script>

<style scoped>
.vtxamount {
  font-size: 1.5em;
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
.modal-content .q-icon {
  cursor: pointer
}
</style>
