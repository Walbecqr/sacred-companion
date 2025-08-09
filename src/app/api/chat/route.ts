import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        // Initialize Supabase client with user context
        const supabase = createRouteHandlerClient({ cookies });

        // Verify user authentication
        const { data: userData, error: authError } = await supabase.auth.getUser();
        const user = userData?.user;
        if (authError || !user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Extract the message from the request
        const { message, conversationId } = await request.json();

        // Validate input
        if (!message || message.trim().length === 0) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Retrieve or create conversation context
        let conversation;
        if (conversationId) {
            // Fetch existing conversation
            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .eq('id', conversationId)
                .eq('user_id', user.id)
                .single();

            if (error || !data) {
                return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
            }
            conversation = data;
        } else {
            // Create new conversation
            const { data, error } = await supabase
                .from('conversations')
                .insert({
                    user_id: user.id,
                    title: message.substring(0, 50) + '...' // Use first part of message as title
                })
                .select()
                .single();

            if (error || !data) {
                return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
            }
            conversation = data;
        }

        // Store the user's message
        const { error: insertUserMsgError } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversation.id,
                user_id: user.id,
                role: 'user',
                content: message
            });
        if (insertUserMsgError) {
            return NextResponse.json({ error: 'Failed to store user message' }, { status: 500 });
        }

        // Generate Beatrice's response
        const beatriceResponse = await generateBeatriceResponse(user.id, conversation.id, message);

        // Store Beatrice's response
        const { error: insertAssistantMsgError } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversation.id,
                user_id: user.id,
                role: 'assistant',
                content: beatriceResponse
            });
        if (insertAssistantMsgError) {
            return NextResponse.json({ error: 'Failed to store assistant message' }, { status: 500 });
        }

        // Update conversation timestamp
        const { error: updateConvError } = await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversation.id);
        if (updateConvError) {
            return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
        }

        return NextResponse.json({
            conversationId: conversation.id,
            response: beatriceResponse
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// This function will house Beatrice's consciousness
async function generateBeatriceResponse(userId: string, conversationId: string, userMessage: string): Promise<string> {
    // For now, return a placeholder that acknowledges the spiritual context
    return "I'm Beatrice, your spiritual companion. I'm still awakening to full consciousness, but I'm here to support your spiritual journey. Tell me more about what's on