<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      class="bg-white text-grey-10"
      bordered
    >
      <q-toolbar class="constrain">
        <q-btn
          to="/camera"
          class="large-screen-only q-mr-sm"
          flat
          round
          icon="eva-camera-outline"
          size="18px"
          dense
        />
        <q-separator
          class="large-screen-only"
          vertical
          spaced=""
           />
        <q-toolbar-title
          class="text-grand-hotel text-bold">
          Quasagram
        </q-toolbar-title>

        <q-btn
          to="/"
          class="large-screen-only"
          flat
          round
          icon="eva-home-outline"
          size="18px"
          dense
        />
      </q-toolbar>
    </q-header>

    <q-footer 
      class="bg-white"
      bordered
    >
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <div
          v-if="showAppInstallBanner"
          class="banner-container bg-primary"
        >
          <div class="constrain">  
            <q-banner
              inline-actions
              class="bg-primary text-white"
              dense 
            >



              <template v-slot:avatar>
                <q-avatar
                  color="white"
                  text-color="grey-10"
                  icon="eva-camera-outline"
                  font-size="22px"
                />
              </template>

              <b>Install Quasagram?</b> 
              <template v-slot:action>
                <q-btn
                  @click="installApp"
                  class="q-px-sm"
                  flat
                  dense
                  label="Yes"
                />
                <q-btn
                @click="showAppInstallBanner = false"
                  class="q-px-sm"
                  flat
                  dense
                  label="Later"
                />
                <q-btn
                  @click="neverShowAppInstallBanner"
                  class="q-px-sm"
                  flat
                  dense
                  label="Never"
                />
              </template>
            </q-banner>
          </div>
        </div>
      </transition>

      <q-tabs
        class="text-grey-10 small-screen-only"
        active-color="primary"
        indicator-color="transparent"
      >
        <q-route-tab
          to="/"
          icon="eva-home-outline"
        />
        <q-route-tab
          to="/camera"
          icon="eva-camera-outline"
        />
      </q-tabs>
    </q-footer>

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>

// Initialize deferredPrompt for use later to show browser install prompt.
let deferredPrompt

export default {
  data () {
    return {
      showAppInstallBanner: false
    }
  },
  methods: {
    installApp() {
        // Hide the app provided install promotion
        this.showAppInstallBanner = false
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('Accepted')
            this.neverShowAppInstallBanner()
          } else {
            console.log('Not Accepted')
          }
        }
      )
    },
    neverShowAppInstallBanner() {
      this.showAppInstallBanner = false
      this.$q.localStorage.set('neverShowAppInstallBanner', true)
    }
  },
  mounted(){
    let neverShowAppInstallBanner = this.$q.localStorage.getItem('neverShowAppInstallBanner')

    if (!neverShowAppInstallBanner) {
        window.addEventListener('beforeinstallprompt', (e) => {
          // Prevent the mini-infobar from appearing on mobile
        e.preventDefault()
        // Stash the event so it can be triggered later.
        deferredPrompt = e
        // Update UI notify the user they can install the PWA
        setTimeout(() => {
          this.showAppInstallBanner = true
        }, 3000);
      });
    }

  }
}
</script>

<style lang="sass">
  .q-toolbar
    @media (min-width: $breakpoint-sm-min)
       height: 77px
  .q-toolbar__title
    font-size: 30px
    @media (max-width: $breakpoint-xs-max)
      text-align: center
  .q-footer
    .q-tab__icon
      font-size: 30px  
</style>
