<script lang="ts">
  import Icon from '@iconify/svelte/dist/OfflineIcon.svelte'
  import folder from '@iconify-icons/feather/folder.js'
  import file from '@iconify-icons/feather/file.js'
  import image from '@iconify-icons/feather/image.js'
  import gdrive from '@iconify-icons/mdi/google-drive.js'
  import shared from '@iconify-icons/mdi/folder-shared-outline.js'

  import type { TreeNode, TreeViewProps } from 'svelte-tree-view'
  import type { DriveFile, MyDrive, SharedFiles } from '@my-org/types'

  export let node: TreeNode<DriveFile | MyDrive | SharedFiles>,
    props: Omit<TreeViewProps, 'data'>,
    handleToggleCollapse: (node: TreeNode) => void,
    defaultFormatter: (val: any) => string | undefined,
    defaultLogNode: (node: TreeNode) => void,
    defaultCopyNodeToClipboard: (node: TreeNode) => void

  let nodeKey = node.key,
    checked = false,
    containerElement: HTMLElement | null = null,
    icon: any

  $: hasChildren = node.children.length > 0
  $: value = node.value
  $: {
    if (value.kind === '__my-drive__') {
      icon = gdrive
    } else if (value.kind === '__shared__') {
      icon = shared
    } else if (value.mimeType === 'application/vnd.google-apps.folder') {
      icon = folder
    } else if (value.mimeType?.slice(0, 6) === 'image/') {
      icon = image
    } else {
      icon = file
    }
  }

  function formatSize(size: number) {
    const kbs = size / 1000
    const mbs = size / 1000 / 1000
    const gbs = size / 1000 / 1000 / 1000
    if (gbs > 1) {
      return `${Math.round(gbs * 100) / 100} GB`
    } else if (mbs > 1) {
      return `${Math.round(mbs * 100) / 100} MB`
    } else if (kbs > 1) {
      return `${Math.round(kbs * 100) / 100} kB`
    }
    return `${size} B`
  }
</script>

<div
  class="file-node flex w-full h-[28px] py-2 px-4"
  tabindex="-1"
  title={nodeKey}
  on:click={() => handleToggleCollapse(node)}
  bind:this={containerElement}
  role="presentation"
>
  <div class="flex items-center truncate">
    <div class="flex items-center justify-center" style:padding-right={`${node.depth * 1}em`}>
      <input class="w-4 h-4" type="checkbox" {checked} on:change={() => (checked = !checked)} />
    </div>
    {#if hasChildren}
      <button
        class={`arrow-btn ${node.collapsed ? 'collapsed' : ''}`}
        on:click={() => handleToggleCollapse(node)}
      >
        ▶
      </button>
    {:else}
      <div class="arrow-btn invisible">▶</div>
    {/if}
    <button class="w-[16px]" on:click={() => handleToggleCollapse(node)}>
      <Icon {icon} width={20} />
    </button>
    <button class="ml-4 pr-4 text-left text-white truncate">{nodeKey}</button>
  </div>
  <div class="flex items-center">
    {#if node.value.fileExtension}
      <div class="extension h-6 px-2 flex items-center uppercase">{node.value.fileExtension}</div>
    {/if}
    {#if node.value.size && node.value.size > 0}
      <div class="ml-4 w-20 text-right">{formatSize(node.value.size)}</div>
    {/if}
  </div>
</div>

<style lang="scss">
  .file-node {
    color: var(--tree-view-base0D);
    @apply py-0.5 cursor-pointer flex border border-transparent justify-between;
    &:hover {
      @apply bg-gray-800;
    }
  }
  .tree-item {
    @apply flex items-center px-1 py-0.5;
  }
  .arrow-btn {
    background: transparent;
    border: 0;
    color: var(--tree-view-base0D);
    cursor: pointer;
    margin-right: 0.7em;
    padding: 0;
    transition: all 150ms ease 0s;
    transform: rotateZ(90deg);
    transform-origin: 47% 43%;
    position: relative;
    line-height: 1.1em;
    font-size: 0.75em;
    &.collapsed {
      transform: rotateZ(0deg);
    }
  }
  .extension {
    background: #ffffff0a;
    box-shadow: inset 0px 1px 0px rgb(255 255 255 / 20%),
      inset 0px -1px 0px 1px hsl(0deg 0% 100% / 20%);
    border-radius: 4px;
  }
</style>
