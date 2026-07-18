import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getSocialLinkById,
  updateSocialLink,
  deleteSocialLink,
  toggleSocialLinkStatus,
} from "@/src/features/cms/services/social-links";
import { socialLinkSchema } from "@/src/app/admin/cms/social-links/_components/SocialLinksSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const socialLink = await getSocialLinkById(id);

    if (!socialLink) {
      return NextResponse.json(
        { error: "Tautan sosial tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(socialLink);
  } catch (error) {
    console.error("Error fetching social link:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data tautan sosial" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    const body = await request.json();
    const validated = socialLinkSchema.parse(body);
    const socialLink = await updateSocialLink(id, validated);
    revalidatePath("/admin/cms/social-links");
    revalidatePath("/kontak");
    revalidatePath("/", "layout");
    return NextResponse.json(socialLink);
  } catch (error) {
    console.error("Error updating social link:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Data tidak valid", details: error },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal memperbarui tautan sosial" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    const body = await request.json();

    if (typeof body.isActive === "boolean") {
      const socialLink = await toggleSocialLinkStatus(id, body.isActive);
      revalidatePath("/admin/cms/social-links");
      revalidatePath("/kontak");
      revalidatePath("/", "layout");
      return NextResponse.json(socialLink);
    }

    return NextResponse.json({ error: "Operasi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Error patching social link:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui tautan sosial" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    await deleteSocialLink(id);

    revalidatePath("/admin/cms/social-links");
    revalidatePath("/kontak");
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting social link:", error);
    return NextResponse.json(
      { error: "Gagal menghapus tautan sosial" },
      { status: 500 },
    );
  }
}
