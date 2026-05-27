export async function onRequest(context) {
  // Hanya menerima POST
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Ambil file dari form data
    const formData = await context.request.formData();
    const file = formData.get('file');
    
    // Validasi file
    if (!file || file.size === 0) {
      return new Response(JSON.stringify({ error: 'Tidak ada file yang diupload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Batasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Ukuran file terlalu besar (max 5MB)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Konversi file ke base64
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    // Upload ke Telegraph
    const telegraphRes = await fetch('https://telegra.ph/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ file: base64 })
    });
    
    const result = await telegraphRes.json();
    
    // Cek hasil
    if (!result || !result[0] || !result[0].src) {
      return new Response(JSON.stringify({ error: 'Gagal upload ke server gambar' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Kembalikan URL gambar
    return new Response(JSON.stringify({
      success: true,
      url: `https://telegra.ph${result[0].src}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
