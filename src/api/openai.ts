import axios, { AxiosError } from 'axios'

const OPEN_AI_KEY = import.meta.env.VITE_SSA_OPENAI_API_KEY
const http = axios.create({
  baseURL: 'https://api.openai.com/v1',
  timeout: 30000,
  headers: {
    Authorization: `Bearer ${OPEN_AI_KEY}`,
    'Content-Type': 'application/json',
  },
})

export async function generateTextSuggestion(systemContext: string, prompt: string) {
  const messages = [
    { role: 'system', content: systemContext },
    { role: 'user', content: prompt },
  ]

  const payload = {
    model: 'gpt-3.5-turbo',
    messages,
    max_tokens: 300,
    temperature: 0.7,
  }

  try {
    const res = await http.post('/chat/completions', payload)
    const content = res.data?.choices?.[0]?.message?.content
    return content || ''
  } catch (err: unknown) {
    //errors
    let msg = 'Unknown error';
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<{ error: { message: string } }>
      if (axiosErr.response?.status === 429) {
        msg = 'Rate limit exceeded. Please wait a few seconds and try again.'
      } else {
        msg = axiosErr.response?.data?.error?.message || err.message || msg
      }
    }
    else if (err instanceof Error) {
        msg = err.message;
    }

    console.error(msg)
    throw new Error(msg)
  }
}