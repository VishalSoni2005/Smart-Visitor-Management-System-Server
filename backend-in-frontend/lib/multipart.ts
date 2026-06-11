export interface MultipartFile {
  filename: string;
  contentType: string;
  content: Buffer;
}

export interface MultipartData {
  fields: Record<string, string>;
  files: Record<string, MultipartFile>;
}

export function parseMultipart(
  bodyBuffer: Buffer,
  contentTypeHeader: string
): MultipartData {
  const boundaryMatch = contentTypeHeader.match(/boundary=(.+)/);
  if (!boundaryMatch) {
    throw new Error("No boundary found in Content-Type header");
  }
  const boundary = boundaryMatch[1];
  
  const fields: Record<string, string> = {};
  const files: Record<string, MultipartFile> = {};
  
  // Split the buffer by boundary (which is prefixed by -- in the body)
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  
  let index = bodyBuffer.indexOf(boundaryBuffer);
  while (index !== -1) {
    const nextIndex = bodyBuffer.indexOf(boundaryBuffer, index + boundaryBuffer.length);
    if (nextIndex === -1) break;
    
    // Extract part (excluding the boundary bytes themselves)
    const partBuffer = bodyBuffer.slice(index + boundaryBuffer.length, nextIndex);
    
    // Header and content separator is \r\n\r\n
    const dividerIndex = partBuffer.indexOf(Buffer.from("\r\n\r\n"));
    if (dividerIndex !== -1) {
      const headerPart = partBuffer.slice(0, dividerIndex).toString("utf-8");
      // Content starts after \r\n\r\n and ends before the trailing \r\n (2 bytes) of the part
      const contentPart = partBuffer.slice(dividerIndex + 4, partBuffer.length - 2);
      
      // Parse Headers
      const nameMatch = headerPart.match(/name="([^"]+)"/);
      const filenameMatch = headerPart.match(/filename="([^"]+)"/);
      const contentTypeMatch = headerPart.match(/Content-Type:\s*([^\r\n]+)/i);
      
      if (nameMatch) {
        const name = nameMatch[1];
        if (filenameMatch) {
          files[name] = {
            filename: filenameMatch[1],
            contentType: contentTypeMatch ? contentTypeMatch[1].trim() : "application/octet-stream",
            content: contentPart,
          };
        } else {
          fields[name] = contentPart.toString("utf-8").trim();
        }
      }
    }
    
    index = nextIndex;
  }
  
  return { fields, files };
}
