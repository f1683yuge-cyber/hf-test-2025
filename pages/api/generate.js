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
    const hfRes = await fetch('https://api-inference.huggingface.co/models/fffiloni/realistic-vision-v5.1', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: prompt || 'a smiling person' })
    });

    if (!hfRes.ok) {
      const errorText = await hfRes.text();
      return new Response(errorText, { status: hfRes.status });
    }

    const arrayBuffer = await hfRes.arrayBuffer();
    return new Response(arrayBuffer, {
      headers: { 'Content-Type': 'image/jpeg' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
