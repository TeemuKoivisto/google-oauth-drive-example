<script lang="ts">
  import { onMount } from 'svelte'

  import { isLoggedIn } from '$stores/auth'
  import { googleCredentials, files, selectedFiles, gapiActions } from '$stores/gapi'
  import { goto } from '$app/navigation'
  import DriveList from './DriveList.svelte'

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
  <DriveList />
</section>

<style lang="scss">
</style>
