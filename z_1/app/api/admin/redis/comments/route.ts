import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return NextResponse.json({ error: 'Missing Upstash Redis credentials' }, { status: 500 });
  }

  const fetchUrl = `${url}/lrange/comments:all/0/-1`;
  const response = await fetch(fetchUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Log the status and body for debugging
  const text = await response.text();
  console.log('Upstash response status:', response.status);
  console.log('Upstash response body:', text);

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch comments from Redis', status: response.status, body: text }, { status: 500 });
  }

  // Try to parse the response as JSON
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON from Redis', body: text }, { status: 500 });
  }

  return NextResponse.json(data);
} 