"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function createJobApplication(formData: FormData) {
    const jobOfferId = formData.get("jobOfferId") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const linkedIn = formData.get("linkedIn") as string;
    const coverLetter = formData.get("coverLetter") as string;
    
    // Handle CV File Upload
    const cvFile = formData.get("cvFile") as File;
    let cvUrl = "";

    if (cvFile && cvFile.size > 0) {
        // Validate File
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(cvFile.type)) {
             throw new Error("Invalid file type. Only PDF and Word documents are allowed.");
        }
        if (cvFile.size > 5 * 1024 * 1024) { // 5MB
             throw new Error("File too large. Max 5MB.");
        }

        const buffer = Buffer.from(await cvFile.arrayBuffer());
        const filename = Date.now() + "-" + cvFile.name.replace(/\s+/g, "-");
        const uploadDir = path.join(process.cwd(), "public", "uploads", "cvs");
        
        try {
            await mkdir(uploadDir, { recursive: true });
            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);
            cvUrl = `/uploads/cvs/${filename}`;
        } catch (error) {
            console.error("Error saving CV file:", error);
            throw new Error("Failed to upload CV file");
        }
    }

    await prisma.jobApplication.create({
        data: {
            jobOfferId,
            firstName,
            lastName,
            email,
            phone,
            address,
            linkedIn,
            cvUrl,
            coverLetter,
            status: "pending",
        },
    });

    revalidatePath("/about/career");
    revalidatePath("/admin/applications");
    revalidateTag("job-applications", { expire: 0 });
}

const getJobApplicationsCached = unstable_cache(
    async () =>
        prisma.jobApplication.findMany({
            include: {
                jobOffer: true,
            },
            orderBy: { submittedAt: "desc" },
        }),
    ["job-applications:list"],
    { revalidate: 10, tags: ["job-applications"] }
);

const getJobApplicationByIdCached = unstable_cache(
    async (id: string) =>
        prisma.jobApplication.findUnique({
            where: { id },
            include: {
                jobOffer: true,
            },
        }),
    ["job-applications:by-id"],
    { revalidate: 10, tags: ["job-applications"] }
);

export async function getJobApplications() {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }
    return getJobApplicationsCached();
}

export async function getJobApplicationById(id: string) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }
    return getJobApplicationByIdCached(id);
}

export async function updateJobApplicationStatus(id: string, status: string, notes?: string) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }
    await prisma.jobApplication.update({
        where: { id },
        data: {
            status,
            notes,
        },
    });

    revalidatePath("/admin/applications");
    revalidateTag("job-applications", { expire: 0 });
}

export async function deleteJobApplication(id: string) {
    await prisma.jobApplication.delete({
        where: { id },
    });

    revalidatePath("/admin/applications");
    revalidateTag("job-applications", { expire: 0 });
}
