import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://159.198.35.231:8090');

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const record = await pb.collection('cook_form_submissions').create({ email });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Error creating record:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}