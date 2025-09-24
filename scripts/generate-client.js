#!/usr/bin/env node

/**
 * TypeScript API client generator for VerityInspect
 * 
 * This script:
 * 1. Fetches the OpenAPI schema from the Django backend
 * 2. Generates TypeScript types and client code
 * 3. Creates type-safe API methods
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';
const OUTPUT_DIR = path.join(__dirname, '../apps/web/src/generated');

async function fetchSchema() {
  console.log('Fetching OpenAPI schema...');
  
  const url = `${API_BASE_URL}/api/schema/`;
  const client = url.startsWith('https') ? https : http;
  
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const schema = JSON.parse(data);
          resolve(schema);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

function generateTypes(schema) {
  console.log('Generating TypeScript types...');
  
  const components = schema.components || {};
  const schemas = components.schemas || {};
  
  let output = `// Generated TypeScript types for VerityInspect API
// Generated at: ${new Date().toISOString()}

`;

  // Generate interfaces for each schema
  for (const [name, schemaObj] of Object.entries(schemas)) {
    if (schemaObj.type === 'object' && schemaObj.properties) {
      output += generateInterface(name, schemaObj);
    }
  }
  
  // Add common response types
  output += `
// Common API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}
`;

  return output;
}

function generateInterface(name, schema) {
  const properties = schema.properties || {};
  const required = schema.required || [];
  
  let output = `export interface ${name} {\n`;
  
  for (const [propName, propSchema] of Object.entries(properties)) {
    const isRequired = required.includes(propName);
    const optional = isRequired ? '' : '?';
    const type = mapSchemaType(propSchema);
    
    // Add JSDoc comment if description exists
    if (propSchema.description) {
      output += `  /** ${propSchema.description} */\n`;
    }
    
    output += `  ${propName}${optional}: ${type};\n`;
  }
  
  output += '}\n\n';
  return output;
}

function mapSchemaType(schema) {
  if (!schema) return 'any';
  
  switch (schema.type) {
    case 'string':
      if (schema.enum) {
        return schema.enum.map(v => `'${v}'`).join(' | ');
      }
      if (schema.format === 'date-time') {
        return 'string'; // Could be Date if we want to parse
      }
      return 'string';
      
    case 'integer':
    case 'number':
      return 'number';
      
    case 'boolean':
      return 'boolean';
      
    case 'array':
      const itemType = mapSchemaType(schema.items);
      return `${itemType}[]`;
      
    case 'object':
      if (schema.additionalProperties) {
        const valueType = mapSchemaType(schema.additionalProperties);
        return `Record<string, ${valueType}>`;
      }
      return 'Record<string, any>';
      
    default:
      // Handle $ref
      if (schema.$ref) {
        const refName = schema.$ref.split('/').pop();
        return refName;
      }
      return 'any';
  }
}

function generateClient(schema) {
  console.log('Generating API client...');
  
  const paths = schema.paths || {};
  
  let output = `// Generated API client for VerityInspect
// Generated at: ${new Date().toISOString()}

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse, ApiError } from './types';

export class VerityInspectClient {
  private client: AxiosInstance;
  
  constructor(baseURL: string = '${API_BASE_URL}/api', token?: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (token) {
      this.setAuthToken(token);
    }
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message,
          code: error.response?.data?.code,
          details: error.response?.data,
        };
        return Promise.reject(apiError);
      }
    );
  }
  
  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;
  }
  
  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

`;

  // Generate methods for each endpoint
  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (typeof operation !== 'object') continue;
      
      const methodName = generateMethodName(path, method, operation);
      const methodCode = generateMethod(path, method, operation, methodName);
      output += methodCode;
    }
  }
  
  output += '}\n\n';
  output += 'export default VerityInspectClient;\n';
  
  return output;
}

function generateMethodName(path, method, operation) {
  // Use operationId if available
  if (operation.operationId) {
    return operation.operationId;
  }
  
  // Generate method name from path and method
  const cleanPath = path
    .replace('/api/', '')
    .replace(/{[^}]+}/g, '') // Remove path parameters
    .replace(/\/$/, '') // Remove trailing slash
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  const methodPrefix = method.toLowerCase();
  
  return `${methodPrefix}_${cleanPath}`;
}

function generateMethod(path, httpMethod, operation, methodName) {
  const parameters = operation.parameters || [];
  const pathParams = parameters.filter(p => p.in === 'path');
  const queryParams = parameters.filter(p => p.in === 'query');
  const hasRequestBody = operation.requestBody !== undefined;
  
  // Build parameter list
  const paramList = [];
  
  // Add path parameters
  pathParams.forEach(param => {
    paramList.push(`${param.name}: ${mapParameterType(param)}`);
  });
  
  // Add request body parameter
  if (hasRequestBody) {
    paramList.push('data: any'); // Could be more specific based on schema
  }
  
  // Add query parameters as optional object
  if (queryParams.length > 0) {
    paramList.push('params?: Record<string, any>');
  }
  
  const params = paramList.join(', ');
  
  // Build URL construction
  let urlConstruction = `'${path}'`;
  pathParams.forEach(param => {
    urlConstruction = urlConstruction.replace(`{${param.name}}`, `\${${param.name}}`);
  });
  
  // Determine return type
  const returnType = 'Promise<AxiosResponse<any>>';
  
  // Generate method body
  const methodBody = generateMethodBody(httpMethod, hasRequestBody, queryParams.length > 0);
  
  return `  async ${methodName}(${params}): ${returnType} {
    return this.client.${httpMethod}(${urlConstruction}${methodBody});
  }

`;
}

function generateMethodBody(httpMethod, hasRequestBody, hasQueryParams) {
  const parts = [];
  
  if (hasRequestBody && ['post', 'put', 'patch'].includes(httpMethod)) {
    parts.push('data');
  }
  
  if (hasQueryParams || (!hasRequestBody && ['get', 'delete'].includes(httpMethod))) {
    parts.push('{ params }');
  }
  
  return parts.length > 0 ? ', ' + parts.join(', ') : '';
}

function mapParameterType(param) {
  switch (param.schema?.type) {
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    default:
      return 'string';
  }
}

async function main() {
  try {
    console.log('Starting VerityInspect TypeScript client generation...');
    
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Fetch schema
    const schema = await fetchSchema();
    
    // Generate types
    const types = generateTypes(schema);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'types.ts'), types);
    console.log('✓ Types generated');
    
    // Generate client
    const client = generateClient(schema);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'client.ts'), client);
    console.log('✓ Client generated');
    
    // Generate index file
    const index = `export * from './types';
export { default as VerityInspectClient } from './client';
export { VerityInspectClient as Client } from './client';
`;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.ts'), index);
    console.log('✓ Index file generated');
    
    console.log(`\nTypeScript client generated successfully in ${OUTPUT_DIR}`);
    console.log('\nUsage example:');
    console.log(`
import { VerityInspectClient } from './generated';

const client = new VerityInspectClient();
client.setAuthToken('your-jwt-token');

// Use the client
const videos = await client.get_videos();
const upload = await client.post_uploads_request_presigned_url({
  filename: 'video.mp4',
  store_id: 1,
  mode: 'inspection'
});
`);
    
  } catch (error) {
    console.error('Error generating client:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}