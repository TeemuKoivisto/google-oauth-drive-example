interface TokenClientConfig {
  client_id: string
  scope: string
  callback?: (data: { access_token: string }) => void
}

interface TokenClient {
  requestAccessToken: () => void
}

interface CredentialResponse {
  credential?: string
  select_by?:
    | 'auto'
    | 'user'
    | 'user_1tap'
    | 'user_2tap'
    | 'btn'
    | 'btn_confirm'
    | 'brn_add_session'
    | 'btn_confirm_add_session'
  clientId?: string
}

interface GsiButtonConfiguration {
  type: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signup_with'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: string
  local?: string
}

declare namespace google.accounts.id {
  export function initialize(params: {
    client_id: string
    callback: (res: CredentialResponse) => void
  }): void
  export function renderButton(
    parent: HTMLElement,
    options: GsiButtonConfiguration,
    clickHandler?: () => void
  ): void
}

declare namespace google.accounts.oauth2 {
  export function revoke(token: string): void
  export function initTokenClient(tokenClientConfig: TokenClientConfig): TokenClient
  export function hasGrantedAllScopes(scope: string): boolean
}
