<script>
  import NavBar from '$components/NavBar.svelte'
  import '../tailwind.css'
</script>

<div>
  <NavBar />
  <main class="min-h-screen">
    <slot />
  </main>
</div>
