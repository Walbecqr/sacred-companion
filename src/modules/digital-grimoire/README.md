# Digital Grimoire Module

A comprehensive digital grimoire system for the Sacred Companion application, providing users with a personal magical library to store, organize, and evolve their spiritual knowledge.

## Features

### Core Functionality
- **Entry Management**: Create, edit, and organize magical entries (spells, rituals, correspondences, etc.)
- **Daily Practice**: Track daily spiritual practices with moon phase integration
- **Correspondences**: Browse and integrate with the magical correspondence system
- **Search & Filter**: Advanced search and filtering capabilities
- **Collections**: Organize entries into themed collections
- **Version History**: Track changes and evolution of entries over time

### Advanced Features
- **AI Integration**: AI-powered suggestions and content evolution
- **Content Ingestion**: Import and structure content from various sources
- **Export/Import**: Backup and restore grimoire data
- **Safety Mode**: Built-in safety warnings and disclaimers
- **Lunar Integration**: Moon phase tracking and lunar correspondences

## Architecture

### Database Schema
The module uses a comprehensive PostgreSQL schema with the following tables:
- `grimoire_vaults`: User vault metadata and settings
- `grimoire_entries`: Individual magical entries
- `grimoire_attachments`: File attachments and media
- `grimoire_collections`: Entry organization
- `grimoire_entry_history`: Version tracking
- `grimoire_search_index`: Full-text search capabilities

### Frontend Components
- **GrimoireDashboard**: Main dashboard interface
- **Tab Components**: Library, Daily Practice, Correspondences, Settings
- **Navigation**: Main tabs, action toolbar, filter sidebar
- **Entry Management**: Entry cards, editor, viewer
- **Context Provider**: Global state management

## File Structure

```
src/
├── contexts/
│   └── GrimoireContext.tsx          # Global state management
├── components/
│   ├── grimoire/
│   │   ├── GrimoireDashboard.tsx    # Main dashboard
│   │   ├── navigation/              # Navigation components
│   │   ├── tabs/                    # Tab components
│   │   └── entries/                 # Entry components
│   └── ui/                          # Reusable UI components
├── types/
│   └── grimoire.ts                  # TypeScript definitions
├── lib/
│   └── utils.ts                     # Utility functions
└── app/
    └── dashboard/
        └── grimoire/
            └── page.tsx             # Grimoire page route
```

## Usage

### Basic Setup
1. Ensure the database migration has been run:
   ```sql
   -- Run the migration file: supabase/migrations/20250115_digital_grimoire.sql
   ```

2. Wrap your app with the GrimoireProvider:
   ```tsx
   import { GrimoireProvider } from '@/contexts/GrimoireContext';
   
   function App() {
     return (
       <GrimoireProvider>
         <YourApp />
       </GrimoireProvider>
     );
   }
   ```

3. Use the GrimoireDashboard component:
   ```tsx
   import { GrimoireDashboard } from '@/components/grimoire/GrimoireDashboard';
   
   function GrimoirePage() {
     return <GrimoireDashboard />;
   }
   ```

### Creating Entries
```tsx
import { useGrimoire } from '@/contexts/GrimoireContext';

function MyComponent() {
  const { createEntry } = useGrimoire();
  
  const handleCreateSpell = async () => {
    const entry = await createEntry('spell', {
      title: 'Protection Spell',
      content: 'A simple protection spell...',
      tags: ['protection', 'beginner'],
    });
  };
}
```

### Searching Entries
```tsx
import { useGrimoire } from '@/contexts/GrimoireContext';

function SearchComponent() {
  const { searchEntries } = useGrimoire();
  
  const handleSearch = async () => {
    const results = await searchEntries({
      query: 'protection',
      types: ['spell', 'ritual'],
      tags: ['beginner'],
    });
  };
}
```

## Configuration

### Vault Settings
Users can configure their grimoire through the Settings tab:
- **General**: Name, practice type, default view
- **Appearance**: Theme, layout preferences
- **Notifications**: Daily reminders, AI suggestions
- **Backup**: Export/import settings
- **Advanced**: AI features, safety warnings

### Entry Types
The system supports various entry types:
- `spell`: Magical spells and incantations
- `ritual`: Ceremonial rituals and practices
- `correspondence`: Magical correspondences
- `herb`: Herbal knowledge and properties
- `crystal`: Crystal and stone properties
- `dream`: Dream records and interpretations
- `research`: Research findings and notes
- `reflection`: Personal reflections and insights
- `deity`: Deity-related practices
- `tool`: Magical tools and instruments
- `recipe`: Magical recipes and preparations
- `journal`: Personal journal entries
- `note`: General notes and observations

## Integration

### With Existing Systems
- **Correspondence System**: Integrates with the existing correspondence database
- **Authentication**: Uses existing Supabase auth system
- **Navigation**: Follows the existing dashboard navigation pattern
- **Design System**: Uses consistent styling and components

### API Endpoints
The module uses the existing Supabase client for all database operations:
- Row Level Security (RLS) ensures data isolation
- Real-time subscriptions for live updates
- Full-text search with PostgreSQL

## Development

### Adding New Features
1. **Database**: Add new tables/columns to the migration
2. **Types**: Update TypeScript definitions in `types/grimoire.ts`
3. **Context**: Add new methods to `GrimoireContext.tsx`
4. **Components**: Create new UI components
5. **Integration**: Update existing components to use new features

### Testing
- Unit tests for context methods
- Integration tests for database operations
- Component tests for UI interactions
- E2E tests for user workflows

### Performance Considerations
- Lazy loading for large entry lists
- Virtualization for long lists
- Optimistic updates for better UX
- Caching for frequently accessed data

## Security

### Data Protection
- Row Level Security (RLS) policies
- User authentication required
- Data isolation per user
- Secure file upload handling

### Safety Features
- Built-in safety warnings
- Content moderation capabilities
- User-controlled privacy settings
- Secure backup/restore process

## Future Enhancements

### Planned Features
- **Collaborative Grimoires**: Shared vaults for covens
- **Advanced AI**: More sophisticated content suggestions
- **Mobile App**: Native mobile application
- **Offline Support**: Offline-first capabilities
- **Advanced Search**: Semantic search and AI-powered discovery
- **Integration APIs**: Third-party integrations
- **Analytics**: Usage analytics and insights

### Technical Improvements
- **Performance**: Optimize for large datasets
- **Accessibility**: Enhanced accessibility features
- **Internationalization**: Multi-language support
- **Customization**: More customization options
- **API**: Public API for integrations

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all new features
3. Include proper error handling
4. Add tests for new functionality
5. Update documentation as needed

## License

This module is part of the Sacred Companion application and follows the same licensing terms.
