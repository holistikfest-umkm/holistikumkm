export async function onRequest(context) {
  // Test sederhana - return JSON tanpa proses apapun
  if (context.request.method === 'POST') {
    return new Response(JSON.stringify({ 
      success: true, 
      url: 'https://telegra.ph/file/test-123.jpg' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('OK', { status: 200 });
}
