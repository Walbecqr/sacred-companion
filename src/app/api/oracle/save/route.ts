import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface SaveOracleRequest {
  oracle_card_id: string;
  collection_id?: string;
  notes?: string;
}

// Save oracle card to user's collection
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SaveOracleRequest = await request.json();
    const { oracle_card_id, collection_id, notes } = body;

    if (!oracle_card_id) {
      return NextResponse.json({ error: 'Oracle card ID is required' }, { status: 400 });
    }

    // Verify the oracle card exists and is active
    const { data: oracleCard, error: cardError } = await supabase
      .from('oracle_cards')
      .select('id, title')
      .eq('id', oracle_card_id)
      .eq('is_active', true)
      .single();

    if (cardError || !oracleCard) {
      return NextResponse.json({ error: 'Oracle card not found' }, { status: 404 });
    }

    let targetCollectionId = collection_id;

    // If no collection specified, use or create default collection
    if (!targetCollectionId) {
      const { data: defaultCollection, error: collectionError } = await supabase
        .from('user_oracle_collections')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (collectionError && collectionError.code === 'PGRST116') {
        // Create default collection
        const { data: newCollection, error: createError } = await supabase
          .from('user_oracle_collections')
          .insert({
            user_id: user.id,
            name: 'Saved Oracle Cards',
            description: 'Your collection of meaningful oracle cards and wisdom',
            is_default: true
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating default collection:', createError);
          return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
        }

        targetCollectionId = newCollection!.id;
      } else if (collectionError) {
        console.error('Error fetching default collection:', collectionError);
        return NextResponse.json({ error: 'Failed to access collection' }, { status: 500 });
      } else {
        targetCollectionId = defaultCollection!.id;
      }
    } else {
      // Verify user owns the specified collection
      const { data: collection, error: verifyError } = await supabase
        .from('user_oracle_collections')
        .select('id')
        .eq('id', collection_id)
        .eq('user_id', user.id)
        .single();

      if (verifyError || !collection) {
        return NextResponse.json({ error: 'Collection not found or access denied' }, { status: 404 });
      }
    }

    // Check if card is already in collection
    const { data: existingItem } = await supabase
      .from('oracle_collection_items')
      .select('id')
      .eq('collection_id', targetCollectionId)
      .eq('oracle_card_id', oracle_card_id)
      .single();

    if (existingItem) {
      return NextResponse.json({ 
        message: 'Oracle card already saved to collection',
        already_saved: true
      });
    }

    // Add card to collection
    const { error: insertError } = await supabase
      .from('oracle_collection_items')
      .insert({
        collection_id: targetCollectionId,
        oracle_card_id: oracle_card_id,
        notes: notes || null
      });

    if (insertError) {
      console.error('Error saving oracle card:', insertError);
      return NextResponse.json({ error: 'Failed to save oracle card' }, { status: 500 });
    }

    // Record the interaction
    await supabase
      .from('user_oracle_interactions')
      .insert({
        user_id: user.id,
        oracle_card_id: oracle_card_id,
        interaction_type: 'save',
        interaction_date: new Date().toLocaleDateString('en-CA'),
        notes: notes,
        metadata: { collection_id: targetCollectionId }
      });

    return NextResponse.json({ 
      message: 'Oracle card saved successfully',
      collection_id: targetCollectionId
    });

  } catch (error) {
    console.error('Error in save oracle endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Remove oracle card from user's collection
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const oracle_card_id = searchParams.get('oracle_card_id');
    const collection_id = searchParams.get('collection_id');

    if (!oracle_card_id) {
      return NextResponse.json({ error: 'Oracle card ID is required' }, { status: 400 });
    }

    let whereClause: { oracle_card_id: string; collection_id?: string } = {
      oracle_card_id: oracle_card_id
    };

    if (collection_id) {
      // Remove from specific collection - verify user owns it
      const { data: collection, error: verifyError } = await supabase
        .from('user_oracle_collections')
        .select('id')
        .eq('id', collection_id)
        .eq('user_id', user.id)
        .single();

      if (verifyError || !collection) {
        return NextResponse.json({ error: 'Collection not found or access denied' }, { status: 404 });
      }

      whereClause = { ...whereClause, collection_id };
    } else {
      // Remove from default collection
      const { data: defaultCollection } = await supabase
        .from('user_oracle_collections')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (defaultCollection) {
        whereClause = { ...whereClause, collection_id: defaultCollection.id };
      }
    }

    // Remove the item from collection
    const { error: deleteError } = await supabase
      .from('oracle_collection_items')
      .delete()
      .match(whereClause);

    if (deleteError) {
      console.error('Error removing oracle card:', deleteError);
      return NextResponse.json({ error: 'Failed to remove oracle card' }, { status: 500 });
    }

    // Record the interaction
    await supabase
      .from('user_oracle_interactions')
      .insert({
        user_id: user.id,
        oracle_card_id: oracle_card_id,
        interaction_type: 'unsave',
        interaction_date: new Date().toLocaleDateString('en-CA'),
        metadata: { collection_id: collection_id }
      });

    return NextResponse.json({ message: 'Oracle card removed successfully' });

  } catch (error) {
    console.error('Error in remove oracle endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
