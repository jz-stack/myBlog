export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  success: boolean
  token: string
  user: {
    id: string
    username: string
    nickname: string
    avatar: string
  }
}

export interface ProfileResult {
  success: boolean
  data: {
    id: string
    username: string
    nickname: string
    avatar: string
    created_at: string
  }
}