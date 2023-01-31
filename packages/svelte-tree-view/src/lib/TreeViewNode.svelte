<script lang="ts">
  import { getContext } from 'svelte'

  import DefaultNode from './DefaultNode.svelte'

  import type { Stores } from './stores'
  import type { TreeNode } from './types'

  export let id: string

  const { treeStore, propsStore, rootElementStore } = getContext<Stores>('svelte-tree-view')
  let node: TreeNode
  $: {
    let found = treeStore.getNode(id)
    // Should explode rather than have logic written around undefinedness
    // as this component should be unmounted if it's undefined.
    if (!found) {
      throw Error(
        '[svelte-tree-view] TreeViewNode.svelte received undefined node from treeMapStore whereas it should be already unmounted!'
      )
    }
    node = found
  }
  $: hasChildren = node && node.children.length > 0
  $: props = propsStore.props
  $: nodeComponent = $props.nodeComponent

  treeStore.treeMap.subscribe(value => {
    const n = value.get(id)
    if (n && node !== n) {
      node = n
    }
  })

  function defaultLogNode() {
    // eslint-disable-next-line no-console
    console.info('%c [svelte-tree-view]: Property added to window._node', 'color: #b8e248')
    // eslint-disable-next-line no-console
    console.log(node.value)
    try {
      if (typeof window !== 'undefined') window._node = node.value
    } catch (err) {
      console.error('Failed to set _node, window was undefined')
    }
  }
  function defaultCopyNodeToClipboard() {
    try {
      navigator.clipboard.writeText(JSON.stringify(node.value))
    } catch (err) {
      console.error('Copying node to clipboard failed: ', err)
    }
  }
  function handleToggleCollapse() {
    // console.debug('handle', node)
    if (hasChildren) {
      treeStore.toggleCollapse(node.id)
    } else if (node.circularOfId) {
      treeStore.expandAllNodesToNode(node.circularOfId)
      $rootElementStore.querySelector(`li[data-tree-id="${node.circularOfId}"]`)?.scrollIntoView()
    }
  }
  function defaultFormatter(val: any) {
    return propsStore.formatValue(val, node)
  }
</script>

<li class="row" class:collapsed={node.collapsed && hasChildren} data-tree-id={node.id}>
  {#if nodeComponent}
    <svelte:component
      this={nodeComponent}
      {node}
      props={$props}
      {handleToggleCollapse}
      {defaultFormatter}
      {defaultLogNode}
      {defaultCopyNodeToClipboard}
    />
  {:else}
    <DefaultNode
      {node}
      props={$props}
      {handleToggleCollapse}
      {defaultFormatter}
      {defaultLogNode}
      {defaultCopyNodeToClipboard}
    />
  {/if}
</li>
{#if !node.collapsed && hasChildren}
  <li class="row">
    <ul class="list">
      {#each node.children as child}
        <svelte:self id={child.id} />
      {/each}
    </ul>
  </li>
{/if}

<style lang="scss">
  ul {
    display: flex;
    flex-direction: column;
    height: max-content;
    list-style: none;
    padding: 0;
    padding-left: var(--tree-view-left-indent);
    margin: 0;
    width: 100%;
  }
  li {
    align-items: baseline;
    display: flex;
    height: max-content;
    line-height: var(--tree-view-line-height);
    list-style: none;
    width: 100%;
  }
  li + li {
    margin-top: 0.25em;
  }
</style>
