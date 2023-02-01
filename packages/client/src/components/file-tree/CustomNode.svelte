<script lang="ts">
  import { onMount } from 'svelte'
  import Icon from '@iconify/svelte/dist/OfflineIcon.svelte'
  import folder from '@iconify-icons/feather/folder.js'
  import file from '@iconify-icons/feather/file.js'
  import image from '@iconify-icons/feather/image.js'
  import gdrive from '@iconify-icons/mdi/google-drive.js'
  import shared from '@iconify-icons/mdi/folder-shared-outline.js'

  import debounce from 'lodash.debounce'

  import { selectedFiles, gapiActions } from '$stores/gapi'

  import type { TreeNode, TreeViewProps } from 'svelte-tree-view'
  import type { DriveFile, MyDrive, SharedFiles } from '@my-org/types'

  type HoverStatus = 'inactive' | 'entered' | 'active'

  export let node: TreeNode<DriveFile | MyDrive | SharedFiles>,
    props: Omit<TreeViewProps, 'data'>,
    handleToggleCollapse: (node: TreeNode) => void,
    defaultFormatter: (val: any) => string | undefined,
    defaultLogNode: (node: TreeNode) => void,
    defaultCopyNodeToClipboard: (node: TreeNode) => void

  let nodeKey = node.key,
    checked = false,
    hoverStatus: HoverStatus = 'inactive',
    containerElement: HTMLElement | null = null,
    icon: any

  $: hasChildren = node.children.length > 0
  $: value = node.value
  $: isImage = value.mimeType?.slice(0, 6) === 'image/'
  $: {
    if (value.kind === '__my-drive__') {
      icon = gdrive
    } else if (value.kind === '__shared__') {
      icon = shared
    } else if (value.mimeType === 'application/vnd.google-apps.folder') {
      icon = folder
    } else if (isImage) {
      icon = image
    } else {
      icon = file
    }
  }
  $: {
    const sel = $selectedFiles.get(value.id)
    if (sel !== undefined && sel !== checked) {
      checked = sel
    }
  }

  onMount(() => {
    if (isImage) {
      containerElement?.addEventListener('mouseover', handleMouseOver)
      containerElement?.addEventListener('mouseout', handleMouseOut)
      return () => {
        containerElement?.removeEventListener('mouseover', handleMouseOver)
        containerElement?.removeEventListener('mouseout', handleMouseOut)
      }
    }
  })

  const debouncedSetHover = debounce(() => {
    if (hoverStatus === 'entered') {
      hoverStatus = 'active'
    }
  }, 250)

  function handleMouseOver() {
    hoverStatus = 'entered'
    return debouncedSetHover()
  }

  function handleMouseOut() {
    hoverStatus = 'inactive'
  }

  function handleSelect() {
    gapiActions.selectFiles([value.id], !checked)
  }

  function handleClick() {
    if (isImage) {
      gapiActions.selectFiles([value.id], !checked)
    } else {
      handleToggleCollapse(node)
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

<div class="flex w-full h-[28px]">
  <div class="flex items-center justify-center">
    <input class="w-[18px] h-[18px]" type="checkbox" {checked} on:click={handleSelect} />
  </div>
  <div class="relative" style:padding-left={`${node.depth * 1}em`}>
    {#if value?.thumbnailLink}
      <div
        class="w-max h-auto absolute z-10 rounded"
        class:hidden={hoverStatus !== 'active'}
        style:top="30px"
        style:left="0px"
      >
        <img
          class="w-max h-auto"
          src={value.thumbnailLink}
          alt="Thumbnail, re-login to Google if not visible"
        />
      </div>
    {/if}
  </div>
  <div
    class="relative py-2 px-4 py-0.5 flex items-center justify-between flex-grow cursor-pointer rounded truncate hover:bg-gray-800"
    title={nodeKey}
    on:click={handleClick}
    role="presentation"
    bind:this={containerElement}
  >
    <div class="flex items-center truncate">
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
      <div class="w-[16px]">
        <Icon {icon} width={20} />
      </div>
      <button class="ml-4 pr-4 text-left text-white truncate">{nodeKey}</button>
      <div
        class="spinner-border animate-spin inline-block w-4 h-4 border-1 rounded-full"
        role="status"
        aria-label="Loading"
      />
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
</div>

<style lang="scss">
  .file-node {
    color: var(--tree-view-base0D);
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
  .spinner-border {
    vertical-align: -0.125em;
    border: 0.25em solid;
    border-right-color: transparent;
  }
  .extension {
    background: #ffffff0a;
    box-shadow: inset 0px 1px 0px rgb(255 255 255 / 20%),
      inset 0px -1px 0px 1px hsl(0deg 0% 100% / 20%);
    border-radius: 4px;
  }
</style>
