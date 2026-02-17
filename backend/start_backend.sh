SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$SCRIPT_DIR"

echo "Current directory: $(pwd)"
echo "Starting backend server..."

if command -v pipenv &> /dev/null; then
    echo "Using pipenv..."
    pipenv run python run.py
else
    echo "Pipenv not found, trying direct Python..."
    python run.py
fi
