<script lang="ts">
  import { isLoggedIn } from '$stores/auth'
  import { authActions } from '$stores/auth.actions'
  import { goto } from '$app/navigation'

  import LoginForm from '$components/LoginForm.svelte'

  import type { ILoginParams } from '@my-org/types'

  let loading = false,
    loginError: string | null = null
  $: {
    if (typeof window !== 'undefined' && !$isLoggedIn) {
      goto('/login')
    }
  }
  async function handleSubmit(e: CustomEvent<ILoginParams>) {
    loading = true
    const resp = await authActions.login(e.detail)
    loading = false
    if ('err' in resp) {
      loginError = resp.err
    } else {
      loginError = null
      goto('/files')
    }
  }
</script>

<div class="h-full w-full absolute">
  <div class="absolute inset-0 flex items-center main-bg">
    <section
      class="p-16 w-[400px] mx-auto inline-block bg-gray-700 text-container border rounded-2xl"
    >
      <h1 class="mb-8 text-5xl font-bold cursive">login</h1>
      <div>
        <button class="py-1 px-2 border border-gray-400 hover:border-gray-600 rounded w-full"
          >Sign in with Google</button
        >
        <hr class="mt-10 mb-8 border-gray-400" />
        <LoginForm {loading} error={loginError} on:submit={handleSubmit} />
      </div>
    </section>
  </div>
</div>

<style>
</style>
