import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import * as QRCode from "qrcode";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveVisitor } from "../lib/dynamo";
import { uploadPhoto, uploadGatePass } from "../lib/s3";
import { parseMultipart } from "../lib/multipart";

export interface Visitor {
  visitorId: string;
  name: string;
  phone: string;
  email?: string;
  purpose: "Meeting" | "Interview" | "Delivery" | "Other";
  hostName: string;
  hostDepartment: string;
  photoUrl: string;
  gatePassUrl: string;
  visitorToken: string;
  status: "checked-in" | "checked-out";
  checkInTime: string;
  checkOutTime: string | null;
  createdAt: string;
}

export interface Admin {
  email: string;
  passwordHash: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH,DELETE",
};

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Helper to generate a 6-character alphanumeric token
function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log("event for creating visition: ", event);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: HEADERS, body: "" };
  }

  try {
    const contentTypeHeader =
      event.headers["Content-Type"] || event.headers["content-type"] || "";

    if (!contentTypeHeader.includes("multipart/form-data")) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({
          success: false,
          error: "Request Content-Type must be multipart/form-data",
        }),
      };
    }

    console.log("event for creating visition: ", event);

    const bodyBuffer = event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64")
      : Buffer.from(event.body || "");

    const { fields, files } = parseMultipart(bodyBuffer, contentTypeHeader);

    const name = fields.name;
    const phone = fields.phone;
    const email = fields.email;
    const purpose = fields.purpose;
    const hostName = fields.hostName;
    const hostDepartment = fields.hostDepartment;
    const photoFile = files.photo;

    console.log("photo filename:", photoFile.filename);
    console.log("photo contentType:", photoFile.contentType);
    console.log("photo size:", photoFile.content.length);

    console.log(
      "photo signature:",
      photoFile.content.subarray(0, 20).toString("hex"),
    );

    // Validate inputs
    if (
      !name ||
      !phone ||
      !purpose ||
      !hostName ||
      !hostDepartment ||
      !photoFile
    ) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({
          success: false,
          error:
            "All fields except Email are required, including webcam photo capture.",
        }),
      };
    }

    const visitorId = uuidv4();
    const visitorToken = generateToken();
    const now = new Date().toISOString();

    // 1. Upload photo to S3
    const photoUrl = await uploadPhoto(
      visitorId,
      photoFile.content,
      photoFile.contentType,
    );

    console.log("Photo url of S3: ", photoUrl);

    // 2. Generate QR Code
    const checkoutUrl = `${FRONTEND_URL}/checkout?token=${visitorToken}`;
    const qrDataUrl = await QRCode.toDataURL(checkoutUrl, {
      margin: 1,
      width: 150,
    });
    const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

    // 3. Generate Gate Pass PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    // Compact pass dimensions: 320pt wide by 500pt high
    const page = pdfDoc.addPage([320, 500]);
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Colors
    const deepNavy = rgb(15 / 255, 23 / 255, 42 / 255);
    const accentBlue = rgb(59 / 255, 130 / 255, 246 / 255);
    const lightGray = rgb(241 / 255, 245 / 255, 249 / 255);
    const darkGray = rgb(100 / 255, 116 / 255, 139 / 255);

    // Draw header
    page.drawRectangle({
      x: 0,
      y: height - 60,
      width,
      height: 60,
      color: deepNavy,
    });

    page.drawText("VISITOR GATE PASS", {
      x: 20,
      y: height - 38,
      size: 18,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawRectangle({
      x: 0,
      y: height - 65,
      width,
      height: 5,
      color: accentBlue,
    });

    // Embed Visitor Photo (JPEG or PNG)
    // let photoImage;
    // if (photoFile.contentType.includes("png")) {
    //   photoImage = await pdfDoc.embedPng(photoFile.content);
    // } else {
    //   console.log("contentType:", photoFile.contentType);

    //   console.log(
    //     "before embedJpg signature:",
    //     photoFile.content.subarray(0, 20).toString("hex"),
    //   );

    //   console.log(
    //     "before embedJpg trailer:",
    //     photoFile.content
    //       .subarray(photoFile.content.length - 10)
    //       .toString("hex"),
    //   );
    //   photoImage = await pdfDoc.embedJpg(photoFile.content);
    // }

    console.log("Skipping photo embedding");

    // Draw photo container border & photo
    page.drawRectangle({
      x: width / 2 - 50,
      y: height - 190,
      width: 100,
      height: 100,
      color: lightGray,
    });
    // page.drawImage(photoImage, {
    //   x: width / 2 - 46,
    //   y: height - 186,
    //   width: 92,
    //   height: 92,
    // });

    // Draw fields
    const drawField = (label: string, value: string, yPos: number) => {
      page.drawText(label, {
        x: 30,
        y: yPos,
        size: 9,
        font: fontBold,
        color: darkGray,
      });
      page.drawText(value, {
        x: 120,
        y: yPos,
        size: 10,
        font: fontRegular,
        color: deepNavy,
      });
    };

    let currentY = height - 220;
    const lineSpacing = 20;

    drawField("Visitor Name:", name, currentY);
    currentY -= lineSpacing;
    drawField("Phone Number:", phone, currentY);
    currentY -= lineSpacing;
    if (email) {
      drawField("Email Address:", email, currentY);
      currentY -= lineSpacing;
    }
    drawField("Purpose of Visit:", purpose, currentY);
    currentY -= lineSpacing;
    drawField("Host Employee:", hostName, currentY);
    currentY -= lineSpacing;
    drawField("Host Department:", hostDepartment, currentY);
    currentY -= lineSpacing;

    // Format check-in time nicely
    const formattedDate = new Date(now).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    drawField("Check-In Time:", formattedDate, currentY);

    // Draw QR Code
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    const qrSize = 75;
    page.drawImage(qrImage, {
      x: width - 30 - qrSize,
      y: 25,
      width: qrSize,
      height: qrSize,
    });

    // Token Section
    page.drawText("VISITOR TOKEN", {
      x: 30,
      y: 80,
      size: 9,
      font: fontBold,
      color: darkGray,
    });

    page.drawText(visitorToken, {
      x: 30,
      y: 50,
      size: 22,
      font: fontBold,
      color: accentBlue,
    });

    // Divider line at the bottom
    page.drawLine({
      start: { x: 20, y: 20 },
      end: { x: width - 20, y: 20 },
      thickness: 1,
      color: lightGray,
    });

    // Footer
    page.drawText(
      "This pass is valid for single visit only. Scan QR code to check out.",
      {
        x: 20,
        y: 8,
        size: 7,
        font: fontRegular,
        color: darkGray,
      },
    );

    // Save and upload PDF
    const pdfBytes = await pdfDoc.save();
    const gatePassUrl = await uploadGatePass(visitorId, Buffer.from(pdfBytes));

    // 4. Save visitor record in DynamoDB
    const visitor: Visitor = {
      visitorId,
      name,
      phone,
      email,
      purpose: purpose as Visitor["purpose"],
      hostName,
      hostDepartment,
      photoUrl,
      gatePassUrl,
      visitorToken,
      status: "checked-in",
      checkInTime: now,
      checkOutTime: null,
      createdAt: now,
    };

    await saveVisitor(visitor);

    return {
      statusCode: 201,
      headers: HEADERS,
      body: JSON.stringify({
        success: true,
        data: visitor,
      }),
    };
  } catch (error: any) {
    console.error("Create Visitor Error:", error);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
    };
  }
};
