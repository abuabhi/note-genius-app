/**
 * Helper functions for Google Cloud Vision API integration
 */

/**
 * Get access token using service account (FIXED)
 */
export async function getAccessToken(credentials: any): Promise<string> {
  const jwt = await generateJWT(credentials);
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

/**
 * Upload PDF to Google Cloud Storage with service account authentication
 */
export async function uploadToGCSWithServiceAccount(
  pdfBuffer: ArrayBuffer, 
  bucket: string, 
  fileName: string, 
  credentials: any
): Promise<string> {
  const accessToken = await getAccessToken(credentials);
  const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${fileName}`;
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/pdf',
    },
    body: pdfBuffer
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload to GCS: ${response.status} ${errorText}`);
  }
  
  return `gs://${bucket}/${fileName}`;
}

/**
 * Start async batch annotation job with service account authentication
 */
export async function startAsyncBatchAnnotation(
  inputUri: string, 
  bucket: string, 
  credentials: any
): Promise<string> {
  const accessToken = await getAccessToken(credentials);
  const url = 'https://vision.googleapis.com/v1/files:asyncBatchAnnotate';
  const outputPrefix = `vision-output-${Date.now()}`;
  
  const requestBody = {
    requests: [
      {
        inputConfig: {
          gcsSource: { uri: inputUri },
          mimeType: 'application/pdf'
        },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        outputConfig: {
          gcsDestination: { uri: `gs://${bucket}/${outputPrefix}/` },
          batchSize: 2
        }
      }
    ]
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to start async annotation: ${response.status} ${errorText}`);
  }
  
  const result = await response.json();
  return result.name;
}

/**
 * Poll operation until complete with service account authentication
 */
export async function pollOperationUntilComplete(
  operationName: string, 
  credentials: any, 
  maxAttempts = 30
): Promise<string> {
  const accessToken = await getAccessToken(credentials);
  const url = `https://vision.googleapis.com/v1/${operationName}`;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to poll operation: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.done) {
      if (result.error) {
        throw new Error(`Vision API operation failed: ${JSON.stringify(result.error)}`);
      }
      
      const outputUri = result.response?.responses?.[0]?.outputConfig?.gcsDestination?.uri;
      if (!outputUri) {
        throw new Error('No output URI found in operation result');
      }
      
      return outputUri;
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Polling attempt ${attempt + 1}/${maxAttempts} - operation still running...`);
  }
  
  throw new Error('Operation timed out after maximum polling attempts');
}

/**
 * Download and parse results from GCS with service account authentication
 */
export async function downloadAndParseResults(outputUri: string, credentials: any): Promise<string> {
  const accessToken = await getAccessToken(credentials);
  const bucketMatch = outputUri.match(/gs:\/\/([^\/]+)\/(.+)/);
  if (!bucketMatch) {
    throw new Error('Invalid output URI format');
  }
  
  const bucket = bucketMatch[1];
  const prefix = bucketMatch[2];
  
  // List files in the output directory
  const listUrl = `https://storage.googleapis.com/storage/v1/b/${bucket}/o?prefix=${encodeURIComponent(prefix)}`;
  
  const listResponse = await fetch(listUrl, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  if (!listResponse.ok) {
    const errorText = await listResponse.text();
    throw new Error(`Failed to list output files: ${listResponse.status} ${errorText}`);
  }
  
  const listResult = await listResponse.json();
  const jsonFiles = listResult.items?.filter((item: any) => item.name.endsWith('.json')) || [];
  
  if (jsonFiles.length === 0) {
    throw new Error('No JSON result files found in output directory');
  }
  
  // Download the first JSON file
  const fileName = jsonFiles[0].name;
  const downloadUrl = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(fileName)}?alt=media`;
  
  const downloadResponse = await fetch(downloadUrl, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  if (!downloadResponse.ok) {
    const errorText = await downloadResponse.text();
    throw new Error(`Failed to download result file: ${downloadResponse.status} ${errorText}`);
  }
  
  const resultData = await downloadResponse.json();
  
  // Extract text from the result
  let extractedText = '';
  if (resultData.responses && resultData.responses.length > 0) {
    for (const response of resultData.responses) {
      if (response.fullTextAnnotation && response.fullTextAnnotation.text) {
        extractedText += response.fullTextAnnotation.text + '\n';
      }
    }
  }
  
  if (!extractedText.trim()) {
    throw new Error('No text content found in Vision API results');
  }
  
  return extractedText.trim();
}

/**
 * Clean up temporary files from GCS with service account authentication
 */
export async function cleanupGCSFiles(bucket: string, fileName: string, credentials: any): Promise<void> {
  try {
    const accessToken = await getAccessToken(credentials);
    const deleteUrl = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(fileName)}`;
    
    await fetch(deleteUrl, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    console.log('Cleaned up temporary PDF file');
  } catch (error) {
    console.warn('Failed to cleanup temporary files:', error.message);
  }
}

/**
 * Generate JWT token for service account authentication (FIXED)
 */
async function generateJWT(credentials: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };
  
  // Create JWT header
  const header = { alg: 'RS256', typ: 'JWT' };
  
  // Encode header and payload
  const encodedHeader = btoa(JSON.stringify(header)).replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' })[m]);
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' })[m]);
  
  // Fix private key parsing - handle both escaped and raw formats
  let privateKeyPem = credentials.private_key;
  
  // If the key has literal \n strings, replace them with actual newlines
  if (privateKeyPem.includes('\\n')) {
    privateKeyPem = privateKeyPem.replace(/\\n/g, '\n');
  }
  
  // Ensure proper PEM format and extract the actual key content
  if (!privateKeyPem.startsWith('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('Invalid private key format - must be PKCS#8 PEM format');
  }
  
  try {
    // Extract the base64 content between the PEM headers
    const pemContent = privateKeyPem
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, ''); // Remove all whitespace including newlines
    
    // Convert base64 to binary
    const binaryString = atob(pemContent);
    const keyBuffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      keyBuffer[i] = binaryString.charCodeAt(i);
    }
    
    // Import private key with proper error handling
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      keyBuffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Sign the token
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );
    
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' })[m]);
    
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
    
  } catch (keyError) {
    console.error('Private key import error:', keyError);
    throw new Error(`Failed to import private key: ${keyError.message}. Ensure the service account JSON contains a valid PKCS#8 private key.`);
  }
}
