from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import uvicorn
import json

app = FastAPI()

# Configure CORS with more specific settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Explicitly allow these methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Server is running"}

@app.post("/chat")
async def chat(request: Request):
    try:
        # Read the raw request body
        body = await request.body()
        print(f"Raw request body: {body}")  # Debug log
        
        # Try to parse the JSON body
        try:
            data = await request.json()
        except:
            # If JSON parsing fails, try to parse the raw body
            try:
                data = json.loads(body)
            except:
                print(f"Failed to parse JSON: {body}")  # Debug log
                return JSONResponse(
                    status_code=400,
                    content={"error": "Invalid JSON format", "received": str(body)}
                )
        
        print(f"Parsed JSON data: {data}")  # Debug log
        
        # Handle both string and object message formats
        message = None
        if isinstance(data, str):
            message = data
        elif isinstance(data, dict):
            message = data.get("message")
        
        if not message:
            return JSONResponse(
                status_code=400,
                content={"error": "Message is required", "received": data}
            )
            
        # Forward the request to Ollama
        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "hugbot",
                    "prompt": message,
                    "stream": False
                }
            )
            print(f"Ollama response: {response.text}")  # Debug log
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Ollama request error: {str(e)}")  # Debug log
            return JSONResponse(
                status_code=500,
                content={"error": f"Failed to connect to Ollama: {str(e)}"}
            )
    except Exception as e:
        print(f"Error: {str(e)}")  # Debug log
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 