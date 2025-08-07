import subprocess
import sys

# Check if pnpm is installed
try:
    result = subprocess.run(["pnpm", "--version"], capture_output=True, text=True, shell=True)
    if result.returncode == 0:
        print(f"pnpm is installed: {result.stdout.strip()}")
    else:
        print("pnpm is not installed")
        print("Installing pnpm via npm...")
        # Try to install pnpm globally using npm
        install_result = subprocess.run(["npm", "install", "-g", "pnpm"], capture_output=True, text=True, shell=True)
        if install_result.returncode == 0:
            print("pnpm installed successfully!")
        else:
            print(f"Failed to install pnpm: {install_result.stderr}")
except Exception as e:
    print(f"Error checking pnpm: {e}")