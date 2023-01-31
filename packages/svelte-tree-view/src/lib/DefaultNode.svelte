<script lang="ts">
  import type { TreeNode, TreeViewProps } from './types'

  export let node: TreeNode,
    props: Omit<TreeViewProps, 'data'>,
    handleToggleCollapse: (node: TreeNode) => void,
    defaultFormatter: (val: any) => string | undefined,
    defaultLogNode: (node: TreeNode) => void,
    defaultCopyNodeToClipboard: (node: TreeNode) => void

  $: hasChildren = node.children.length > 0

  const { valueComponent, showLogButton, showCopyButton } = props
</script>

{#if hasChildren}
  <button
    class={`arrow-btn ${node.collapsed ? 'collapsed' : ''}`}
    on:click={() => handleToggleCollapse}
  >
    ▶
  </button>
{/if}
<div
  class="node-key"
  class:has-children={hasChildren}
  class:p-left={!hasChildren}
  on:click={() => handleToggleCollapse}
  role="presentation"
>
  {node.key}:
</div>
<div
  class="node-value"
  data-type={node.type}
  class:expanded={!node.collapsed && hasChildren}
  class:has-children={hasChildren}
  on:click={() => handleToggleCollapse}
  role="presentation"
>
  {#if valueComponent}
    <svelte:component this={valueComponent} value={node.value} {node} {defaultFormatter} />
  {:else}
    {defaultFormatter(node.value)}
  {/if}
</div>
<div class="buttons">
  {#if showLogButton}
    <button class="log-copy-button" on:click={() => defaultLogNode}>log</button>
  {/if}
  {#if showCopyButton}
    <button class="log-copy-button" on:click={() => defaultCopyNodeToClipboard}>copy</button>
  {/if}
</div>

<style lang="scss">
  .empty-block {
    visibility: hidden;
  }
  .node-key {
    color: var(--tree-view-base0D);
    margin-right: var(--tree-view-key-margin-right);
    &.has-children {
      cursor: pointer;
    }
    &.p-left {
      padding-left: 1.1em;
    }
  }
  .node-value {
    color: var(--tree-view-base0B);
    margin-right: 0.5em;
    word-break: break-all;
    &[data-type='number'],
    &[data-type='boolean'] {
      color: var(--tree-view-base09);
    }
    &[data-type='null'],
    &[data-type='undefined'] {
      color: var(--tree-view-base08);
    }
    &.expanded {
      color: var(--tree-view-base03);
    }
    &.has-children {
      cursor: pointer;
    }
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
  .buttons {
    display: flex;
    flex-wrap: wrap;
  }
  .log-copy-button {
    background: transparent;
    border: 0;
    color: var(--tree-view-base0D);
    cursor: pointer;
    margin: 0;
    padding: 0 0.5em;
    &:hover {
      background: rgba(rgb(255, 162, 177), 0.4);
      border-radius: 2px;
      color: var(--tree-view-base07);
    }
  }
</style>
