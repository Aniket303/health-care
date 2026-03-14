import Link from "next/link";
import { 
  Heart, 
  Shield, 
  Clock, 
  Users, 
  Video, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Star,
  ArrowRight,
  Stethoscope,
  Building2,
  Smartphone
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(22,163,74,0.12),transparent_35%),linear-gradient(180deg,#fcfdfc_0%,#f5f8f6_100%)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-foreground">HealthCare</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-green-600 hover:bg-green-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="rounded-full px-4 py-2 text-green-700 bg-green-100">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Trusted by 10,000+ Users
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                  Healthcare Made 
                  <span className="text-green-600 block">Simple & Secure</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Connect with certified healthcare providers from anywhere. Book appointments, 
                  manage your health records, and get expert care through our secure platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup?role=patient">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6">
                    <Users className="mr-2 h-5 w-5" />
                    I'm a Patient
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/signup?role=provider">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-green-200 hover:bg-green-50">
                    <Stethoscope className="mr-2 h-5 w-5" />
                    I'm a Provider
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">24/7 Available</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-green-600" />
                        <span className="font-semibold">Video Calls</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">👩‍⚕️</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Records</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📋</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-lg col-span-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold">Smart Scheduling</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">Next appointment: Today 2:00 PM</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-background/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Everything You Need for Better Healthcare</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform brings patients and providers together with powerful tools for modern healthcare delivery.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Virtual Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  High-quality video calls with healthcare providers. Secure, reliable, and accessible from any device.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Smart Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI-powered appointment scheduling that works around your schedule and provider availability.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Digital Health Records</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Secure, comprehensive health records accessible to you and your care team whenever needed.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">HIPAA Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enterprise-grade security and privacy protection. Your health data is always safe and encrypted.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Mobile Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access your healthcare on any device. Native mobile experience optimized for phones and tablets.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle className="text-xl">Provider Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with certified healthcare providers across multiple specialties and locations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
            <p className="text-xl text-muted-foreground">Getting healthcare should be simple. Here's how we make it happen.</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold">Sign Up & Verify</h3>
              <p className="text-muted-foreground">
                Create your secure account and complete identity verification in minutes.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold">Find Your Provider</h3>
              <p className="text-muted-foreground">
                Browse certified providers by specialty, location, availability, and ratings.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold">Get Care</h3>
              <p className="text-muted-foreground">
                Book appointments, join video calls, and manage your health records all in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-16 bg-background/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Trusted by Patients & Providers</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "The convenience of virtual appointments has been life-changing. Great platform with excellent providers."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                    <span>👩‍💼</span>
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Patient</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "As a provider, this platform makes patient management seamless. The tools are intuitive and powerful."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <span>👨‍⚕️</span>
                  </div>
                  <div>
                    <p className="font-semibold">Dr. Michael Chen</p>
                    <p className="text-sm text-muted-foreground">Family Medicine</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "Excellent security and user experience. My patients love the convenience and I love the efficiency."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                    <span>👩‍⚕️</span>
                  </div>
                  <div>
                    <p className="font-semibold">Dr. Emily Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Cardiology</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl font-bold sm:text-5xl">Ready to Transform Your Healthcare Experience?</h2>
          <p className="text-xl opacity-90">
            Join thousands of patients and providers who trust our platform for secure, convenient healthcare delivery.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?role=patient">
              <Button size="lg" variant="outline" className="bg-white text-green-700 hover:bg-gray-50 border-white text-lg px-8 py-6">
                <Users className="mr-2 h-5 w-5" />
                Start as Patient
              </Button>
            </Link>
            <Link href="/auth/signup?role=provider">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 text-lg px-8 py-6">
                <Stethoscope className="mr-2 h-5 w-5" />
                Join as Provider
              </Button>
            </Link>
          </div>
          
          <div className="pt-8 border-t border-green-500/30">
            <p className="text-sm opacity-70">
              Free to join • HIPAA Compliant • Available 24/7 • Trusted by 10,000+ users
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-background border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold text-foreground">HealthCare</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>© 2024 HealthCare Platform</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Privacy Policy</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Terms of Service</span>
              <Separator orientation="vertical" className="h-4" />
              <span>HIPAA Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
