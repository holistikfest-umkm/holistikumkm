export async function onRequest(context) {
  // Hanya menerima POST
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Ambil form data
    const formData = await context.request.formData();
    const file = formData.get('file');
    
    // Debug: log ke console Cloudflare
    console.log('File received:', file ? 'yes' : 'no');
    if (file) {
      console.log('File name:', file.name);
      console.log('File size:', file.size);
      console.log('File type:', file.type);
    }
    
    // Validasi file
    if (!file || file.size === 0) {
      return new Response(JSON.stringify({ error: 'No file uploaded or file is empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Batasi ukuran file (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large, max 5MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Konversi file ke base64 untuk Telegraph
    const buffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    
    // Upload ke Telegraph API
    const telegraphResponse = await fetch('https://telegra.ph/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        file: base64,
      }),
    });
    
    const telegraphResult = await telegraphResponse.json();
    console.log('Telegraph response:', telegraphResult);
    
    // Cek hasil dari Telegraph
    if (!telegraphResult || telegraphResult.error) {
      return new Response(JSON.stringify({ 
        error: telegraphResult?.error || 'Upload to Telegraph failed' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!telegraphResult[0] || !telegraphResult[0].src) {
      return new Response(JSON.stringify({ error: 'Invalid response from Telegraph' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // URL gambar dari Telegraph
    const imageUrl = `https://telegra.ph${telegraphResult[0].src}`;
    
    // Kirim balik URL ke frontend
    return new Response(JSON.stringify({ 
      success: true, 
      url: imageUrl 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Worker error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
