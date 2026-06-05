import os
import logging
import pdfplumber
import PyPDF2

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts text from a PDF file using pdfplumber, falling back to PyPDF2.
    If the extracted text is empty or extremely short, it attempts Tesseract OCR as a fallback.
    If Tesseract is unavailable, it returns the text found so far without raising errors.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF file not found at {file_path}")

    text = ""
    
    # 1. Try pdfplumber
    try:
        logger.info(f"Attempting text extraction with pdfplumber: {file_path}")
        with pdfplumber.open(file_path) as pdf:
            pages = []
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    pages.append(page_text)
            text = "\n".join(pages).strip()
    except Exception as e:
        logger.warning(f"pdfplumber extraction failed for {file_path}: {e}")

    # 2. Try PyPDF2 as fallback if pdfplumber failed or returned empty
    if not text:
        try:
            logger.info(f"Attempting fallback text extraction with PyPDF2: {file_path}")
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                pages = []
                for page_num in range(len(reader.pages)):
                    page = reader.pages[page_num]
                    page_text = page.extract_text()
                    if page_text:
                        pages.append(page_text)
                text = "\n".join(pages).strip()
        except Exception as e:
            logger.warning(f"PyPDF2 extraction failed for {file_path}: {e}")

    # 3. OCR Fallback for scanned PDFs (less than 100 characters extracted)
    if len(text) < 100:
        logger.info("Extracted text is minimal. Attempting Tesseract OCR fallback...")
        try:
            # Import OCR libraries inside the block to avoid startup failure if they aren't fully configured
            import pytesseract
            from pdf2image import convert_from_path
            from PIL import Image
            
            # Convert PDF pages to PIL images
            # Note: poppler must be installed for pdf2image to work, so we wrap in try-except
            logger.info("Converting PDF pages to images for OCR...")
            images = convert_from_path(file_path)
            
            ocr_pages = []
            for i, image in enumerate(images):
                logger.info(f"Processing OCR for page {i+1}/{len(images)}...")
                page_text = pytesseract.image_to_string(image)
                if page_text:
                    ocr_pages.append(page_text)
                    
            ocr_text = "\n".join(ocr_pages).strip()
            if ocr_text:
                logger.info("OCR extraction succeeded.")
                text = ocr_text
            else:
                logger.warning("OCR extraction completed but returned empty text.")
                
        except ImportError as ie:
            logger.warning(f"OCR libraries not fully installed or imported: {ie}. Continuing with available text.")
        except Exception as e:
            logger.warning(f"OCR fallback failed (Tesseract or Poppler may not be installed/on PATH): {e}. Continuing with available text.")
            
    return text
