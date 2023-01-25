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

  async function clientOnly() {
    await gapiActions.loadAuth()
    await gapiActions.listInClient()
  }
  async function APIOnly() {
    await gapiActions.listFromAPI()
  }
  async function clientAndAPI() {
    await gapiActions.loadAuth()
    await gapiActions.listFromAPI(false)
  }
</script>

<section class="p-4 h-full m-auto lg:container md:p-16 md:pt-8 xs:p-8 rounded-2xl">
  <header class="flex flex-col items-center mt-8">
    <h1 class="my-3 text-5xl font-bold flex items-center">List Drive files</h1>
    <div class="my-8" bind:this={loginEl} />
    <Button class="bg-red-500 text-white" on:click={clientOnly}>Client only list</Button>
    <Button class="mt-8 bg-red-500 text-white" on:click={APIOnly}>API only list</Button>
    <Button class="mt-8 bg-red-500 text-white" on:click={clientAndAPI}>Client & API list</Button>
  </header>
  <div class="mt-8 relative overflow-x-auto">
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-900 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3"> ID </th>
          <th scope="col" class="px-6 py-3"> Name </th>
          <th scope="col" class="px-6 py-3"> Kind </th>
          <th scope="col" class="px-6 py-3"> MimeType </th>
        </tr>
      </thead>
      <tbody>
        {#each $files as file}
          <tr class="bg-white dark:bg-gray-800">
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >{file.id}</th
            >
            <th class="px-6 py-4">{file.name}</th>
            <th class="px-6 py-4">{file.kind}</th>
            <th class="px-6 py-4">{file.mimeType}</th>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style lang="scss">
</style>
