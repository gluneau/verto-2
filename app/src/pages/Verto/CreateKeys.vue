<template>
<q-page :class="{'dark-theme': $store.state.lightMode.lightMode === 'true', 'text-black bg-white': $store.state.lightMode.lightMode === 'false'}">
    <div v-if="step===2" class="standard-content" style="padding-bottom: 0px">
        <div class="standard-content--body">
            <h2 class="standard-content--title"> Creating </h2>
            <!-- <p class="diclaimer"> {{ status }} </p> -->
            <div class="standard-content--body__form">
                <div class="send-modal__content--body column flex-center">
                    <q-circular-progress :value="progress" size="170px" :thickness="0.05" color="cyan-5" track-color="grey-3" class="q-ma-md" show-value font-size="20px" />
                    <svg class="svg_logo" fill="#7272FA" width="40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 20.58">
                        <path d="M199,25.24q0,3.29,0,6.57a.5.5,0,0,1-.18.41l-7.32,6.45a.57.57,0,0,1-.71,0l-7.21-6.1c-.12-.11-.25-.22-.38-.32a.53.53,0,0,1-.22-.47q0-3.83,0-7.66,0-2.69,0-5.39c0-.33.08-.47.29-.51s.33.07.44.37l3.45,8.84c.52,1.33,1,2.65,1.56,4a.21.21,0,0,0,.23.16h4.26a.19.19,0,0,0,.21-.14l3.64-9.7,1.21-3.22c.08-.22.24-.32.42-.29a.34.34,0,0,1,.27.37c0,.41,0,.81,0,1.22Q199,22.53,199,25.24Zm-8.75,12s0,0,0,0,0,0,0,0a.28.28,0,0,0,0-.05l-1.88-4.83c0-.11-.11-.11-.2-.11h-3.69s-.1,0-.13,0l.11.09,4.48,3.8C189.38,36.55,189.8,36.93,190.25,37.27Zm-6.51-16.76h0s0,.07,0,.1q0,5.4,0,10.79c0,.11,0,.16.15.16h4.06c.15,0,.15,0,.1-.16s-.17-.44-.26-.66l-3.1-7.94Zm14.57.06c-.06,0-.06.07-.07.1l-1.89,5q-1.06,2.83-2.13,5.66c-.06.16,0,.19.13.19h3.77c.16,0,.2,0,.2-.2q0-5.3,0-10.59Zm-7.16,17,.05-.11,1.89-5c.05-.13,0-.15-.11-.15h-3.71c-.17,0-.16,0-.11.18.26.65.51,1.31.77,2Zm.87-.3,0,0,5.65-5H194c-.13,0-.16.07-.19.17l-1.59,4.23Zm0,.06h0Z" transform="translate(-183 -18.21)"></path>
                    </svg>
                    <div class="--label text-cyan-5 text-h6">{{ progress }} %</div>
                </div>
                <div class="send-modal__content--footer">
                    <div class="text-h4 --status">{{ status }}</div>
                </div>
                <div class="flex-end flex justify-end">
                    <q-btn class="action-link next" color="deep-purple-14" text-color="white" label="Next" @click="step=3" :disable="!mapped" />
                </div>
            </div>
        </div>
    </div>
    <div v-if="step===3" class="standard-content" style="padding-bottom: 0px">
        <div class="standard-content--body">
            <h2 class="standard-content--title">You're all set.
                Enjoy using verto</h2>
            <br>
            <p class="diclaimer"><strong>Disclaimer</strong>
                Your 24 words are very important! <br>
                Keep them stored somewhere safe. <br>
                The position of each word is critical and should be stored in the correct sequence order.<br>
                Anyone with access to these 24 words will be able to recover this Verto app and the private keys it is associated with,
                so keep in a safe place that only you have access to.
            </p>
            <div class="standard-content--body__form">
                <div class="flex-end flex justify-end">
                    <q-btn class="action-link next" color="deep-purple-14" text-color="white" label="Next" @click="dataRefresh()" />
                </div>
            </div>
        </div>
    </div>
