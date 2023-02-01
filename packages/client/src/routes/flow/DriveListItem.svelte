<script lang="ts">
  import Icon from '@iconify/svelte/dist/OfflineIcon.svelte'

  import Button from '$elements/Button.svelte'
  import FileTree from '$components/file-tree/FileTree.svelte'

  import type { IconifyIcon } from '@iconify/svelte'

  export let name: string, icon: IconifyIcon
</script>

<div class="w-full">
  <div class="w-full flex items-center">
    <div class="btn">
      <div class="flex items-center">
        <Icon {icon} width={42} />
        <span class="ml-8 text-2xl">{name}</span>
      </div>
    </div>
    <Button
      class="ml-8 px-8 text-white flex items-center rounded-full transition ease-out hover:bg-gray-800"
      on:click={() => undefined}
    >
      <span class="">List</span>
      <span class="ml-2">></span>
    </Button>
  </div>
</div>

<style lang="scss">
  .btn {
    @apply flex items-center justify-between rounded p-4 pr-8 rounded-2xl;
  }
  li + li {
    @apply mt-8;
  }
</style>
