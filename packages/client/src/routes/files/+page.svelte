<script lang="ts">
  import { isLoggedIn } from '$stores/auth'
  import { files, gapiActions } from '$stores/gapi'
  import { goto } from '$app/navigation'
  import Button from '$elements/Button.svelte'
  import { onMount } from 'svelte'

  let loginEl: HTMLElement

  $: {
    if (typeof window !== 'undefined' && !$isLoggedIn) {
      goto('/login')
    }
  }

  onMount(() => {
    gapiActions.setRenderContainer(loginEl)
  })

  async function clientFiles() {
    await gapiActions.load()
    await gapiActions.scanDriveFiles()
  }

  async function apiFiles() {
    await gapiActions.apiFiles()
  }
</script>

<section class="p-4 h-full m-auto lg:container md:p-16 md:pt-8 xs:p-8 rounded-2xl">
  <header class="flex flex-col items-center mt-8">
    <h1 class="my-3 text-5xl font-bold flex items-center">List Drive files</h1>
    <div class="my-8" bind:this={loginEl} />
    <Button class="bg-red-500 text-white" on:click={clientFiles}>List in client</Button>
    <Button class="my-8 bg-red-500 text-white" on:click={apiFiles}>List from API</Button>
  </header>
  <ul>
    {#each $files as file}
      <li>{file.name}</li>
    {/each}
  </ul>
</section>

<style>
</style>
