"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/admin");
                router.refresh();
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6" }}>
            <Card style={{ width: "100%", maxWidth: "400px", padding: "1rem" }}>
                <CardHeader style={{ textAlign: "center", borderBottom: "none", paddingBottom: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                        <Image src="/images/logo.png" alt="KINT Logo" width={80} height={80} style={{ objectFit: "contain" }} />
                    </div>
                    <CardTitle style={{ fontSize: "1.5rem" }}>Admin Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {error && (
                            <div style={{ padding: "0.75rem", backgroundColor: "#fee2e2", color: "#ef4444", borderRadius: "0.5rem", fontSize: "0.875rem", textAlign: "center" }}>
                                {error}
                            </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label htmlFor="email" style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="admin@example.com"
                                style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", outline: "none", width: "100%" }}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label htmlFor="password" style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", outline: "none", width: "100%" }}
                            />
                        </div>
                        <Button type="submit" disabled={loading} style={{ width: "100%", marginTop: "0.5rem", padding: "0.75rem" }}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
