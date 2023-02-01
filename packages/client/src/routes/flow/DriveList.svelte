<script lang="ts">
  import Icon from '@iconify/svelte/dist/OfflineIcon.svelte'
  import folder from '@iconify-icons/feather/folder.js'
  import file from '@iconify-icons/feather/file.js'
  import down from '@iconify-icons/feather/chevron-right.js'
  // import driveLogo from '@iconify-icons/logos/google-drive.js'
  import gdrive from '@iconify-icons/mdi/google-drive.js'
  import shared from '@iconify-icons/mdi/folder-shared-outline.js'

  import Button from '$elements/Button.svelte'
  import FileTree from '$components/file-tree/FileTree.svelte'
  import DriveListItem from './DriveListItem.svelte'

  import { rootFile, sharedDrives } from '$stores/gapi'

  let state = 'select-drives'
</script>

<h2 class="text-4xl mb-16">Choose drives to import from</h2>
<ul class="w-full">
  <li>
    <div class="flex items-center">
      <button class="mr-4 rounded hover:bg-gray-800">
        <Icon icon={down} width={48} />
      </button>
      <DriveListItem icon={gdrive} name={$rootFile.my_drive?.name || ''} />
    </div>
    <FileTree class="ml-20" />
  </li>
  {#each $sharedDrives as drive}
    <li>
      <div class="flex items-center">
        <div class="mr-4">
          <Icon icon={down} width={48} />
        </div>
        <DriveListItem icon={gdrive} name={drive.name} />
      </div>
      <FileTree class="ml-20" />
    </li>
  {/each}
  <li>
    <div class="flex items-center">
      <div class="mr-4">
        <Icon icon={down} width={48} />
      </div>
      <DriveListItem icon={shared} name={$rootFile.shared?.name || ''} />
    </div>
    <FileTree class="ml-20" />
  </li>
</ul>

<style lang="scss">
  .btn {
    @apply flex items-center justify-between rounded p-4 pr-8 rounded-2xl;
  }
  li + li {
    @apply mt-8;
  }
</style>
