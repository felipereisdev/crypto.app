<template>
  <div class="w-full flex flex-col items-start p-6 overflow-y-auto" style="height: calc(100vh - 80px)">
    <div class="w-full flex justify-between">
      <h1 class="card-title">My pairs</h1>
      <h1>Update in: {{ count }}</h1>
    </div>
    <div class="w-full items-center justify-start flex gap-4 flex-wrap mt-5">
      <div class="card w-1/6 bg-base-200 shadow cursor-pointer" v-for="(myPair, index) in myPairs" :key="index" @click="() => handleClick(myPair.symbol)">
        <div class="flex justify-between items-center card-body">
          <h2>{{ myPair.asset }}</h2>
          <span :id="myPair.symbol">0,00</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ipcRenderer} from "electron";

export default {
  data() {
    return {
      myPairs: [],
      count: 10,
      timeout: null,
      interval: null
    }
  },

  mounted() {
    this.getMyCryptosPairs();

    this.getPrices();

    this.interval = setInterval(this.getPrices, 10000);
  },

  methods: {
    async getMyCryptosPairs() {
      this.myPairs = await ipcRenderer.invoke('get-database', 'my_cryptos_pairs');
    },

    async getPrices() {
      const response = await ipcRenderer.invoke('get-prices');

      if (response) {
        await response.forEach(pair => {
          const myPair = this.myPairs.find(p => p.symbol === pair.symbol);
          let price = pair.price;

          if (myPair && myPair.locale) {
            price = new Intl.NumberFormat(myPair.locale, { style: 'currency', currency: myPair.cash }).format(pair.price);
          }

          const spanPrice = document.getElementById(pair.symbol);

          if (spanPrice) {
            spanPrice.textContent = price;
          }
        });
      }

      if (this.count < 10) {
        this.count = 10;
        clearTimeout(this.timeout);
      }
    },

    handleClick(symbol) {
      this.$router.push({ name: 'Details', params: { symbol } });
    }
  },

  watch: {
    count: {
      handler(value) {
        if (value > 0) {
          this.timeout = setTimeout(() => {
            this.count--;
          }, 1000);
        }
      },
      immediate: true
    }
  },

  beforeDestroy() {
    for (let i = 1; i < this.interval; i++) {
      clearInterval(i);
      clearTimeout(i);
    }
  }
}
</script>

<style scoped>

</style>