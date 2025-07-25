import { NextRequest, NextResponse } from "next/server";
import {
  getConfig,
  setConfig,
  deleteConfig,
} from "@/lib/redisConfigManager";

export async function GET(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  const { type } = params;
  const config = await getConfig(type as any);
  return NextResponse.json(config);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  const { type } = params;
  const body = await req.json();
  await setConfig(type as any, body);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  const { type } = params;
  await deleteConfig(type as any);
  return NextResponse.json({ success: true });
}

