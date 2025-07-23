import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'z_1/config/data.json');

export async function POST(request: NextRequest) {
  try {
    const newTool = await request.json();
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    // Ensure unique ID
    if (!newTool.id) {
      newTool.id = Date.now().toString();
    }
    const now = new Date().toISOString();
    newTool.date_added = now;
    newTool.date_modified = now;
    data.tools.push(newTool);
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ success: true, tool: newTool });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 