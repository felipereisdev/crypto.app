<template>
  <div id="app">
    <main-header />

    <div>
      <router-view />
    </div>
  </div>
</template>

<script>
import MainHeader from "@/components/MainHeader";

import './global.css';
export default {
  name: 'App',

  components: {
    MainHeader,
  }
}
</script>
