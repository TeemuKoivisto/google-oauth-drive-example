<script lang="ts">
  import { TreeView } from 'svelte-tree-view'
  import type { ValueType } from 'svelte-tree-view'
  import type { DriveFile, FileRoot } from '@my-org/types'

  import CustomNode from './CustomNode.svelte'

  import { fileTree, rootFile } from '$stores/gapi'

  function isFileRoot(obj: any): obj is FileRoot {
    return typeof obj === 'object' && 'isRoot' in obj
  }

  function mapTreeFileChildren(val: DriveFile | FileRoot, type: ValueType) {
    if (type === 'object' && isFileRoot(val) && val.my_drive && val.shared) {
      return [
        [val.my_drive.name, val.my_drive] as [string, any],
        [val.shared.name, val.shared] as [string, any]
      ]
    } else if (type === 'object') {
      // @ts-ignore
      const children = $fileTree.get(val.id) || []
      return children.map((f: DriveFile) => [f.name, f] as [string, DriveFile])
    }
    return []
  }
</script>

<div class="p-4 tree-view-wrapper">
  <TreeView
    data={$rootFile}
    nodeComponent={CustomNode}
    recursionOpts={{
      mapChildren: mapTreeFileChildren,
      shouldExpandNode: () => true
    }}
  />
</div>

<style lang="scss">
  .tree-view-wrapper > :global(.svelte-tree-view) {
    --tree-view-base00: transparent;
    --tree-view-base01: #604d49;
    --tree-view-base02: #6d5a55;
    --tree-view-base03: red;
    --tree-view-base04: #b79f8d;
    --tree-view-base05: #f9f8f2;
    --tree-view-base06: #f7f4f1;
    --tree-view-base07: #faf8f5;
    --tree-view-base08: #fa3e7e;
    --tree-view-base09: #fd993c;
    --tree-view-base0A: #f6bf81;
    --tree-view-base0B: #222;
    --tree-view-base0C: #b4efe4;
    --tree-view-base0D: gray;
    --tree-view-base0E: #be87ff;
    --tree-view-base0F: #d6724c;

    --tree-view-left-indent: 0;
    --tree-view-key-margin-right: 0;
    --tree-view-font-size: 15px;

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
