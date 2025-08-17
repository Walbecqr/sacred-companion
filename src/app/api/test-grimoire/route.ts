import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Test grimoire vault access
    const { data: vault, error: vaultError } = await supabase
      .from('grimoire_vaults')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (vaultError) {
      return NextResponse.json({
        success: false,
        error: 'Grimoire vault not found',
        details: vaultError.message,
        setup_required: true
      });
    }

    // Test correspondences access
    const { data: correspondences, error: corrError } = await supabase
      .from('correspondences')
      .select('id, name, category')
      .limit(5);

    if (corrError) {
      return NextResponse.json({
        success: false,
        error: 'Correspondences table not accessible',
        details: corrError.message,
        setup_required: true
      });
    }

    // Test grimoire entries access
    const { data: entries, error: entriesError } = await supabase
      .from('grimoire_entries')
      .select('id, title, entry_type')
      .eq('vault_id', vault.id)
      .limit(5);

    return NextResponse.json({
      success: true,
      message: 'Grimoire setup is working correctly',
      data: {
        user_id: user.id,
        vault: {
          id: vault.id,
          book_name: vault.book_name,
          practice: vault.practice
        },
        correspondences_count: correspondences?.length || 0,
        entries_count: entries?.length || 0,
        sample_correspondences: correspondences?.slice(0, 3) || [],
        sample_entries: entries?.slice(0, 3) || []
      }
    });

  } catch (error) {
    console.error('Grimoire test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
