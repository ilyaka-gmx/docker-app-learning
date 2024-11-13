import os
import shutil

def create_directory_structure():
    base_dir = "docker-learning-app"
    dirs = [
        "conversation",
        "src/frontend",
        "src/backend",
        "docs"
    ]
    
    for dir in dirs:
        os.makedirs(os.path.join(base_dir, dir), exist_ok=True)

def save_conversation(conversation):
    with open("docker-learning-app/conversation/chat_log.md", "w") as f:
        f.write(conversation)

def save_code_files():
    frontend_code = """
    // Paste the content of docker-learning-app.tsx here
    """
    
    backend_code = """
    # Paste the content of main.py here
    """
    
    with open("docker-learning-app/src/frontend/docker-learning-app.tsx", "w") as f:
        f.write(frontend_code)
    
    with open("docker-learning-app/src/backend/main.py", "w") as f:
        f.write(backend_code)

def create_readme():
    readme_content = """
    # Paste the content of the README.md here
    """
    
    with open("docker-learning-app/README.md", "w") as f:
        f.write(readme_content)

def main():
    create_directory_structure()
    save_conversation("Paste your entire conversation here")
    save_code_files()
    create_readme()
    print("Project structure created successfully!")

if __name__ == "__main__":
    main()