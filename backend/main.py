import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import traceback
import json
from google.cloud import vision # We still use this for the best text extraction
# NEW: Import OpenAI library (used for OpenRouter)
import openai

# --- SETUP ---

# 1. Google Cloud Vision (for reading text)
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'google-credentials.json'
vision_client = vision.ImageAnnotatorClient()

# 2. AI Model (for understanding text)
load_dotenv()
# We use OPENAI_API_KEY environment variable to hold the OpenRouter key
API_KEY = os.getenv("OPENAI_API_KEY") 
if not API_KEY:
    raise ValueError("OpenAI/OpenRouter API Key not found. Please add OPENAI_API_KEY to your .env file.")

# NEW: Initialize OpenAI Client configured for OpenRouter
# This directs all requests to OpenRouter's endpoint
try:
    openai_client = openai.OpenAI(
        api_key=API_KEY,
        base_url="https://openrouter.ai/api/v1",
    )
except Exception as e:
    raise RuntimeError(f"Failed to initialize OpenAI client for OpenRouter: {e}")

# The model chosen for its low cost and reliability via OpenRouter
AI_MODEL_NAME = "openai/gpt-4o" 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print(f"Backend server is running with Google Cloud Vision + {AI_MODEL_NAME} (via OpenRouter) pipeline.")


@app.post("/analyze-images/")
async def analyze_images(front_image: UploadFile = File(...), back_image: UploadFile = File(None)):
    try:
        # --- Step 1: Get Accurate Text with Google Cloud Vision ---
        print("Step 1/2: Sending image(s) to Google Cloud Vision...")
        front_contents = await front_image.read()
        
        try:
            front_text = vision_client.text_detection(image=vision.Image(content=front_contents)).text_annotations[0].description
        except IndexError:
            front_text = "" # Handle case where no text is found

        back_text = ""
        if back_image:
            back_contents = await back_image.read()
            try:
                back_text_annotation = vision_client.text_detection(image=vision.Image(content=back_contents)).text_annotations
                if back_text_annotation:
                    back_text = back_text_annotation[0].description
            except IndexError:
                pass 
        
        combined_text = front_text + "\n" + back_text
        print(f"Text extracted. Now sending to {AI_MODEL_NAME} for parsing...")

        # --- Step 2: Use GPT-4o mini to Intelligently Parse the Text ---
        
        # The prompt content for the LLM
        prompt_content = f"""
        Analyze the following text extracted from a medicine package. Your task is to act as an expert pharmacist 
        and identify the specified details.

        Extracted Text:
        ---
        {combined_text}
        ---

        Return a single, clean JSON object. For each key, provide a nested object with "value" and "source".
        If you find the data in the text, set "source" to "image".
        If you CANNOT find the data, generate a realistic but placeholder example and set "source" to "generated".

        These are the 22 keys you must return:
        "medicineName", "brandName", "saltComposition", "strength", "form", "packSize", "description",
        "batchNumber", "expiryDate" (format YYYY-MM-DD), "initialQuantity", "purchasePrice", "mrp", "gstRate",
        "hsnCode", "gtinBarcode", "manufacturer", "marketingCompany", "isScheduleH1" (true/false),
        "minStockLevel", "maxStockLevel", "reorderLevel", "category", "abcClassification", "sellingPrice"
        
        Do not include any text or formatting outside of the single JSON object.
        """

        # Call OpenRouter API with JSON response format constraint
        openai_response = openai_client.chat.completions.create(
            model=AI_MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are an expert pharmacist generating clean JSON. Your output must be a valid JSON object only."},
                {"role": "user", "content": prompt_content},
            ],
            response_format={"type": "json_object"},
        )
        print(f"{AI_MODEL_NAME} analysis complete.")

        # The response content should be clean JSON due to response_format setting
        cleaned_text = openai_response.choices[0].message.content
        parsed_json = json.loads(cleaned_text)

        print("Parsed Data:", json.dumps(parsed_json, indent=2))

        return parsed_json

    except Exception as e:
        return {"error": f"An unexpected error occurred: {str(e)}", "trace": traceback.format_exc()}