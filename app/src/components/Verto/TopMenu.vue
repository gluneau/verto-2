<template>
<div class="menu-top-wrapper" :class="{'dark-theme': $store.state.lightMode.lightMode === 'true'}">
    <div class="row">
        <div class="col col-2 app-logo flex q-pl-md items-center">
            <!-- <img src="statics/vtx_black.svg" alt="" class="q-mr-sm" style="width: 30px; height: 30px;"> -->
            <svg class="svg_logo q-mr-sm" width="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 20.58"> <path d="M199,25.24q0,3.29,0,6.57a.5.5,0,0,1-.18.41l-7.32,6.45a.57.57,0,0,1-.71,0l-7.21-6.1c-.12-.11-.25-.22-.38-.32a.53.53,0,0,1-.22-.47q0-3.83,0-7.66,0-2.69,0-5.39c0-.33.08-.47.29-.51s.33.07.44.37l3.45,8.84c.52,1.33,1,2.65,1.56,4a.21.21,0,0,0,.23.16h4.26a.19.19,0,0,0,.21-.14l3.64-9.7,1.21-3.22c.08-.22.24-.32.42-.29a.34.34,0,0,1,.27.37c0,.41,0,.81,0,1.22Q199,22.53,199,25.24Zm-8.75,12s0,0,0,0,0,0,0,0a.28.28,0,0,0,0-.05l-1.88-4.83c0-.11-.11-.11-.2-.11h-3.69s-.1,0-.13,0l.11.09,4.48,3.8C189.38,36.55,189.8,36.93,190.25,37.27Zm-6.51-16.76h0s0,.07,0,.1q0,5.4,0,10.79c0,.11,0,.16.15.16h4.06c.15,0,.15,0,.1-.16s-.17-.44-.26-.66l-3.1-7.94Zm14.57.06c-.06,0-.06.07-.07.1l-1.89,5q-1.06,2.83-2.13,5.66c-.06.16,0,.19.13.19h3.77c.16,0,.2,0,.2-.2q0-5.3,0-10.59Zm-7.16,17,.05-.11,1.89-5c.05-.13,0-.15-.11-.15h-3.71c-.17,0-.16,0-.11.18.26.65.51,1.31.77,2Zm.87-.3,0,0,5.65-5H194c-.13,0-.16.07-.19.17l-1.59,4.23Zm0,.06h0Z" transform="translate(-183 -18.21)"></path> </svg>
            <router-link to="/verto/dashboard">VERTO</router-link>
        </div>
        <div class="col col-5 flex items-center date-scrolling-msg">
            <div class="date">{{refreshDate()}}</div>
            <!-- <VTextMarquee :speed="40" @click="animate = !animate" :animate="animate" content='This app is in beta, please send us bug reports if you find any. <b><a target="_blank" href="https://t.me/vertosupport">t.me/vertosupport</a></b>' /> -->
        </div>
        <div class="col col-5 flex justify-end q-pr-md items-center menu">
            <!-- to="/verto/earn/use-referral-account" -->
            <!-- <router-link disabled>Refer & Earn</router-link> -->
            <router-link to="/verto/vdexnode/">vDexNode</router-link>
            <router-link to="/verto/exchange">Exchange</router-link>
            <a href="javascript:void(0)" @click="logout">
                <q-icon class="reverse" name="exit_to_app" /> Logout
            </a>
            <q-toggle
              v-model="lightMode"
              checked-icon="wb_sunny"
              @input="toggleLightDarkMode"
              color="grey"
              size="lg"
              class="darkmode-btn"
              unchecked-icon="brightness_3">
              <q-tooltip v-if="$store.state.lightMode.lightMode === 'false'" content-class="black" :offset="[10, 10]">
                Dark mode
              </q-tooltip>
              <q-tooltip v-else content-class="black" :offset="[10, 10]">
                Light mode
              </q-tooltip>
            </q-toggle>
        </div>
    </div>
    <q-dialog v-model="temp">
        <FreeCPUDialog />
    </q-dialog>
</div>
</template>

<script>
// import configManager from '@/util/ConfigManager'
// import { VTextMarquee } from 'vue-text-marquee'

export default {
  name: 'TopMenu',
  components: {
    // VTextMarquee: VTextMarquee
  },
  data () {
    return {
      lightMode: false,
      temp: false,
      animate: true,
      interval: null,
      key: 0
    }
  },
  created () {
    window.localStorage.setItem('skin', window.localStorage.getItem('skin') !== null ? window.localStorage.getItem('skin') : false)
    this.$store.state.lightMode.lightMode = window.localStorage.getItem('skin') !== null ? window.localStorage.getItem('skin') : false
    // console.log('this.$store.state.lightMode.lightMode', this.$store.state.lightMode.lightMode)
    this.lightMode = window.localStorage.getItem('skin') !== 'false'
  },
  methods: {
    toggleLightDarkMode (val) {
      // console.log('toggleLightDarkMode (val)', val)
      window.localStorage.setItem('skin', val)
      this.$store.state.lightMode.lightMode = window.localStorage.getItem('skin')
      // console.log('this.$store.state.lightMode.lightMode', this.$store.state.lightMode.lightMode)
    },
    refreshDate () {
      let date = new Date()
      return date.toDateString() + ',  ' + date.getHours() + ':' + date.getMinutes()
    },
    logout () {
      // configManager.logout()
      this.$router.push({
        path: '/login'
      })
    }
  },
  destroyed () {
    clearInterval(this.interval)
  },
  mounted () {
    this.interval = setInterval(() => {
      this.key++
    }, 60000)
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/styles/variables.scss";

.menu-top-wrapper {
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    $height: 60px;
    height: $height;
    // background-color: #fff;
    background: #E7E8E8;
    z-index: 9;
    // @extend .shad;
    .row {
        .col {
            height: $height;
            &.menu {
                a {
                    font-weight: $regular;
                    font-family: $Titillium;
                    font-size: 16px;
                    color: #333;
                    text-decoration: none;
                    padding: 5px 10px;
                    border-radius: 5px;

                    &:hover {
                        background-color: rgba(black, .02);
                    }
                }
            }

            &.app-logo {
              svg{
                fill: #000;
              }
                a {
                    font-weight: $bold;
                    text-transform: uppercase;
                    font-family: $Titillium;
                    font-size: 20px;
                    color: #333;
                    text-decoration: none;
                }
            }

            cursor: pointer;
            position: relative;

        }
    }
    &.dark-theme{
      background: #04111F;
      .date-scrolling-msg{
        .date{
          color: #FFF;
        }
      }
      .row{
        .col{
          &.app-logo {
              svg{
                fill: #FFF;
              }
          }
          &.menu{
            a{
              color: #FFF;
            }
          }
          &.app-logo{
            a{
              color: #FFF;
            }
          }
        }
      }
    }
}

.reverse {
    transform: scaleX(-1);
}
.date-scrolling-msg{
  /deep/ .v-marquee{
    max-width: 360px;
    margin-left: 20px;
  }
}
</style>
