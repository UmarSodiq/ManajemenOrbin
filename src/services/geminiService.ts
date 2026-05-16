/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AIChatRequest {
  prompt: string;
  history?: { role: string; parts: string[] }[];
  systemInstruction?: string;
}

export async function askAI(prompt: string, options: Partial<AIChatRequest> = {}) {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, ...options }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Gagal menghubungi asisten AI');
    }

    const data = await response.json();
    return data.text as string;
  } catch (error: any) {
    console.error('AI Service Error:', error);
    throw error;
  }
}
