export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { prompt } = await request.json();

  try {
    // 调用 gpt2，不带 token（完全公开）
    const hfRes = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // ⚠️ 注意：这里移除了 Authorization
      },
      body: JSON.stringify({ inputs: prompt || 'Hello' })
    });

    if (!hfRes.ok) {
      const errorText = await hfRes.text();
      return new Response(errorText, { status: hfRes.status });
    }

    const result = await hfRes.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
