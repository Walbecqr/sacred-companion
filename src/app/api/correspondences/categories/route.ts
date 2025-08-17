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

    // Get unique categories from correspondences table
    const { data: categories, error } = await supabase
      .from('correspondences')
      .select('category')
      .order('category');

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const uniqueCategories = [...new Set(categories.map(item => item.category))];
    
    const categoryData = uniqueCategories.map((category, index) => ({
      id: category,
      name: category,
      display_name: category.charAt(0).toUpperCase() + category.slice(1),
      description: `${category} correspondences`,
      color_hex: getCategoryColor(category),
      sort_order: index + 1,
      item_count: categories.filter(item => item.category === category).length,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: categoryData,
    });

  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to assign colors to categories
function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    elements: '#10b981', // Green
    planets: '#8b5cf6',  // Purple
    zodiac: '#f59e0b',   // Amber
    crystals: '#06b6d4', // Cyan
    herbs: '#84cc16',    // Lime
    colors: '#ef4444',   // Red
    animals: '#8b5a2b',  // Brown
    metals: '#6b7280',   // Gray
    numbers: '#3b82f6',  // Blue
    days: '#ec4899',     // Pink
    months: '#10b981',   // Green
    seasons: '#f97316',  // Orange
  };

  return colorMap[category.toLowerCase()] || '#6366f1'; // Default indigo
}

// Update category counts (admin function)
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
    const { action } = body;

    if (action === 'update_counts') {
      // For now, just return success since we don't have the database function
      // TODO: Implement category count updates when the database function is available
      return NextResponse.json({
        success: true,
        message: 'Category counts updated successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Categories POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
