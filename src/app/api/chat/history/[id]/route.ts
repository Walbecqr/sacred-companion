import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Initialize Supabase client with user context
    const cookieStore = await cookies() as unknown as {
      get: (name: string) => { value: string } | undefined;
      set: (init: { name: string; value: string } & CookieOptions) => void;
    };
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: CookieOptions) => cookieStore.set({ name, value, ...options }),
          remove: (name: string, options: CookieOptions) => cookieStore.set({ name, value: '', ...options })
        }
      }
    );

    // Verify user authentication
    const { data: userData, error: authError } = await supabase.auth.getUser();
    const user = userData?.user;
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const conversationId = params.id;

    // Verify the conversation belongs to the user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, user_id, title')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Fetch messages for the conversation
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({
      conversationId: conversation.id,
      title: conversation.title,
      messages: messages?.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at
      })) || []
    });

  } catch (error) {
    console.error('Chat history API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}