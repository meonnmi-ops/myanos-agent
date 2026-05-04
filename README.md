# MyanOS Agent

Manus-like **Free Unlimited AI Agent** web application built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- 🤖 **AI Chat** — Powered by z-ai-web-dev-sdk with multi-turn conversation
- 💻 **Shell Execution** — Run commands on Termux (Android) via HTTP tunnel
- 🔧 **MMC Compiler** — Compile Myanmar Code (MMC) to LLVM IR and ARM64 binary
- 📦 **OneDrive Quota** — Check 1TB cloud storage status
- ⚡ **Tool Calling** — AI automatically selects and executes tools
- 📊 **Task Progress** — Step-by-step progress tracking (like Manus AI)
- 🌙 **Dark Theme** — Sleek dark UI with emerald accent
- 📱 **Mobile Responsive** — Works on any device

## Prerequisites

- Node.js 18+ and npm
- **z-ai-web-dev-sdk API key** — Required for AI chat functionality
- Termux (Android) + tunnel (for shell/mmc tools)

## Quick Start

```bash
# 1. Clone
git clone https://github.com/meonnmi-ops/myanos-agent.git
cd myanos-agent

# 2. Install dependencies
npm install

# 3. Configure AI SDK (REQUIRED)
cp .z-ai-config.example .z-ai-config
# Edit .z-ai-config and fill in your baseUrl and apiKey
nano .z-ai-config

# 4. Start dev server
npm run dev

# 5. Open http://localhost:3000
```

### Step 3: Configure .z-ai-config

The `.z-ai-config` file is **required** for AI chat to work. Create it in your project root or home directory (`~/.z-ai-config`):

```json
{
  "baseUrl": "https://your-api-gateway.com/v1",
  "apiKey": "your-api-key-here"
}
```

- `baseUrl`: Your AI API gateway URL (must include `/v1`)
- `apiKey`: Your API key for the gateway

The SDK searches for config in this order: `./.z-ai-config` > `~/.z-ai-config` > `/etc/.z-ai-config`

### Termux (Android)

On Termux (android/arm64), Turbopack is not supported. The `dev` script already uses `--webpack` mode.

```bash
git clone https://github.com/meonnmi-ops/myanos-agent.git
cd myanos-agent
npm install
cp .z-ai-config.example .z-ai-config
# Edit .z-ai-config with your API key
nano .z-ai-config
npm run dev
# Open http://localhost:3000
```

## Tools

| Tool | Description | Setup |
|------|-------------|-------|
| `shell_exec` | Run shell commands on Termux | Set Tunnel URL in Settings |
| `mmc_compile` | Compile MMC → LLVM → ARM64 binary | Requires Termux + tunnel |
| `onedrive_quota` | Check 1TB OneDrive storage | Works out of the box |

## Termux Tunnel Setup

To enable shell execution on your Android device:

### Option 1: Cloudflare Tunnel (Recommended)
```bash
pkg install cloudflared
cloudflared tunnel --url http://localhost:3000
# Copy the trycloudflare.com URL to Settings
```

### Option 2: ngrok
```bash
pkg install ngrok
ngrok http 3000
# Copy the ngrok URL to Settings
```

### Option 3: Bore.pub
```bash
pkg install bore
bore local 3000 --to localhost:3000
# Copy the bore.pub URL to MyanOS Agent Settings
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State**: Zustand
- **Animation**: Framer Motion
- **AI SDK**: z-ai-web-dev-sdk
- **Markdown**: react-markdown

## Project Structure

```
myanos-agent/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts          # AI chat with tool calling
│   │   │   └── tools/
│   │   │       ├── shell/route.ts      # Termux shell execution
│   │   │       ├── mmc/route.ts        # MMC compiler
│   │   │       └── onedrive/route.ts   # OneDrive quota
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                    # Main agent interface
│   ├── components/
│   │   ├── agent/
│   │   │   ├── chat-input.tsx
│   │   │   ├── chat-message.tsx
│   │   │   ├── task-step.tsx
│   │   │   ├── thinking-indicator.tsx
│   │   │   └── tool-result.tsx
│   │   └── ui/                         # shadcn/ui components
│   └── lib/
│       ├── agent-store.ts              # Zustand state
│       └── utils.ts
├── package.json
├── tsconfig.json
└── next.config.mjs
```

## Important Notes

- **AI Config required**: You MUST create `.z-ai-config` with your API key before the chat will work. Without it, you'll see "Configuration file not found" errors.
- **Termux users**: The dev server uses Webpack mode because Turbopack does not support android/arm64. This is already configured in the default `dev` script.
- **Tunnel URL**: Set the tunnel URL in MyanOS Agent Settings (gear icon) to enable shell execution, MMC compile, and other Termux tools from the web interface.
- **Tunnel port**: The dev server runs on port 3000, so tunnels must point to `localhost:3000`.
- **Cloudflare Tunnel recommended**: If bore.pub has DNS issues on your network, use `cloudflared tunnel` instead — it's more reliable.

## License

MIT

## Author

MyanOS Team — meonnmi-ops
