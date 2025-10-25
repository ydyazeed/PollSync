import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { normalizeCode } from '@/lib/utils/normalize-code';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Access code is required' },
        { status: 400 }
      );
    }

    // Normalize the code (remove spaces, uppercase, ensure dash placement)
    const normalizedCode = normalizeCode(code);
    console.log('Code verification:', { original: code, normalized: normalizedCode });

    // Hash the normalized code
    const codeHashSecret = process.env.CODE_HASH_SECRET || 'default-secret';
    const codeHash = crypto.createHmac('sha256', codeHashSecret).update(normalizedCode).digest('hex');

    // Look up the code
    const supabase = await createClient();
    const { data: accessCode, error } = await supabase
      .from('access_codes')
      .select('poll_id, is_active')
      .eq('code_hash', codeHash)
      .single();

    if (error || !accessCode) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 404 }
      );
    }

    if (!accessCode.is_active) {
      return NextResponse.json(
        { error: 'This access code has been deactivated' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      poll_id: accessCode.poll_id,
    });
  } catch (error: any) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}

