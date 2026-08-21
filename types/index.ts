export interface MediaAsset { id: number; type: "image" | "video" | string; url?: string | null; altText?: string | null; sortOrder?: number; }
export interface Hub { id: number; name: string; slug: string; district?: string | null; description?: string | null; coverImage?: string | null; latitude?: string | null; longitude?: string | null; media?: MediaAsset[]; }
export interface Program { id: number; title: string; slug: string; category: string; status?: string; summary?: string | null; body?: string | null; coverImage?: string | null; isFeatured?: boolean; hub?: Hub | null; media?: MediaAsset[]; }
export interface Story { id: number; title: string; slug: string; authorName: string; body: string; publishedAt?: string | null; hub?: Hub | null; program?: Program | null; media?: MediaAsset[]; }
export interface Event { id: number; title: string; slug: string; eventType: string; location: string; startsAt: string; endsAt?: string | null; description?: string | null; coverImage?: string | null; hub?: Hub | null; program?: Program | null; media?: MediaAsset[]; }
export interface Partner { id: number; name: string; logo?: string | null; websiteUrl?: string | null; partnerType: string; description?: string | null; media?: MediaAsset[]; }
export interface NewsPost { id: number; title: string; slug: string; body: string; coverImage?: string | null; publishedAt?: string | null; media?: MediaAsset[]; }
export interface NewsletterSubscriber { email: string; }
export interface VolunteerApplication { name: string; email: string; phone?: string; hubOfInterest?: string; message?: string; }
export interface PartnershipInquiry { organizationName: string; contactName: string; email: string; message: string; }
export interface ContactMessage { name: string; email: string; subject: string; message: string; }
export interface StaffUser { id: number; name: string; email: string; roles: string[]; permissions: string[]; }