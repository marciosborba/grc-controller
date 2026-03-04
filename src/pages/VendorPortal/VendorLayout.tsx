import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Bell, User, LogOut, Menu, X, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const VendorLayout = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Verificação de autenticação e papel
    // Permite acesso se for um vendor logado ou um admin da plataforma testando
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50/50"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div></div>;
    }

    if (!user && location.pathname !== '/vendor-portal/login') {
        return <Navigate to="/vendor-portal/login" state={{ from: location }} replace />;
    }

    if (location.pathname === '/vendor-portal/login') {
        return <Outlet />;
    }

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/vendor-portal/login');
            toast({
                title: "Sessão encerrada",
                description: "Você saiu do portal do fornecedor.",
            });
        } catch (error) {
            console.error(error);
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/vendor-portal', icon: LayoutDashboard },
        { name: 'Minhas Avaliações', path: '/vendor-portal/assessments', icon: CheckSquare },
        { name: 'Planos de Ação', path: '/vendor-portal/action-plans', icon: Activity },
        { name: 'Mensagens', path: '/vendor-portal/messages', icon: Bell },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none sm:hidden mr-2"
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                    GRC Portal
                                </span>
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                                    Fornecedor
                                </span>
                            </div>
                            <nav className="hidden sm:ml-8 sm:flex sm:space-x-8">
                                {navItems.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => navigate(item.path)}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${(location.pathname === item.path || (item.path !== '/vendor-portal' && location.pathname.startsWith(item.path)))
                                            ? 'border-primary text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4 mr-2" />
                                        {item.name}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500 rounded-full h-8 w-8 hidden sm:flex">
                                <Bell className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-medium text-gray-900 leading-none">{user?.email}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 h-8 w-8" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4 text-gray-600" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="sm:hidden border-t border-gray-200">
                        <div className="pt-2 pb-3 space-y-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        navigate(item.path);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`border-l-4 w-full text-left flex items-center pl-3 pr-4 py-2 text-base font-medium ${(location.pathname === item.path || (item.path !== '/vendor-portal' && location.pathname.startsWith(item.path)))
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                                        }`}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} GRC Controller. Portal do Fornecedor.</p>
                    <div className="flex space-x-4">
                        <a href="#" className="hover:text-gray-900 transition-colors">Suporte</a>
                        <a href="#" className="hover:text-gray-900 transition-colors">Termos</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default VendorLayout;
