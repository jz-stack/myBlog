export interface AIChatOptions {
    params: {
      query: string
    },
    signal: AbortSignal
}

export interface AIChatMessage {
  type: string
  partial?: boolean
  payload: {
    content: string
  }
}