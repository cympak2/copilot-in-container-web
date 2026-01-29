# Copilot-in-Container Web Interface

This web application provides a terminal-based interface for managing and interacting with GitHub Copilot server instances running in containers.

## Features

- **Auto-Discovery**: Automatically detects and displays all running Copilot server instances
- **Multi-Tab Interface**: Each server instance gets its own dedicated tab
- **Real-Time Command Execution**: Send commands directly to server instances and see output in real-time
- **Instance Information**: View port, status, uptime, and workspace for each instance
- **Refresh Support**: Click the refresh button to update the list of available instances

## Prerequisites

1. **copilot-in-container CLI** must be installed and available in your PATH as `cic`
2. At least one server instance should be running. Start one with:
   ```bash
   cic server start --name myserver
   ```

## Configuration

### CIC Path Configuration

You can configure the path to the `cic` executable in two ways:

**Option 1: Environment Variable**
```bash
# Create .env.local file
echo "CIC_PATH=/path/to/cic" > .env.local
```

**Option 2: Config File**
```bash
# Create config file
mkdir -p ~/.copilot-in-container
cat > ~/.copilot-in-container/web-config.json << EOF
{
  "cicPath": "/path/to/cic"
}
EOF
```

**Priority**: Environment variable (`CIC_PATH`) takes precedence over config file. If neither is set, defaults to `cic` from PATH.

## Getting Started

### Installation

```bash
cd copilot-in-container-web
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

```bash
npm run build
npm start
```

## Usage

### Starting Server Instances

Before using the web interface, start one or more Copilot server instances:

```bash
# Start a default server
cic server start

# Start a named server on a specific port
cic server start --name dev-server --port 8080

# Start with a specific model
cic server start --name prod-server --model gpt-4
```

### Using the Web Interface

1. **View Instances**: The web app automatically loads all running server instances on startup
2. **Switch Tabs**: Click on any tab to switch between different server instances
3. **Execute Commands**: Type commands in the terminal input and press Enter
4. **Refresh**: Click the refresh icon (↻) in the tab bar to update the instance list
5. **Clear Output**: Type `clear` to clear the terminal output

### Example Commands

Once connected to a server instance, you can send any command that the Copilot CLI supports:

```bash
# Ask a question
what is the difference between async and await?

# Request code generation
write a python function to calculate fibonacci numbers

# Get help with debugging
why is my code throwing a null pointer exception?
```

## API Routes

The web app provides three API endpoints:

### GET `/api/servers`
Lists all available server instances with their status and details.

**Response:**
```json
{
  "instances": [
    {
      "instanceName": "default",
      "containerId": "abc123...",
      "port": 8080,
      "status": "running",
      "uptime": "2h 15m",
      "workspaceFolder": "/Users/you/project"
    }
  ]
}
```

### POST `/api/servers/execute`
Executes a command on a specific server instance.

**Request:**
```json
{
  "instanceName": "default",
  "command": "your command here"
}
```

**Response:**
```json
{
  "output": "Command output...",
  "error": null
}
```

### GET `/api/servers/logs?instanceName=default&tail=50`
Retrieves logs from a specific server instance.

**Response:**
```json
{
  "logs": "Server log output..."
}
```

## Architecture

- **Frontend**: Next.js 16 with React, TypeScript, and Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Backend**: Next.js API routes that interface with the `cic` CLI tool
- **State Management**: React hooks (useState, useEffect)

## Troubleshooting

### No instances appear
- Verify that you have started at least one server: `cic server list`
- Check that the `cic` command is in your PATH
- Ensure the server state directory exists: `~/.copilot-in-container/servers/`

### Commands not executing
- Verify the server instance is running: `cic server status --name <instance-name>`
- Check the browser console for any API errors
- Ensure you have proper GitHub authentication: `gh auth status`

### Connection errors
- Make sure the server port is accessible
- Check that no firewall is blocking the connection
- Verify the container is running: `container list`

## Development

### Project Structure

```
copilot-in-container-web/
├── app/
│   ├── api/
│   │   └── servers/
│   │       ├── route.ts          # List instances
│   │       ├── execute/route.ts  # Execute commands
│   │       └── logs/route.ts     # Get logs
│   ├── page.tsx                  # Main page
│   └── layout.tsx
├── components/
│   ├── terminal-session.tsx      # Terminal session component
│   ├── terminal-input.tsx        # Command input
│   ├── terminal-output.tsx       # Output display
│   ├── terminal-tab-bar.tsx      # Tab navigation
│   └── terminal-header.tsx       # Header
└── types/
    └── terminal.ts               # TypeScript interfaces
```

### Adding New Features

To add new functionality:

1. **New API endpoint**: Create a new route in `app/api/servers/`
2. **UI changes**: Modify components in the `components/` directory
3. **Type definitions**: Update `types/terminal.ts` as needed

## License

Same license as the parent copilot-in-container project.
