<script lang="ts">
  import { onMount } from 'svelte'

  import { isLoggedIn } from '$stores/auth'
  import { googleCredentials, gapiActions } from '$stores/gapi'
  import { goto } from '$app/navigation'
  import Button from '$elements/Button.svelte'
  import Dropdown from '$elements/Dropdown.svelte'
  import FileTree from '$components/file-tree/FileTree.svelte'

  let googleLoginEl: HTMLElement

  const dropdownOptions = [
    {
      key: 'last-day',
      value: 'Last day'
    },
    {
      key: 'last-week',
      value: 'Last 7 days'
    },
    {
      key: 'last-month',
      value: 'Last 30 days'
    },
    {
      key: 'last-half-year',
      value: 'Last 6 months'
    },
    {
      key: 'last-year',
      value: 'Last 12 months'
    }
  ]
  let selectedOption = 'last-day'

  $: {
    if (typeof window !== 'undefined' && !$isLoggedIn) {
      goto('/login')
    }
  }

  onMount(() => {
    gapiActions.setRenderContainer(googleLoginEl)
  })

  async function clientOnly() {
    await gapiActions.loadAuth()
    await gapiActions.listInClient()
  }
  async function APIOnly() {
    await gapiActions.listFromAPI()
  }
  async function clientAndAPI() {
    if ($googleCredentials === null) {
      await gapiActions.loadAuth()
    }
    await gapiActions.listDrives()
  }
  async function handleListDrives() {
    if ($googleCredentials === null) {
      await gapiActions.loadAuth()
    }
    await gapiActions.listDrives()
  }
  function handleDownload() {
    gapiActions.importFiles()
  }
</script>

<section class="p-4 h-full m-auto lg:container md:p-16 md:pt-8 xs:p-8 rounded-2xl">
  <header class="flex flex-col items-center mt-8">
    <h1 class="my-3 text-5xl font-bold flex items-center">List Drive files</h1>
    <div class="my-8" bind:this={googleLoginEl} />
    <div class="flex items-center">
      <Button class="bg-red-500 text-white" on:click={clientOnly}>Client only list</Button>
      <Button class="ml-4 bg-red-500 text-white" on:click={APIOnly}>API only list</Button>
      <Button class="ml-4 bg-red-500 text-white" on:click={clientAndAPI}>Client & API list</Button>
      <Button class="ml-4 bg-red-500 text-white" on:click={handleListDrives}>List drives</Button>
    </div>
  </header>
  <div class="mt-8 relative ">
    <div class="flex items-center justify-between pb-4">
      <Dropdown
        options={dropdownOptions}
        selectedKey={selectedOption}
        onSelect={idx => {
          selectedOption = dropdownOptions[idx].key
        }}
      />
      <label for="table-search" class="sr-only">Search</label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            class="w-5 h-5 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clip-rule="evenodd"
            /></svg
          >
        </div>
        <input
          type="text"
          id="table-search"
          class="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Search..."
        />
      </div>
    </div>
    <FileTree />
    <button
      class="mt-4 inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-3 py-2 dark:bg-green-800 dark:text-white dark:border-gray-600 dark:hover:bg-green-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
      on:click={handleDownload}>Download</button
    >
  </div>
</section>

<style lang="scss">
</style>
