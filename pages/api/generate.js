// 使用默认 Node.js 运行时（最长 10 秒）
// 无需声明 runtime: 'edge'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { prompt } = req.body;

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/distilgpt2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: prompt || 'Hello' })
    });

    // 如果模型正在加载（Hugging Face 返回 503 + estimated_time）
    if (response.status === 503) {
      const data = await response.json();
      if (data.estimated_time) {
        // 告诉用户模型正在加载，建议稍后重试或预热
        return res.status(202).json({
          message: 'Model is loading. Please wait or try again in a few seconds.',
          estimated_time: data.estimated_time
        });
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      return res.status(response.status).json({ error: 'Hugging Face API error', details: errorText });
    }

    const result = await response.json();
    return res.status(200).json(result);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
