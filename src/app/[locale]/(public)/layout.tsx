import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const dynamic = 'force-static';

export default async function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <main style={{ minHeight: 'calc(100vh - 350px)', paddingTop: '80px' }}>
                {children}
            </main>
            <Footer />
        </>
    );
}
