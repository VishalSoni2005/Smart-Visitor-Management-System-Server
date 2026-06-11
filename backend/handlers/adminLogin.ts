import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as bcrypt from "bcryptjs";
import { getAdminByEmail, saveAdmin } from "../lib/dynamo";
import { signToken } from "../lib/jwt";

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH,DELETE",
};

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: HEADERS, body: "" };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ success: false, error: "Missing request body" }),
      };
    }

    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({
          success: false,
          error: "Email and password are required",
        }),
      };
    }

    // Dynamic Seed: If table is empty for default admin, seed it.
    let admin = await getAdminByEmail(email);

    if (!admin && email === "admin@company.com") {
      const passwordHash = await bcrypt.hash(password, 10);
      await saveAdmin({
        email: "admin@company.com",
        passwordHash,
      });
      admin = await getAdminByEmail(email);
    }

    if (!admin) {
      return {
        statusCode: 401,
        headers: HEADERS,
        body: JSON.stringify({ success: false, error: "Invalid credentials" }),
      };
    }

    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);

    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers: HEADERS,
        body: JSON.stringify({
          success: false,
          error: "Invalid credentials, Wrong password",
        }),
      };
    }

    const token = signToken({ email: admin.email });

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        success: true,
        data: { token, email: admin.email },
      }),
    };
  } catch (error: any) {
    console.error("Admin Login Error:", error);
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
