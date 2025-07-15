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

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch comments from Redis' }, { status: 500 });
  }

  const data = await response.json();
  return NextResponse.json(data);
} 