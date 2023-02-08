<script lang="ts">
  import { onMount } from 'svelte'

  import { isLoggedIn } from '$stores/auth'
  import { googleCredentials, gapiActions } from '$stores/gapi'
  import { goto } from '$app/navigation'

  import FileTree from '$components/file-tree/FileTree.svelte'

  $: {
    if (typeof window !== 'undefined' && !$isLoggedIn) {
      goto('/login')
    }
  }

  onMount(async () => {
    if ($googleCredentials === null) {
      await gapiActions.loadAuth()
    }
    await gapiActions.listDrives()
  })
</script>

<section class="mx-8 my-12 p-4 h-full m-auto lg:container md:p-16 md:pt-8 xs:p-8">
  <button
    class="mt-4 inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-3 py-2 dark:bg-green-700 dark:text-white dark:border-gray-600 dark:hover:bg-green-800 dark:hover:border-gray-600 dark:focus:ring-gray-700"
    on:click={() => gapiActions.importFiles()}>Download</button
  >
  <FileTree />
</section>

<style lang="scss">
</style>
