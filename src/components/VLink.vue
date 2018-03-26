<template>
  <a
    v-bind:href="href"
    v-bind:class="{ active: isActive }"
    v-on:click="go"
  >
    <slot></slot>
  </a>
</template>

<script>
  import routes from '../routes'

  export default {
    props: {
      href: {
        type:String,
        required: true 
      }
    },
    computed: {
      isActive () {
        return this.href === this.$root.currentView
      }
    },
    methods: {
      go (event) {
        event.preventDefault()
        var view = this.href.replace("/", "");
        this.$root.currentView = view;
        window.history.pushState(
          null,
          routes[this.href],
          `#${view}`
        )
      }
    }
  }
</script>

<style scoped>
  .link{
    font-size:18px;
  }
  a:link,
  a:visited,
  a:active{
    color:#ccc;
  }
  a:hover{
    color:#FFF;
  }
  a.active {
    color: #fff;
  }
</style>
