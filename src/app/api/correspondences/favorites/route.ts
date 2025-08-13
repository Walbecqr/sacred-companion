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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const includeCorrespondence = searchParams.get('include_correspondence') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

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
      .from('user_correspondence_favorites')
      .select(selectClause)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching correspondence favorites:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch favorites' },
        { status: 500 }
      );
    }

    // Transform the data if correspondence is included
    let favorites = data || [];
    if (includeCorrespondence && Array.isArray(favorites)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      favorites = (favorites as unknown[]).map((favorite: any) => ({
        ...favorite,
        correspondence: favorite.correspondence ? {
          ...favorite.correspondence,
          category_display_name: favorite.correspondence.category_display_name?.display_name,
          category_icon: favorite.correspondence.category_icon?.icon_name,
          category_color: favorite.correspondence.category_color?.color_hex,
        } : null,
      }));
    }

    return NextResponse.json({
      success: true,
      data: favorites,
      total: count || 0,
    });

  } catch (error) {
    console.error('Favorites GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add to favorites
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { correspondence_id, notes, tags } = body;

    if (!correspondence_id) {
      return NextResponse.json(
        { success: false, error: 'correspondence_id is required' },
        { status: 400 }
      );
    }

    // Check if correspondence exists
    const { data: correspondence, error: correspondenceError } = await supabase
      .from('correspondences')
      .select('id')
      .eq('id', correspondence_id)
      .single();

    if (correspondenceError || !correspondence) {
      return NextResponse.json(
        { success: false, error: 'Correspondence not found' },
        { status: 404 }
      );
    }

    // Insert the favorite
    const { data, error } = await supabase
      .from('user_correspondence_favorites')
      .insert({
        user_id: user.id,
        correspondence_id,
        notes: notes || null,
        tags: tags || [],
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { success: false, error: 'Correspondence is already in favorites' },
          { status: 409 }
        );
      }
      console.error('Error adding to favorites:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to add to favorites' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Added to favorites successfully',
    });

  } catch (error) {
    console.error('Favorites POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update favorite notes/tags
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { correspondence_id, notes, tags } = body;

    if (!correspondence_id) {
      return NextResponse.json(
        { success: false, error: 'correspondence_id is required' },
        { status: 400 }
      );
    }

    // Update the favorite
    const { data, error } = await supabase
      .from('user_correspondence_favorites')
      .update({
        notes: notes || null,
        tags: tags || [],
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('correspondence_id', correspondence_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Favorite not found' },
          { status: 404 }
        );
      }
      console.error('Error updating favorite:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update favorite' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Favorite updated successfully',
    });

  } catch (error) {
    console.error('Favorites PUT API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Remove from favorites
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

    const { searchParams } = new URL(request.url);
    const correspondence_id = searchParams.get('correspondence_id');

    if (!correspondence_id) {
      return NextResponse.json(
        { success: false, error: 'correspondence_id is required' },
        { status: 400 }
      );
    }

    // Delete the favorite
    const { error } = await supabase
      .from('user_correspondence_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('correspondence_id', correspondence_id);

    if (error) {
      console.error('Error removing from favorites:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to remove from favorites' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites successfully',
    });

  } catch (error) {
    console.error('Favorites DELETE API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
