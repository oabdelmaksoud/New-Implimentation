# Multi-format File Processing

## Overview

The Multi-format File Processing component is a critical part of the Knowledge Management and Learning phase. It enables the system to ingest, process, and extract knowledge from various file formats, making the information accessible to agents. This document outlines the detailed implementation plan for the Multi-format File Processing system.

## Objectives

- Implement file format detection and validation
- Create parsers for various document formats
- Develop knowledge extraction from different file types
- Implement file conversion and normalization

## Tasks

1. **File Format Detection**
   - Implement MIME type detection
   - Create file signature analysis
   - Develop format validation
   - Implement metadata extraction

2. **Document Parsing**
   - Create text document parsers
   - Implement structured document parsers
   - Develop binary document parsers
   - Create media file parsers

3. **Knowledge Extraction**
   - Implement text extraction
   - Create entity recognition
   - Develop relationship extraction
   - Implement semantic analysis

4. **File Conversion**
   - Create format conversion
   - Implement content normalization
   - Develop structure preservation
   - Create accessibility enhancements

## Micro-Level Implementation Details

### File Format Handling

```typescript
// Supported File Format
interface SupportedFormat {
  id: string;                     // Unique format ID
  name: string;                   // Format name
  mimeTypes: string[];            // MIME types
  extensions: string[];           // File extensions
  signatures: Uint8Array[];       // Binary signatures
  category: FormatCategory;       // Format category
  parser: string;                 // Parser ID
  metadata: Map<string, any>;     // Additional metadata
}

// Format Category
enum FormatCategory {
  TEXT = 'text',
  DOCUMENT = 'document',
  SPREADSHEET = 'spreadsheet',
  PRESENTATION = 'presentation',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  ARCHIVE = 'archive',
  CODE = 'code',
  DATA = 'data',
  OTHER = 'other'
}

// File Parser
interface FileParser {
  id: string;                     // Unique parser ID
  name: string;                   // Parser name
  supportedFormats: string[];     // Supported format IDs
  parseFile(file: ProcessedFile): Promise<ParsedContent>; // Parse method
  extractMetadata(file: ProcessedFile): Promise<Map<string, any>>; // Metadata extraction
  validateFile(file: ProcessedFile): Promise<boolean>; // Validation method
  metadata: Map<string, any>;     // Additional metadata
}

// Processed File
interface ProcessedFile {
  id: string;                     // Unique file ID
  name: string;                   // File name
  path: string;                   // File path
  size: number;                   // File size in bytes
  mimeType: string;               // MIME type
  extension: string;              // File extension
  formatId?: string;              // Detected format ID
  content: Buffer | string;       // File content
  metadata: Map<string, any>;     // File metadata
  createdAt: Date;                // Creation timestamp
  updatedAt: Date;                // Last update timestamp
}

// Parsed Content
interface ParsedContent {
  fileId: string;                 // Source file ID
  formatId: string;               // Format ID
  contentType: ContentType;       // Content type
  textContent?: string;           // Extracted text
  structuredContent?: any;        // Structured content
  sections?: ContentSection[];    // Content sections
  entities?: ExtractedEntity[];   // Extracted entities
  relationships?: ExtractedRelationship[]; // Extracted relationships
  metadata: Map<string, any>;     // Content metadata
  confidence: number;             // Parsing confidence (0-1)
}

// Content Type
enum ContentType {
  TEXT = 'text',
  HTML = 'html',
  MARKDOWN = 'markdown',
  JSON = 'json',
  XML = 'xml',
  CSV = 'csv',
  STRUCTURED = 'structured',
  BINARY = 'binary'
}

// Content Section
interface ContentSection {
  id: string;                     // Section ID
  title?: string;                 // Section title
  level: number;                  // Section level
  content: string;                // Section content
  startOffset: number;            // Start offset in document
  endOffset: number;              // End offset in document
  parentId?: string;              // Parent section ID
  metadata: Map<string, any>;     // Section metadata
}

// Extracted Entity
interface ExtractedEntity {
  id: string;                     // Entity ID
  type: string;                   // Entity type
  value: string;                  // Entity value
  startOffset: number;            // Start offset in document
  endOffset: number;              // End offset in document
  confidence: number;             // Extraction confidence (0-1)
  metadata: Map<string, any>;     // Entity metadata
}

// Extracted Relationship
interface ExtractedRelationship {
  id: string;                     // Relationship ID
  type: string;                   // Relationship type
  sourceEntityId: string;         // Source entity ID
  targetEntityId: string;         // Target entity ID
  confidence: number;             // Extraction confidence (0-1)
  metadata: Map<string, any>;     // Relationship metadata
}

// File Converter
interface FileConverter {
  id: string;                     // Unique converter ID
  name: string;                   // Converter name
  sourceFormats: string[];        // Source format IDs
  targetFormats: string[];        // Target format IDs
  convertFile(file: ProcessedFile, targetFormatId: string): Promise<ProcessedFile>; // Convert method
  metadata: Map<string, any>;     // Additional metadata
}
```

