import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'z_1/config/data.json');

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    const originalLength = data.tools.length;
    data.tools = data.tools.filter((tool: any) => tool.id !== id);
    if (data.tools.length === originalLength) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 