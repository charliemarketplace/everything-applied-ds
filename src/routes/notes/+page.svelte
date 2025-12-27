<script lang="ts">
  import { navigation } from '$lib/data/navigation';
  import { browser } from '$app/environment';

  interface Note {
    id: string;
    topic: string;
    content: string;
    createdAt: string; // ISO string for JSON serialization
    tags: string[];
  }

  const defaultNotes: Note[] = [
    {
      id: '1',
      topic: 'Bayesian Updating',
      content: 'Key insight: More observations → posterior closer to data mean. Prior precision matters!',
      createdAt: new Date().toISOString(),
      tags: ['core', 'statistics']
    },
    {
      id: '2', 
      topic: 'Kelly Criterion',
      content: 'Use half-Kelly in practice for safety. Full Kelly has too much variance.',
      createdAt: new Date().toISOString(),
      tags: ['pricing', 'risk']
    }
  ];

  let notes = $state<Note[]>(defaultNotes);
  
  // Load saved notes on mount
  $effect(() => {
    if (browser) {
      const saved = localStorage.getItem('pricingModels_notes');
      if (saved) {
        try {
          notes = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to load notes:', e);
        }
      }
    }
  });
  
  // Save notes whenever they change
  function saveNotes() {
    if (browser) {
      localStorage.setItem('pricingModels_notes', JSON.stringify(notes));
    }
  }

  let newNoteContent = $state('');
  let selectedTopic = $state('General');
  let searchQuery = $state('');

  const allTopicNames = $derived(['General', ...navigation.flatMap(s => s.items.map(i => i.label))]);

  const filteredNotes = $derived(
    notes.filter(n => 
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.topic.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  function addNote() {
    if (!newNoteContent.trim()) return;
    
    notes = [{
      id: String(Date.now()),
      topic: selectedTopic,
      content: newNoteContent,
      createdAt: new Date().toISOString(),
      tags: []
    }, ...notes];
    
    newNoteContent = '';
    saveNotes();
  }

  function deleteNote(id: string) {
    notes = notes.filter(n => n.id !== id);
    saveNotes();
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<svelte:head>
  <title>My Notes | Pricing Models</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <h1 class="section-title">My Notes</h1>
    <p class="section-subtitle">Capture insights and key takeaways as you learn</p>
  </div>

  <!-- Add Note -->
  <div class="glass-card p-6">
    <h2 class="font-display text-lg font-semibold text-obsidian-100 mb-4">✏️ Add Note</h2>
    
    <div class="space-y-4">
      <div class="flex gap-4">
        <select 
          bind:value={selectedTopic}
          class="px-4 py-2 bg-obsidian-800/50 border border-obsidian-600 rounded-lg text-sm text-obsidian-100 w-48"
        >
          {#each allTopicNames as topic}
            <option value={topic}>{topic}</option>
          {/each}
        </select>
      </div>
      
      <textarea
        bind:value={newNoteContent}
        placeholder="Write your note here..."
        rows={3}
        class="w-full px-4 py-3 bg-obsidian-800/50 border border-obsidian-600 rounded-lg
               text-obsidian-100 placeholder-obsidian-500 resize-none
               focus:outline-none focus:border-amber-350/50"
      ></textarea>
      
      <div class="flex justify-end">
        <button onclick={addNote} class="btn-primary text-sm py-2">
          Add Note
        </button>
      </div>
    </div>
  </div>

  <!-- Search -->
  <div class="relative">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search notes..."
      class="w-full px-4 py-3 pl-10 bg-obsidian-800/50 border border-obsidian-600 rounded-lg
             text-obsidian-100 placeholder-obsidian-400 focus:outline-none focus:border-amber-350/50"
    />
    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>

  <!-- Notes List -->
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="font-display text-lg font-semibold text-obsidian-100">
        All Notes ({filteredNotes.length})
      </h2>
    </div>

    {#if filteredNotes.length === 0}
      <div class="glass-card p-8 text-center">
        <div class="text-4xl mb-4">📝</div>
        <p class="text-obsidian-400">No notes yet. Start capturing your insights!</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each filteredNotes as note (note.id)}
          <div class="glass-card p-4 group hover:border-obsidian-600 transition-colors">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="badge-amber text-[10px]">{note.topic}</span>
                  <span class="text-xs text-obsidian-500">{formatDate(note.createdAt)}</span>
                </div>
                <p class="text-obsidian-200">{note.content}</p>
              </div>
              <button
                onclick={() => deleteNote(note.id)}
                class="p-2 text-obsidian-500 hover:text-crimson-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Storage Info & Export -->
  <div class="glass-card p-6">
    <h2 class="font-display text-lg font-semibold text-obsidian-100 mb-4">💾 Your Notes</h2>
    <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg mb-4">
      <p class="text-sm text-jade-400 flex items-center gap-2">
        <span>✓</span>
        <span>Notes are saved automatically to your browser's local storage.</span>
      </p>
      <p class="text-xs text-obsidian-400 mt-2">
        Data stays on your device and persists across sessions. Clearing browser data will delete notes.
      </p>
    </div>
    <div class="flex gap-4">
      <button 
        onclick={() => {
          if (notes.length === 0) {
            alert('No notes to export!');
            return;
          }
          const header = `# Pricing Models Notes\nExported: ${new Date().toLocaleDateString()}\n\n---\n\n`;
          const body = notes.map(n => `## ${n.topic}\n*${formatDate(n.createdAt)}*\n\n${n.content}\n`).join('\n---\n\n');
          const md = header + body;
          const blob = new Blob([md], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'pricing-models-notes.md';
          a.click();
          URL.revokeObjectURL(url);
        }}
        class="btn-secondary text-sm py-2"
      >
        Export as Markdown
      </button>
      <button 
        onclick={() => {
          if (confirm('Delete all notes? This cannot be undone.')) {
            notes = [];
            saveNotes();
          }
        }}
        class="btn-secondary text-sm py-2 text-crimson-400 border-crimson-500/30 hover:border-crimson-500"
      >
        Delete All Notes
      </button>
    </div>
  </div>
</div>

