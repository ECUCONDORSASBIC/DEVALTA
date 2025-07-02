#!/usr/bin/env node
// 🛡️ FRONTEND ERROR HANDLER & API LIMIT MANAGER
// Resuelve errores de frontend y límites de API para MCP servers

/**
 * 🔍 SAFE DOM TEXT EXTRACTION
 * Añade comprobación nula antes de usar innerText/textContent
 */
class SafeDOMHandler {
  /**
   * Safely extract text content from DOM elements
   * @param {Element|null} element - DOM element to extract text from
   * @param {string} fallback - Fallback text if element is null or has no text
   * @returns {string} - Safe text content
   */
  static safeInnerText(element, fallback = '') {
    try {
      if (!element) {
        console.warn('SafeDOMHandler: Element is null or undefined');
        return fallback;
      }

      // Check if element has innerText property
      if (typeof element.innerText === 'string') {
        return element.innerText.trim() || fallback;
      }

      // Fallback to textContent
      if (typeof element.textContent === 'string') {
        return element.textContent.trim() || fallback;
      }

      // Last resort: try innerHTML and strip tags
      if (typeof element.innerHTML === 'string') {
        const textOnly = element.innerHTML.replace(/<[^>]*>/g, '').trim();
        return textOnly || fallback;
      }

      console.warn('SafeDOMHandler: Element has no readable text content');
      return fallback;

    } catch (error) {
      console.error('SafeDOMHandler: Error extracting text content:', error);
      return fallback;
    }
  }

  /**
   * Safely extract multiple text contents from a collection of elements
   * @param {NodeList|Array} elements - Collection of DOM elements
   * @param {string} separator - Text separator for joining results
   * @param {string} fallback - Fallback if no valid text found
   * @returns {string} - Joined text content
   */
  static safeInnerTextMultiple(elements, separator = ' ', fallback = '') {
    try {
      if (!elements || !elements.length) {
        return fallback;
      }

      const textContents = [];
      
      for (let i = 0; i < elements.length; i++) {
        const text = this.safeInnerText(elements[i]);
        if (text) {
          textContents.push(text);
        }
      }

      return textContents.length > 0 ? textContents.join(separator) : fallback;

    } catch (error) {
      console.error('SafeDOMHandler: Error extracting multiple text contents:', error);
      return fallback;
    }
  }

  /**
   * Safely get attribute value from element
   * @param {Element|null} element - DOM element
   * @param {string} attributeName - Attribute name to extract
   * @param {string} fallback - Fallback value
   * @returns {string} - Safe attribute value
   */
  static safeAttribute(element, attributeName, fallback = '') {
    try {
      if (!element || typeof element.getAttribute !== 'function') {
        return fallback;
      }

      const value = element.getAttribute(attributeName);
      return value !== null ? value : fallback;

    } catch (error) {
      console.error(`SafeDOMHandler: Error getting attribute ${attributeName}:`, error);
      return fallback;
    }
  }
}

/**
 * 📝 PROMPT PAGINATION & TRUNCATION
 * Implementa paginación/recorte de prompts para evitar "prompt is too long" y "exceeded_limit"
 */
class PromptManager {
  constructor(options = {}) {
    // Default limits - can be configured per API provider
    this.limits = {
      maxPromptLength: options.maxPromptLength || 32000,      // Conservative limit
      maxTokens: options.maxTokens || 8000,                   // Approximate token limit
      chunkSize: options.chunkSize || 4000,                   // Size per chunk
      maxChunks: options.maxChunks || 10,                     // Maximum chunks to process
      overlapSize: options.overlapSize || 200,               // Overlap between chunks
      ...options.limits
    };

    this.currentProvider = options.provider || 'generic';
    this.providerLimits = {
      'openai': { maxPromptLength: 32000, maxTokens: 8000 },
      'anthropic': { maxPromptLength: 100000, maxTokens: 4000 },
      'google': { maxPromptLength: 30000, maxTokens: 8000 },
      'generic': { maxPromptLength: 32000, maxTokens: 8000 }
    };

    // Update limits based on provider
    if (this.providerLimits[this.currentProvider]) {
      Object.assign(this.limits, this.providerLimits[this.currentProvider]);
    }
  }

