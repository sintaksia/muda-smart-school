import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getSocialLinks,
  createSocialLink,
} from "@/src/features/cms/services/social-links";
import { socialLinkSchema } from "@/src/app/admin/cms/social-links/_components/SocialLinksSchema";

export async function GET() {
  try {
    const socialLinks = await getSocialLinks();
    return NextResponse.json(socialLinks);
  } catch (error) {
    console.error("Error fetching social links:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data tautan sosial" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = socialLinkSchema.parse(body);
    const socialLink = await createSocialLink(validated);

    revalidatePath("/admin/cms/social-links");
    return NextResponse.json(socialLink, { status: 201 });
  } catch (error) {
    console.error("Error creating social link:", error);

    if (error instanceof Error && "errors" in error) {
      return NextResponse.json(
        {
          error: "Data tidak valid",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Gagal membuat tautan sosial" },
      { status: 500 },
    );
  }
}
