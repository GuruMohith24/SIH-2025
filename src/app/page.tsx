
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-200 flex flex-col font-sans">
            {/* Glassy Navbar */}
            <nav className="flex items-center justify-between px-12 py-4 bg-white/60 backdrop-blur-md shadow-lg sticky top-0 z-20 rounded-b-2xl border-b border-blue-200">
                <div className="flex items-center gap-4">
                    <img src="/logo.svg" alt="Pathshala Logo" className="h-11 w-11 mr-2 drop-shadow" />
                    <span className="text-3xl font-extrabold text-indigo-700 tracking-tight drop-shadow">Pathshala</span>
                </div>
                <div className="flex items-center gap-14">
                    <Link href="#about" className="text-indigo-700 font-semibold text-lg px-3 py-1 rounded hover:bg-indigo-100 transition no-underline">About</Link>
                    <Link href="#features" className="text-indigo-700 font-semibold text-lg px-3 py-1 rounded hover:bg-indigo-100 transition no-underline">Features</Link>
                    <Link href="/login" className="px-7 py-2 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-indigo-900 rounded-full font-bold shadow-lg hover:from-yellow-400 hover:to-yellow-600 transition no-underline">Sign In</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-10 bg-gradient-to-br from-blue-100/60 to-cyan-100/80">
                <h1 className="text-6xl md:text-7xl font-extrabold text-indigo-800 mb-7 drop-shadow-xl">Saving Time, Ensuring Presence</h1>
                <p className="max-w-3xl text-2xl text-gray-700 mb-10 font-medium">
                    <span className="font-bold text-indigo-700">Pathshala</span> is a low-cost, user-friendly attendance system for rural schools.<br />
                    It helps teachers save valuable time and ensures accurate attendance records for better resource management.
                </p>
                <Link href="/login" className="px-12 py-4 bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 text-white rounded-full text-2xl font-bold shadow-xl hover:from-indigo-700 hover:to-cyan-500 transition">Get Started</Link>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white/80" id="features">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-4xl font-extrabold text-indigo-800 mb-14 text-center drop-shadow">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <Card className="flex flex-col items-center">
                            <CardHeader className="items-center">
                                <span className="mb-2 text-4xl">📱</span>
                                <CardTitle className="text-indigo-700 text-2xl">QR Code Scan</CardTitle>
                                <CardDescription>Teachers use their smartphone to quickly scan student QR codes for daily attendance.</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="flex flex-col items-center">
                            <CardHeader className="items-center">
                                <span className="mb-2 text-4xl">🤖</span>
                                <CardTitle className="text-indigo-700 text-2xl">AI Verification</CardTitle>
                                <CardDescription>Our AI-powered "Scan and Verify" feature prevents proxy attendance by matching a classroom photo to student profiles.</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="flex flex-col items-center">
                            <CardHeader className="items-center">
                                <span className="mb-2 text-4xl">📊</span>
                                <CardTitle className="text-indigo-700 text-2xl">Real-time Reports</CardTitle>
                                <CardDescription>Generate accurate attendance reports for government schemes and school administration with a single click.</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto py-8 bg-white/90 text-center text-gray-500 text-base shadow-inner">
                &copy; {new Date().getFullYear()} Pathshala. All rights reserved.
            </footer>
        </main>
    );
}