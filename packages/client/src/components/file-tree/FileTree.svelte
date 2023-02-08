<script lang="ts">
  import { TreeView } from 'svelte-tree-view'
  import type { ValueType } from 'svelte-tree-view'
  import type { DriveFile, FileRoot } from '@my-org/types'

  import CustomNode from './CustomNode.svelte'

  import { fileTree, fileTreeRoot } from '$stores/gapi'

  function isFileOrDrive(obj: any): obj is DriveFile {
    return typeof obj === 'object' && 'id' in obj
  }

  function isFileRoot(obj: any): obj is FileRoot {
    return typeof obj === 'object' && 'isRoot' in obj
  }

  function mapTreeFileChildren(val: DriveFile | FileRoot, type: ValueType) {
    if (type === 'object' && isFileRoot(val) && val.my_drive && val.shared_with_me) {
      return [
        [val.my_drive.name, val.my_drive] as [string, any],
        ...val.drives.map(d => [d.name, d] as [string, any]),
        [val.shared_with_me.name, val.shared_with_me] as [string, any]
      ]
    } else if (type === 'object' && isFileOrDrive(val)) {
      const children = $fileTree.get(val.id) || []
      return children.map((f: DriveFile) => [f.name, f] as [string, DriveFile])
    }
    return []
  }
</script>

<div class={`${$$props.class || ''} my-4 tree-view-wrapper`}>
  <TreeView
    data={$fileTreeRoot}
    nodeComponent={CustomNode}
    recursionOpts={{
      mapChildren: mapTreeFileChildren
      // shouldExpandNode: () => true
    }}
  />
</div>

<style lang="scss">
  .tree-view-wrapper > :global(.svelte-tree-view) {
    // --tree-view-base00: transparent;
    // --tree-view-left-indent: 0;
    // --tree-view-key-margin-right: 0;
    // --tree-view-font-size: 15px;

    @apply w-full px-4;

    :global(.row + .row) {
      margin: 4px 0 0 0;
    }
    :global(.row) {
      align-items: center;
      padding: 2px 0;
    }
  }
</style>
