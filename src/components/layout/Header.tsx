"use client";

import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
    ChevronDown, 
    ChevronRight, 
    Menu, 
    X,
    Globe,
    ArrowRight,
    Leaf,
    Users,
    Building2,
    Phone,
    Newspaper,
    BookOpen
} from 'lucide-react';

/* --- TYPES --- */
interface SubItem {
    name: string;
    href: any;
    subItems?: SubItem[];
    description?: string;
    icon?: React.ReactNode;
    subLink?: { name: string; href: any };
}

interface NavItem {
    name: string;
    href: any;
    subItems?: SubItem[];
    icon?: React.ReactNode;
}

type ProductCategoryNavChild = {
    id: string;
    name: string;
    name_ar: string | null;
    slug: string;
};

type ProductCategoryNav = {
    id: string;
    name: string;
    name_ar: string | null;
    slug: string;
    description: string | null;
    description_ar: string | null;
    children?: ProductCategoryNavChild[];
};

type HeaderProps = {
    productCategories?: ProductCategoryNav[];
};

export default function Header({ productCategories }: HeaderProps) {
    const t = useTranslations('Navigation');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const pathname = usePathname();
    const router = useRouter();

    /* --- STATE --- */
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [categories, setCategories] = useState<ProductCategoryNav[]>(productCategories ?? []);
    
    // For mobile accordion logic
    const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

    /* --- EFFECTS --- */
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!productCategories && categories.length === 0) {
            (async () => {
                try {
                    const res = await fetch('/api/public/product-categories', { next: { revalidate: 300 } });
                    if (res.ok) {
                        const data = await res.json();
                        setCategories(data);
                    }
                } catch (_) {}
            })();
        }
    }, [productCategories, categories.length]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
    }, [pathname]);

    const switchLocale = (nextLocale: string) => {
        router.replace(pathname, { locale: nextLocale });
    };

    const productOfferSubItems: SubItem[] = (categories ?? []).map((category) => {
        const name = locale === 'ar' ? (category.name_ar || category.name) : category.name;
        const description = locale === 'ar' ? (category.description_ar || category.description) : category.description;
        const children = category.children ?? [];
        const subItems = children.length ? children.map((child) => ({
            name: locale === 'ar' ? (child.name_ar || child.name) : child.name,
            href: `/product-category/${child.slug}` as any,
        })) : undefined;

        return {
            name,
            href: `/product-category/${category.slug}` as any,
            description: description || undefined,
            subItems,
        };
    });

    const navItems: NavItem[] = [
        {
            name: t('agriculturalProducts'),
            href: '/product-category/agricultural' as any,
            icon: <Leaf size={20} />,
            subItems: [
                { 
                    name: t('productOffer'), 
                    href: '/product-category/agricultural' as any,
                    subItems: productOfferSubItems.length ? productOfferSubItems : undefined,
                    description: t('cropGuidesDesc')
                },
                { 
                    name: t('cropGuides'), 
                    href: '/product-category/crop-guides' as any,
                    description: t('cropGuidesDesc')
                },
                { 
                    name: t('treatmentEfficacy'), 
                    href: '/treatment-efficacy/optimum-conditions' as any,
                    description: t('provenTreatmentResults'),
                    subLink: { name: t('optimumConditions'), href: '/treatment-efficacy/optimum-conditions' as any }
                },
                { 
                    name: t('mixingTable'), 
                    href: '/mixing-table' as any, 
                    description: t('mixingTableDesc') 
                },
            ]
        },
        {
            name: t('animalProducts'),
            href: '/product-category/animal' as any,
            icon: <Users size={20} />, // Placeholder icon
            subItems: [
                { name: t('veterinaryProducts'), href: '/product-category/veterinary' as any },
                { 
                    name: t('byAnimalType'), 
                    href: '/product-category/by-animal' as any,
                    subItems: [
                        { name: t('poultry'), href: '/products-for-animals/poultry' as any },
                        { name: t('ruminants'), href: '/products-for-animals/ruminants' as any },
                        { name: t('swine'), href: '/products-for-animals/swine' as any },
                    ]
                }
            ]
        },
        {
            name: t('about'),
            href: '/about' as any,
            icon: <Building2 size={20} />,
            subItems: [
                { name: t('about'), href: '/about' as any },
                { name: t('rdCentre'), href: '/about/rd-centre' as any },
                { name: t('productionPlants'), href: '/about/production-plants' as any },
                { name: t('logisticsCentre'), href: '/about/logistics-centre' as any },
                { name: t('companyData'), href: '/about/company-data' as any },
                { name: t('career'), href: '/about/career' as any },
                { name: t('certificates'), href: '/about/certificates' as any },
                { name: t('awards'), href: '/about/awards' as any },
            ]
        },
        { name: t('news'), href: '/blog' as any, icon: <Newspaper size={20} /> },
        { name: t('catalogs'), href: '/catalogs' as any, icon: <BookOpen size={20} /> },
        {
            name: t('contact'),
            href: '/contact' as any,
            icon: <Phone size={20} />,
            subItems: [
                { name: t('companyHeadquarter'), href: '/contact/headquarter' as any },
                { name: t('exportDepartment'), href: '/contact/export-department' as any },
                { name: t('localRepresentatives'), href: '/contact/local-representatives' as any },
                { name: t('contactForm'), href: '/contact' as any },
            ]
        }
    ];

    return (
        <>
            <header className={`header-wrapper ${scrolled ? 'scrolled' : ''} ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="header-container">
                    {/* Logo Section */}
                    <div className="logo-area">
                        <Link href="/" className="logo-link">
                            <Image 
                                src="/images/logo.png" 
                                alt="KINT Logo" 
                                width={60} 
                                height={60} 
                                className="logo-img"
                            />
                            <div className="logo-text">
                                <span className="brand-name">KINT</span>
                                <span className="brand-tagline">INTERNATIONAL</span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav">
                        <ul className="nav-list">
                            {navItems.map((item) => (
                                <li 
                                    key={item.name} 
                                    className="nav-item"
                                    onMouseEnter={() => setActiveDropdown(item.name)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link 
                                        href={item.href} 
                                        className={`nav-link ${pathname.startsWith(item.href) && item.href !== '/' ? 'active' : ''}`}
                                    >
                                        {item.name}
                                        {item.subItems && <ChevronDown size={14} className="dropdown-arrow" />}
                                    </Link>

                                    {/* Mega Dropdown */}
                                    {item.subItems && (
                                        <div className={`mega-dropdown ${activeDropdown === item.name ? 'visible' : ''}`}>
                                            <div className="dropdown-inner">
                                                {item.subItems.map((sub, idx) => (
                                                    <div key={idx} className="dropdown-column">
                                                        <Link href={sub.href} className="column-title">
                                                            {sub.name}
                                                            <ArrowRight size={14} className="link-arrow" />
                                                        </Link>
                                                        {sub.description && <p className="column-desc">{sub.description}</p>}
                                                        
                                                        {sub.subItems && (
                                                            <ul className="nested-list">
                                                                {sub.subItems.map((nested, nIdx) => (
                                                                    <li key={nIdx}>
                                                                        <Link href={nested.href} className="nested-link">
                                                                            {nested.name}
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}

                                                        {sub.subLink && (
                                                            <Link href={sub.subLink.href} className="special-sublink">
                                                                {sub.subLink.name}
                                                            </Link>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Actions Area */}
                    <div className="actions-area">
                        <div className="lang-toggle">
                            <button 
                                className={locale === 'en' ? 'active' : ''} 
                                onClick={() => switchLocale('en')}
                            >EN</button>
                            <span className="divider">/</span>
                            <button 
                                className={locale === 'ar' ? 'active' : ''} 
                                onClick={() => switchLocale('ar')}
                            >AR</button>
                        </div>
                        
                        <Link href="/admin" className="portal-btn">
                            <Users size={18} />
                            <span className="btn-text">Portal</span>
                        </Link>

                        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar */}
            <div className={`mobile-sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                <div className="mobile-sidebar" onClick={e => e.stopPropagation()} dir={isRtl ? 'rtl' : 'ltr'}>
                    <div className="sidebar-header">
                        <span className="sidebar-title">{t('home')}</span>
                        <button className="close-btn" onClick={() => setMobileMenuOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="sidebar-content">
                        {navItems.map((item) => (
                            <div key={item.name} className="mobile-group">
                                <div className="mobile-item-head">
                                    <Link 
                                        href={item.href} 
                                        className="mobile-main-link"
                                        onClick={() => !item.subItems && setMobileMenuOpen(false)}
                                    >
                                        {item.icon && <span className="mobile-icon">{item.icon}</span>}
                                        {item.name}
                                    </Link>
                                    {item.subItems && (
                                        <button 
                                            className={`expand-btn ${mobileExpanded === item.name ? 'expanded' : ''}`}
                                            onClick={() => setMobileExpanded(mobileExpanded === item.name ? null : item.name)}
                                        >
                                            <ChevronDown size={18} />
                                        </button>
                                    )}
                                </div>

                                {item.subItems && (
                                    <div className={`mobile-submenu ${mobileExpanded === item.name ? 'open' : ''}`}>
                                        {item.subItems.map((sub, sIdx) => (
                                            <div key={sIdx} className="mobile-sub-group">
                                                <Link 
                                                    href={sub.href} 
                                                    className="mobile-sub-link"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {sub.name}
                                                </Link>
                                                {sub.subItems && (
                                                    <div className="mobile-nested-links">
                                                        {sub.subItems.map((nested, nIdx) => (
                                                            <Link 
                                                                key={nIdx} 
                                                                href={nested.href} 
                                                                className="mobile-nested-link"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                            >
                                                                — {nested.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="sidebar-footer">
                        <div className="mobile-lang">
                            <button onClick={() => switchLocale('en')} className={locale === 'en' ? 'active' : ''}>English</button>
                            <button onClick={() => switchLocale('ar')} className={locale === 'ar' ? 'active' : ''}>العربية</button>
                        </div>
                        <Link href="/admin" className="mobile-portal-btn">
                            Customer Portal
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                /* --- VARIABLES & BASE --- */
                .header-wrapper {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 90px;
                    z-index: 1000;
                    background: transparent;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    border-bottom: 1px solid transparent;
                }
                .header-wrapper.scrolled {
                    height: 70px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(12px);
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
                    border-bottom-color: rgba(0, 0, 0, 0.05);
                }

                .header-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 2rem;
                }

                /* --- LOGO --- */
                .logo-link {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    text-decoration: none;
                    color: inherit;
                }
                .logo-img {
                    width: 48px;
                    height: 48px;
                    object-fit: contain;
                    transition: transform 0.3s ease;
                }
                .header-wrapper.scrolled .logo-img {
                    width: 40px;
                    height: 40px;
                }
                .logo-text {
                    display: flex;
                    flex-direction: column;
                    line-height: 1;
                }
                .brand-name {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.03em;
                }
                .brand-tagline {
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: #64748b;
                    letter-spacing: 0.15em;
                }

                /* --- DESKTOP NAV --- */
                .desktop-nav {
                    height: 100%;
                    display: none;
                }
                @media (min-width: 1024px) {
                    .desktop-nav { display: block; }
                }

                .nav-list {
                    display: flex;
                    height: 100%;
                    gap: 2rem;
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }

                .nav-item {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    position: relative;
                }

                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    text-decoration: none;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #334155;
                    padding: 0.5rem 0.8rem;
                    border-radius: 8px;
                    transition: all 0.2s;
                    position: relative;
                }
                .nav-link:hover, .nav-link.active {
                    color: #e9496c;
                    background: rgba(233, 73, 108, 0.05);
                }
                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    width: 0;
                    height: 2px;
                    background: #e9496c;
                    transition: all 0.3s;
                    transform: translateX(-50%);
                }
                .nav-link.active::after {
                    width: 60%;
                }

                .dropdown-arrow {
                    transition: transform 0.2s;
                    opacity: 0.5;
                }
                .nav-item:hover .dropdown-arrow {
                    transform: rotate(180deg);
                    opacity: 1;
                }

                /* --- MEGA DROPDOWN --- */
                .mega-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%) translateY(20px);
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
                    padding: 1.5rem;
                    min-width: 600px;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .mega-dropdown.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(-50%) translateY(0);
                }
                /* Adjust positioning for items near edges */
                .nav-item:first-child .mega-dropdown {
                    left: 0;
                    transform: translateY(20px);
                }
                .nav-item:first-child .mega-dropdown.visible {
                    transform: translateY(0);
                }
                .nav-item:last-child .mega-dropdown {
                    left: auto;
                    right: 0;
                    transform: translateY(20px);
                }
                .nav-item:last-child .mega-dropdown.visible {
                    transform: translateY(0);
                }

                .dropdown-inner {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                }

                .column-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                }
                .column-title:hover {
                    color: #e9496c;
                }
                .link-arrow {
                    opacity: 0;
                    transform: translateX(-5px);
                    transition: all 0.2s;
                }
                .column-title:hover .link-arrow {
                    opacity: 1;
                    transform: translateX(0);
                }

                .column-desc {
                    font-size: 0.85rem;
                    color: #64748b;
                    margin-bottom: 1rem;
                    line-height: 1.5;
                }

                .nested-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .nested-link {
                    font-size: 0.9rem;
                    color: #475569;
                    text-decoration: none;
                    transition: color 0.2s;
                    display: block;
                    padding: 0.25rem 0;
                }
                .nested-link:hover {
                    color: #e9496c;
                    padding-left: 5px;
                }
                .rtl .nested-link:hover {
                    padding-left: 0;
                    padding-right: 5px;
                }

                .special-sublink {
                    display: inline-block;
                    margin-top: 0.5rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #e9496c;
                    text-decoration: none;
                    border-bottom: 1px dashed #e9496c;
                }

                /* --- ACTIONS AREA --- */
                .actions-area {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .lang-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #64748b;
                }
                .lang-toggle button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: inherit;
                    padding: 0.2rem;
                    transition: color 0.2s;
                }
                .lang-toggle button.active {
                    color: #e9496c;
                }
                .divider {
                    opacity: 0.3;
                }

                .portal-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #0f172a;
                    color: white;
                    padding: 0.6rem 1.2rem;
                    border-radius: 50px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.3s;
                }
                .portal-btn:hover {
                    background: #e9496c;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(233, 73, 108, 0.3);
                }
                .btn-text {
                    display: none;
                }
                @media (min-width: 640px) {
                    .btn-text { display: inline; }
                }

                .mobile-toggle {
                    display: none;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #0f172a;
                }
                @media (max-width: 1023px) {
                    .mobile-toggle { display: block; }
                }

                /* --- MOBILE SIDEBAR --- */
                .mobile-sidebar-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.3);
                    backdrop-filter: blur(4px);
                    z-index: 2000;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s;
                }
                .mobile-sidebar-overlay.open {
                    opacity: 1;
                    visibility: visible;
                }

                .mobile-sidebar {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 300px;
                    background: white;
                    box-shadow: 0 0 40px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .ltr .mobile-sidebar { right: 0; transform: translateX(100%); }
                .ltr .mobile-sidebar-overlay.open .mobile-sidebar { transform: translateX(0); }
                .rtl .mobile-sidebar { left: 0; transform: translateX(-100%); }
                .rtl .mobile-sidebar-overlay.open .mobile-sidebar { transform: translateX(0); }

                .sidebar-header {
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f1f5f9;
                }
                .sidebar-title {
                    font-weight: 800;
                    font-size: 1.2rem;
                    color: #0f172a;
                }
                .close-btn {
                    background: #f8fafc;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #64748b;
                }

                .sidebar-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                }

                .mobile-group {
                    border-bottom: 1px solid #f8fafc;
                }
                .mobile-item-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .mobile-main-link {
                    flex: 1;
                    padding: 1rem 0;
                    text-decoration: none;
                    color: #334155;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .mobile-icon {
                    color: #e9496c;
                }
                .expand-btn {
                    background: none;
                    border: none;
                    padding: 1rem;
                    color: #94a3b8;
                    transition: transform 0.3s;
                }
                .expand-btn.expanded {
                    transform: rotate(180deg);
                    color: #e9496c;
                }

                .mobile-submenu {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-out;
                    background: #f8fafc;
                    border-radius: 8px;
                }
                .mobile-submenu.open {
                    max-height: 800px;
                    margin-bottom: 1rem;
                }

                .mobile-sub-group {
                    padding: 0.5rem 1rem;
                }
                .mobile-sub-link {
                    display: block;
                    text-decoration: none;
                    font-weight: 600;
                    color: #475569;
                    margin-bottom: 0.5rem;
                }
                .mobile-nested-links {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    padding-left: 1rem;
                }
                .rtl .mobile-nested-links {
                    padding-left: 0;
                    padding-right: 1rem;
                }
                .mobile-nested-link {
                    text-decoration: none;
                    font-size: 0.85rem;
                    color: #64748b;
                }

                .sidebar-footer {
                    padding: 1.5rem;
                    background: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                }
                .mobile-lang {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .mobile-lang button {
                    flex: 1;
                    padding: 0.6rem;
                    border: 1px solid #cbd5e1;
                    background: white;
                    border-radius: 8px;
                    font-weight: 600;
                    color: #64748b;
                }
                .mobile-lang button.active {
                    border-color: #e9496c;
                    color: #e9496c;
                    background: #fff0f3;
                }
                .mobile-portal-btn {
                    display: block;
                    text-align: center;
                    background: #0f172a;
                    color: white;
                    padding: 0.8rem;
                    border-radius: 12px;
                    text-decoration: none;
                    font-weight: 700;
                }
            `}</style>
        </>
    );
}
