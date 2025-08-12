import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface ShareOracleRequest {
  oracle_card_id: string;
  share_type: 'public_link' | 'social_text' | 'embed_code';
  include_attribution?: boolean;
  personal_note?: string;
}

interface OracleCard {
  id: string;
  title: string;
  content: string;
  card_type: string;
  source?: string;
  image_url?: string;
}

// Generate shareable content for oracle card
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ShareOracleRequest = await request.json();
    const { oracle_card_id, share_type, include_attribution = true, personal_note } = body;

    if (!oracle_card_id || !share_type) {
      return NextResponse.json({ error: 'Oracle card ID and share type are required' }, { status: 400 });
    }

    // Get user's privacy preferences
    const { data: userProfile } = await supabase
      .from('user_spiritual_profiles')
      .select('preferences')
      .eq('user_id', user.id)
      .single();

    const privacySettings = userProfile?.preferences?.privacy || {};
    
    // Check if user allows sharing (default to false for privacy)
    if (!privacySettings.allowOracleSharing) {
      return NextResponse.json({ 
        error: 'Oracle sharing is disabled in your privacy settings',
        privacy_setting: 'allowOracleSharing'
      }, { status: 403 });
    }

    // Get the oracle card
    const { data: oracleCard, error: cardError } = await supabase
      .from('oracle_cards')
      .select('*')
      .eq('id', oracle_card_id)
      .eq('is_active', true)
      .single();

    if (cardError || !oracleCard) {
      return NextResponse.json({ error: 'Oracle card not found' }, { status: 404 });
    }

    // Generate share content based on type
    let shareContent: any = {};

    switch (share_type) {
      case 'social_text':
        shareContent = generateSocialText(oracleCard, include_attribution, personal_note);
        break;
      
      case 'public_link':
        shareContent = generatePublicLink(oracleCard, include_attribution, personal_note);
        break;
      
      case 'embed_code':
        shareContent = generateEmbedCode(oracleCard, include_attribution, personal_note);
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid share type' }, { status: 400 });
    }

    // Record the sharing interaction
    await supabase
      .from('user_oracle_interactions')
      .insert({
        user_id: user.id,
        oracle_card_id: oracle_card_id,
        interaction_type: 'share',
        interaction_date: new Date().toLocaleDateString('en-CA'),
        notes: personal_note,
        metadata: { 
          share_type,
          include_attribution,
          has_personal_note: !!personal_note
        }
      });

    return NextResponse.json({
      message: 'Share content generated successfully',
      share_type,
      ...shareContent
    });

  } catch (error) {
    console.error('Error in share oracle endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateSocialText(card: OracleCard, includeAttribution: boolean, personalNote?: string): any {
  let text = '';
  
  if (personalNote) {
    text += `${personalNote}\n\n`;
  }
  
  text += `"${card.content}"`;
  
  if (card.title && card.title !== card.content) {
    text += `\n\n— ${card.title}`;
  }
  
  if (includeAttribution && card.source) {
    text += `\n\nSource: ${card.source}`;
  }
  
  text += `\n\n✨ Shared from Sacred Companion`;
  
  return {
    text,
    hashtags: ['#SpiritualWisdom', '#OracleCard', '#DailyGuidance', '#SacredCompanion'],
    character_count: text.length
  };
}

function generatePublicLink(card: OracleCard, includeAttribution: boolean, personalNote?: string): any {
  // In a real implementation, you'd create a public share page
  // For now, we'll return the data structure for a share link
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.com';
  const shareUrl = `${baseUrl}/oracle/shared/${card.id}`;
  
  return {
    url: shareUrl,
    title: card.title,
    description: card.content,
    image_url: card.image_url,
    meta_tags: {
      'og:title': card.title,
      'og:description': card.content,
      'og:image': card.image_url || `${baseUrl}/images/oracle-card-default.jpg`,
      'og:type': 'article',
      'twitter:card': 'summary_large_image',
      'twitter:title': card.title,
      'twitter:description': card.content
    }
  };
}

function generateEmbedCode(card: OracleCard, includeAttribution: boolean, personalNote?: string): any {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.com';
  
  // Generate iframe embed code
  const embedCode = `<iframe 
  src="${baseUrl}/oracle/embed/${card.id}?attribution=${includeAttribution}&note=${encodeURIComponent(personalNote || '')}"
  width="400" 
  height="300" 
  frameborder="0" 
  style="border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
  title="Oracle Card: ${card.title}">
</iframe>`;

  // Generate JavaScript widget code
  const widgetCode = `<div id="oracle-card-${card.id}"></div>
<script>
(function() {
  var widget = document.createElement('div');
  widget.innerHTML = \`
    <div style="max-width: 400px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">${card.title}</h3>
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; font-style: italic;">"${card.content}"</p>
      ${includeAttribution && card.source ? `<p style="margin: 0 0 8px 0; font-size: 12px; opacity: 0.8;">— ${card.source}</p>` : ''}
      ${personalNote ? `<p style="margin: 0 0 8px 0; font-size: 14px; background: rgba(255,255,255,0.1); padding: 8px; border-radius: 6px;">${personalNote}</p>` : ''}
      <div style="font-size: 12px; opacity: 0.7; text-align: right;">
        <a href="${baseUrl}" style="color: white; text-decoration: none;">✨ Sacred Companion</a>
      </div>
    </div>
  \`;
  document.getElementById('oracle-card-${card.id}').appendChild(widget);
})();
</script>`;

  return {
    iframe_code: embedCode,
    widget_code: widgetCode,
    preview_url: `${baseUrl}/oracle/embed/${card.id}`,
    dimensions: {
      width: 400,
      height: 300
    }
  };
}

// Get shareable oracle card data (for public viewing)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const card_id = searchParams.get('card_id');
    const type = searchParams.get('type') || 'preview';

    if (!card_id) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get the oracle card (no auth required for public sharing)
    const { data: oracleCard, error: cardError } = await supabase
      .from('oracle_cards')
      .select('id, title, content, card_type, source, image_url, tags')
      .eq('id', card_id)
      .eq('is_active', true)
      .single();

    if (cardError || !oracleCard) {
      return NextResponse.json({ error: 'Oracle card not found' }, { status: 404 });
    }

    // Return public-safe data
    return NextResponse.json({
      card: {
        id: oracleCard.id,
        title: oracleCard.title,
        content: oracleCard.content,
        card_type: oracleCard.card_type,
        source: oracleCard.source,
        image_url: oracleCard.image_url,
        tags: oracleCard.tags
      },
      shareable: true
    });

  } catch (error) {
    console.error('Error in get shareable oracle endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
