import mammoth from 'mammoth';
import { UploadedFileItem } from '../types/quiz';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per file
export const MAX_TOTAL_SIZE_BYTES = 25 * 1024 * 1024; // 25MB total
export const MAX_FILE_COUNT = 5;

export interface FileProcessResult {
  item?: UploadedFileItem;
  error?: string;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function processUploadedFile(file: File): Promise<FileProcessResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      error: `"${file.name}" exceeds the 10MB limit (${formatBytes(file.size)}).`,
    };
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const fileType = file.type;

  const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  try {
    // 1. Text & Markdown
    if (['txt', 'md', 'markdown', 'csv', 'json'].includes(extension) || fileType.startsWith('text/')) {
      const text = await file.text();
      if (!text.trim()) {
        return { error: `"${file.name}" appears to be empty.` };
      }
      return {
        item: {
          id: fileId,
          name: file.name,
          size: file.size,
          type: fileType || 'text/plain',
          textContent: text,
        },
      };
    }

    // 2. DOCX Word Documents
    if (extension === 'docx' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const extractedText = result.value.trim();
      if (!extractedText) {
        return { error: `Could not extract readable text from "${file.name}". Ensure it is not password protected.` };
      }
      return {
        item: {
          id: fileId,
          name: file.name,
          size: file.size,
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          textContent: extractedText,
        },
      };
    }

    // 3. PDF Documents (sent as base64 for Gemini multimodal processing & OCR)
    if (extension === 'pdf' || fileType === 'application/pdf') {
      const base64Data = await fileToBase64Data(file);
      return {
        item: {
          id: fileId,
          name: file.name,
          size: file.size,
          type: 'application/pdf',
          base64Data,
        },
      };
    }

    // 4. Images (JPG, PNG, WebP) - for handwritten notes, textbook photos, whiteboard slides
    if (['png', 'jpg', 'jpeg', 'webp'].includes(extension) || fileType.startsWith('image/')) {
      const base64Data = await fileToBase64Data(file);
      return {
        item: {
          id: fileId,
          name: file.name,
          size: file.size,
          type: fileType || `image/${extension === 'jpg' ? 'jpeg' : extension}`,
          base64Data,
        },
      };
    }

    // 5. PPTX Presentation Slides (extract raw text strings or provide guidance)
    if (extension === 'pptx' || fileType.includes('presentationml')) {
      // PPTX is a zip of XML files; we can read plain text by parsing slide XMLs if needed, or read as text chunks
      const text = await extractPptxText(file);
      if (text && text.trim().length > 30) {
        return {
          item: {
            id: fileId,
            name: file.name,
            size: file.size,
            type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            textContent: text,
          },
        };
      }
      return {
        error: `Could not extract slide text from "${file.name}". Tip: Save slides as PDF or export notes for best results.`,
      };
    }

    return {
      error: `Unsupported format ".${extension}". Supported: PDF, DOCX, TXT, MD, PPTX, JPG, PNG, WebP.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown parsing error';
    return {
      error: `Failed to process "${file.name}": ${message}`,
    };
  }
}

function fileToBase64Data(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip data:mime/type;base64, prefix
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

async function extractPptxText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const raw = decoder.decode(arrayBuffer);
    // Find text inside <a:t>...</a:t> PowerPoint slide text tags
    const regex = /<a:t[^>]*>([^<]+)<\/a:t>/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(raw)) !== null) {
      if (match[1]?.trim()) {
        matches.push(match[1].trim());
      }
    }
    return matches.join(' ');
  } catch {
    return '';
  }
}
