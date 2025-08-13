import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerComponentClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the specific correspondence with category information
    const { data, error } = await supabase
      .from('correspondences')
      .select(`
        *,
        category_display_name:correspondence_categories!inner(display_name),
        category_icon:correspondence_categories!inner(icon_name),
        category_color:correspondence_categories!inner(color_hex)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Correspondence not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching correspondence:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch correspondence' },
        { status: 500 }
      );
    }

    // Transform the data to flatten the joined category fields
    const correspondence = {
      ...data,
      category_display_name: data.category_display_name?.display_name,
      category_icon: data.category_icon?.icon_name,
      category_color: data.category_color?.color_hex,
    };

    // Track the view (fire and forget)
    supabase.rpc('track_correspondence_view', {
      correspondence_uuid: id,
      viewer_user_id: user.id,
    }).then(({ error: trackError }) => {
      if (trackError) {
        console.error('Error tracking correspondence view:', trackError);
      }
    });

    return NextResponse.json({
      success: true,
      data: correspondence,
    });

  } catch (error) {
    console.error('Correspondence detail API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
