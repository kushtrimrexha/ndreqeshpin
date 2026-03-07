# NdreqeShpin — Platforma e Renovimeve

Platformë e plotë e ndërtuar me **Next.js 14**, **Supabase**, **Stripe**, dhe **Resend**.

---

## Stack Teknologjik

| Layer       | Teknologji           |
|-------------|----------------------|
| Frontend    | Next.js 14 (App Router) + TypeScript |
| Styling     | CSS-in-JS inline (zero config)      |
| Database    | Supabase (PostgreSQL + Realtime)     |
| Auth        | Supabase Auth                        |
| Payments    | Stripe (Subscriptions)               |
| Email       | Resend                               |
| Charts      | Recharts                             |
| Fonts       | Fraunces + DM Sans (Google Fonts)    |

---

## Setup i Shpejtë

### 1. Instalim

```bash
npx create-next-app@latest ndreqeshpin --typescript
cd ndreqeshpin

npm install @supabase/ssr @supabase/supabase-js stripe resend recharts
```

### 2. Variablat e Mjedisit

Kopjo `.env.local.example` → `.env.local` dhe plotëso:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://ndreqeshpin.com
```

### 3. Database Setup (rend i saktë)

Ekzekuto në Supabase SQL Editor:

```
1. supabase/messages_schema_v2.sql
2. supabase/reviews_schema.sql  
3. supabase/settings_schema.sql
4. supabase/stripe_schema.sql
5. supabase/notifications_schema.sql   ← E RE
6. supabase/notification_triggers.sql  ← E RE (triggers automatike)
```

### 4. Supabase Realtime

Shko: Supabase → Database → Replication → Tables
Aktivizo realtime për: `notifications`, `messages`

Ose ekzekuto:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### 5. Supabase Storage

Krijo bucket `avatars` dhe vendos si **Public**.

### 6. Stripe Setup

```bash
# Instalo Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Krijo produkte
stripe products create --name="NdreqeShpin Premium"
stripe prices create --product=prod_xxx --unit-amount=999 --currency=eur --recurring[interval]=month
stripe prices create --product=prod_xxx --unit-amount=9588 --currency=eur --recurring[interval]=year
```

### 7. Resend Setup

1. Shko [resend.com](https://resend.com) → Domains → Add `ndreqeshpin.com`
2. Shto DNS records (SPF, DKIM, DMARC)
3. Merr API key

---

## Struktura e Projektit

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── client/
│   ├── dashboard/
│   ├── applications/
│   ├── offers/
│   ├── messages/
│   ├── reviews/
│   ├── notifications/
│   ├── profile/
│   └── settings/
├── company/            (struktura e njëjtë)
├── worker/             (struktura e njëjtë)
├── admin/
│   ├── dashboard/
│   ├── companies/
│   ├── users/
│   ├── applications/
│   ├── offers/
│   ├── stats/
│   └── settings/
├── pricing/
├── api/
│   ├── notifications/send/
│   ├── offers/create/
│   ├── offers/accept/
│   ├── messages/send/
│   ├── reviews/create/
│   ├── admin/verify-company/
│   ├── admin/update-role/
│   ├── profile/update/
│   ├── settings/...
│   ├── stripe/checkout/
│   ├── stripe/portal/
│   └── webhooks/stripe/
└── layout.tsx

components/
├── Sidebar.tsx          ← Real-time notifications + dropdown
├── PageShell.tsx        ← Layout wrapper
├── Analytics.tsx        ← KpiCard, TrendAreaChart, StatsBarChart, StatsPieChart, ActivityFeed
├── Toast.tsx            ← Global toast system
├── Skeleton.tsx         ← Loading skeletons
├── ErrorBoundary.tsx    ← Error handling
├── Avatar.tsx
├── StatusBadge.tsx
├── EmptyState.tsx
├── ConfirmModal.tsx
├── DataTable.tsx
├── SearchFilter.tsx
├── FormField.tsx
└── ...

hooks/
├── useRealtimeNotifications.ts  ← Live notification count hook
└── useProfile.ts                ← Global profile state

lib/
├── supabase/server.ts
├── supabase/client.ts
├── email/templates.ts
├── email/sender.ts
└── stripe/index.ts
```

---

## Roles & Access Control

| Role    | Dashboard | Funksionalitete |
|---------|-----------|-----------------|
| client  | ✅ | Posto aplikime, prano oferta, chat, vlerëso |
| company | ✅ | Dërgo oferta, statistika, menaxho bids |
| worker  | ✅ | Apliko për punë, menaxho disponueshmërinë |
| admin   | ✅ | Verifiko kompani, ndrysho role, statistika globale |

Admin i vetëm mund të aksesohet duke u vendosur në DB:
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'UUID-KËTU';
```

---

## Komponente të reja

### Analytics.tsx
```tsx
import { KpiCard, TrendAreaChart, StatsBarChart, StatsPieChart, ActivityFeed } from '@/components/Analytics'

<KpiCard title="Oferta" value={42} icon="💼" color="#e8621a" change={12} changeLabel="këtë muaj" />
<TrendAreaChart data={[{label:'Jan',value:5},...]} title="Trend 6 muaj" color="#e8621a" />
<StatsPieChart data={[{label:'Pranuar',value:10,color:'#22d3a5'},...]} title="Statusi" />
<ActivityFeed items={[{id,icon,title,description,time,color},...]} />
```

### Sidebar.tsx (v2)
Props të reja:
```tsx
<Sidebar role="company" userName="..." userId={profile.id} avatar={profile.avatar_url} package={profile.package_type} />
```
- `userId` — kërkohet për real-time notifications
- `avatar` — shfaq foto ose iniciale

### useRealtimeNotifications
```tsx
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'

const { unread, notifications, markAllRead } = useRealtimeNotifications(userId)
```

---

## Email Templates (8 total)

| Template | Kur dërgohet |
|----------|-------------|
| `welcomeEmail` | Regjistrim i ri |
| `newOfferEmail` | Kompania dërgon ofertë |
| `offerAcceptedEmail` | Klienti pranon ofertën |
| `companyVerifiedEmail` | Admin verifikon kompaninë |
| `newReviewEmail` | Vlerësim i ri |
| `newMessageEmail` | Mesazh i ri |
| `premiumActivatedEmail` | Stripe webhook — premium aktiv |
| `passwordResetEmail` | Reset fjalëkalimit |

---

## Deploy (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add env vars
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... (repeat for all vars)

# Production
vercel --prod
```

**Webhook URL për Stripe:**
`https://ndreqeshpin.com/api/webhooks/stripe`

Events:
- `customer.subscription.created`
- `customer.subscription.updated`  
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## Status Platformës

| Funksionalitet | Status |
|---------------|--------|
| Auth (login/register) | ✅ |
| Client Dashboard + Analytics | ✅ |
| Company Dashboard + Analytics | ✅ |
| Worker Dashboard | ✅ |
| Admin Panel | ✅ |
| Aplikime (CRUD) | ✅ |
| Oferta (send/accept) | ✅ |
| Mesazhet realtime | ✅ |
| Vlerësimet | ✅ |
| Notifikime realtime | ✅ |
| Sidebar me dropdown notifikimesh | ✅ |
| Email automation | ✅ |
| Stripe Premium | ✅ |
| Pricing page | ✅ |
| Mobile responsive | ✅ |
| Error boundaries | ✅ |
| Middleware role guard | ✅ |
| DB triggers auto-notify | ✅ |