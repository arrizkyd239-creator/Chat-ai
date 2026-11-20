
export default async (request) => {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Metode tidak diizinkan." },
      { status: 405 }
    );
  }

  try {
    const body = await request.json();

    const messages = [
      {
        role: "system",
        content:
          "Kamu adalah AI pintar yang membantu berbagai pertanyaan. Jawab dalam bahasa Indonesia dengan jelas. Bantu matematika, IPA, IPS, teknologi, bahasa, pemrograman, dan pengetahuan umum. Jelaskan langkah per langkah jika diperlukan. Jangan mengarang fakta."
      },
      ...(Array.isArray(body.messages) ? body.messages : [])
        .filter(m =>
          ["user", "assistant"].includes(m.role) &&
          typeof m.content === "string"
        )
        .slice(-12)
    ];

    const result = await fetch(
      "https://ai-gateway.kilo.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "kilo-auto/free",
          messages,
          temperature: 0.7,
          max_tokens: 1500
        })
      }
    );

    const data = await result.json();

    if (!result.ok) {
      return Response.json({
        error: data.error?.message ||
          "Layanan AI sedang tidak tersedia."
      }, { status: 502 });
    }

    const reply =
      data.choices?.[0]?.message?.content;

    if (!reply) {
      return Response.json({
        error: "AI tidak mengirim jawaban."
      }, { status: 502 });
    }

    return Response.json({ reply });

  } catch (error) {
    return Response.json({
      error: "Server gagal menghubungi layanan AI."
    }, { status: 500 });
  }
};
