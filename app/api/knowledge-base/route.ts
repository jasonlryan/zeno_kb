import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/redisConfigManager';

export async function GET() {
  try {
    // Get data from Redis instead of static file
    const data = await getConfig('data') as any;
    
    // Return the tools array from the Redis data
    return NextResponse.json(data?.tools || []);
  } catch (error) {
    console.error('Error reading knowledge base from Redis:', error);
    return NextResponse.json([], { status: 200 });
  }
} 