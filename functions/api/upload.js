export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }

  try {
    const formData = await context.request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Tidak ada file' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // validasi ukuran
    if (file.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'Max 5MB' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // kirim langsung ke Telegraph
    const telegraphForm = new FormData();
    telegraphForm.append('file', file);

    const telegraphRes = await fetch(
      'https://telegra.ph/upload',
      {
        method: 'POST',
        body: telegraphForm
      }
    );

    const result = await telegraphRes.json();

    console.log(result);

    if (!Array.isArray(result) || !result[0]?.src) {
      return new Response(
        JSON.stringify({
          error: 'Gagal upload ke Telegraph',
          detail: result
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: `https://telegra.ph${result[0].src}`
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
