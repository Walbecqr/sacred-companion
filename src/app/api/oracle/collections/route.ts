import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface CreateCollectionRequest {
  name: string;
  description?: string;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  card_count?: number;
}

// Get user's oracle collections
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const include_cards = searchParams.get('include_cards') === 'true';
    const collection_id = searchParams.get('collection_id');

    if (collection_id) {
      // Get specific collection with cards
      const { data: collection, error: collectionError } = await supabase
        .from('user_oracle_collections')
        .select('*')
        .eq('id', collection_id)
        .eq('user_id', user.id)
        .single();

      if (collectionError || !collection) {
        return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
      }

      // Get cards in collection
      const { data: collectionItems, error: itemsError } = await supabase
        .from('oracle_collection_items')
        .select(`
          id,
          notes,
          added_at,
          oracle_cards (
            id,
            title,
            content,
            card_type,
            tags,
            source,
            image_url
          )
        `)
        .eq('collection_id', collection_id)
        .order('added_at', { ascending: false });

      if (itemsError) {
        console.error('Error fetching collection items:', itemsError);
        return NextResponse.json({ error: 'Failed to fetch collection items' }, { status: 500 });
      }

      return NextResponse.json({
        collection,
        cards: collectionItems || []
      });
    }

    // Get all collections for user
    let query = supabase
      .from('user_oracle_collections')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    const { data: collections, error } = await query;

    if (error) {
      console.error('Error fetching collections:', error);
      return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
    }

    if (include_cards) {
      // Get card counts for each collection
      const collectionsWithCounts = await Promise.all(
        (collections || []).map(async (collection: any) => {
          const { count } = await supabase
            .from('oracle_collection_items')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', collection.id);

          return {
            ...collection,
            card_count: count || 0
          };
        })
      );

      return NextResponse.json({ collections: collectionsWithCounts });
    }

    return NextResponse.json({ collections: collections || [] });

  } catch (error) {
    console.error('Error in collections endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new oracle collection
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateCollectionRequest = await request.json();
    const { name, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Collection name too long (max 100 characters)' }, { status: 400 });
    }

    // Check if user already has a collection with this name
    const { data: existingCollection } = await supabase
      .from('user_oracle_collections')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name.trim())
      .single();

    if (existingCollection) {
      return NextResponse.json({ error: 'Collection with this name already exists' }, { status: 409 });
    }

    // Create new collection
    const { data: newCollection, error: createError } = await supabase
      .from('user_oracle_collections')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        is_default: false
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating collection:', createError);
      return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Collection created successfully',
      collection: newCollection
    }, { status: 201 });

  } catch (error) {
    console.error('Error in create collection endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update oracle collection
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    // Verify user owns the collection
    const { data: collection, error: verifyError } = await supabase
      .from('user_oracle_collections')
      .select('id, is_default')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (verifyError || !collection) {
      return NextResponse.json({ error: 'Collection not found or access denied' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name && name.trim().length > 0) {
      if (name.trim().length > 100) {
        return NextResponse.json({ error: 'Collection name too long (max 100 characters)' }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    // Update collection
    const { data: updatedCollection, error: updateError } = await supabase
      .from('user_oracle_collections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating collection:', updateError);
      return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Collection updated successfully',
      collection: updatedCollection
    });

  } catch (error) {
    console.error('Error in update collection endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete oracle collection
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const collection_id = searchParams.get('collection_id');

    if (!collection_id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    // Verify user owns the collection and it's not default
    const { data: collection, error: verifyError } = await supabase
      .from('user_oracle_collections')
      .select('id, is_default, name')
      .eq('id', collection_id)
      .eq('user_id', user.id)
      .single();

    if (verifyError || !collection) {
      return NextResponse.json({ error: 'Collection not found or access denied' }, { status: 404 });
    }

    if (collection.is_default) {
      return NextResponse.json({ error: 'Cannot delete default collection' }, { status: 400 });
    }

    // Delete collection (cascade will handle collection items)
    const { error: deleteError } = await supabase
      .from('user_oracle_collections')
      .delete()
      .eq('id', collection_id);

    if (deleteError) {
      console.error('Error deleting collection:', deleteError);
      return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Collection deleted successfully',
      deleted_collection: collection.name
    });

  } catch (error) {
    console.error('Error in delete collection endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
