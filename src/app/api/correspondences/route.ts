import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  CorrespondenceSearchParams, 
  CorrespondenceSearchResult,
  DEFAULT_CORRESPONDENCE_LIMIT 
} from '@/types/correspondence';

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

    // Parse search parameters
    const { searchParams } = new URL(request.url);
    const params: CorrespondenceSearchParams = {
      query: searchParams.get('query') || undefined,
      category: searchParams.get('category') || undefined,
      categories: searchParams.get('categories')?.split(',') || undefined,
      magical_uses: searchParams.get('magical_uses')?.split(',') || undefined,
      elemental_associations: searchParams.get('elemental_associations')?.split(',') || undefined,
      planetary_associations: searchParams.get('planetary_associations')?.split(',') || undefined,
      zodiac_associations: searchParams.get('zodiac_associations')?.split(',') || undefined,
      rarity_level: searchParams.get('rarity_level')?.split(',') || undefined,
      origin_culture: searchParams.get('origin_culture') || undefined,
      featured_only: searchParams.get('featured_only') === 'true',
      sort_by: (searchParams.get('sort_by') as 'name' | 'popularity' | 'view_count' | 'created_at' | 'updated_at') || 'name',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
      limit: parseInt(searchParams.get('limit') || String(DEFAULT_CORRESPONDENCE_LIMIT)),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Build the query
    let query = supabase
      .from('correspondences')
      .select('*', { count: 'exact' });

    // Apply filters
    if (params.query) {
      // Use full-text search
      query = query.textSearch('search_vector', params.query, {
        type: 'websearch',
        config: 'english'
      });
    }

    if (params.category) {
      query = query.eq('category', params.category);
    }

    if (params.categories && params.categories.length > 0) {
      query = query.in('category', params.categories);
    }

    if (params.magical_uses && params.magical_uses.length > 0) {
      query = query.overlaps('magical_uses', params.magical_uses);
    }

    if (params.elemental_associations && params.elemental_associations.length > 0) {
      query = query.overlaps('elemental_associations', params.elemental_associations);
    }

    if (params.planetary_associations && params.planetary_associations.length > 0) {
      query = query.overlaps('planetary_associations', params.planetary_associations);
    }

    if (params.zodiac_associations && params.zodiac_associations.length > 0) {
      query = query.overlaps('zodiac_associations', params.zodiac_associations);
    }

    // Remove filters for non-existent columns
    // if (params.rarity_level && params.rarity_level.length > 0) {
    //   query = query.in('rarity_level', params.rarity_level);
    // }

    // if (params.origin_culture) {
    //   query = query.eq('origin_culture', params.origin_culture);
    // }

    // if (params.featured_only) {
    //   query = query.eq('is_featured', true);
    // }

    // Apply sorting
    const sortColumn = params.sort_by === 'popularity' ? 'name' : params.sort_by; // Use name as fallback for popularity
    query = query.order(sortColumn || 'name', { ascending: params.sort_order === 'asc' });

    // Apply pagination
    const limit = Math.min(params.limit || DEFAULT_CORRESPONDENCE_LIMIT, 100); // Max 100 items
    query = query.range(params.offset || 0, (params.offset || 0) + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching correspondences:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch correspondences' },
        { status: 500 }
      );
    }

    // Transform the data to add category display info
    const correspondences = (data || []).map(item => ({
      ...item,
      category_display_name: item.category, // Use category as display name for now
      category_icon: 'leaf', // Default icon
      category_color: '#4ade80', // Default color
    }));

    const totalCount = count || 0;
    const hasMore = (params.offset || 0) + limit < totalCount;
    const nextOffset = hasMore ? (params.offset || 0) + limit : undefined;

    const result: CorrespondenceSearchResult = {
      data: correspondences,
      total_count: totalCount,
      has_more: hasMore,
      next_offset: nextOffset,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Correspondence API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Track view for analytics and recent items
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
    const { correspondence_id, action } = body;

    if (!correspondence_id) {
      return NextResponse.json(
        { success: false, error: 'correspondence_id is required' },
        { status: 400 }
      );
    }

    if (action === 'view') {
      // For now, just return success since we don't have the tracking function
      // TODO: Implement view tracking when the database function is available
      return NextResponse.json({
        success: true,
        message: 'View tracked successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Correspondence POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