  /**
   * Estimate token count (rough approximation)
   * @param {string} text - Text to analyze
   * @returns {number} - Estimated token count
   */
  estimateTokens(text) {
    if (!text || typeof text !== 'string') return 0;
    
    // Rough estimation: 1 token ≈ 4 characters for English text
    // This is a conservative estimate
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if text exceeds limits
   * @param {string} text - Text to check
   * @returns {object} - Status and details
   */
  checkLimits(text) {
    const length = text ? text.length : 0;
    const estimatedTokens = this.estimateTokens(text);

    return {
      exceedsLength: length > this.limits.maxPromptLength,
      exceedsTokens: estimatedTokens > this.limits.maxTokens,
      currentLength: length,
      estimatedTokens,
      maxLength: this.limits.maxPromptLength,
      maxTokens: this.limits.maxTokens,
      needsPagination: length > this.limits.maxPromptLength || estimatedTokens > this.limits.maxTokens
    };
  }

  /**
   * Truncate text safely while preserving meaning
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length (optional, uses configured limit)
   * @returns {string} - Truncated text
   */
  safeTruncate(text, maxLength = null) {
    if (!text || typeof text !== 'string') return '';

    const limit = maxLength || this.limits.maxPromptLength;
    
    if (text.length <= limit) {
      return text;
    }

    // Try to truncate at word boundaries
    let truncated = text.substring(0, limit);
    const lastSpace = truncated.lastIndexOf(' ');
    const lastNewline = truncated.lastIndexOf('\n');
    const lastPeriod = truncated.lastIndexOf('.');

    // Find the best truncation point
    const cutPoint = Math.max(lastSpace, lastNewline, lastPeriod);
    
    if (cutPoint > limit * 0.8) { // Only use if we don't lose too much content
      truncated = text.substring(0, cutPoint);
    }

    return truncated + '\n\n[Content truncated due to length limits...]';
  }

  /**
   * Split text into manageable chunks for pagination
   * @param {string} text - Text to split
   * @param {object} options - Chunking options
   * @returns {Array} - Array of text chunks
   */
  createChunks(text, options = {}) {
    if (!text || typeof text !== 'string') return [''];

    const chunkSize = options.chunkSize || this.limits.chunkSize;
    const overlap = options.overlapSize || this.limits.overlapSize;
    const maxChunks = options.maxChunks || this.limits.maxChunks;

    if (text.length <= chunkSize) {
      return [text];
    }

    const chunks = [];
    let start = 0;

    while (start < text.length && chunks.length < maxChunks) {
      let end = start + chunkSize;
      
      // Don't exceed text length
      if (end >= text.length) {
        chunks.push(text.substring(start));
        break;
      }

      // Try to find a good break point
      let chunkText = text.substring(start, end);
      const lastSpace = chunkText.lastIndexOf(' ');
      const lastNewline = chunkText.lastIndexOf('\n');
      const lastPeriod = chunkText.lastIndexOf('.');

      const cutPoint = Math.max(lastSpace, lastNewline, lastPeriod);
      
      if (cutPoint > chunkSize * 0.7) {
        end = start + cutPoint + 1;
        chunkText = text.substring(start, end);
      }

      chunks.push(chunkText);
      
      // Move start position with overlap
      start = end - overlap;
      if (start < 0) start = 0;
    }

    // Add chunk metadata
    return chunks.map((chunk, index) => ({
      content: chunk,
      index: index + 1,
      total: chunks.length,
      start: index === 0 ? 0 : null,
      end: index === chunks.length - 1 ? text.length : null,
      estimatedTokens: this.estimateTokens(chunk)
    }));
  }

  /**
   * Process text for API consumption with automatic pagination
   * @param {string} text - Input text
   * @param {object} options - Processing options
   * @returns {object} - Processed result
   */
  processForAPI(text, options = {}) {
    try {
      if (!text || typeof text !== 'string') {
        return {
          success: false,
          error: 'Invalid input text',
          chunks: [],
          needsPagination: false
        };
      }

      const status = this.checkLimits(text);
      
      if (!status.needsPagination) {
        return {
          success: true,
          chunks: [{
            content: text,
            index: 1,
            total: 1,
            estimatedTokens: status.estimatedTokens
          }],
          needsPagination: false,
          totalLength: text.length,
          totalTokens: status.estimatedTokens
        };
      }

      // Text needs pagination
      let processedText = text;
      
      if (options.truncate && status.exceedsLength) {
        processedText = this.safeTruncate(text);
        
        return {
          success: true,
          chunks: [{
            content: processedText,
            index: 1,
            total: 1,
            estimatedTokens: this.estimateTokens(processedText),
            truncated: true
          }],
          needsPagination: false,
          totalLength: processedText.length,
          totalTokens: this.estimateTokens(processedText),
          originalLength: text.length,
          truncated: true
        };
      }

      // Create chunks
      const chunks = this.createChunks(processedText, options);
      const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.estimatedTokens, 0);

      return {
        success: true,
        chunks,
        needsPagination: true,
        totalLength: text.length,
        totalTokens,
        chunkCount: chunks.length,
        processingStrategy: 'pagination'
      };

    } catch (error) {
      console.error('PromptManager: Error processing text for API:', error);
      return {
        success: false,
        error: error.message,
        chunks: [],
        needsPagination: false
      };
    }
  }

