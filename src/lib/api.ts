import { NextResponse } from 'next/server';

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse(data: unknown) {
  return NextResponse.json(data);
}
