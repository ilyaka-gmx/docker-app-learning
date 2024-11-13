from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import re

app = FastAPI()

class DockerCommand(BaseModel):
    command: str
    dockerfile: str

class OutputAnalysis(BaseModel):
    output: str

def analyze_docker_command(command: str, dockerfile: str):
    parts = command.split()
    if parts[0] != "docker":
        return "Error: Not a docker command"
    
    if parts[1] == "build":
        return analyze_docker_build(parts[2:], dockerfile)
    elif parts[1] == "run":
        return analyze_docker_run(parts[2:])
    elif parts[1] == "image":
        return analyze_docker_image(parts[2:])
    else:
        return f"Simulating Docker command: {command}"

def analyze_docker_build(args, dockerfile):
    tag = "latest"
    for i, arg in enumerate(args):
        if arg == "-t" and i + 1 < len(args):
            tag = args[i+1]
            break
    
    stages = dockerfile.count("FROM")
    expose_ports = re.findall(r"EXPOSE\s+(\d+)", dockerfile)
    
    return f"Building image with tag: {tag}\n" \
           f"Dockerfile has {stages} stage(s)\n" \
           f"Exposed ports: {', '.join(expose_ports)}"

def analyze_docker_run(args):
    name = "unnamed"
    ports = []
    volumes = []
    
    for i, arg in enumerate(args):
        if arg == "--name" and i + 1 < len(args):
            name = args[i+1]
        elif arg == "-p" and i + 1 < len(args):
            ports.append(args[i+1])
        elif arg == "-v" and i + 1 < len(args):
            volumes.append(args[i+1])
    
    return f"Running container: {name}\n" \
           f"Mapped ports: {', '.join(ports)}\n" \
           f"Mounted volumes: {', '.join(volumes)}"

def analyze_docker_image(args):
    if args[0] == "ls":
        return "REPOSITORY          TAG       IMAGE ID       CREATED         SIZE\n" \
               "example-image       latest    1234567890ab   2 minutes ago   50MB"
    return f"Simulating Docker image command: docker image {' '.join(args)}"

@app.post("/api/docker-simulate")
async def simulate_docker(command: DockerCommand):
    try:
        result = analyze_docker_command(command.command, command.dockerfile)
        return {"output": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-output")
async def analyze_output(output: OutputAnalysis):
    analysis = "Output Analysis:\n\n"
    
    if "Error" in output.output:
        analysis += "An error occurred during command execution.\n"
        error_lines = [line for line in output.output.split('\n') if "Error" in line]
        analysis += "Errors found:\n" + "\n".join(error_lines)
    else:
        analysis += "Command executed successfully.\n"
        
    if "Building" in output.output:
        analysis += "A Docker image was built.\n"
        image_info = re.search(r"Successfully tagged (.+)", output.output)
        if image_info:
            analysis += f"Image tagged as: {image_info.group(1)}\n"
    if "Running" in output.output:
        analysis += "A Docker container was started.\n"
        
    ports = re.findall(r"Mapped ports: (.*)", output.output)
    if ports:
        analysis += f"Ports mapped: {ports[0]}\n"
        
    volumes = re.findall(r"Mounted volumes: (.*)", output.output)
    if volumes:
        analysis += f"Volumes mounted: {volumes[0]}\n"
    
    return {"analysis": analysis}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)