  /**
   * Smart content summarization for long texts
   * @param {string} text - Text to summarize
   * @param {number} targetLength - Target summary length
   * @returns {string} - Summarized text
   */
  smartSummarize(text, targetLength = 1000) {
    if (!text || text.length <= targetLength) {
      return text;
    }

    // Simple extractive summarization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const avgSentenceLength = text.length / sentences.length;
    const targetSentences = Math.floor(targetLength / avgSentenceLength);

    if (targetSentences >= sentences.length) {
      return text;
    }

    // Keep first, middle, and last sentences for context
    const summary = [];
    const step = Math.floor(sentences.length / targetSentences);
    
    for (let i = 0; i < sentences.length; i += step) {
      if (summary.length < targetSentences) {
        summary.push(sentences[i].trim());
      }
    }

    return summary.join('. ') + '.\n\n[Content summarized to fit limits...]';
  }
}

/**
 * 🔒 CSP AND RESOURCE MANAGER
 * Ajusta permisos CSP o URLs de recursos externos
 */
class CSPManager {
  constructor() {
    this.allowedDomains = new Set([
      'localhost',
      '127.0.0.1',
      'cdn.jsdelivr.net',
      'unpkg.com',
      'cdnjs.cloudflare.com'
    ]);

    this.allowedProtocols = new Set(['https:', 'http:', 'data:', 'blob:']);
  }

