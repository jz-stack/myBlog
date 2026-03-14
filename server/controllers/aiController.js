import { query } from '../utils/db.js'
import { ChatOpenAI } from '@langchain/openai';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;
const MODEL = process.env.MODEL;

const model = new ChatOpenAI({
  model: MODEL,
  configuration: {
    apiKey: API_KEY,
    baseURL: BASE_URL,
  },
  stream: true
})

const messages = [
  new SystemMessage(
  `
  你是一位全栈开发专家，可以回答关于前端、后端、数据库、DevOps 等各种技术问题。

  ## 回答原则
  1.  **准确为先**：确保回答的技术内容准确无误，引用可靠的来源或最佳实践。
  2.  **简洁明了**：直接给出核心要点，避免冗长的解释，但关键细节不能遗漏。
  3.  **代码示例**：对于编程相关的问题，提供简洁的代码示例，帮助用户理解。
  4.  **分层讲解**：对于复杂问题，先给出概要，再根据需要深入细节。

  ## 可以回答的问题类型
  - **前端开发**：Vue、React、Angular 等框架，TypeScript、JavaScript 语言，CSS、HTML 等
  - **后端开发**：Node.js、Python、Java、Go 等语言，Express、Koa、Django 等框架
  - **数据库**：MySQL、PostgreSQL、MongoDB、Redis 等
  - **DevOps**：Docker、Kubernetes、CI/CD、Nginx 等
  - **工具与库**：Webpack、Vite、Babel、ESLint、Prettier 等
  - **其他技术**：算法、数据结构、设计模式、系统设计等

  ## 回答方式
  - 直接给出解决方案或答案
  - 提供简洁的代码示例（如果需要）
  - 解释关键概念或注意事项
  - 给出相关的最佳实践

  ## 语气与风格
  - 专业、准确、直接
  - 避免过多的客套话
  - 保持回答的简洁性和实用性
  `
  )
]

export const getHistory = (req, res) => {
  try {
    // 把 LangChain 的 BaseMessage 转换为前端的 ChatMessage
    const historyMessages = messages
      .map((message) => {
        if (message instanceof HumanMessage) {
          return {
            type: 'user',
            payload: { content: message.content.toString() },
          };
        }
        if (message instanceof AIMessage) {
          return {
            type: 'assistant',
            payload: { content: message.content.toString() },
          };
        }
        // SystemMessage 不返回给前端
        return null;
      })
      .filter((message) => message !== null);

    res.json(historyMessages);
  } catch (error) {
    console.error('getHistory error:', error)
    res.status(500).json({ error: 'Failed to get history' })
  }
};

export const chat = async (req, res, next) => {
  try {
    let query = ''
    query = req.body.query

    messages.push(new HumanMessage(query))
    // 创建一个控制器，可以发送中止信号
    const abortController = new AbortController()

    const stream = await model.stream(messages, {
      signal: abortController.signal
    })

    // 设置SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    //提前发送响应头
    res.flushHeaders()

    // 如果客户端断开连接，则取消模型请求。
    req.on('end', () => {
      abortController.abort()
    })

    let response = ''

    // 接收模型的流式响应
    for await (const chunk of stream) {
      const content = chunk.content.toString();
      // 封装成前端需要的消息格式
      const message = {
        type: 'assistant',
        partial: true,
        payload: { content }
      };

      // 发送给前端
      res.write(`data: ${JSON.stringify(message)}\n\n`);

      response += content;
    }
    // 保存本次模型回复
    messages.push(new AIMessage(response)); 

    res.end('event: close\ndata:\n\n');
  } catch (error) {
    next(error)
  }
}