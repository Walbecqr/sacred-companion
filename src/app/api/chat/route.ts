import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getDataObject, type DataObjectOptions } from '../../lib/data/supabaseDataObjects';
import { gatherSpiritualContext, generateBeatriceResponse } from '../../lib/ai/beatrice';

export async function POST(request: NextRequest) {
    try {
        // Initialize Supabase client with user context (SSR-compatible)
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

        // Extract the message from the request
        const { message, conversationId } = await request.json();

        // Validate input
        if (!message || message.trim().length === 0) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Retrieve or create conversation context
        interface Conversation { id: string; user_id: string; title?: string; created_at?: string; last_message_at?: string }
        let conversation: Conversation;
        if (conversationId) {
            // Fetch existing conversation via DataObject
            const convFetchOptions: DataObjectOptions = {
                viewName: 'conversations',
                fields: [
                    { name: 'id', type: 'string' },
                    { name: 'user_id', type: 'string' },
                    { name: 'title', type: 'string' },
                    { name: 'created_at', type: 'string' },
                    { name: 'last_message_at', type: 'string' }
                ],
                whereClauses: [
                    { field: 'id', operator: 'equals', value: conversationId },
                    { field: 'user_id', operator: 'equals', value: user.id }
                ],
                recordLimit: 1,
                canInsert: false,
                canUpdate: false,
                canDelete: false
            };
            const convFetchDO = await getDataObject(convFetchOptions) as { getData: () => Conversation[] };
            const data = convFetchDO.getData();
            if (!data || data.length === 0) {
                return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
            }
            conversation = data[0];
        } else {
            // Create new conversation via DataObject, then fetch it back
            const convDOOptions: DataObjectOptions = {
                viewName: 'conversations',
                fields: [
                    { name: 'id', type: 'string' },
                    { name: 'user_id', type: 'string' },
                    { name: 'title', type: 'string' },
                    { name: 'created_at', type: 'string' }
                ],
                sort: { field: 'created_at', direction: 'desc' },
                recordLimit: 1,
                canInsert: true,
                canUpdate: true,
                canDelete: false
            };
            const convDO = await getDataObject(convDOOptions) as { insert: (rec: Partial<Conversation>) => Promise<void>; refresh: () => Promise<void> };
            await convDO.insert({
                user_id: user.id,
                title: message.substring(0, 50) + '...'
            });
            await convDO.refresh();

            // Fetch most recent conversation for user
            const convFetchOptions: DataObjectOptions = {
                viewName: 'conversations',
                fields: [
                    { name: 'id', type: 'string' },
                    { name: 'user_id', type: 'string' },
                    { name: 'title', type: 'string' },
                    { name: 'created_at', type: 'string' }
                ],
                whereClauses: [{ field: 'user_id', operator: 'equals', value: user.id }],
                sort: { field: 'created_at', direction: 'desc' },
                recordLimit: 1,
                canInsert: false,
                canUpdate: false,
                canDelete: false
            };
            const convFetchDO = await getDataObject(convFetchOptions) as { getData: () => Conversation[] };
            const latest = convFetchDO.getData();
            if (!latest || latest.length === 0) {
                return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
            }
            conversation = latest[0];
        }

        // Store the user's message via DataObject
        const messagesDOOptions: DataObjectOptions = {
            viewName: 'messages',
            fields: [
                { name: 'id', type: 'string' },
                { name: 'conversation_id', type: 'string' },
                { name: 'user_id', type: 'string' },
                { name: 'role', type: 'string' },
                { name: 'content', type: 'string' }
            ],
            canInsert: true,
            canUpdate: false,
            canDelete: false,
            recordLimit: 0
        };
        const messagesDO = await getDataObject(messagesDOOptions) as { insert: (rec: { conversation_id: string; user_id: string; role: string; content: string }) => Promise<void> };
        await messagesDO.insert({
            conversation_id: conversation.id,
            user_id: user.id,
            role: 'user',
            content: message
        });

        // Generate Beatrice's response using context
        const spiritualContext = await gatherSpiritualContext(user.id, conversation.id, message);
        const beatriceResponse = await generateBeatriceResponse(message, spiritualContext);

        // Store Beatrice's response
        await messagesDO.insert({
            conversation_id: conversation.id,
            user_id: user.id,
            role: 'assistant',
            content: beatriceResponse
        });

        // Update conversation timestamp via DataObject
        const convUpdateOptions: DataObjectOptions = {
            viewName: 'conversations',
            fields: [ { name: 'id', type: 'string' } ],
            canInsert: false,
            canUpdate: true,
            canDelete: false,
            recordLimit: 0
        };
        const convUpdateDO = await getDataObject(convUpdateOptions) as { update: (id: string, changes: Partial<Conversation> & { last_message_at?: string }) => Promise<void> };
        await convUpdateDO.update(conversation.id, { last_message_at: new Date().toISOString() });

        return NextResponse.json({
            conversationId: conversation.id,
            response: beatriceResponse
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// generateBeatriceResponse is now imported from Beatrice AI module