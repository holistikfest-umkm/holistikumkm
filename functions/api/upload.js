export async function onRequest(context) {
  // Hanya menerima method POST
  if (context.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await context.request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Konversi file ke base64 untuk Telegraph
    const buffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    
    // Upload ke Telegraph
    const telegraphResponse = await fetch('https://telegra.ph/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        file: base64,
      }),
    });
    
    const result = await telegraphResponse.json();
    
    if (!result || result.error) {
      return new Response(JSON.stringify({ error: result?.error || 'Upload to Telegraph failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const imageUrl = `https://telegra.ph${result[0].src}`;
    
    return new Response(JSON.stringify({ success: true, url: imageUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}