  /**
   * Generate safe CSP header for MCP applications
   * @param {object} options - CSP configuration options
   * @returns {string} - CSP header value
   */
  generateCSPHeader(options = {}) {
    const config = {
      allowInlineScripts: options.allowInlineScripts || false,
      allowInlineStyles: options.allowInlineStyles || true,
      allowEval: options.allowEval || false,
      additionalDomains: options.additionalDomains || [],
      ...options
    };

    const directives = [];

    // Default source policy
    const defaultSrc = ["'self'"];
    if (config.additionalDomains.length > 0) {
      defaultSrc.push(...config.additionalDomains);
    }
    directives.push(`default-src ${defaultSrc.join(' ')}`);

    // Script source policy
    const scriptSrc = ["'self'"];
    if (config.allowInlineScripts) {
      scriptSrc.push("'unsafe-inline'");
    }
    if (config.allowEval) {
      scriptSrc.push("'unsafe-eval'");
    }
    scriptSrc.push(...Array.from(this.allowedDomains));
    directives.push(`script-src ${scriptSrc.join(' ')}`);

    // Style source policy
    const styleSrc = ["'self'"];
    if (config.allowInlineStyles) {
      styleSrc.push("'unsafe-inline'");
    }
    styleSrc.push(...Array.from(this.allowedDomains));
    directives.push(`style-src ${styleSrc.join(' ')}`);

    // Image source policy
    const imgSrc = ["'self'", "data:", "blob:"];
    imgSrc.push(...Array.from(this.allowedDomains));
    directives.push(`img-src ${imgSrc.join(' ')}`);

    // Font source policy
    const fontSrc = ["'self'", "data:"];
    fontSrc.push(...Array.from(this.allowedDomains));
    directives.push(`font-src ${fontSrc.join(' ')}`);

    // Connect source policy (for AJAX, WebSocket, etc.)
    const connectSrc = ["'self'"];
    connectSrc.push(...Array.from(this.allowedDomains));
    directives.push(`connect-src ${connectSrc.join(' ')}`);

    return directives.join('; ');
  }

  /**
   * Validate and sanitize resource URL
   * @param {string} url - URL to validate
   * @returns {object} - Validation result
   */
  validateResourceURL(url) {
    try {
      if (!url || typeof url !== 'string') {
        return { valid: false, error: 'Invalid URL format' };
      }

      const urlObj = new URL(url);
      
      // Check protocol
      if (!this.allowedProtocols.has(urlObj.protocol)) {
        return { 
          valid: false, 
          error: `Protocol ${urlObj.protocol} not allowed`,
          suggestion: `Use https: instead of ${urlObj.protocol}`
        };
      }

      // Check domain for external resources
      if (urlObj.protocol === 'https:' || urlObj.protocol === 'http:') {
        const hostname = urlObj.hostname;
        
        if (!this.allowedDomains.has(hostname) && !hostname.includes('localhost')) {
          return {
            valid: false,
            error: `Domain ${hostname} not in allowed list`,
            suggestion: `Add ${hostname} to allowed domains or use a CDN`
          };
        }
      }

      return { 
        valid: true, 
        url: url,
        protocol: urlObj.protocol,
        hostname: urlObj.hostname
      };

    } catch (error) {
      return {
        valid: false,
        error: `Invalid URL: ${error.message}`
      };
    }
  }

  /**
   * Generate safe resource URL with fallbacks
   * @param {string} resource - Resource name or URL
   * @param {string} type - Resource type (script, style, image, etc.)
   * @returns {string} - Safe resource URL
   */
  generateSafeResourceURL(resource, type = 'script') {
    if (!resource) return '';

    // If already a full URL, validate it
    if (resource.startsWith('http') || resource.startsWith('//')) {
      const validation = this.validateResourceURL(resource);
      if (validation.valid) {
        return resource;
      } else {
        console.warn(`CSPManager: Invalid resource URL ${resource}: ${validation.error}`);
        return this.getFallbackURL(resource, type);
      }
    }

    // Generate URL for popular libraries
    const cdnMappings = {
      'react': 'https://unpkg.com/react@18/umd/react.production.min.js',
      'react-dom': 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
      'vue': 'https://unpkg.com/vue@3/dist/vue.global.prod.js',
      'jquery': 'https://code.jquery.com/jquery-3.6.0.min.js',
      'bootstrap': 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
      'tailwind': 'https://cdn.tailwindcss.com'
    };

    if (cdnMappings[resource]) {
      return cdnMappings[resource];
    }

    // Default CDN construction
    return `https://unpkg.com/${resource}`;
  }

