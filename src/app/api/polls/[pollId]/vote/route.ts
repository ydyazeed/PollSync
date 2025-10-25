import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { normalizeCode } from '@/lib/utils/normalize-code';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params;
    const body = await request.json();
    const { option_id, voter_uuid, voter_name, code } = body;

    // Validate input
    if (!option_id || !voter_uuid || !voter_name) {
      return NextResponse.json(
        { error: 'Option ID, voter UUID, and voter name are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify the code if provided
    if (code) {
      // Normalize the code (remove spaces, uppercase, ensure dash placement)
      const normalizedCode = normalizeCode(code);
      const codeHashSecret = process.env.CODE_HASH_SECRET || 'default-secret';
      const codeHash = crypto.createHmac('sha256', codeHashSecret).update(normalizedCode).digest('hex');

      console.log('Verifying vote code:', { code, codeHash: codeHash.substring(0, 10) + '...', pollId });

      const { data: accessCode, error: codeError } = await supabase
        .from('access_codes')
        .select('poll_id, is_active')
        .eq('code_hash', codeHash)
        .single();

      console.log('Code verification result:', { accessCode, codeError, matches: accessCode?.poll_id === pollId });

      if (codeError || !accessCode || accessCode.poll_id !== pollId || !accessCode.is_active) {
        console.error('Code verification failed:', { codeError, accessCode, pollId });
        return NextResponse.json(
          { error: 'Invalid or inactive access code' },
          { status: 403 }
        );
      }
    }

    // Verify the poll exists
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id')
      .eq('id', pollId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Verify the option belongs to this poll
    const { data: option, error: optionError } = await supabase
      .from('poll_options')
      .select('id')
      .eq('id', option_id)
      .eq('poll_id', pollId)
      .single();

    if (optionError || !option) {
      return NextResponse.json(
        { error: 'Invalid option for this poll' },
        { status: 400 }
      );
    }

    // Check if voter has already voted
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('voter_uuid', voter_uuid)
      .single();

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted in this poll' },
        { status: 409 }
      );
    }

    // Insert vote
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        poll_id: pollId,
        option_id: option_id,
        voter_uuid: voter_uuid,
        voter_name: voter_name,
      })
      .select()
      .single();

    if (voteError) {
      // Check if it's a unique constraint violation
      if (voteError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already voted in this poll' },
          { status: 409 }
        );
      }
      throw voteError;
    }

    return NextResponse.json({
      success: true,
      vote_id: vote.id,
    });
  } catch (error: any) {
    console.error('Error submitting vote:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit vote' },
      { status: 500 }
    );
  }
}

