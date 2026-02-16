"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { createProductSection, updateProductSection, deleteProductSection, getProductSections } from "@/actions/productSectionActions";
import { Plus, Trash2, Edit2 } from "lucide-react";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });

interface Section {
    id: string;
    title: string;
    title_ar?: string | null;
    content: string;
    content_ar?: string | null;
    order: number;
    colorTheme: string;
}

export default function ProductSectionsManager({
    productId,
    initialSections = [],
}: {
    productId: string;
    initialSections?: Section[];
}) {
    const [sections, setSections] = useState<Section[]>(initialSections);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        title_ar: "",
        content: "",
        content_ar: "",
        order: 0,
        colorTheme: "blue",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "order" ? parseInt(value) || 0 : value,
        }));
    };

    const handleAddSection = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            formDataObj.append(key, String(value));
        });

        await createProductSection(productId, formDataObj);
        
        // Refresh sections list after adding
        const updatedSections = await getProductSections(productId);
        setSections(updatedSections);

        setFormData({
            title: "",
            title_ar: "",
            content: "",
            content_ar: "",
            order: sections.length,
            colorTheme: "blue",
        });
        setIsLoading(false);
    };

    const handleUpdateSection = async (e: React.FormEvent) => {
        if (!editingId) return;
        e.preventDefault();
        setIsLoading(true);

        const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            formDataObj.append(key, String(value));
        });

        await updateProductSection(editingId, formDataObj);

        // Refresh sections list after update
        const updatedSections = await getProductSections(productId);
        setSections(updatedSections);

        setEditingId(null);
        setFormData({
            title: "",
            title_ar: "",
            content: "",
            content_ar: "",
            order: 0,
            colorTheme: "blue",
        });
        setIsLoading(false);
    };

    const handleEditSection = (section: Section) => {
        setEditingId(section.id);
        setFormData({
            title: section.title,
            title_ar: section.title_ar || "",
            content: section.content,
            content_ar: section.content_ar || "",
            order: section.order,
            colorTheme: section.colorTheme,
        });
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (!confirm("Are you sure you want to delete this section?")) return;
        setIsLoading(true);
        await deleteProductSection(sectionId, productId);
        
        // Refresh sections list after delete
        const updatedSections = await getProductSections(productId);
        setSections(updatedSections);
        
        setIsLoading(false);
    };

    return (
        <div style={{ marginTop: "2rem" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", fontWeight: 700 }}>
                Product Sections
            </h3>

            {/* Form */}
            <form onSubmit={editingId ? handleUpdateSection : handleAddSection} style={{ marginBottom: "2rem", padding: "2rem", backgroundColor: "#f8fafc", borderRadius: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Section Title (English)"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        style={{ padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "1rem" }}
                    />
                    <input
                        type="text"
                        name="title_ar"
                        placeholder="Section Title (Arabic)"
                        value={formData.title_ar}
                        onChange={handleInputChange}
                        style={{ padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "1rem" }}
                    />
                    <input
                        type="number"
                        name="order"
                        placeholder="Order"
                        value={formData.order}
                        onChange={handleInputChange}
                        min="0"
                        style={{ padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "1rem" }}
                    />
                    <select
                        name="colorTheme"
                        value={formData.colorTheme}
                        onChange={handleInputChange}
                        style={{ padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "1rem" }}
                    >
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="purple">Purple</option>
                        <option value="orange">Orange</option>
                    </select>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                    <RichTextEditor
                        label="Content (English)"
                        value={formData.content}
                        onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                    />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                    <RichTextEditor
                        label="Content (Arabic)"
                        value={formData.content_ar}
                        onChange={(html) => setFormData(prev => ({ ...prev, content_ar: html }))}
                        dir="rtl"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "var(--primary)",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        fontWeight: 600,
                        cursor: isLoading ? "not-allowed" : "pointer",
                        opacity: isLoading ? 0.6 : 1,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    <Plus size={18} />
                    {editingId ? "Update Section" : "Add Section"}
                </button>
                {editingId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                title: "",
                                title_ar: "",
                                content: "",
                                content_ar: "",
                                order: 0,
                                colorTheme: "blue",
                            });
                        }}
                        style={{
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#94a3b8",
                            color: "white",
                            border: "none",
                            borderRadius: "0.5rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            marginLeft: "0.5rem",
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            {/* Sections List */}
            <div style={{ display: "grid", gap: "1rem" }}>
                {sections.length === 0 ? (
                    <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>No sections yet</p>
                ) : (
                    sections.map((section) => (
                        <div
                            key={section.id}
                            style={{
                                padding: "1.5rem",
                                border: "1px solid #e2e8f0",
                                borderRadius: "0.75rem",
                                backgroundColor: "white",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{section.title}</h4>
                                {section.title_ar && (
                                    <p style={{ margin: "0.25rem 0 0 0", color: "#64748b" }}>{section.title_ar}</p>
                                )}
                                <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>
                                    Order: {section.order} | Color: {section.colorTheme}
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                    onClick={() => handleEditSection(section)}
                                    style={{
                                        padding: "0.5rem",
                                        backgroundColor: "#3b82f6",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "0.5rem",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                    }}
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteSection(section.id)}
                                    disabled={isLoading}
                                    style={{
                                        padding: "0.5rem",
                                        backgroundColor: "#ef4444",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "0.5rem",
                                        cursor: isLoading ? "not-allowed" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        opacity: isLoading ? 0.6 : 1,
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
