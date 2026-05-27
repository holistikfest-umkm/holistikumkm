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
        JSON.stringify({ error: 'No file uploaded' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // MAX 5MB
    if (file.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'Max 5MB' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // convert ke base64
    const arrayBuffer = await file.arrayBuffer();

    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);

    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    const base64 = btoa(binary);

    // API KEY IMGBB
    const API_KEY = '76b51317391c38c2f5a78c131c3b66c9';

    const body = new URLSearchParams();
    body.append('key', API_KEY);
    body.append('image', base64);

    const uploadRes = await fetch(
      'https://api.imgbb.com/1/upload',
      {
        method: 'POST',
        body
      }
    );

    const result = await uploadRes.json();

    console.log(result);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Upload ImgBB gagal',
          detail: result
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: result.data.url
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
          'Content-Type': 'application/json'
        }
      }
    );

  }
}
