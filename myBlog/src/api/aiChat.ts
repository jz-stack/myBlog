import type { AIChatOptions, AIChatMessage } from '@/types/aiChatTypes'
import request from '@/utils/request'

export const getHistory = async () => {
  const response = await request.get('/ai/history')
  return response
}

export async function* ssePost(options: AIChatOptions): AsyncGenerator<AIChatMessage> {
  const { params, signal } = options

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    signal,
  })

  if (!response.ok) {
    const text = (await response.text()) || response.statusText
    throw new Error(text)
  }

  const reader = response.body?.getReader()

  if (!reader) {
    throw new Error('no body present')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      
      // 以 \n 结尾 → pop() 返回空字符串 → 清空 buffer
      // 不以 \n 结尾 → pop() 返回非空字符串 → 保留到 buffer
      // 保留最后一个不完整的行
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine) continue

        const colonIndex = trimmedLine.indexOf(':')
        if (colonIndex === -1) continue

        const key = trimmedLine.slice(0, colonIndex).trim()
        const val = trimmedLine.slice(colonIndex + 1).trim()

        if (key === 'data' && val) {
          const message: AIChatMessage = JSON.parse(val)
          yield message
        }
        
        if (key === 'event' && val === 'close') {
          return
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}