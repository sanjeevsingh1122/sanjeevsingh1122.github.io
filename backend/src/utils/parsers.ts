import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import JSZip from 'jszip';

function xmlToText(xml: string) {
  return xml
    .replace(/<\/?\w+[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function extractPptxText(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const slideKeys = Object.keys(zip.files).filter((key) => key.startsWith('ppt/slides/slide') && key.endsWith('.xml'));
  const texts = await Promise.all(
    slideKeys.map(async (key) => {
      const file = zip.file(key);
      if (!file) return '';
      const xml = await file.async('string');
      return xmlToText(xml);
    })
  );
  return texts.join('\n');
}

export async function extractTextFromBuffer(buffer: Buffer, mimetype: string, filename: string): Promise<string> {
  if (mimetype === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filename.toLowerCase().endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    filename.toLowerCase().endsWith('.pptx')
  ) {
    return extractPptxText(buffer);
  }

  if (mimetype.startsWith('text/') || filename.toLowerCase().endsWith('.txt')) {
    return buffer.toString('utf-8');
  }

  throw new Error('Unsupported file type');
}
