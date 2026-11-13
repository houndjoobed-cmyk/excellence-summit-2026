import { NextResponse } from "next/server";
import {
  buildQrVerificationUrl,
  generateQrCodePngBuffer,
  resolveRequestOrigin,
  verifyQrToken,
} from "@/lib/badge";
import { isSessionSecretConfigured } from "@/lib/site";

export async function GET(request: Request) {
  if (!isSessionSecretConfigured()) {
    return NextResponse.json(
      {
        error: {
          code: "SIGNING_NOT_CONFIGURED",
          message: "Configuration de signature serveur manquante.",
        },
      },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const badgeCode = searchParams.get("code")?.trim().toUpperCase() || "";
  const qrToken = searchParams.get("t")?.trim() || "";

  if (!verifyQrToken(badgeCode, qrToken)) {
    return NextResponse.json(
      { error: "Invalid badge QR signature." },
      { status: 403 },
    );
  }

  try {
    const origin = resolveRequestOrigin(request);
    const verificationUrl = buildQrVerificationUrl(badgeCode, qrToken, origin);
    const pngBuffer = await generateQrCodePngBuffer(verificationUrl);

    return new Response(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="badge-${badgeCode}.png"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[GET /api/badges/qr] error:", err);
    return NextResponse.json(
      { error: "Could not render QR image." },
      { status: 500 },
    );
  }
}