### File Processing System

```typescript
// File Processing System
class FileProcessingSystem {
  private db: Database;
  private supportedFormats: Map<string, SupportedFormat>;
  private parsers: Map<string, FileParser>;
  private converters: Map<string, FileConverter>;
  private processingQueue: ProcessingQueue;
  
  constructor(db: Database) {
    this.db = db;
    this.supportedFormats = new Map();
    this.parsers = new Map();
    this.converters = new Map();
    this.processingQueue = new ProcessingQueue();
  }
  
  async initialize(): Promise<void> {
    // Load supported formats from database
    const formatData = await this.db.supportedFormats.findAll();
    for (const data of formatData) {
      const format: SupportedFormat = {
        id: data.uuid,
        name: data.name,
        mimeTypes: data.mime_types,
        extensions: data.extensions,
        signatures: data.signatures.map(s => new Uint8Array(s)),
        category: data.category as FormatCategory,
        parser: data.parser,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.supportedFormats.set(format.id, format);
    }
    
    // Register built-in parsers
    this.registerBuiltInParsers();
    
    // Register built-in converters
    this.registerBuiltInConverters();
  }
  
  private registerBuiltInParsers(): void {
    // Text parser
    this.registerParser({
      id: 'text-parser',
      name: 'Text Parser',
      supportedFormats: ['text-plain', 'text-csv', 'text-markdown'],
      parseFile: async (file: ProcessedFile): Promise<ParsedContent> => {
        // Basic text parsing
        const textContent = file.content.toString('utf-8');
        
        return {
          fileId: file.id,
          formatId: file.formatId,
          contentType: ContentType.TEXT,
          textContent,
          metadata: new Map(),
          confidence: 1.0
        };
      },
      extractMetadata: async (file: ProcessedFile): Promise<Map<string, any>> => {
        // Extract basic metadata
        const metadata = new Map<string, any>();
        metadata.set('charCount', file.content.toString('utf-8').length);
        metadata.set('lineCount', file.content.toString('utf-8').split('\n').length);
        
        return metadata;
      },
      validateFile: async (file: ProcessedFile): Promise<boolean> => {
        // Validate text file
        try {
          const text = file.content.toString('utf-8');
          return text.length > 0;
        } catch (error) {
          return false;
        }
      },
      metadata: new Map()
    });
    
    // Markdown parser
    this.registerParser({
      id: 'markdown-parser',
      name: 'Markdown Parser',
      supportedFormats: ['text-markdown'],
      parseFile: async (file: ProcessedFile): Promise<ParsedContent> => {
        // Parse markdown
        const textContent = file.content.toString('utf-8');
        const sections: ContentSection[] = [];
        
        // Extract sections based on headers
        const headerRegex = /^(#{1,6})\s+(.+)$/gm;
        let match;
        let lastIndex = 0;
        let sectionId = 0;
        
        while ((match = headerRegex.exec(textContent)) !== null) {
          const level = match[1].length;
          const title = match[2].trim();
          const startOffset = match.index;
          
          // Add previous section
          if (startOffset > lastIndex) {
            sections.push({
              id: `section-${sectionId++}`,
              level: 0,
              content: textContent.substring(lastIndex, startOffset).trim(),
              startOffset: lastIndex,
              endOffset: startOffset,
              metadata: new Map()
            });
          }
          
          // Find end of this section (next header or end of file)
          const nextMatch = headerRegex.exec(textContent);
          const endOffset = nextMatch ? nextMatch.index : textContent.length;
          headerRegex.lastIndex = match.index + match[0].length; // Reset regex to continue from current match
          
          // Add current section
          sections.push({
            id: `section-${sectionId++}`,
            title,
            level,
            content: textContent.substring(startOffset + match[0].length, endOffset).trim(),
            startOffset,
            endOffset,
            metadata: new Map()
          });
          
          lastIndex = endOffset;
        }
        
        // Add final section if needed
        if (lastIndex < textContent.length) {
          sections.push({
            id: `section-${sectionId++}`,
            level: 0,
            content: textContent.substring(lastIndex).trim(),
            startOffset: lastIndex,
            endOffset: textContent.length,
            metadata: new Map()
          });
        }
        
        return {
          fileId: file.id,
          formatId: file.formatId,
          contentType: ContentType.MARKDOWN,
          textContent,
          sections,
          metadata: new Map(),
          confidence: 1.0
        };
      },
      extractMetadata: async (file: ProcessedFile): Promise<Map<string, any>> => {
        // Extract markdown metadata
        const metadata = new Map<string, any>();
        const text = file.content.toString('utf-8');
        
        // Count headers
        const h1Count = (text.match(/^#\s+.+$/gm) || []).length;
        const h2Count = (text.match(/^##\s+.+$/gm) || []).length;
        const h3Count = (text.match(/^###\s+.+$/gm) || []).length;
        
        metadata.set('h1Count', h1Count);
        metadata.set('h2Count', h2Count);
        metadata.set('h3Count', h3Count);
        
        // Count code blocks
        const codeBlockCount = (text.match(/```[\s\S]*?```/g) || []).length;
        metadata.set('codeBlockCount', codeBlockCount);
        
        return metadata;
      },
      validateFile: async (file: ProcessedFile): Promise<boolean> => {
        // Validate markdown file
        try {
          const text = file.content.toString('utf-8');
          // Check for some markdown features
          return text.includes('#') || text.includes('*') || text.includes('```');
        } catch (error) {
          return false;
        }
      },
      metadata: new Map()
    });
    
    // JSON parser
    this.registerParser({
      id: 'json-parser',
      name: 'JSON Parser',
      supportedFormats: ['application-json'],
      parseFile: async (file: ProcessedFile): Promise<ParsedContent> => {
        // Parse JSON
        const textContent = file.content.toString('utf-8');
        const structuredContent = JSON.parse(textContent);
        
        return {
          fileId: file.id,
          formatId: file.formatId,
          contentType: ContentType.JSON,
          textContent,
          structuredContent,
          metadata: new Map(),
          confidence: 1.0
        };
      },
      extractMetadata: async (file: ProcessedFile): Promise<Map<string, any>> => {
        // Extract JSON metadata
        const metadata = new Map<string, any>();
        try {
          const json = JSON.parse(file.content.toString('utf-8'));
          
          // Get top-level keys
          if (typeof json === 'object' && json !== null) {
            metadata.set('topLevelKeys', Object.keys(json));
            metadata.set('objectDepth', this.calculateObjectDepth(json));
          }
        } catch (error) {
          // Ignore parsing errors
        }
        
        return metadata;
      },
      validateFile: async (file: ProcessedFile): Promise<boolean> => {
        // Validate JSON file
        try {
          JSON.parse(file.content.toString('utf-8'));
          return true;
        } catch (error) {
          return false;
        }
      },
      metadata: new Map()
    });
    
    // CSV parser
    this.registerParser({
      id: 'csv-parser',
      name: 'CSV Parser',
      supportedFormats: ['text-csv'],
      parseFile: async (file: ProcessedFile): Promise<ParsedContent> => {
        // Parse CSV
        const textContent = file.content.toString('utf-8');
        const lines = textContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        if (lines.length === 0) {
          throw new Error('Empty CSV file');
        }
        
        // Parse header
        const headers = this.parseCSVLine(lines[0]);
        
        // Parse rows
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
          const values = this.parseCSVLine(lines[i]);
          
          // Create row object
          const row = {};
          for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = j < values.length ? values[j] : '';
          }
          
          rows.push(row);
        }
        
        return {
          fileId: file.id,
          formatId: file.formatId,
          contentType: ContentType.CSV,
          textContent,
          structuredContent: {
            headers,
            rows
          },
          metadata: new Map(),
          confidence: 1.0
        };
      },
      extractMetadata: async (file: ProcessedFile): Promise<Map<string, any>> => {
        // Extract CSV metadata
        const metadata = new Map<string, any>();
        const text = file.content.toString('utf-8');
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        if (lines.length > 0) {
          const headers = this.parseCSVLine(lines[0]);
          metadata.set('columnCount', headers.length);
          metadata.set('rowCount', lines.length - 1);
          metadata.set('headers', headers);
        }
        
        return metadata;
      },
      validateFile: async (file: ProcessedFile): Promise<boolean> => {
        // Validate CSV file
        try {
          const text = file.content.toString('utf-8');
          const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
          
          if (lines.length === 0) {
            return false;
          }
          
          // Check if all rows have the same number of columns
          const headerCount = this.parseCSVLine(lines[0]).length;
          
          for (let i = 1; i < lines.length; i++) {
            const columnCount = this.parseCSVLine(lines[i]).length;
            if (columnCount !== headerCount && columnCount !== 0) {
              return false;
            }
          }
          
          return true;
        } catch (error) {
          return false;
        }
      },
      metadata: new Map()
    });
    
    // HTML parser
    this.registerParser({
      id: 'html-parser',
      name: 'HTML Parser',
      supportedFormats: ['text-html'],
      parseFile: async (file: ProcessedFile): Promise<ParsedContent> => {
        // Parse HTML
        const textContent = file.content.toString('utf-8');
        
        // Use JSDOM to parse HTML
        const { JSDOM } = require('jsdom');
        const dom = new JSDOM(textContent);
        const document = dom.window.document;
        
        // Extract text content
        const extractedText = document.body.textContent;
        
        // Extract sections based on headings
        const sections: ContentSection[] = [];
        let sectionId = 0;
        
        // Process headings
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        for (let i = 0; i < headings.length; i++) {
          const heading = headings[i];
          const level = parseInt(heading.tagName.substring(1));
          const title = heading.textContent.trim();
          
          // Find content until next heading
          let content = '';
          let nextElement = heading.nextElementSibling;
          
          while (nextElement && !nextElement.tagName.match(/^H[1-6]$/)) {
            content += nextElement.textContent + '\n';
            nextElement = nextElement.nextElementSibling;
          }
          
          sections.push({
            id: `section-${sectionId++}`,
            title,
            level,
            content: content.trim(),
            startOffset: textContent.indexOf(heading.outerHTML),
            endOffset: nextElement ? textContent.indexOf(nextElement.outerHTML) : textContent.length,
            metadata: new Map()
          });
        }
        
        return {
          fileId: file.id,
          formatId: file.formatId,
          contentType: ContentType.HTML,
          textContent: extractedText,
          sections,
          metadata: new Map(),
          confidence: 1.0
        };
      },
      extractMetadata: async (file: ProcessedFile): Promise<Map<string, any>> => {
        // Extract HTML metadata
        const metadata = new Map<string, any>();
        
        // Use JSDOM to parse HTML
        const { JSDOM } = require('jsdom');
        const dom = new JSDOM(file.content.toString('utf-8'));
        const document = dom.window.document;
        
        // Extract title
        const title = document.querySelector('title');
        if (title) {
          metadata.set('title', title.textContent);
        }
        
        // Extract meta tags
        const metaTags = document.querySelectorAll('meta');
        const metaData = {};
        
        for (let i = 0; i < metaTags.length; i++) {
          const meta = metaTags[i];
          const name = meta.getAttribute('name') || meta.getAttribute('property');
          const content = meta.getAttribute('content');
          
          if (name && content) {
            metaData[name] = content;
          }
        }
        
        metadata.set('meta', metaData);
        
        // Count elements
        metadata.set('linkCount', document.querySelectorAll('a').length);
        metadata.set('imageCount', document.querySelectorAll('img').length);
        metadata.set('scriptCount', document.querySelectorAll('script').length);
        metadata.set('styleCount', document.querySelectorAll('style').length);
        
        return metadata;
      },
      validateFile: async (file: ProcessedFile): Promise<boolean> => {
        // Validate HTML file
        try {
          const { JSDOM } = require('jsdom');
          new JSDOM(file.content.toString('utf-8'));
          return true;
        } catch (error) {
          return false;
        }
      },
      metadata: new Map()
    });
    
    // PDF parser
    this.registerParser({
      id: 'pdf-parser',
      name: 'PDF Parser',
      supportedFormats: ['application-pdf'],
      parseFile: async (file: ProcessedFile): Promise<ParsedContent> => {
        // Parse PDF
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(file.content);
        
        // Extract text content
        const textContent = data.text;
        
        // Extract sections based on font size changes
        // Note: This is a simplified approach; real PDF parsing is more complex
        const sections: ContentSection[] = [];
        let sectionId = 0;
        
        // Simple section extraction based on line breaks
        const lines = textContent.split('\n');
        let currentSection = {
          id: `section-${sectionId++}`,
          level: 0,
          content: '',
          startOffset: 0,
          endOffset: 0,
          metadata: new Map()
        };
        
        let offset = 0;
        for (const line of lines) {
          // Heuristic: Lines with few words and ending with numbers might be headers
          if (line.trim().length > 0 && line.split(' ').length <= 5 && /\d+$/.test(line)) {
            // Save previous section if it has content
            if (currentSection.content.trim().length > 0) {
              currentSection.endOffset = offset;
              sections.push(currentSection);
            }
            
            // Start new section
            currentSection = {
              id: `section-${sectionId++}`,
              title: line.trim(),
              level: 1, // Assume level 1 for simplicity
              content: '',
              startOffset: offset,
              endOffset: 0,
              metadata: new Map()
            };
          } else {
            // Add to current section
            currentSection.content += line + '\n';
          }
          
          offset += line.length + 1; // +1 for newline
        }
        
        // Add final section
        if (currentSection.content.trim().length > 0) {
          currentSection.endOffset = offset;
          sections.push(currentSection);
        }
        
        return {
          fileId: file.id,
          formatId: file.formatId,
          contentType: ContentType.TEXT,
          textContent,
          sections,
          metadata: new Map([
            ['pageCount', data.numpages],
            ['author', data.info?.Author || ''],
            ['title', data.info?.Title || '']
          ]),
          confidence: 0.8 // PDF parsing is not always perfect
        };
      },
      extractMetadata: async (file: ProcessedFile): Promise<Map<string, any>> => {
        // Extract PDF metadata
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(file.content);
        
        const metadata = new Map<string, any>();
        metadata.set('pageCount', data.numpages);
        metadata.set('info', data.info);
        metadata.set('version', data.version);
        
        return metadata;
      },
      validateFile: async (file: ProcessedFile): Promise<boolean> => {
        // Validate PDF file
        try {
          // Check PDF signature
          const signature = file.content.slice(0, 5).toString('utf-8');
          return signature === '%PDF-';
        } catch (error) {
          return false;
        }
      },
      metadata: new Map()
    });
  }
  
  private registerBuiltInConverters(): void {
    // Markdown to HTML converter
    this.registerConverter({
      id: 'markdown-to-html',
      name: 'Markdown to HTML Converter',
      sourceFormats: ['text-markdown'],
      targetFormats: ['text-html'],
      convertFile: async (file: ProcessedFile, targetFormatId: string): Promise<ProcessedFile> => {
        // Convert Markdown to HTML
        const marked = require('marked');
        const markdown = file.content.toString('utf-8');
        const html = marked(markdown);
        
        // Create new processed file
        const newFile: ProcessedFile = {
          id: uuidv4(),
          name: file.name.replace(/\.md$/, '.html'),
          path: file.path.replace(/\.md$/, '.html'),
          size: Buffer.from(html).length,
          mimeType: 'text/html',
          extension: 'html',
          formatId: targetFormatId,
          content: Buffer.from(html),
          metadata: new Map([...file.metadata, ['sourceFileId', file.id]]),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return newFile;
      },
      metadata: new Map()
    });
    
    // HTML to Text converter
    this.registerConverter({
      id: 'html-to-text',
      name: 'HTML to Text Converter',
      sourceFormats: ['text-html'],
      targetFormats: ['text-plain'],
      convertFile: async (file: ProcessedFile, targetFormatId: string): Promise<ProcessedFile> => {
        // Convert HTML to Text
        const { JSDOM } = require('jsdom');
        const dom = new JSDOM(file.content.toString('utf-8'));
        const text = dom.window.document.body.textContent;
        
        // Create new processed file
        const newFile: ProcessedFile = {
          id: uuidv4(),
          name: file.name.replace(/\.html$/, '.txt'),
          path: file.path.replace(/\.html$/, '.txt'),
          size: Buffer.from(text).length,
          mimeType: 'text/plain',
          extension: 'txt',
          formatId: targetFormatId,
          content: Buffer.from(text),
          metadata: new Map([...file.metadata, ['sourceFileId', file.id]]),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return newFile;
      },
      metadata: new Map()
    });
    
    // PDF to Text converter
    this.registerConverter({
      id: 'pdf-to-text',
      name: 'PDF to Text Converter',
      sourceFormats: ['application-pdf'],
      targetFormats: ['text-plain'],
      convertFile: async (file: ProcessedFile, targetFormatId: string): Promise<ProcessedFile> => {
        // Convert PDF to Text
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(file.content);
        const text = data.text;
        
        // Create new processed file
        const newFile: ProcessedFile = {
          id: uuidv4(),
          name: file.name.replace(/\.pdf$/, '.txt'),
          path: file.path.replace(/\.pdf$/, '.txt'),
          size: Buffer.from(text).length,
          mimeType: 'text/plain',
          extension: 'txt',
          formatId: targetFormatId,
          content: Buffer.from(text),
          metadata: new Map([...file.metadata, ['sourceFileId', file.id]]),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return newFile;
      },
      metadata: new Map()
    });
  }
  
  async registerFormat(formatData: Omit<SupportedFormat, 'id'>): Promise<string> {
    // Generate format ID
    const formatId = uuidv4();
    
    // Create format object
    const format: SupportedFormat = {
      id: formatId,
      ...formatData
    };
    
    // Validate format
    this.validateFormat(format);
    
    // Add to memory
    this.supportedFormats.set(formatId, format);
    
    // Store in database
    await this.db.supportedFormats.create({
      uuid: formatId,
      name: format.name,
      mime_types: format.mimeTypes,
      extensions: format.extensions,
      signatures: format.signatures.map(s => Array.from(s)),
      category: format.category,
      parser: format.parser,
      metadata: Object.fromEntries(format.metadata)
    });
    
    return formatId;
  }
  
  async registerParser(parser: FileParser): Promise<void> {
    // Validate parser
    this.validateParser(parser);
    
    // Add to memory
    this.parsers.set(parser.id, parser);
    
    // Store in database (if needed)
    // Note: Built-in parsers might not need to be stored
  }
  
  async registerConverter(converter: FileConverter): Promise<void> {
    // Validate converter
    this.validateConverter(converter);
    
    // Add to memory
    this.converters.set(converter.id, converter);
    
    // Store in database (if needed)
    // Note: Built-in converters might not need to be stored
  }
  
  async processFile(filePath: string): Promise<ProcessedFile> {
    // Read file
    const fs = require('fs');
    const path = require('path');
    
    const content = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);
    const name = path.basename(filePath);
    const extension = path.extname(filePath).substring(1).toLowerCase();
    
    // Create processed file
    const file: ProcessedFile = {
      id: uuidv4(),
      name,
      path: filePath,
      size: stats.size,
      mimeType: this.getMimeType(extension),
      extension,
      content,
      metadata: new Map(),
      createdAt: stats.birthtime,
      updatedAt: stats.mtime
    };
    
    // Detect format
    const formatId = await this.detectFormat(file);
    if (formatId) {
      file.formatId = formatId;
    }
    
    // Extract metadata
    const metadata = await this.extractMetadata(file);
    file.metadata = metadata;
    
    // Store in database
    await this.db.processedFiles.create({
      uuid: file.id,
      name: file.name,
      path: file.path,
      size: file.size,
      mime_type: file.mimeType,
      extension: file.extension,
      format_id: file.formatId,
      metadata: Object.fromEntries(file.metadata),
      created_at: file.createdAt,
      updated_at: file.updatedAt
    });
    
    return file;
  }
  
  async parseFile(fileId: string): Promise<ParsedContent> {
    // Get file
    const file = await this.getProcessedFile(fileId);
    
    // Check if format is detected
    if (!file.formatId) {
      throw new Error(`Format
