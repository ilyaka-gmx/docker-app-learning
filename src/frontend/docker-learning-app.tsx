'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function DockerLearningApp() {
  const initialDockerfile = `
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
VOLUME ["/app/data"]
CMD ["npm", "start"]
  `.trim()

  const [dockerfile, setDockerfile] = useState(initialDockerfile)
  const [command, setCommand] = useState('')
  const [output, setOutput] = useState('')
  const [containers, setContainers] = useState<
    {
      id: string
      name: string
      image: string
      ports: string
      volumes: { hostPath: string; containerPath: string; exists: boolean }[]
      command: string
    }[]
  >([])
  const [hostFileSystem, setHostFileSystem] = useState<string[]>(['/host/data', '/host/config'])
  const [containerFileSystem, setContainerFileSystem] = useState<string[]>([])

  const simulateDockerCommand = (cmd: string) => {
    const parts = cmd.trim().split(' ')
    const mainCommand = parts[1]

    switch (mainCommand) {
      case 'run':
        return simulateDockerRun(parts.slice(2))
      case 'build':
        return 'Building Docker image...\nSuccessfully built 1234567890ab'
      case 'ps':
        return containers.length > 0
          ? 'CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS   NAMES\n' +
            containers
              .map(
                (c) =>
                  `${c.id}   ${c.image}   "${c.command}"   2 minutes ago   Up 2 minutes   ${c.ports ||
                    'None'}   ${c.name}`
              )
              .join('\n')
          : 'CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS   NAMES'
      default:
        return `Error: Unknown command "${mainCommand}"`
    }
  }

  const simulateDockerRun = (args: string[]) => {
    let name = 'random_name'
    let image = ''
    let ports = ''
    let volumeMappings: { hostPath: string; containerPath: string; exists: boolean }[] = []
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
        case '--volume':
          const mapping = args[++i]
          const [hostPath, containerPath] = mapping.split(':')
          const hostPathExists = hostFileSystem.includes(hostPath)
          volumeMappings.push({ hostPath, containerPath, exists: hostPathExists })
          break
        case '--entrypoint':
          command = args[++i]
          break
        default:
          if (!args[i].startsWith('-') && !image) {
            image = args[i]
          }
      }
    }

    // Simulate the creation of host directories if they don't exist
    volumeMappings = volumeMappings.map((vm) => {
      if (!vm.exists) {
        setHostFileSystem((prev) => [...prev, vm.hostPath])
        return { ...vm, exists: true }
      }
      return vm
    })

    // Simulate mapping volumes in the container's file system
    setContainerFileSystem((prev) => [
      ...prev,
      ...volumeMappings.map((vm) => vm.containerPath),
    ])

    const newContainer = {
      id: Math.random()
        .toString(36)
        .substr(2, 9),
      name,
      image: image || 'default_image',
      ports: ports.trim(),
      volumes: volumeMappings,
      command: command || 'npm start',
    }

    setContainers((prev) => [...prev, newContainer])

    // Generate output
    let output = `
Container created: ${name}
Image: ${image || 'default_image'}
Ports: ${ports.trim() || 'None'}
Volumes:
    `.trim()

    volumeMappings.forEach((vm) => {
      output += `\n- Host: ${vm.hostPath} ${vm.exists ? '(exists)' : '(created)'} => Container: ${
        vm.containerPath
      }`
      if (!vm.exists) {
        output += `\nWarning: Host directory ${vm.hostPath} did not exist. It has been created.`
      }
    })

    output += `

Command: ${command || 'npm start'}

You are now inside the container. Working directory: /app
Container user: node (uid=1000, gid=1000)
Host volume user: ${
      Math.random() > 0.5 ? 'root (uid=0, gid=0)' : 'your_username (uid=1001, gid=1001)'
    }

To keep host and container volumes synced and accessible:
1. Use the same UID/GID for the container user and host user
2. Set appropriate permissions on the host volume
3. Consider using Docker Compose for more complex setups
    `

    return output.trim()
  }

  const handleRunCommand = () => {
    if (command.trim()) {
      const result = simulateDockerCommand(command)
      setOutput((prev) => `${prev}\n\n$ ${command}\n${result}`)
      setCommand('')
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left Pane: Host File System */}
      <div className="w-1/2 p-4 bg-gray-100">
        <h2 className="text-xl font-bold mb-2">Host File System</h2>
        <ScrollArea className="h-full">
          <ul>
            {hostFileSystem.map((path, index) => (
              <li key={index}>{path}</li>
            ))}
          </ul>
        </ScrollArea>
      </div>
      {/* Right Pane: Container File System and Command Interface */}
      <div className="w-1/2 flex flex-col">
        <h2 className="text-xl font-bold mb-2">Container File System</h2>
        <ScrollArea className="flex-grow p-4 bg-white">
          <ul>
            {containerFileSystem.map((path, index) => (
              <li key={index}>{path}</li>
            ))}
          </ul>
          <pre className="mt-4 bg-black text-green-400 font-mono p-2">{output}</pre>
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