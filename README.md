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

## Quick Start

```bash
# Clone
git clone https://github.com/meonnmi-ops/myanos-agent.git
cd myanos-agent

# Install dependencies
npm install

# Set environment variables (optional)
echo "ZAI_API_KEY=your_key" > .env.local

# Start dev server
npm run dev

# Open http://localhost:3000
```

### Termux (Android)

On Termux (android/arm64), Turbopack is not supported. The `dev` script already uses `--webpack` mode.

```bash
git clone https://github.com/meonnmi-ops/myanos-agent.git
cd myanos-agent
npm install
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

### Option 1: Bore.pub
```bash
pkg install bore
bore local 3000 --to localhost:3000
# Copy the bore.pub URL to MyanOS Agent Settings
```

### Option 2: Cloudflare Tunnel
```bash
pkg install cloudflared
cloudflared tunnel --url http://localhost:3000
# Copy the trycloudflare.com URL to Settings
```

### Option 3: ngrok
```bash
pkg install ngrok
ngrok http 3000
# Copy the ngrok URL to Settings
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

- **Termux users**: The dev server uses Webpack mode because Turbopack does not support android/arm64. This is already configured in the default `dev` script.
- **Tunnel URL**: Set the tunnel URL in MyanOS Agent Settings (gear icon) to enable shell execution, MMC compile, and other Termux tools from the web interface.
- **Tunnel port**: The dev server runs on port 3000, so tunnels must point to `localhost:3000`.

## License

MIT

## Author

MyanOS Team — meonnmi-ops
