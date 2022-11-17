<template>
  <div class="w-full p-6 overflow-y-auto" style="height: calc(100vh - 80px)">
    <div class="w-full flex flex-col gap-2 justify-center items-center mb-12">
      <label>Add the pair for tracking. Ex: BTC/BUSD</label>
      <div class="flex justify-center items-center gap-2 w-full">
        <v-select
            :options="paginated"
            :filterable="false"
            @open="onOpen"
            @close="onClose"
            @search="(query) => (search = query)"
            class="w-full max-w-xs cursor-pointer text-black"
            label="asset"
            v-model="pairSelected"
        >
          <template #list-footer>
            <li v-show="hasNextPage" ref="load" class="loader">
              Loading more options...
            </li>
          </template>
        </v-select>
        <button class="btn btn-sm btn-primary" @click="handleSelected" title="Add"><i class="las la-plus"></i></button>
        <button class="btn btn-sm btn-primary" @click="handleUpdatePairs" title="Update pairs"><i class="las la-redo-alt"></i></button>
      </div>
    </div>
    <div class="w-full items-center justify-center flex gap-4 flex-wrap">
      <div class="card w-1/6 bg-base-200 shadow" v-for="(myPair, index) in myPairs" :key="index">
        <div class="card-body flex-row justify-between items-center">
          <div class="flex flex-col">
            <h2>{{ myPair.asset }}</h2>
          </div>
          <div>
            <button class="btn btn-sm btn-error" title="Delete" @click="() => handleDeletePair(myPair.symbol)">
              <i class="las la-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import vSelect from 'vue-select'

import 'vue-select/dist/vue-select.css';

export default {
  components: {
    vSelect
  },

  data() {
    return {
      allPairs: [],
      myPairs: [],
      pairSelected: '',
      limit: 10,
      search: '',
      observer: null,
    }
  },

  created() {
    this.getAllCryptosPairs();

    this.getMyCryptosPairs();
  },

  mounted() {
    this.observer = new IntersectionObserver(this.infiniteScroll)
  },

  methods: {
    async getAllCryptosPairs() {
      this.allPairs = await ipcRenderer.invoke('get-all-pairs');
    },

    async handleSelected() {
      let myPairs = await ipcRenderer.invoke('get-database', 'my_cryptos_pairs');

      if (!myPairs) {
        myPairs = [];
      }

      const exists = myPairs.find(pair => pair.symbol === this.pairSelected.symbol);

      if (exists) {
        return;
      }

      await ipcRenderer.invoke('set-database', ['my_cryptos_pairs', [...myPairs, this.pairSelected]]);

      this.pairSelected = '';

      await this.getMyCryptosPairs();
    },

    async getMyCryptosPairs() {
      this.myPairs = await ipcRenderer.invoke('get-database', 'my_cryptos_pairs');
    },

    async handleDeletePair(symbol) {
      const myPairs = await ipcRenderer.invoke('get-database', 'my_cryptos_pairs');

      const newMyPairs = myPairs.filter(pair => pair.symbol !== symbol);

      await ipcRenderer.invoke('set-database', ['my_cryptos_pairs', newMyPairs]);

      await this.getMyCryptosPairs();
    },

    async handleUpdatePairs() {
      await ipcRenderer.invoke('delete-database', 'all_cryptos_pairs');

      await this.getAllCryptosPairs();
    },

    async onOpen() {
      if (this.hasNextPage) {
        await this.$nextTick()
        this.observer.observe(this.$refs.load)
      }
    },

    onClose() {
      this.observer.disconnect()
    },

    async infiniteScroll([{ isIntersecting, target }]) {
      if (isIntersecting) {
        const ul = target.offsetParent
        const scrollTop = target.offsetParent.scrollTop
        this.limit += 10
        await this.$nextTick()
        ul.scrollTop = scrollTop
      }
    },
  },

  computed: {
    filtered() {
      const search = this.search.toLowerCase();
      return this.allPairs.filter((pair) => pair.symbol.toLowerCase().indexOf(search) !== -1)
    },
    paginated() {
      return this.filtered.slice(0, this.limit)
    },
    hasNextPage() {
      return this.paginated.length < this.filtered.length
    },
  },
}
</script>

<style scoped>
>>> {
  --vs-controls-color: #664cc3;
  --vs-border-color: #664cc3;

  --vs-dropdown-bg: #282c34;
  --vs-dropdown-color: #cc99cd;
  --vs-dropdown-option-color: #cc99cd;

  --vs-selected-bg: #664cc3;
  --vs-selected-color: #000;

  --vs-search-input-color: #000;

  --vs-dropdown-option--active-bg: #664cc3;
  --vs-dropdown-option--active-color: #eeeeee;
}
</style>