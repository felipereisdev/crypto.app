<template>
  <div class="w-full mt-10 px-6">
    <h1 class="card-title mb-5">Gráfico {{ symbol }}</h1>
    <VueTradingView :options="{
      symbol,
      theme: 'dark',
      locale,
      allow_symbol_change: false,
      interval: 240,
      width: '100%',
      height: '600px',
    }" />
  </div>
</template>

<script>
import VueTradingView from 'vue-trading-view';

export default {
  props: {
    symbol: {
      type: String,
      required: true
    }
  },

  components: {
    VueTradingView
  },

  data() {
    return {
      locale: 'en',
    }
  },

  created() {
    this.getLocale();
  },

  methods: {
    getLocale() {
      this.locale = navigator.userLanguage || (navigator.languages && navigator.languages.length && navigator.languages[0]) || navigator.language || navigator.browserLanguage || navigator.systemLanguage || 'en';
    }
  }
}
</script>