'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DockerLearningApp() {
  const [dockerfile, setDockerfile] = useState(`
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
VOLUME ["/app/data"]
CMD ["npm", "start"]
  `.trim())

  const [command, setCommand] = useState('')
  const [output, setOutput] = useState('')
  const [containers, setContainers] = useState([])

  const simulateDockerCommand = (cmd: string) => {
    const parts = cmd.split(' ')
    const mainCommand = parts[1]

    switch (mainCommand) {
      case 'run':
        return simulateDockerRun(parts.slice(2))
      case 'build':
        return 'Building Docker image...\nSuccessfully built 1234567890ab'
      case 'ps':
        return containers.length > 0 
          ? 'CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS   NAMES\n' + 
            containers.map(c => `${c.id}   ${c.image}   "${c.command}"   2 minutes ago   Up 2 minutes   ${c.ports}   ${c.name}`).join('\n')
          : 'CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS   NAMES'
      default:
        return `Error: Unknown command "${mainCommand}"`
    }
  }

  const simulateDockerRun = (args: string[]) => {
    let name = 'random_name'
    let image = 'default_image'
    let ports = ''
    let volumes = ''
    let command = ''

    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--name':
          name = args[++i]
          break
        case '-p':
          ports += args[++i] + ' '
          break
        case '-v':
          volumes += args[++i] + ' '
          break
        case '--entrypoint':
          command = args[++i]
          break
        default:
          if (!image.includes(':')) {
            image = args[i]
          }
      }
    }

    const newContainer = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      image,
      ports: ports.trim(),
      volumes: volumes.trim(),
      command: command || 'npm start'
    }

    setContainers([...containers, newContainer])

    return `
Container created: ${name}
Image: ${image}
Ports: ${ports}
Volumes: ${volumes}
Command: ${command || 'npm start'}

You are now inside the container. Working directory: /app
Container user: node (uid=1000, gid=1000)
Host volume user: ${Math.random() > 0.5 ? 'root (uid=0, gid=0)' : 'your_username (uid=1001, gid=1001)'}

To keep host and container volumes synced and accessible:
1. Use the same UID/GID for the container user and host user
2. Set appropriate permissions on the host volume
3. Consider using Docker Compose for more complex setups
    `.trim()
  }

  const handleRunCommand = () => {
    if (command.trim()) {
      const result = simulateDockerCommand(command)
      setOutput(prev => `${prev}\n\n$ ${command}\n${result}`)
      setCommand('')
    }
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/3 p-4 bg-gray-100">
        <h2 className="text-xl font-bold mb-2">Dockerfile</h2>
        <ScrollArea className="h-full">
          <pre className="p-4 bg-white rounded shadow">{dockerfile}</pre>
        </ScrollArea>
      </div>
      <div className="w-2/3 flex flex-col">
        <ScrollArea className="flex-grow p-4 bg-black text-green-400 font-mono">
          <pre>{output}</pre>
        </ScrollArea>
        <div className="p-4 bg-gray-800 flex">
          <Input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleRunCommand()}
            placeholder="Enter Docker command..."
            className="flex-grow mr-2 bg-gray-700 text-white"
          />
          <Button onClick={handleRunCommand}>Run</Button>
        </div>
      </div>
    </div>
  )
}