import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const connectionTest = {
      environment: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      },
      connection: {
        status: 'Testing...',
        message: '',
      },
      auth: {
        status: 'Testing...',
        message: '',
      },
      database: {
        status: 'Testing...',
        tables: [] as string[],
      }
    };

    const { error: authError } = await supabase.auth.getSession();
    if (!authError) {
      connectionTest.auth.status = '✅ Working';
      connectionTest.auth.message = 'Auth system is accessible';
    } else {
      connectionTest.auth.status = '❌ Error';
      connectionTest.auth.message = authError.message;
    }

    const tablesToCheck = [
      'journal_entries',
      'rituals',
      'divination_readings',
      'book_of_shadows_entries',
      'daily_check_ins',
      'conversations',
      'messages',
      'correspondences',
      'spiritual_inventory',
      'user_spiritual_profiles'
    ];

    const foundTables = [];
    let connectionWorking = false;

    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
          .single();
        
        if (!error || error.code === 'PGRST116') {
          foundTables.push(table);
          connectionWorking = true;
        }
      } catch (e) {
        console.error(`Error checking table ${table}:`, e);
      }
    }

    if (connectionWorking) {
      connectionTest.connection.status = '✅ Connected';
      connectionTest.connection.message = 'Successfully connected to Supabase';
      
      if (foundTables.length > 0) {
        connectionTest.database.status = '✅ Working';
        connectionTest.database.tables = foundTables;
      } else {
        connectionTest.database.status = '⚠️ Connected but no tables found';
      }
    } else {
      connectionTest.connection.status = '⚠️ Connection established but no tables accessible';
      connectionTest.connection.message = 'You may need to run migrations to create tables';
      connectionTest.database.status = '⚠️ No tables found';
    }

    return NextResponse.json(connectionTest, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to test connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}