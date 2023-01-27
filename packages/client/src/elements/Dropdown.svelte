<script lang="ts">
  import { onMount } from 'svelte'

  interface Option {
    key: string
    value: string
  }
  export let options: Option[],
    selectedKey: string,
    id: string | undefined = undefined,
    disabled = false,
    onSelect: (idx: number) => void

  let containerEl: HTMLElement,
    open = false

  onMount(() => {
    function onClickOutside(e: Event) {
      if (
        open &&
        containerEl &&
        e.target &&
        e.target instanceof HTMLElement &&
        !containerEl.contains(e.target)
      ) {
        open = false
      }
    }
    window.addEventListener('click', onClickOutside)
    return () => {
      window.removeEventListener('click', onClickOutside)
    }
  })

  function handleOpen() {
    if (!disabled) {
      open = !open
    }
  }
</script>

<div {id} bind:this={containerEl}>
  <button
    class="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-3 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
    class:disabled
    class:open
    on:click={handleOpen}
  >
    <svg
      class="w-4 h-4 mr-2 text-gray-400"
      aria-hidden="true"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      ><path
        fill-rule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clip-rule="evenodd"
      /></svg
    >
    {options.find(o => o.key === selectedKey)?.value}
    <svg
      class="w-3 h-3 ml-2"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      ><path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 9l-7 7-7-7"
      /></svg
    >
  </button>
  <div class="relative" style:display={open ? 'block' : 'none'}>
    <div
      class="absolute top-2 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600"
    >
      <ul class="z-10 p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200">
        {#each options as { key, value }, idx}
          <li
            class="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
            class:selected={selectedKey === key}
          >
            <input
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              id={'filter-radio-example-' + idx}
              type="radio"
              name="filter-radio"
              checked={selectedKey === key}
              on:input={() => onSelect(idx)}
            />
            <label
              for={'filter-radio-example-' + idx}
              class="w-full ml-2 text-sm font-medium text-gray-900 rounded dark:text-gray-300"
              >{value}</label
            >
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>
