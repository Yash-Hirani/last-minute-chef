"""
HTTP server wrapping the RecipeEngine.
Run once: python3 recipe_server.py
Your Next.js API route calls: http://localhost:5001/search
"""
import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from recipe_engine import RecipeEngine

# Build index once at startup
dataset_path = os.path.join(os.path.dirname(__file__), 'Cleaned_Indian_Food_Dataset.csv')
engine = RecipeEngine(dataset_path)

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args): pass  # silence default logs

    def do_POST(self):
        if self.path != '/search':
            self._send(404, {'error': 'Not found'}); return
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))
            ingredients = body.get('ingredients', [])
            if not ingredients:
                self._send(400, {'error': 'ingredients required'}); return

            results = engine.search(
                user_ingredients=ingredients,
                top_n=body.get('top_n', 4),
                max_missing=body.get('max_missing', 5),
                cuisine_filter=body.get('cuisine_filter'),
                max_time_mins=body.get('max_time_mins'),
                vegetarian_only=body.get('vegetarian_only', False),
            )
            self._send(200, {'results': results})
        except Exception as e:
            self._send(500, {'error': str(e)})

    def _send(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(body))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

if __name__ == '__main__':
    server = HTTPServer(('localhost', 5001), Handler)
    print("Recipe server running on http://localhost:5001")
    server.serve_forever()
