import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { DEFAULT_RECENT_LIMIT } from '@/types/correspondence';

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const includeCorrespondence = searchParams.get('include_correspondence') === 'true';
    const limit = parseInt(searchParams.get('limit') || String(DEFAULT_RECENT_LIMIT));

    // Build the query
    let selectClause = '*';
    if (includeCorrespondence) {
      selectClause = `
        *,
        correspondence:correspondences!inner(
          *,
          category_display_name:correspondence_categories!inner(display_name),
          category_icon:correspondence_categories!inner(icon_name),
          category_color:correspondence_categories!inner(color_hex)
        )
      `;
    }

    const query = supabase
      .from('user_correspondence_recent')
      .select(selectClause)
      .eq('user_id', user.id)
      .order('accessed_at', { ascending: false })
      .limit(Math.min(limit, 50)); // Max 50 recent items

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recent correspondences:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch recent items' },
        { status: 500 }
      );
    }

    // Transform the data if correspondence is included
    let recent = data || [];
    if (includeCorrespondence && Array.isArray(recent)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recent = (recent as unknown[]).map((item: any) => ({
        ...item,
        correspondence: item.correspondence ? {
          ...item.correspondence,
          category_display_name: item.correspondence.category_display_name?.display_name,
          category_icon: item.correspondence.category_icon?.icon_name,
          category_color: item.correspondence.category_color?.color_hex,
        } : null,
      }));
    }

    return NextResponse.json({
      success: true,
      data: recent,
    });

  } catch (error) {
    console.error('Recent GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Clear recent history
export async function DELETE(request: NextRequest) {
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

    // Parse query parameters to see if we're clearing all or specific items
    const { searchParams } = new URL(request.url);
    const correspondence_id = searchParams.get('correspondence_id');

    let query = supabase
      .from('user_correspondence_recent')
      .delete()
      .eq('user_id', user.id);

    if (correspondence_id) {
      // Clear specific item
      query = query.eq('correspondence_id', correspondence_id);
    }

    const { error } = await query;

    if (error) {
      console.error('Error clearing recent history:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to clear recent history' },
        { status: 500 }
      );
    }

    const message = correspondence_id 
      ? 'Item removed from recent history' 
      : 'Recent history cleared successfully';

    return NextResponse.json({
      success: true,
      message,
    });

  } catch (error) {
    console.error('Recent DELETE API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