  /**
   * Get fallback URL for blocked resources
   * @param {string} resource - Original resource
   * @param {string} type - Resource type
   * @returns {string} - Fallback URL
   */
  getFallbackURL(resource, type) {
    const fallbacks = {
      script: 'data:text/javascript,console.log("Script blocked by CSP");',
      style: 'data:text/css,/* Style blocked by CSP */',
      image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text y="50" font-size="14">Image blocked</text></svg>'
    };

    return fallbacks[type] || '';
  }

  /**
   * Add allowed domain to CSP
   * @param {string} domain - Domain to allow
   */
  addAllowedDomain(domain) {
    if (domain && typeof domain === 'string') {
      this.allowedDomains.add(domain);
    }
  }

  /**
   * Remove domain from allowed list
   * @param {string} domain - Domain to remove
   */
  removeAllowedDomain(domain) {
    this.allowedDomains.delete(domain);
  }
}

/**
 * 🚨 ERROR RECOVERY UTILITIES
 * Advanced error recovery and graceful degradation
 */
class ErrorRecoveryManager {
  constructor() {
    this.errorCounts = new Map();
    this.maxRetries = 3;
    this.retryDelays = [1000, 2000, 5000]; // Progressive backoff
  }

  /**
   * Handle API limit errors with automatic recovery
   * @param {Error} error - The error to handle
   * @param {Function} retryFunction - Function to retry
   * @param {object} context - Error context
   * @returns {Promise} - Recovery result
   */
  async handleAPILimitError(error, retryFunction, context = {}) {
    const errorKey = `${context.endpoint || 'unknown'}_${error.message}`;
    const currentCount = this.errorCounts.get(errorKey) || 0;

    if (currentCount >= this.maxRetries) {
      console.error('ErrorRecovery: Max retries reached for', errorKey);
      throw new Error(`Max retries exceeded: ${error.message}`);
    }

    this.errorCounts.set(errorKey, currentCount + 1);

    // Determine recovery strategy based on error type
    if (error.message.includes('prompt is too long') || error.message.includes('exceeded_limit')) {
      console.log('ErrorRecovery: Applying prompt truncation strategy');
      
      // Apply prompt management
      const promptManager = new PromptManager();
      
      if (context.prompt) {
        const processed = promptManager.processForAPI(context.prompt, { truncate: true });
        
        if (processed.success) {
          context.prompt = processed.chunks[0].content;
          console.log(`ErrorRecovery: Truncated prompt from ${context.originalLength || 'unknown'} to ${context.prompt.length} characters`);
        }
      }
    }

    if (error.message.includes('rate limit') || error.message.includes('quota')) {
      const delay = this.retryDelays[currentCount - 1] || 5000;
      console.log(`ErrorRecovery: Rate limit detected, waiting ${delay}ms before retry`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Retry the operation
    try {
      const result = await retryFunction(context);
      
      // Reset error count on success
      this.errorCounts.delete(errorKey);
      
      return result;
    } catch (retryError) {
      return this.handleAPILimitError(retryError, retryFunction, context);
    }
  }

  /**
   * Graceful degradation for frontend errors
   * @param {Error} error - The error that occurred
   * @param {object} fallbackData - Fallback data to use
   * @returns {object} - Graceful fallback result
   */
  gracefulDegrade(error, fallbackData = {}) {
    console.warn('ErrorRecovery: Applying graceful degradation for:', error.message);

    return {
      success: false,
      error: error.message,
      fallback: true,
      data: fallbackData,
      message: 'Feature temporarily unavailable. Using fallback data.',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reset error counts (useful for testing or manual recovery)
   */
  resetErrorCounts() {
    this.errorCounts.clear();
  }
}

// Export all utilities
export {
  SafeDOMHandler,
  PromptManager,
  CSPManager,
  ErrorRecoveryManager
};

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SafeDOMHandler,
    PromptManager,
    CSPManager,
    ErrorRecoveryManager
  };
}
