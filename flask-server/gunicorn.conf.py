"""Gunicorn configuration for production deployment"""

# Worker Options
workers = 4  # Adjust based on your server's CPU cores
worker_class = 'sync'
threads = 2
timeout = 120

# Server Socket
bind = "0.0.0.0:$PORT"  # Uses the PORT env var set by Render

# Server Mechanics
preload_app = True
daemon = False  # For containerized environments

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# App module specification
wsgi_app = 'app:app'

# Reload on file changes (useful for development, remove in strict production)
# reload = True

def on_starting(server):
    """Log when the server starts"""
    server.log.info("Starting Assignment Checker API server")
