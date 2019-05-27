<template>
  <div class="layout-padding">
    <q-page class="column flex-center text-white bg-black  text-white" v-show="b8sOrZixiModal">
      <q-card flat class="bg-black" style="width: 100%; max-width: 550px;">
        <q-card-section class="text-weight-bold text-center text-uppercase">
            <q-icon class="float-left" name="help_outline" size="2.5rem" color="white" @click.native="$documentationManger.openDocumentation('addwallets/addLedger')">
            <q-tooltip>{{ $t('SettingsView.help') }}</q-tooltip>
            </q-icon>
            <big class="titillium q-pa-xl">Choose Currency</big>
            <q-icon class="float-right" name="close" size="2.5rem" color="white" @click.native="$router.push('wallet')"/>
        </q-card-section>
      </q-card>
      <br>
      <div class="flex justify-center">
        <q-list class="no-border">
        <!-- <div @click="$router.push('request-native-chain-address')">  coinswitch-get-vtx -->
        <div @click="$router.push('cs-get-vtx-transactions')">
          <q-card dark style="width: 23rem; border-style: solid;" class="justify-center q-pa-sm q-mb-sm bg-black upper-case" flat>
            <div class="row full-width q-pa-md  ">
              <div class="col-4">
                <q-avatar>
                  <img src="statics/img/btc.png"/>
                </q-avatar>
              </div>
              <div class="col-4 text-uppercase">
                <big>Crypto</big>
              </div>
              <div class="col-4 text-right">
                <q-icon name="navigate_next" size="3.2rem" color="green">
                <q-tooltip>{{ $t('next') }}</q-tooltip>
              </q-icon>
              </div>
            </div>
          </q-card>
        </div>
        <br>
        <div @click="$router.push('zixipay-get-vtx')">
          <q-card dark style="width: 23rem; border-style: solid;" class="justify-center q-pa-sm q-mb-sm bg-black upper-case" flat>
            <div class="row full-width q-pa-md  ">
              <div class="col-4">
                <q-avatar>
                  <img src="statics/img/crypto-coins-2.png"/>
                </q-avatar>
              </div>
              <div class="col-4 text-uppercase">
                <big>FIAT</big>
              </div>
              <div class="col-4 text-right">
                <q-icon name="navigate_next" size="3.2rem" color="green">
                <q-tooltip>{{ $t('next') }}</q-tooltip>
              </q-icon>
              </div>
            </div>
          </q-card>
        </div>
        </q-list>
      </div>
    </q-page>
  </div>
</template>

<script>
import getVtxHelper from '../../util/GetVtxHelper'
import configManager from '../../util/ConfigManager'

export default {
  data () {
    return {
      showErrorModal: false,
      walletNotWhitelisted: false,
      blocktopusModal: false,
      modalMessages: '',
      b8sOrZixiModal: false
    }
  },
  mounted () {
    const that = this
    const router = this.$router
    getVtxHelper.getWalletStatus(this.$store.state.currentwallet.wallet.key, function (response) {
      if (response.success) {
        if (response.message === 'wallet_not_allocated') {
          const associations = {
            blocktopus: configManager.checkIfAssociatedWithBlocktopus(),
            zixipay: configManager.checkIfAssociatedWithZixipay()
          }
          console.log('Associations: b8s: ' + associations.blocktopus + ' zixi: ' + associations.zixipay)
          if (associations.blocktopus && !associations.zixipay) {
            that.$router.push({ path: 'request-native-chain-address' })
          } else if (!associations.blocktopus && associations.zixipay) {
            that.$router.push({ path: 'zixipay-get-vtx' })
          } else {
            that.b8sOrZixiModal = true
          }
          // router.push({ name: 'request-native-chain-address' })
        } else if (response.message === 'wallet_allocated') {
          router.push(
            '/get-vtx?native_chain_address=' + response.data.data.native_chain_address +
            '&valid_until=' + response.data.data.valid_until +
            '&native_chain_name=' + response.data.data.native_chain_name +
            '&server_time=' + response.data.data.server_time
          )
        } else {
          let message = `BeginGetVtx.${response.message}`
          if (that.$t(message) === message) message = 'BeginGetVtx.unexpected_error'

          that.modalMessages = that.$t(message)
          if (response.message === 'wallet_not_whitelisted') {
            that.blocktopusModal = true
          } else {
            that.showErrorModal = true
          }
        }
      } else {
        that.modalMessages = that.$t('BeginGetVtx.unexpected_error')
        that.showErrorModal = true
      }
    })
  },
  methods: {}
}
</script>

<style>
.verticalLine {
  border-left: thin solid green;
  padding-left: 20px;
}
</style>