</q-page>
</template>

<script>
import HD from '@/util/hdwallet'
import initWallet from '@/util/Wallets2Tokens'
// I have setup your symbols into a sandbox wallet named testwallet.
// You can proceed with development with this as your walletName.
// IDs will be created as foo@testwallet.crux
import EosWrapper from '@/util/EosWrapper'
const eos = new EosWrapper()
export default {
  data () {
    return {
      step: 2,
      error: false,
      errorMessage: '',
      walletClientName: 'verto', // should be 'verto' when in prod // testwallet
      vertoPassword: this.$store.state.settings.temporary, // TODO empty temporary
      config: this.$store.state.currentwallet.config,
      loading: false,
      mapped: false,
      addressMap: null,
      showMap: false,
      state: null,
      status: '',
      progress: 0,
      available: false,
      assets: {},
      names: [{
        'value': 'btc',
        'label': 'Bitcoin'
      },
      {
        'value': 'eth',
        'label': 'Ethereum'
      },
      {
        'value': 'bnb',
        'label': 'Binance Coin'
      },
      {
        'value': 'ltc',
        'label': 'Litecoin'
      },
      {
        'value': 'dash',
        'label': 'DASH'
      },
      // { 'value': 'eos', 'label': 'EOS Key' },
      // { 'value': 'steem', 'label': 'STEEM Key' },
      // { 'value': 'xrp', 'label': 'Ripple' },
      // { 'value': 'ada', 'label': 'Cardano' },
      {
        'value': 'xlm',
        'label': 'Stellar Lumens'
      },
      {
        'value': 'xtz',
        'label': 'Tezos'
      }
      ]
    }
  },
  created () {},
  async mounted () {
    this.step = 2
    this.putAddress()
    // console.log('addressMap', this.addressMap, 'show?', this.showMap)
  },
  computed: {},
  methods: {
    copyToClipboard (key, copied) {
      this.$clipboardWrite(key)
      this.$q.notify({
        message: copied ? copied + ' Copied' : 'Key Copied',
        timeout: 2000,
        icon: 'check',
        textColor: 'white',
        type: 'warning',
        position: 'top'
      })
    },
    async putAddress () {
      const self = this
      let count = this.names.length
      let i = 0

      for (const name of this.names) {
        i++
        this.progress = Math.round(i / count * 10000) / 100
        console.log('this.progress', this.progress)
        this.status = 'Creating keys for: ' + name.value

        let results = await HD.Wallet(name.value).then(async keys => {
          return self.$configManager.saveWalletAndKey(name.label, self.vertoPassword, null, keys.publicKey, keys.privateKey, name.value, 'mnemonic')
        })

        console.log('key creation: ', results)
      }

      // console.log('map', map)
      this.mapped = true
      // this.step = 3
    },
    associateEOSAccount () {
      let tableData = this.$store.state.wallets.tokens
      let currentAccount = tableData.find(w => w.chain === 'eos' && w.type === 'verto')
      eos.getAccountNamesFromPubKeyP(currentAccount.key)
        .then((result) => {
          if (result.account_names.length) {
            currentAccount.type = 'eos'
            currentAccount.name = result.account_names[0]
            currentAccount.to = `/verto/wallets/${currentAccount.chain}/${currentAccount.type}/${currentAccount.name}`
            currentAccount.icon = 'https://files.coinswitch.co/public/coins/eos.png'
            this.$configManager.updateConfig(this.vertoPassword, this.$store.state.currentwallet.config)
            initWallet()
          }
        }).catch((err) => {
          console.log('There was a problem getting account names', err)
        })
    },
    async dataRefresh () {
      const self = this
      this.$store.state.wallets.tokens = null

      try {
        await initWallet()
        this.associateEOSAccount()
      } catch (error) {
        console.log('initWallet error', error)
      }

      this.$q.notify({
        color: 'positive',
        message: 'Application refreshing'
      })
      setTimeout(function () {
        self.$router.push({
          path: '/verto/dashboard'
        })
      }, 300)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/styles/variables.scss";

.standard-content {
    padding: 5% 10%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100vh !important;
    max-width: 800px;
    margin: auto;

    @media screen and (min-width: 768px) {
        padding-top: 30px;
    }

    &--title {
        font-size: 27px;
        font-weight: $bold;
        position: relative;
        line-height: 40px;
        font-family: $Titillium;
        margin-top: 20px;
        margin-bottom: 30px;

        // word-break: break-all;
        .cruxid {
            font-size: 18px;
            font-weight: $light;
            // display: block;
            background-color: rgba(black, .02);
            padding: 0px 20px;
            border-radius: 10px;
        }
    }

    &--desc {
        margin-top: -20px;
        margin-bottom: 40px;
        font-size: 18px;
        font-weight: $regular;
        position: relative;
        line-height: 26px;
        font-family: $Titillium;
        color: $mainColor;
    }

    &--body {
        min-height: 90vh;

        @media screen and (min-width: 768px) {
            min-height: 50vh;
        }

        .diclaimer {
            strong {
                display: block;
                font-size: 18px;
                font-family: $Titillium;
                font-weight: $bold;
                margin-bottom: 10px;
            }
        }

        &__img {
            // min-height: 200px;
            $width: 170px;
            width: $width;
            height: $width;
            border-radius: $width;
            overflow: hidden;
            margin: 0px auto;
            margin-top: 30px;
            margin-bottom: 40px;

            img {
                max-width: 100%;
            }
        }

        &__form {
            .label {
                padding-left: 21px;
                font-size: 18px;
                margin-bottom: 5px;
                display: block;
            }

            /deep/ .q-field__messages {
                font-size: 14px;
                font-weight: 600;
                color: #FFB200;
                padding-left: 11px;
            }

            /deep/ .q-field__native {
                padding-left: 8px;
                font-size: 16px;
                font-weight: $regular;
            }

            /deep/ .q-field__label {
                font-family: $Titillium;
                font-weight: $bold;
                font-size: 18px;
                padding-left: 10px;
            }

            .flex-end {
                margin-top: 0px;
            }

            .action-link {
                height: 50px;
                text-transform: initial !important;
                font-size: 16px;
                letter-spacing: .5px;
                border-radius: 40px;
                width: 110px;
                margin-left: 10px;
                margin-top: 10px;
            }
        }
    }

    &--footer {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: flex-end;
        min-height: 50px;

        .crux-label {
            font-size: 14px;
            color: #B0B0B0;
            font-weight: $light;
            font-family: $Titillium;
        }
    }
}

.send-modal {
    &__content {
        &--body {
            /deep/ .q-circular-progress__text {
                display: none !important;
            }

            position: relative;

            .svg_logo {
                fill: #00D0CA;
                position: absolute;
                margin-top: 5px;
                width: 90px;
            }

            .--label {
                font-size: 20px;
                font-weight: $light;
                font-family: $Titillium;
                position: absolute;
                bottom: -20px;
            }
        }

        &--footer {
            .--status {
                font-size: 20px;
                font-weight: $bold;
                font-family: $Titillium;
                margin-top: 40px;
                text-align: center;
                margin-bottom: 70px;
            }
        }
    }
}

.cruxid-input {
    width: 81%;

    /deep/ .q-field__native {
        color: #6200ea !important;
    }

    /deep/ .q-field__control:before {
        border: none;
    }
}
.dark-theme{
  background: #04111F !important;
  .send-modal__content--footer .--status{
    color: #FFF;
  }
  .diclaimer{
    color: #CCC;
  }
  .standard-content--title{
    color: #FFF;
  }
}
</style>
