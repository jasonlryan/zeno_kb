import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the data.json file from the config directory
    const configDir = path.join(process.cwd(), 'config');
    const dataPath = path.join(configDir, 'data.json');
    
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json([], { status: 200 });
    }

    const jsonContent = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(jsonContent);
    
    // Return the tools array from the data.json file
    return NextResponse.json(data.tools || []);
  } catch (error) {
    console.error('Error reading knowledge base:', error);
    return NextResponse.json([], { status: 200 });
  }
} 