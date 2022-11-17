<template>
  <div class="w-full p-6 overflow-y-auto" style="height: calc(100vh - 80px)">
    <div class="w-full flex gap-5 justify-between items-center">
      <div class="flex gap-5 items-center w-full">
        <h1 class="card-title">Cointelegraph News</h1>
        <button class="btn btn-primary" @click="handleUpdate">
          Update
        </button>
      </div>
      <div class="flex gap-5 items-center justify-end w-full">
        <label>Language</label>
        <select class="select select-bordered w-full max-w-xs" style="outline: none !important;" v-model="languageSelected">
          <option disabled selected>Pick a language</option>
          <option value="https://cointelegraph.com/rss">English</option>
          <option value="https://cointelegraph.com.br/rss">Portuguese</option>
        </select>
      </div>
    </div>

    <div class="w-full flex flex-col gap-5 mt-4">
      <div
          class="card card-side bg-base-200 shadow-xl h-80 cursor-pointer"
          v-for="(news, index) in newsList"
          :key="index"
          @click="() => handleClickLink(news.link)"
          target="_blank"
      >
        <div class="card-body flex flex-col gap-5">
          <h2 class="card-title">{{ news.title }}</h2>
          <p v-html="news.description" class="flex h-80 news gap-5" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ipcRenderer, shell} from "electron";

export default {
  data() {
    return {
      languageSelected: null,
      newsList: []
    }
  },

  mounted() {
    this.getLanguage();
  },

  methods: {
    async getLanguage() {
      const language = await ipcRenderer.invoke('get-database', 'user_language');

      if (language) {
        this.languageSelected = language;
      }
    },

    async setLanguage() {
      await ipcRenderer.invoke('set-database', ['user_language', this.languageSelected]);
    },

    async handleUpdate() {
      await ipcRenderer.invoke('delete-database', 'news');

      const response = await ipcRenderer.invoke('get-news', this.languageSelected);

      if (response) {
        this.newsList = response;
      }
    },

    handleClickLink(url) {
      shell.openExternal(url);
    }
  },

  watch: {
    async languageSelected(value, oldValue) {
      if (oldValue && oldValue !== value) {
        await ipcRenderer.invoke('delete-database', 'news');
        await this.setLanguage();
      }

      const response = await ipcRenderer.invoke('get-news', value);

      if (response) {
        this.newsList = response;
      }
    }
  }
}
</script>

<style>
.news img {
  width: 400px !important;
  height: 200px !important;
}
</style>