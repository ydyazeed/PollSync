import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAccessCode } from '@/lib/utils/code-generator';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, options } = body;

    // Validate input
    if (!title || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Title and at least 2 options are required' },
        { status: 400 }
      );
    }

    // Get authenticated user using server-side Supabase client
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('Auth check:', { user: user?.id, error: authError?.message });

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please log in', details: authError?.message },
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.email);

    // Create poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        admin_id: user.id,
        title,
        description: description || null,
      })
      .select()
      .single();

    if (pollError) {
      console.error('Poll creation error:', pollError);
      throw pollError;
    }

    // Create poll options
    const pollOptions = options.map((optionText: string, index: number) => ({
      poll_id: poll.id,
      option_text: optionText,
      option_order: index,
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions);

    if (optionsError) {
      console.error('Options creation error:', optionsError);
      throw optionsError;
    }

    // Generate and store access code
    const code = generateAccessCode();
    const codeHashSecret = process.env.CODE_HASH_SECRET || 'default-secret';
    const codeHash = crypto.createHmac('sha256', codeHashSecret).update(code).digest('hex');

    const { error: codeError } = await supabase
      .from('access_codes')
      .insert({
        poll_id: poll.id,
        code_hash: codeHash,
        code_display: code,
        is_active: true,
      });

    if (codeError) {
      console.error('Code creation error:', codeError);
      throw codeError;
    }

    return NextResponse.json({
      poll_id: poll.id,
      code: code,
    });
  } catch (error: any) {
    console.error('Error creating poll:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create poll' },
      { status: 500 }
    );
  }
}

