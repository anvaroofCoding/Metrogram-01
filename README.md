# Metrogram Frontend

Real-time chat web ilovasi — [GAIA UI](https://ui.heygaia.io/docs) dizayn tizimi va maxsus **ChatQuery** engine (RTK Query uslubida).

## Ishga tushirish

```bash
npm install
npm run dev
```

Brauzer: `http://localhost:5173`

## Struktura

```
src/
├── app/                  # Root provider va App
├── components/
│   ├── icons/            # GAIA UI Hugeicons wrapper
│   └── ui/               # GAIA UI komponentlari (composer, message-bubble)
├── config/               # Environment sozlamalari
├── features/chat/        # Chat feature (api, components, pages)
├── lib/chat-query/       # RTK Query uslubidagi data layer
├── realtime/             # WebSocket client + provider
└── types/                # Shared TypeScript tiplar
```

## ChatQuery (RTK Query o'xshash)

```ts
const api = createChatApi().injectEndpoints((build) => ({
  getMessages: build.query("getMessages", {
    queryFn: async (arg) => fetchMessages(arg),
    providesTags: (_, __, arg) => [`Message:${arg.conversationId}`],
  }),
  sendMessage: build.mutation("sendMessage", {
    mutationFn: async (input) => postMessage(input),
    invalidatesTags: (_, __, arg) => [`Message:${arg.conversationId}`],
    onQueryStarted: async (arg, { optimisticUpdate, queryFulfilled }) => {
      const rollback = optimisticUpdate("getMessages", arg, optimisticData);
      try { await queryFulfilled; } catch { rollback(); }
    },
  }),
}));
```

**Imkoniyatlar:** cache tags, optimistic updates, auto-refetch, polling, real-time cache sync.

## Real-time

WebSocket `/ws` orqali ulanadi. Backend tayyor bo'lganda quyidagi eventlar qo'llab-quvvatlanadi:

- `message:new` — yangi xabar
- `message:updated` — xabar yangilandi
- `conversation:updated` — suhbat ro'yxati yangilandi
- `typing` — yozayotganlik indikatori

Backend yo'q bo'lsa demo ma'lumotlar bilan ishlaydi.

## GAIA UI komponentlari qo'shish

```bash
npx shadcn@latest add https://ui.heygaia.io/r/[component-name].json
```

Hozir o'rnatilgan: `composer`, `message-bubble`
